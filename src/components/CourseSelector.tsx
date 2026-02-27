import { motion } from "framer-motion";

interface CourseSelectorProps {
  selectedCourse: string;
  onSelect: (course: string) => void;
}

const courses = [
  "Inglés - Principiantes",
  "Inglés - 1ro A",
  "Computación - Jueves",
];

const CourseSelector = ({ selectedCourse, onSelect }: CourseSelectorProps) => {
  return (
    <div className="px-4 py-4 overflow-x-auto scrollbar-hide no-scrollbar">
      <motion.div 
        className="flex gap-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {courses.map((course) => {
          const isActive = selectedCourse === course;
          return (
            <button
              key={course}
              onClick={() => onSelect(course)}
              className={`relative whitespace-nowrap rounded-[16px] px-5 py-2.5 text-[13px] font-medium transition-all duration-300 ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "bg-surface-variant text-on-surface-variant hover:bg-secondary active:bg-secondary"
              }`}
            >
              {course}
            </button>
          );
        })}
      </motion.div>
    </div>
  );
};

export default CourseSelector;

