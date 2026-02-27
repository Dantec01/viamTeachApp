import { useState } from "react";
import EduHeader from "@/components/EduHeader";
import StudentGrid from "@/components/StudentGrid";
import CaptureArea from "@/components/CaptureArea";
import CourseSelector from "@/components/CourseSelector";
import BottomTabBar, { type TabId } from "@/components/BottomTabBar";
import ReportsView from "@/components/ReportsView";
import StudentsView from "@/components/StudentsView";
import ProfileView from "@/components/ProfileView";
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabId>("clase");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedCourse, setSelectedCourse] = useState("Inglés - Principiantes");

  return (
    <div className="flex flex-col min-h-[100dvh] max-w-md mx-auto bg-background selection:bg-primary/20">
      <EduHeader />

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
              <CourseSelector selectedCourse={selectedCourse} onSelect={setSelectedCourse} />
              <main className="flex-1 overflow-y-auto pb-64 no-scrollbar">
                <StudentGrid
                  selectedId={selectedStudentId}
                  onSelect={(id) =>
                    setSelectedStudentId((prev) => (prev === id ? null : id))
                  }
                />
              </main>
              <CaptureArea selectedStudentId={selectedStudentId} />
            </motion.div>
          </AnimatePresence>
        )}

        {activeTab === "informes" && (
          <main className="flex-1 overflow-y-auto pb-24">
            <ReportsView />
          </main>
        )}

        {activeTab === "alumnos" && (
          <main className="flex-1 overflow-y-auto pb-24">
            <StudentsView />
          </main>
        )}

        {activeTab === "perfil" && (
          <main className="flex-1 overflow-y-auto pb-24">
            <ProfileView />
          </main>
        )}
      </motion.div>

      <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default Index;

