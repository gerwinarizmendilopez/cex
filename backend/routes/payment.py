from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]

router = APIRouter(prefix="/api/payment", tags=["payment"])


class CreatePaymentIntentRequest(BaseModel):
    beat_id: str
    beat_name: str
    license_type: str
    amount: float
    buyer_email: EmailStr
    buyer_name: Optional[str] = None


class PaymentIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: float
    currency: str


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(request: CreatePaymentIntentRequest):
    """
    Crea un Payment Intent de Stripe para procesar el pago
    """
    try:
        # Verificar si el beat existe y está disponible
        beat = await db.beats.find_one({"beat_id": request.beat_id}, {"_id": 0})
        
        if not beat:
            raise HTTPException(status_code=404, detail="Beat no encontrado")
        
        if not beat.get("is_available", True):
            raise HTTPException(status_code=400, detail="Este beat ya no está disponible (vendido en exclusiva)")
        
        # Convertir el monto a centavos (Stripe usa centavos)
        amount_cents = int(request.amount * 100)
        
        # Crear el Payment Intent
        payment_intent = stripe.PaymentIntent.create(
            amount=amount_cents,
            currency="usd",
            metadata={
                "beat_id": request.beat_id,
                "beat_name": request.beat_name,
                "license_type": request.license_type,
                "buyer_email": request.buyer_email,
                "buyer_name": request.buyer_name or "N/A"
            },
            description=f"Beat: {request.beat_name} - Licencia {request.license_type}"
        )
        
        return PaymentIntentResponse(
            client_secret=payment_intent.client_secret,
            payment_intent_id=payment_intent.id,
            amount=request.amount,
            currency="usd"
        )
        
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear payment intent: {str(e)}")


@router.get("/config")
async def get_stripe_config():
    """
    Devuelve la Publishable Key de Stripe para el frontend
    """
    publishable_key = os.environ.get('STRIPE_PUBLISHABLE_KEY')
    
    if not publishable_key:
        raise HTTPException(status_code=500, detail="Stripe publishable key no configurada")
    
    return {
        "publishable_key": publishable_key
    }


class ConfirmPaymentRequest(BaseModel):
    payment_intent_id: str
    beat_id: str
    license_type: str
    buyer_email: EmailStr


@router.post("/confirm-payment")
async def confirm_payment(request: ConfirmPaymentRequest):
    """
    Confirma que el pago se procesó correctamente.
    Si es licencia exclusiva, retira el beat del catálogo.
    """
    try:
        # Verificar el estado del payment intent
        payment_intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if payment_intent.status == "succeeded":
            # Obtener info del beat
            beat = await db.beats.find_one({"beat_id": request.beat_id}, {"_id": 0})
            
            if not beat:
                raise HTTPException(status_code=404, detail="Beat no encontrado")
            
            # Registrar la venta
            sale = {
                "payment_intent_id": request.payment_intent_id,
                "beat_id": request.beat_id,
                "beat_name": beat.get("name"),
                "license_type": request.license_type,
                "buyer_email": request.buyer_email,
                "amount": payment_intent.amount / 100,
                "currency": "usd",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.sales.insert_one(sale)
            
            # Incrementar contador de ventas del beat
            await db.beats.update_one(
                {"beat_id": request.beat_id},
                {"$inc": {"sales": 1}}
            )
            
            # ⭐ Si es licencia EXCLUSIVA, retirar el beat del catálogo
            if request.license_type.lower() == "exclusiva":
                await db.beats.update_one(
                    {"beat_id": request.beat_id},
                    {
                        "$set": {
                            "is_available": False,
                            "sold_exclusive_to": request.buyer_email,
                            "sold_exclusive_date": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                
                return {
                    "status": "success",
                    "message": "¡Felicidades! Has adquirido los derechos exclusivos de este beat. El beat ha sido retirado del catálogo.",
                    "exclusive": True,
                    "payment_intent_id": request.payment_intent_id,
                    "amount": payment_intent.amount / 100,
                    "beat_id": request.beat_id,
                    "license_type": request.license_type
                }
            
            return {
                "status": "success",
                "message": "Pago confirmado exitosamente",
                "exclusive": False,
                "payment_intent_id": request.payment_intent_id,
                "amount": payment_intent.amount / 100,
                "beat_id": request.beat_id,
                "license_type": request.license_type
            }
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"El pago no se ha completado. Estado: {payment_intent.status}"
            )
            
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al confirmar pago: {str(e)}")


@router.get("/sales")
async def get_sales():
    """
    Obtener historial de ventas (para admin)
    """
    cursor = db.sales.find({}, {"_id": 0}).sort("created_at", -1).limit(100)
    sales = await cursor.to_list(length=100)
    
    return {
        "sales": sales,
        "total": len(sales)
    }
