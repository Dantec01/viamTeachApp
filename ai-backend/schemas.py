from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# ==================== STUDENT SCHEMAS ====================
class StudentBase(BaseModel):
    first_name: str
    last_name: str
    avatar_color: str
    course_id: int

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: int

    class Config:
        from_attributes = True

# ==================== COURSE SCHEMAS ====================
class CourseBase(BaseModel):
    name: str
    teacher_id: int

class CourseCreate(CourseBase):
    pass

class CourseResponse(CourseBase):
    id: int
    students: List[StudentResponse] = []

    class Config:
        from_attributes = True

# ==================== TEACHER SCHEMAS ====================
class TeacherBase(BaseModel):
    name: str
    title: str
    email: str
    avatar_url: Optional[str] = None

class TeacherCreate(TeacherBase):
    password: str

class TeacherResponse(TeacherBase):
    id: int
    courses: List[CourseResponse] = []

    class Config:
        from_attributes = True
