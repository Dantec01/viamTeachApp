import { Wifi, CloudOff, Search, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EduHeaderProps {
  selectedCourse: string;
  onSelectCourse: (course: string) => void;
}

const courses = [
  "Inglés - Principiantes",
  "Inglés - 1ro A",
  "Computación - Jueves",
];

const EduHeader = ({ selectedCourse, onSelectCourse }: EduHeaderProps) => {
  const [isOnline] = useState(true);
  const [showCourses, setShowCourses] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex flex-col pt-2 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between h-14 px-4">
        <button className="p-2 transition-colors rounded-full active:bg-primary/10">
          <Settings size={20} className="text-foreground/70" />
        </button>
        
        <div className="flex flex-col items-center">
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-[15px] font-bold tracking-tight text-foreground"
          >
            EduTrack
          </motion.h1>
          <button 
            onClick={() => setShowCourses(!showCourses)}
            className="flex items-center gap-1 text-[11px] font-medium text-primary hover:opacity-80 transition-opacity"
          >
            {selectedCourse}
            <ChevronDown size={12} className={`transition-transform duration-300 ${showCourses ? 'rotate-180' : ''}`} />
          </button>
        </div>

        <div className="flex items-center">
          <div className={`w-2 h-2 rounded-full mr-3 ${isOnline ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
          <button className="p-2 transition-colors rounded-full active:bg-primary/10">
            <Search size={20} className="text-foreground/70" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {showCourses && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-surface-variant/30"
          >
            <div className="flex gap-2 p-3 overflow-x-auto no-scrollbar">
              {courses.map((course) => (
                <button
                  key={course}
                  onClick={() => {
                    onSelectCourse(course);
                    setShowCourses(false);
                  }}
                  className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[11px] font-semibold transition-all ${
                    selectedCourse === course
                      ? "bg-primary text-white"
                      : "bg-background text-foreground/60 border border-border"
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default EduHeader;


