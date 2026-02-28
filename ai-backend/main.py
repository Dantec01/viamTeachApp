from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

import os
import aiofiles
import whisper
import models
import schemas
from ai_service import analyze_observation_with_ollama
from database import engine, get_db

# 1. Crear las tablas en SQLite al arrancar si no existen
models.Base.metadata.create_all(bind=engine)

# ==================== CARGA DE MODELO WHISPER ====================
# Cargamos el modelo más rápido de Whisper en memoria global
# Usamos 'tiny' (39MB) o 'base' (74MB) para ordenadores personales sin GPU.
print("Cargando modelo Whisper (esto puede tardar la primera vez)...")
whisper_model = whisper.load_model("base")
print("Modelo Whisper listo.")

app = FastAPI(title="viamTeachApp - AI Backend")

# Habilitar CORS para que React (Frontend) pueda comunicarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitir peticiones desde tu web
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "El Backend Montessori con IA esta Online", "status": "ok"}

# ==================== TEACHERS ====================
@app.post("/teachers/", response_model=schemas.TeacherResponse)
def create_teacher(teacher: schemas.TeacherCreate, db: Session = Depends(get_db)):
    # Solo ejemplo básico sin un hash real de seguridad
    db_teacher = models.Teacher(
        name=teacher.name,
        title=teacher.title,
        email=teacher.email,
        password_hash=teacher.password, # A cambiar a bcrypt después
        avatar_url=teacher.avatar_url
    )
    db.add(db_teacher)
    db.commit()
    db.refresh(db_teacher)
    return db_teacher

@app.get("/teachers/", response_model=List[schemas.TeacherResponse])
def get_teachers(db: Session = Depends(get_db)):
    return db.query(models.Teacher).all()

# ==================== COURSES ====================
@app.post("/courses/", response_model=schemas.CourseResponse)
def create_course(course: schemas.CourseCreate, db: Session = Depends(get_db)):
    db_course = models.Course(**course.model_dump())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

# ==================== STUDENTS ====================
@app.post("/students/", response_model=schemas.StudentResponse)
def create_student(student: schemas.StudentCreate, db: Session = Depends(get_db)):
    db_student = models.Student(**student.model_dump())
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

@app.get("/students/course/{course_id}", response_model=List[schemas.StudentResponse])
def get_students_by_course(course_id: int, db: Session = Depends(get_db)):
    return db.query(models.Student).filter(models.Student.course_id == course_id).all()

@app.get("/students/{student_id}/reports/latest")
def get_latest_student_report(student_id: int, db: Session = Depends(get_db)):
    # Buscamos el reporte más reciente del estudiante
    report = db.query(models.Report).filter(models.Report.student_id == student_id).order_by(models.Report.created_at.desc()).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Student has no reports yet")
        
    return report

# ==================== AI OBSERVATIONS & REPORTS ====================
from fastapi import UploadFile, File, Form

@app.post("/observations/")
async def create_observation(
    student_id: int = Form(...),
    audio_file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    1. Recibe el audio del frontend.
    2. Guarda el audio temporalmente.
    3. Usa Whisper para convertir a texto.
    4. Usa Ollama para el análisis Montessori.
    5. Guarda todo en la BD.
    """
    # 1. Guardar archivo localmente
    os.makedirs("uploads/audios", exist_ok=True)
    file_path = f"uploads/audios/{student_id}_{audio_file.filename}"
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await audio_file.read()
        await out_file.write(content)
        
    # 2. Transcribir con Whisper local
    print(f"Transcribiendo audio {file_path} con Whisper...")
    result = whisper_model.transcribe(file_path, language="es")
    texto_transcrito = result["text"]
    print(f"Texto extraído: {texto_transcrito}")
    
    # Guardar la base de la Observación en BD
    db_observation = models.Observation(
        student_id=student_id,
        audio_file_path=file_path,
        transcript=texto_transcrito
    )
    db.add(db_observation)
    db.commit()
    db.refresh(db_observation)
    
    # 3. Analizar texto con Ollama local (Método Montessori)
    print("Enviando transcripción a Ollama local para evaluación Montessori...")
    report_data = analyze_observation_with_ollama(texto_transcrito)
    
    # 4. Guardar Reporte en BD
    db_report = models.Report(
        student_id=student_id,
        observation_id=db_observation.id,
        score_ser=report_data.get("score_ser", 0),
        score_saber=report_data.get("score_saber", 0),
        score_hacer=report_data.get("score_hacer", 0),
        score_decidir=report_data.get("score_decidir", 0),
        qualitative_summary=report_data.get("qualitative_summary", ""),
        montessori_guide=report_data.get("montessori_guide", "")
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return {
        "status": "success",
        "transcription": texto_transcrito,
        "report": {
            "score_ser": db_report.score_ser,
            "score_saber": db_report.score_saber,
            "score_hacer": db_report.score_hacer,
            "score_decidir": db_report.score_decidir,
            "summary": db_report.qualitative_summary,
            "guide": db_report.montessori_guide
        }
    }
