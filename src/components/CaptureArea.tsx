import { Mic, Send, Square, Sparkles } from "lucide-react";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { type Student } from "./StudentGrid";
import { motion, AnimatePresence } from "framer-motion";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";

interface CaptureAreaProps {
  selectedStudent: Student | null;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  isPrivacyMode?: boolean;
  token: string | null;
  apiBase: string;
}

const CaptureArea = ({ selectedStudent, isRecording, setIsRecording, isPrivacyMode, token, apiBase }: CaptureAreaProps) => {
  const [note, setNote] = useState("");
  const [transcript, setTranscript] = useState("");
  const { toast } = useToast();

  const studentDisplayName = isPrivacyMode 
    ? `${selectedStudent?.name.charAt(0)}. ${selectedStudent?.lastname?.charAt(0) || ""}.` 
    : selectedStudent?.name;

  const {
    transcript: speechObjTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const handleMicPress = async () => {
    if (!selectedStudent || !token) {
      toast({
        description: "Selecciona un alumno primero",
        variant: "destructive",
      });
      return;
    }

    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "No Soportado",
        description: "Tu navegador no soporta el dictado por voz offline/nativo.",
        variant: "destructive"
      });
      return;
    }

    if (listening) {
        SpeechRecognition.stopListening();
        setIsRecording(false);
        
        if (!speechObjTranscript.trim()) {
            toast({ title: "Sin audio", description: "No se escuchó nada." });
            return;
        }

        toast({ title: "GuIA Procesando...", description: "Guardando nota de voz transcrita..." });
        
        try {
            const res = await fetch(`${apiBase}/observations`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    studentId: selectedStudent.id,
                    content: `Voz: ${speechObjTranscript}`
                })
            });

            if (res.ok) {
                const data = await res.json();
                toast({ 
                  title: "¡Nota Registrada!", 
                  description: `Registrado como '${data.sentiment}' con etiquetas: ${data.tags}`,
                  className: "bg-success text-success-foreground border-success"
                });
                resetTranscript();
            } else {
                toast({ title: "Error", description: "No se pudo procesar la nota.", variant: "destructive" });
            }
        } catch (err) {
            console.error(err);
            toast({ title: "Error de red", description: "Fallo de conexión", variant: "destructive" });
        }

    } else {
        resetTranscript();
        SpeechRecognition.startListening({ continuous: true, language: 'es-ES' });
        setIsRecording(true);
    }
  };

  const handleSendNote = async () => {
    if (!selectedStudent || !token) {
      toast({
        description: "Selecciona un alumno primero",
        variant: "destructive",
      });
      return;
    }
    if (!note.trim()) return;

    toast({
      title: "Enviando a GuIA...",
      description: "Analizando contenido...",
    });

    try {
        const res = await fetch(`${apiBase}/observations`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                studentId: selectedStudent.id,
                content: note
            })
        });

        if (res.ok) {
            const data = await res.json();
            toast({
              title: "Nota guardada",
              description: `Registrado como '${data.sentiment}' con etiquetas: ${data.tags}`,
            });
            setNote("");
        }
    } catch (err) {
        toast({ title: "Error", description: "No se pudo conectar con el servidor.", variant: "destructive" });
    }
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
              REGISTRANDO PARA {studentDisplayName?.toUpperCase()}
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
                    <span className="text-[13px] font-bold text-destructive uppercase tracking-widest animate-pulse ml-2 overflow-hidden text-ellipsis whitespace-nowrap">
                      {transcript || "Escuchando..."}
                    </span>
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
              className={`relative z-10 w-14 h-14 rounded-[22px] flex items-center justify-center transition-all duration-500 shadow-lg ${
                isRecording 
                  ? "bg-destructive text-white scale-110 shadow-destructive/20" 
                  : "bg-primary text-white shadow-primary/20"
              }`}
            >
              {isRecording ? <Square size={22} fill="currentColor" /> : <Mic size={22} />}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CaptureArea;


