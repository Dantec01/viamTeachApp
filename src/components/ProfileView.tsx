import { useState } from "react";
import { BookOpen, Download, Shield, MessageCircle, LogOut, Camera, Loader2, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import CourseManagement from "./CourseManagement";
import { AnimatePresence } from "framer-motion";

const menuItems = [
  { icon: BookOpen, label: "Gestionar Mis Cursos", color: "text-primary", action: "courses" },
  { icon: Download, label: "Exportar Cuaderno Pedagógico PDF", color: "text-primary" },
  { icon: Shield, label: "Privacidad y Datos", color: "text-primary" },
  { icon: MessageCircle, label: "Enviar Feedback / Ayuda", color: "text-primary", action: "feedback" },
];

const ProfileView = ({ token, apiBase, onRefreshCourses }: { 
  token: string | null; 
  apiBase: string;
  onRefreshCourses: () => void;
}) => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [showCourses, setShowCourses] = useState(false);
  const { toast } = useToast();

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    toast({
      description: "¡Gracias! Tu feedback fue enviado.",
      className: "bg-success text-success-foreground border-success",
    });
    setFeedbackText("");
    setFeedbackOpen(false);
  };

  return (
    <div className="px-4 py-6 pb-20">
      {/* Profile header */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-extrabold text-primary">
          GP
        </div>
        <div className="text-center">
          <h2 className="text-lg font-extrabold text-foreground">Profe GuIA</h2>
          <p className="text-sm text-muted-foreground">Administrador Pedagógico</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-card rounded-[32px] border border-border divide-y divide-border overflow-hidden mb-6">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={() => {
                if (action === "feedback") setFeedbackOpen(true);
                if (action === "courses") setShowCourses(true);
            }}
            className="w-full flex items-center gap-3 px-6 py-4 text-left active:bg-secondary/50 transition-colors"
          >
            <Icon size={18} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Premium Stats - WOW Factor */}
      <div className="bg-primary/5 rounded-[32px] p-6 border border-primary/10 mb-6">
          <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Resumen de Impacto</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <p className="text-2xl font-black text-primary">124</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Notas GuIA</p>
              </div>
              <div className="text-center p-4 bg-white/50 rounded-2xl">
                  <p className="text-2xl font-black text-primary">8</p>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">Cursos Activos</p>
              </div>
          </div>
      </div>

      {/* Logout */}
      <button className="w-full shadow-sm bg-card rounded-[24px] border border-border px-6 py-4 text-left active:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-3">
          <LogOut size={18} className="text-destructive" />
          <span className="text-sm font-semibold text-destructive">Cerrar Sesión</span>
        </div>
      </button>

      {/* Course Management Overlay */}
      <AnimatePresence>
          {showCourses && (
              <CourseManagement 
                token={token} 
                apiBase={apiBase} 
                onClose={() => setShowCourses(false)} 
                onRefreshCourses={onRefreshCourses}
              />
          )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-[90%] w-[400px] rounded-[32px] p-6 border-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-foreground">Enviar Feedback</DialogTitle>
          </DialogHeader>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Escribe tu comentario o sugerencia para GuIA..."
            className="min-h-[150px] rounded-2xl border-border bg-surface-variant/20 focus-visible:ring-primary/20"
          />
          <button
            onClick={handleSendFeedback}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-4 text-sm font-bold active:scale-95 transition-transform"
          >
            Enviar Comentarios
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileView;
