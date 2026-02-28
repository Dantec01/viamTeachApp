import { Mic, Send, Square, AudioLines, Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { students } from "./StudentGrid";
import { motion, AnimatePresence } from "framer-motion";

interface CaptureAreaProps {
  selectedStudentId: number | null;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
}

const CaptureArea = ({ selectedStudentId, isRecording, setIsRecording }: CaptureAreaProps) => {
  const [note, setNote] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleMicPress = async () => {
    if (!selectedStudent) {
      toast({ description: "Selecciona un alumno primero", variant: "destructive" });
      return;
    }

    if (isRecording) {
      // Detener grabación
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    } else {
      // Iniciar grabación
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

          // Detener las pistas del micrófono para apagar la luz roja en el navegador
          stream.getTracks().forEach(track => track.stop());

          await uploadAudioToAI(audioBlob);
        };

        mediaRecorder.start();
        setIsRecording(true);
        toast({ description: `Grabando observación para ${selectedStudent.name}...` });
      } catch (err) {
        console.error("Error accediendo al micrófono:", err);
        toast({ description: "Error: No se pudo acceder al micrófono.", variant: "destructive" });
      }
    }
  };

  const uploadAudioToAI = async (audioBlob: Blob) => {
    if (!selectedStudent) return;

    setIsProcessing(true);
    toast({ description: "Enviando audio a la IA local para análisis..." });

    const formData = new FormData();
    // Agregamos un número aleatorio como ID provisorio (en el futuro esto viene del UUID real de DB)
    formData.append("student_id", selectedStudent.id.toString());
    formData.append("audio_file", audioBlob, `observacion_${Date.now()}.webm`);

    try {
      // Cambiar esto por tu IP de red local si lo pruebas en celular
      const response = await fetch("http://localhost:8000/observations/", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Error en el servidor de IA");

      const data = await response.json();
      console.log("Respuesta IA:", data);

      toast({
        title: "¡Análisis Completado!",
        description: `Transcripción: "${data.transcription.substring(0, 50)}..."`,
        variant: "default",
      });

    } catch (error) {
      console.error(error);
      toast({
        title: "Error de conexión",
        description: "Asegúrate de que el servidor FastAPI esté corriendo en localhost:8000",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
              className="px-4 py-1.5 rounded-full bg-primary text-white text-[10px] font-bold mb-4 shadow-xl shadow-primary/20 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              REGISTRANDO PARA {selectedStudent.name.toUpperCase()}
            </motion.div>
          )}
        </AnimatePresence>

        <div className={`w-full bg-card/70 backdrop-blur-3xl rounded-[32px] p-4 shadow-2xl border border-white/20 transition-all duration-500 ${isRecording ? 'border-destructive/30 ring-1 ring-destructive/10' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative flex items-center">
              <AnimatePresence mode="wait">
                {isRecording ? (
                  <motion.div
                    key="visualizer"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex-1 flex items-center gap-2 bg-destructive/10 rounded-2xl px-5 py-3.5 h-[52px]"
                  >
                    <div className="flex gap-1 items-center h-4">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ height: [4, 16, 4] }}
                          transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                          className="w-1 bg-destructive rounded-full"
                        />
                      ))}
                    </div>
                    <span className="text-[13px] font-bold text-destructive uppercase tracking-widest animate-pulse ml-2">En vivo...</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 relative"
                  >
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendNote()}
                      placeholder="Escribe una nota rápida..."
                      className="w-full bg-surface-variant/40 rounded-2xl px-5 py-3.5 text-[15px] placeholder:text-foreground/30 focus:outline-none transition-all border border-transparent focus:border-primary/20"
                    />
                    {note && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleSendNote}
                        className="absolute right-2 top-1.5 p-2 rounded-xl bg-primary text-white shadow-lg active:scale-90 transition-transform"
                      >
                        <Send size={18} />
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleMicPress}
              disabled={isProcessing}
              className={`relative z-10 w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-lg ${isRecording
                  ? "bg-destructive text-white scale-110 shadow-destructive/20"
                  : isProcessing
                    ? "bg-muted text-muted-foreground scale-95"
                    : "bg-primary text-white shadow-primary/20"
                }`}
            >
              {isProcessing ? (
                <Loader2 size={22} className="animate-spin" />
              ) : isRecording ? (
                <Square size={22} fill="currentColor" />
              ) : (
                <Mic size={22} />
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CaptureArea;


