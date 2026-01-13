from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import shutil
from datetime import datetime, timezone
from pathlib import Path

router = APIRouter(prefix="/api/beats", tags=["beats"])

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Directorio para almacenar archivos
UPLOAD_DIR = Path("/app/uploads")
AUDIO_DIR = UPLOAD_DIR / "audio"
COVERS_DIR = UPLOAD_DIR / "covers"
WAV_DIR = UPLOAD_DIR / "wav"
STEMS_DIR = UPLOAD_DIR / "stems"

# Crear directorios si no existen
AUDIO_DIR.mkdir(parents=True, exist_ok=True)
COVERS_DIR.mkdir(parents=True, exist_ok=True)
WAV_DIR.mkdir(parents=True, exist_ok=True)
STEMS_DIR.mkdir(parents=True, exist_ok=True)


class BeatResponse(BaseModel):
    beat_id: str
    name: str
    genre: str
    bpm: int
    key: str
    mood: str
    price_basica: float
    price_premium: float
    price_exclusiva: float
    audio_url: str
    cover_url: str
    wav_url: Optional[str] = None
    stems_url: Optional[str] = None
    plays: int = 0
    sales: int = 0
    created_at: str
    is_available: bool = True


class BeatListResponse(BaseModel):
    beats: List[BeatResponse]
    total: int


@router.post("/upload")
async def upload_beat(
    name: str = Form(...),
    genre: str = Form(...),
    bpm: int = Form(...),
    key: str = Form(...),
    mood: str = Form(...),
    price_basica: float = Form(...),
    price_premium: float = Form(...),
    price_exclusiva: float = Form(...),
    audio_file: UploadFile = File(...),
    cover_file: UploadFile = File(...),
    wav_file: Optional[UploadFile] = File(None),
    stems_file: Optional[UploadFile] = File(None)
):
    """Subir un nuevo beat con archivo de audio, WAV, stems e imagen de portada"""
    
    # Validar tipos de archivo
    audio_extensions = ['.mp3']
    wav_extensions = ['.wav']
    stems_extensions = ['.rar', '.zip']
    image_extensions = ['.png', '.jpg', '.jpeg', '.webp']
    
    audio_ext = Path(audio_file.filename).suffix.lower()
    cover_ext = Path(cover_file.filename).suffix.lower()
    
    if audio_ext not in audio_extensions:
        raise HTTPException(status_code=400, detail="Formato de audio no válido. Use MP3 para el archivo de exhibición.")
    
    if cover_ext not in image_extensions:
        raise HTTPException(status_code=400, detail="Formato de imagen no válido. Use PNG, JPG o WEBP.")
    
    # Generar ID único para el beat
    beat_id = f"beat_{uuid.uuid4().hex[:12]}"
    
    # Guardar archivo de audio MP3 (exhibición y básica)
    audio_filename = f"{beat_id}{audio_ext}"
    audio_path = AUDIO_DIR / audio_filename
    
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio_file.file, buffer)
    
    # Guardar imagen de portada
    cover_filename = f"{beat_id}{cover_ext}"
    cover_path = COVERS_DIR / cover_filename
    
    with open(cover_path, "wb") as buffer:
        shutil.copyfileobj(cover_file.file, buffer)
    
    # Guardar archivo WAV si existe (premium y exclusiva)
    wav_filename = None
    if wav_file and wav_file.filename:
        wav_ext = Path(wav_file.filename).suffix.lower()
        if wav_ext not in wav_extensions:
            raise HTTPException(status_code=400, detail="Formato WAV no válido.")
        wav_filename = f"{beat_id}{wav_ext}"
        wav_path = WAV_DIR / wav_filename
        with open(wav_path, "wb") as buffer:
            shutil.copyfileobj(wav_file.file, buffer)
    
    # Guardar archivo de stems si existe (solo exclusiva)
    stems_filename = None
    if stems_file and stems_file.filename:
        stems_ext = Path(stems_file.filename).suffix.lower()
        if stems_ext not in stems_extensions:
            raise HTTPException(status_code=400, detail="Formato de stems no válido. Use RAR o ZIP.")
        stems_filename = f"{beat_id}_stems{stems_ext}"
        stems_path = STEMS_DIR / stems_filename
        with open(stems_path, "wb") as buffer:
            shutil.copyfileobj(stems_file.file, buffer)
    
    # Crear documento del beat
    beat_doc = {
        "beat_id": beat_id,
        "name": name,
        "genre": genre,
        "bpm": bpm,
        "key": key,
        "mood": mood,
        "price_basica": price_basica,
        "price_premium": price_premium,
        "price_exclusiva": price_exclusiva,
        "audio_filename": audio_filename,
        "cover_filename": cover_filename,
        "wav_filename": wav_filename,
        "stems_filename": stems_filename,
        "plays": 0,
        "sales": 0,
        "is_available": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Guardar en MongoDB
    await db.beats.insert_one(beat_doc)
    
    return {
        "message": "Beat subido exitosamente",
        "beat_id": beat_id,
        "name": name
    }


@router.get("", response_model=BeatListResponse)
async def get_beats(
    genre: Optional[str] = None,
    search: Optional[str] = None,
    sort: str = "recent",
    limit: int = 50,
    skip: int = 0
):
    """Obtener lista de beats con filtros opcionales"""
    
    # Construir query
    query = {"is_available": True}
    
    if genre and genre != "all":
        query["genre"] = genre
    
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"genre": {"$regex": search, "$options": "i"}},
            {"mood": {"$regex": search, "$options": "i"}}
        ]
    
    # Determinar ordenamiento
    sort_field = "created_at"
    sort_order = -1  # Descendente por defecto
    
    if sort == "popular":
        sort_field = "plays"
    elif sort == "price-low":
        sort_field = "price_basica"
        sort_order = 1
    elif sort == "price-high":
        sort_field = "price_basica"
        sort_order = -1
    
    # Obtener beats
    cursor = db.beats.find(query, {"_id": 0}).sort(sort_field, sort_order).skip(skip).limit(limit)
    beats_raw = await cursor.to_list(length=limit)
    
    # Obtener total
    total = await db.beats.count_documents(query)
    
    # Construir URLs para archivos
    backend_url = os.environ.get('BACKEND_URL', '')
    
    beats = []
    for beat in beats_raw:
        beats.append(BeatResponse(
            beat_id=beat["beat_id"],
            name=beat["name"],
            genre=beat["genre"],
            bpm=beat["bpm"],
            key=beat["key"],
            mood=beat["mood"],
            price_basica=beat["price_basica"],
            price_premium=beat["price_premium"],
            price_exclusiva=beat["price_exclusiva"],
            audio_url=f"/api/beats/audio/{beat['audio_filename']}",
            cover_url=f"/api/beats/cover/{beat['cover_filename']}",
            plays=beat.get("plays", 0),
            sales=beat.get("sales", 0),
            created_at=beat["created_at"],
            is_available=beat.get("is_available", True)
        ))
    
    return BeatListResponse(beats=beats, total=total)


