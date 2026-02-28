import { useState, useEffect } from "react";
import EduHeader from "@/components/EduHeader";
import StudentGrid, { type Student } from "@/components/StudentGrid";
import CaptureArea from "@/components/CaptureArea";
import BottomTabBar, { type TabId } from "@/components/BottomTabBar";
import ReportsView from "@/components/ReportsView";
import StudentsView from "@/components/StudentsView";
import ProfileView from "@/components/ProfileView";
import { motion, AnimatePresence } from "framer-motion";

// TIP: Usa tu IP local para que funcione en el celular (ej. 192.168.12.20)
const API_BASE = "http://192.168.12.20:3001/api";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("clase");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [courses, setCourses] = useState<{ id: number; name: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("Cargando...");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Automatic login for MVP/Demo
  useEffect(() => {
    const login = async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "profe@guia.edu", password: "admin123" }),
        });
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
        }
      } catch (err) {
        console.error("Login failed", err);
      }
    };
    login();
  }, []);

  // Fetch courses
  const fetchCourses = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data);
      if (data.length > 0) {
        const stillExists = data.find((c: any) => c.id === selectedCourseId);
        if (!selectedCourseId || !stillExists) {
          setSelectedCourse(data[0].name);
          setSelectedCourseId(data[0].id);
        }
      }

    } catch (err) {
      console.error("Fetch courses failed", err);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token]);


  // Fetch students
  useEffect(() => {
    if (!token || !selectedCourseId) return;
    const fetchStudents = async () => {
      try {
        const res = await fetch(`${API_BASE}/students?courseId=${selectedCourseId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error("Fetch students failed", err);
      }
    };
    fetchStudents();
  }, [token, selectedCourseId]);

  const handleCourseSelect = (name: string) => {
    setSelectedCourse(name);
    const course = courses.find((c) => c.name === name);
    if (course) setSelectedCourseId(course.id);
  };

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null;

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-background selection:bg-primary/20">
      <EduHeader 
        selectedCourse={selectedCourse} 
        onSelectCourse={handleCourseSelect} 
        isPrivacyMode={isPrivacyMode}
        onTogglePrivacy={() => setIsPrivacyMode(!isPrivacyMode)}
        courses={courses.map(c => c.name)}
      />

      <motion.div 
        layout
        className="flex-1 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {activeTab === "clase" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="clase-view"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col"
            >
              <main className="flex-1 overflow-y-auto pb-64 no-scrollbar">
                <StudentGrid
                  students={students}
                  selectedId={selectedStudentId}
                  isRecording={isRecording}
                  isPrivacyMode={isPrivacyMode}
                  onSelect={(id) =>
                    setSelectedStudentId((prev) => (prev === id ? null : id))
                  }
                />
              </main>
              <CaptureArea 
                selectedStudent={selectedStudent} 
                isRecording={isRecording}
                setIsRecording={setIsRecording}
                isPrivacyMode={isPrivacyMode}
                token={token}
                apiBase={API_BASE}
              />
            </motion.div>
          </AnimatePresence>
        )}

        {activeTab === "informes" && (
          <main className="flex-1 overflow-y-auto pb-24">
            <ReportsView 
                students={students} 
                isPrivacyMode={isPrivacyMode} 
                token={token}
                apiBase={API_BASE}
            />
          </main>
        )}

        {activeTab === "alumnos" && (
          <main className="flex-1 overflow-y-auto pb-24">
            <StudentsView 
                token={token} 
                courseId={selectedCourseId} 
                isPrivacyMode={isPrivacyMode} 
                apiBase={API_BASE}
            />
          </main>
        )}

        {activeTab === "perfil" && (
          <main className="flex-1 overflow-y-auto pb-24">
            <ProfileView 
              token={token} 
              apiBase={API_BASE} 
              onRefreshCourses={fetchCourses} 
            />
          </main>
        )}
      </motion.div>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;


