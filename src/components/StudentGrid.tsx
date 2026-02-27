import { motion } from "framer-motion";

interface Student {
  id: number;
  name: string;
  lastname: string;
  avatarColor: string;
}

const students: Student[] = [
  { id: 1, name: "Mateo", lastname: "García", avatarColor: "340 60% 85%" },
  { id: 2, name: "Ana", lastname: "López", avatarColor: "200 60% 85%" },
  { id: 3, name: "Lucía", lastname: "Rodríguez", avatarColor: "150 50% 85%" },
  { id: 4, name: "Carlos", lastname: "Sánchez", avatarColor: "40 60% 85%" },
  { id: 5, name: "Sofía", lastname: "Martínez", avatarColor: "270 50% 85%" },
  { id: 6, name: "Diego", lastname: "Pérez", avatarColor: "20% 70% 85%" },
];

interface StudentGridProps {
  selectedId: number | null;
  onSelect: (id: number) => void;
  isRecording?: boolean;
}

const StudentGrid = ({ selectedId, onSelect, isRecording }: StudentGridProps) => {
  return (
    <div className="px-4 py-4">
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[12px] font-bold text-foreground/40 mb-4 px-2 uppercase tracking-widest"
      >
        Estudiantes registrados
      </motion.p>
      <div className="flex flex-col gap-3">
        {students.map((student, index) => {
          const isSelected = selectedId === student.id;
          const initials = student.name.charAt(0) + student.lastname.charAt(0);
          
          return (
            <motion.button
              key={student.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              onClick={() => !isRecording && onSelect(student.id)}
              disabled={isRecording && !isSelected}
              className={`relative flex items-center gap-4 p-4 rounded-[24px] transition-all duration-300 ${
                isSelected
                  ? "bg-primary/10 ring-2 ring-primary shadow-lg shadow-primary/5"
                  : "bg-surface-variant/40 hover:bg-secondary active:scale-[0.98]"
              } ${isRecording && !isSelected ? "opacity-40 grayscale-[0.5]" : ""}`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-[13px] font-bold transition-transform duration-500 ${isSelected ? 'scale-110 shadow-md' : 'shadow-sm'}`}
                style={{ backgroundColor: `hsl(${student.avatarColor})` }}
              >
                {initials}
              </div>
              <div className="flex flex-col items-start">
                <span className={`text-[15px] font-semibold tracking-tight ${isSelected ? "text-primary" : "text-foreground"}`}>
                  {student.name}
                </span>
                <span className="text-[12px] text-foreground/50">
                  {student.lastname}
                </span>
              </div>
              
              {isSelected && (
                <motion.div 
                  layoutId="selection-bubble"
                  className="absolute inset-0 rounded-[24px] ring-2 ring-primary bg-primary/5 -z-10"
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


