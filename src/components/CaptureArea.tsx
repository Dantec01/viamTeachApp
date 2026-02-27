import { Mic, Send, Square } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { students } from "./StudentGrid";
import { motion, AnimatePresence } from "framer-motion";

interface CaptureAreaProps {
  selectedStudentId: number | null;
}

const CaptureArea = ({ selectedStudentId }: CaptureAreaProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleMicPress = () => {
    if (!selectedStudent) {
      toast({
        description: "Selecciona un alumno primero",
        variant: "destructive",
      });
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      toast({
        description: `Observación guardada — ${selectedStudent.name}`,
        variant: "default",
      });
    } else {
      setIsRecording(true);
    }
  };

  const handleSendNote = () => {
    if (!selectedStudent) {
      toast({
        description: "Selecciona un alumno primero",
        variant: "destructive",
      });
      return;
    }
    if (!note.trim()) return;

    toast({
      description: `Nota guardada — ${selectedStudent.name}`,
    });
    setNote("");
  };

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-[90px] left-0 right-0 z-40 px-6 pointer-events-none"
    >
      <div className="max-w-md mx-auto flex flex-col items-center pointer-events-auto">
        <AnimatePresence>
          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold mb-4 backdrop-blur-md border border-primary/20"
            >
              Grabando para {selectedStudent.name}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-full bg-card/60 backdrop-blur-2xl rounded-[32px] p-4 shadow-2xl shadow-primary/5 border border-white/20">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendNote()}
                placeholder={isRecording ? "Grabando voz..." : "Escribe una nota rápida..."}
                className="w-full bg-surface-variant/50 rounded-2xl px-5 py-3.5 text-[15px] placeholder:text-foreground/30 focus:outline-none transition-all"
              />
              <AnimatePresence>
                {note && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={handleSendNote}
                    className="absolute right-2 top-1.5 p-2 rounded-xl bg-primary text-white shadow-lg active:scale-90 transition-transform"
                  >
                    <Send size={20} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMicPress}
              className={`relative z-10 w-14 h-14 rounded-[20px] flex items-center justify-center transition-all duration-500 shadow-lg ${
                isRecording 
                  ? "bg-destructive text-white recording-pulse scale-110" 
                  : "bg-primary text-white"
              }`}
            >
              {isRecording ? <Square size={24} fill="currentColor" /> : <Mic size={24} />}
            </motion.button>
          </div>
          
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 40, opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center justify-center gap-1.5 mt-2"
              >
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: [8, 20, 8] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-destructive rounded-full"
                  />
                ))}
                <span className="ml-2 text-[11px] font-bold text-destructive uppercase tracking-widest">En vivo</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CaptureArea;

