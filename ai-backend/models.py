from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Teacher(Base):
    __tablename__ = "teachers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    title = Column(String)
    avatar_url = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

    courses = relationship("Course", back_populates="teacher")

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    teacher_id = Column(Integer, ForeignKey("teachers.id"))

    teacher = relationship("Teacher", back_populates="courses")
    students = relationship("Student", back_populates="course")

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    avatar_color = Column(String) # Guardaremos algo como HSL(240 50% 50%)
    course_id = Column(Integer, ForeignKey("courses.id"))

    course = relationship("Course", back_populates="students")
    observations = relationship("Observation", back_populates="student")
    reports = relationship("Report", back_populates="student")

class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    audio_file_path = Column(String) # La ruta física donde se guardó el audio
    transcript = Column(Text, nullable=True) # Lo que extrajo la IA Whisper
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="observations")
    report = relationship("Report", back_populates="observation", uselist=False)

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    observation_id = Column(Integer, ForeignKey("observations.id"))
    
    # 0 a 100 puntos en Radar
    score_ser = Column(Integer, default=0)
    score_saber = Column(Integer, default=0)
    score_hacer = Column(Integer, default=0)
    score_decidir = Column(Integer, default=0)
    
    qualitative_summary = Column(Text) # Generado por Ollama a texto completo
    montessori_guide = Column(Text) # Notas y sugerencias del método
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="reports")
    observation = relationship("Observation", back_populates="report")
