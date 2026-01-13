from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from typing import Optional
import stripe
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Stripe
stripe.api_key = os.environ.get('STRIPE_SECRET_KEY')

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
    Confirma que el pago se procesó correctamente
    En producción, esto debería manejarse con webhooks
    """
    try:
        # Verificar el estado del payment intent
        payment_intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
        
        if payment_intent.status == "succeeded":
            # Aquí puedes:
            # 1. Guardar la orden en la base de datos
            # 2. Enviar el beat por email
            # 3. Generar el PDF de licencia
            
            return {
                "status": "success",
                "message": "Pago confirmado exitosamente",
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al confirmar pago: {str(e)}")