@router.get("/{beat_id}")
async def get_beat(beat_id: str):
    """Obtener un beat específico por ID"""
    
    beat = await db.beats.find_one({"beat_id": beat_id}, {"_id": 0})
    
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    return BeatResponse(
        beat_id=beat["beat_id"],
        name=beat["name"],
        genre=beat["genre"],
        bpm=beat["bpm"],
        key=beat["key"],
        mood=beat["mood"],
        price_basica=beat["price_basica"],
        price_premium=beat["price_premium"],
        price_exclusiva=beat["price_exclusiva"],
        audio_url=f"/api/beats/audio/{beat['audio_filename']}",
        cover_url=f"/api/beats/cover/{beat['cover_filename']}",
        plays=beat.get("plays", 0),
        sales=beat.get("sales", 0),
        created_at=beat["created_at"],
        is_available=beat.get("is_available", True)
    )


@router.get("/audio/{filename}")
async def get_audio(filename: str):
    """Servir archivo de audio"""
    file_path = AUDIO_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Archivo de audio no encontrado")
    
    # Determinar tipo de contenido
    content_type = "audio/mpeg" if filename.endswith(".mp3") else "audio/wav"
    
    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename
    )


@router.get("/cover/{filename}")
async def get_cover(filename: str):
    """Servir imagen de portada"""
    file_path = COVERS_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Imagen no encontrada")
    
    # Determinar tipo de contenido
    ext = Path(filename).suffix.lower()
    content_types = {
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".webp": "image/webp"
    }
    content_type = content_types.get(ext, "image/jpeg")
    
    return FileResponse(
        path=file_path,
        media_type=content_type,
        filename=filename
    )


@router.post("/{beat_id}/play")
async def increment_plays(beat_id: str):
    """Incrementar contador de reproducciones"""
    
    result = await db.beats.update_one(
        {"beat_id": beat_id},
        {"$inc": {"plays": 1}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    return {"message": "Play registrado"}


@router.delete("/{beat_id}")
async def delete_beat(beat_id: str):
    """Eliminar un beat"""
    
    # Obtener beat para eliminar archivos
    beat = await db.beats.find_one({"beat_id": beat_id})
    
    if not beat:
        raise HTTPException(status_code=404, detail="Beat no encontrado")
    
    # Eliminar archivos
    audio_path = AUDIO_DIR / beat["audio_filename"]
    cover_path = COVERS_DIR / beat["cover_filename"]
    
    if audio_path.exists():
        audio_path.unlink()
    if cover_path.exists():
        cover_path.unlink()
    
    # Eliminar de la base de datos
    await db.beats.delete_one({"beat_id": beat_id})
    
    return {"message": "Beat eliminado exitosamente"}
