from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime
from auth.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    decode_access_token,
    generate_verification_code,
    User,
    UserInDB
)
from services.email_service import send_verification_email

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Usuario admin predefinido
ADMIN_EMAIL = "home.recordsinfo@gmail.com"
ADMIN_PASSWORD_HASH = get_password_hash("a1d2m3i4nHMr3cords")


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str


class VerificationCodeStore(BaseModel):
    email: str
    code: str
    created_at: datetime
    expires_at: datetime


async def get_user_by_email(email: str) -> Optional[UserInDB]:
    """Obtener usuario por email"""
    # Verificar si es el admin
    if email == ADMIN_EMAIL:
        return UserInDB(
            email=ADMIN_EMAIL,
            hashed_password=ADMIN_PASSWORD_HASH,
            is_admin=True,
            is_verified=True
        )
    
    # Buscar en la base de datos
    user = await db.users.find_one({"email": email})
    if user:
        return UserInDB(**user)
    return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Obtener usuario actual desde el token"""
    token = credentials.credentials
    token_data = decode_access_token(token)
    
    if token_data is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )
    
    user = await get_user_by_email(token_data.email)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuario no encontrado"
        )
    
    return User(
        email=user.email,
        is_admin=user.is_admin,
        is_verified=user.is_verified
    )


async def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    """Verificar que el usuario es admin"""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador"
        )
    return current_user


@router.post("/register")
async def register(request: RegisterRequest):
    """Registrar nuevo usuario"""
    # Verificar si el usuario ya existe
    existing_user = await db.users.find_one({"email": request.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )
    
    # Generar código de verificación
    verification_code = generate_verification_code()
    
    # Guardar código de verificación (expira en 10 minutos)
    expires_at = datetime.utcnow().timestamp() + (10 * 60)
    await db.verification_codes.insert_one({
        "email": request.email,
        "code": verification_code,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    })
    
    # Crear usuario (sin verificar)
    hashed_password = get_password_hash(request.password)
    user = {
        "email": request.email,
        "hashed_password": hashed_password,
        "is_admin": False,
        "is_verified": False,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    
    # TODO: Enviar email con código de verificación usando SendGrid
    # Por ahora devolvemos el código (solo para desarrollo)
    
    return {
        "message": "Usuario registrado. Verifica tu email.",
        "email": request.email,
        "verification_code": verification_code  # REMOVER en producción
    }


@router.post("/verify-email")
async def verify_email(request: VerifyEmailRequest):
    """Verificar email con código"""
    # Buscar código de verificación
    verification = await db.verification_codes.find_one({
        "email": request.email,
        "code": request.code
    })
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificación inválido"
        )
    
    # Verificar si expiró
    if verification['expires_at'] < datetime.utcnow().timestamp():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Código de verificación expirado"
        )
    
    # Marcar usuario como verificado
    await db.users.update_one(
        {"email": request.email},
        {"$set": {"is_verified": True}}
    )
    
    # Eliminar código usado
    await db.verification_codes.delete_one({"_id": verification['_id']})
    
    return {"message": "Email verificado exitosamente"}


@router.post("/login")
async def login(request: LoginRequest):
    """Login con email y contraseña"""
    user = await get_user_by_email(request.email)
    
    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )
    
    # Verificar si el email está verificado (excepto admin)
    if not user.is_admin and not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Por favor verifica tu email antes de iniciar sesión"
        )
    
    # Crear token de acceso
    access_token = create_access_token(
        data={
            "sub": user.email,
            "is_admin": user.is_admin
        }
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "email": user.email,
            "is_admin": user.is_admin,
            "is_verified": user.is_verified
        }
    }


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Obtener información del usuario actual"""
    return current_user


@router.post("/resend-verification")
async def resend_verification(email: EmailStr):
    """Reenviar código de verificación"""
    user = await db.users.find_one({"email": email})
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if user.get('is_verified'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está verificado"
        )
    
    # Generar nuevo código
    verification_code = generate_verification_code()
    expires_at = datetime.utcnow().timestamp() + (10 * 60)
    
    # Eliminar códigos anteriores
    await db.verification_codes.delete_many({"email": email})
    
    # Guardar nuevo código
    await db.verification_codes.insert_one({
        "email": email,
        "code": verification_code,
        "created_at": datetime.utcnow(),
        "expires_at": expires_at
    })
    
    # TODO: Enviar email con SendGrid
    
    return {
        "message": "Código de verificación reenviado",
        "verification_code": verification_code  # REMOVER en producción
    }
