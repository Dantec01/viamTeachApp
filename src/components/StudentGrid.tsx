import { motion } from "framer-motion";

interface Student {
  id: number;
  name: string;
  avatarColor: string;
}

const students: Student[] = [
  { id: 1, name: "Mateo", avatarColor: "340 60% 85%" },
  { id: 2, name: "Ana", avatarColor: "200 60% 85%" },
  { id: 3, name: "Lucía", avatarColor: "150 50% 85%" },
  { id: 4, name: "Carlos", avatarColor: "40 60% 85%" },
  { id: 5, name: "Sofía", avatarColor: "270 50% 85%" },
  { id: 6, name: "Diego", avatarColor: "20 70% 85%" },
];

interface StudentGridProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
}

const StudentGrid = ({ selectedId, onSelect }: StudentGridProps) => {
  return (
    <div className="px-4 py-2">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[13px] font-medium text-foreground/50 mb-4 px-2"
      >
        Lista de alumnos
      </motion.p>
      <div className="grid grid-cols-2 gap-4">
        {students.map((student, index) => {
          const isSelected = selectedId === student.id;
          const initials = student.name.charAt(0);
          return (
            <motion.button
              key={student.id}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(student.id)}
              className={`relative flex flex-col items-center gap-3 p-5 rounded-[28px] transition-all duration-300 ${
                isSelected
                  ? "bg-primary/10 ring-2 ring-primary shadow-xl shadow-primary/5 scale-[1.02]"
                  : "bg-surface-variant hover:bg-secondary active:scale-[0.98]"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-medium transition-transform duration-500 ${isSelected ? 'scale-110' : ''}`}
                style={{ backgroundColor: `hsl(${student.avatarColor})` }}
              >
                {initials}
              </div>
              <span className={`text-[15px] font-medium tracking-tight ${isSelected ? "text-primary font-bold" : "text-on-surface-variant"}`}>
                {student.name}
              </span>
              
              {isSelected && (
                <motion.div 
                  layoutId="selection-ring"
                  className="absolute inset-0 rounded-[28px] ring-2 ring-primary"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default StudentGrid;
export { students };

