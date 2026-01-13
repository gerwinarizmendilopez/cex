from fastapi import APIRouter, HTTPException, Depends, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import httpx
from datetime import datetime, timedelta, timezone
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
security = HTTPBearer(auto_error=False)

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
            is_verified=True,
            auth_provider="email"
        )
    
    # Buscar en la base de datos (excluir _id)
    user = await db.users.find_one({"email": email}, {"_id": 0})
    if user:
        return UserInDB(**user)
    return None


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> User:
    """Obtener usuario actual desde el token"""
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )
    
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
        is_verified=user.is_verified,
        name=user.name,
        picture=user.picture,
        user_id=user.user_id
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
    
    # Enviar email con código de verificación
    email_sent = await send_verification_email(request.email, verification_code)
    
    if not email_sent:
        print(f"Warning: No se pudo enviar email a {request.email}")
    
    return {
        "message": "Usuario registrado. Revisa tu email para verificar tu cuenta.",
        "email": request.email
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
    
    # Enviar email
    email_sent = await send_verification_email(email, verification_code)
    
    if not email_sent:
        print(f"Warning: No se pudo enviar email a {email}")
    
    return {
        "message": "Código de verificación reenviado. Revisa tu email."
    }


# ========== GOOGLE OAUTH INTEGRATION ==========
# REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH

EMERGENT_AUTH_URL = "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data"


class GoogleSessionRequest(BaseModel):
    session_id: str


class GoogleUser(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    is_admin: bool = False
    is_verified: bool = True
    auth_provider: str = "google"


@router.post("/google/session")
async def process_google_session(request: GoogleSessionRequest, response: Response):
    """
    Procesa el session_id de Google OAuth y devuelve datos del usuario.
    Este endpoint intercambia el session_id temporal por un session_token persistente.
    """
    try:
        # Llamar a Emergent Auth para obtener datos del usuario
        async with httpx.AsyncClient() as client:
            auth_response = await client.get(
                EMERGENT_AUTH_URL,
                headers={"X-Session-ID": request.session_id}
            )
            
            if auth_response.status_code != 200:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Session ID inválido o expirado"
                )
            
            google_data = auth_response.json()
        
        email = google_data.get("email")
        name = google_data.get("name", "Usuario")
        picture = google_data.get("picture")
        session_token = google_data.get("session_token")
        
        if not email or not session_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Datos de autenticación incompletos"
            )
        
        # Buscar o crear usuario en la base de datos
        existing_user = await db.users.find_one({"email": email}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user.get("user_id")
            # Actualizar datos si es necesario
            await db.users.update_one(
                {"email": email},
                {"$set": {
                    "name": name,
                    "picture": picture,
                    "last_login": datetime.now(timezone.utc),
                    "auth_provider": "google"
                }}
            )
            is_admin = existing_user.get("is_admin", False)
        else:
            # Crear nuevo usuario
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            # Verificar si es el admin
            is_admin = email == ADMIN_EMAIL
            
            new_user = {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "is_admin": is_admin,
                "is_verified": True,
                "auth_provider": "google",
                "created_at": datetime.now(timezone.utc),
                "last_login": datetime.now(timezone.utc)
            }
            await db.users.insert_one(new_user)
        
        # Crear sesión en la base de datos
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        # Eliminar sesiones anteriores del usuario
        await db.user_sessions.delete_many({"user_id": user_id})
        
        # Crear nueva sesión
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at,
            "created_at": datetime.now(timezone.utc)
        })
        
        # También crear un JWT token para mantener compatibilidad con el sistema existente
        access_token = create_access_token(
            data={
                "sub": email,
                "is_admin": is_admin,
                "user_id": user_id
            }
        )
        
        # Configurar cookie httpOnly
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=False,  # Cambiar a True en producción con HTTPS
            samesite="lax",
            max_age=7 * 24 * 60 * 60,  # 7 días
            path="/"
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "user_id": user_id,
                "email": email,
                "name": name,
                "picture": picture,
                "is_admin": is_admin,
                "is_verified": True
            }
        }
        
    except httpx.RequestError as e:
        print(f"Error conectando con Emergent Auth: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Error al conectar con el servicio de autenticación"
        )


@router.get("/google/me")
async def get_google_user(request: Request):
    """
    Obtener usuario autenticado via Google OAuth usando session_token de cookie.
    """
    session_token = request.cookies.get("session_token")
    
    if not session_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No autenticado"
        )
    
    # Buscar sesión en la base de datos
    session = await db.user_sessions.find_one(
        {"session_token": session_token},
        {"_id": 0}
    )
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no válida"
        )
    
    # Verificar expiración
    expires_at = session.get("expires_at")
    if isinstance(expires_at, datetime):
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Sesión expirada"
            )
    
    # Obtener datos del usuario
    user = await db.users.find_one(
        {"user_id": session["user_id"]},
        {"_id": 0}
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    return {
        "user_id": user.get("user_id"),
        "email": user.get("email"),
        "name": user.get("name"),
        "picture": user.get("picture"),
        "is_admin": user.get("is_admin", False),
        "is_verified": user.get("is_verified", True)
    }


@router.post("/google/logout")
async def google_logout(request: Request, response: Response):
    """
    Cerrar sesión de Google OAuth.
    """
    session_token = request.cookies.get("session_token")
    
    if session_token:
        # Eliminar sesión de la base de datos
        await db.user_sessions.delete_one({"session_token": session_token})
    
    # Eliminar cookie
    response.delete_cookie(
        key="session_token",
        path="/"
    )
    
    return {"message": "Sesión cerrada exitosamente"}
