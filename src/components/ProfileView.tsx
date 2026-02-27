import { useState } from "react";
import { BookOpen, Download, Shield, MessageCircle, LogOut } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const menuItems = [
  { icon: BookOpen, label: "Mis Cursos", color: "text-primary" },
  { icon: Download, label: "Exportar Cuaderno Pedagógico PDF", color: "text-primary" },
  { icon: Shield, label: "Privacidad y Datos", color: "text-primary" },
  { icon: MessageCircle, label: "Enviar Feedback / Ayuda", color: "text-primary", action: "feedback" },
];

const ProfileView = () => {
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
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
          JP
        </div>
        <div className="text-center">
          <h2 className="text-lg font-extrabold text-foreground">Dr. Pérez</h2>
          <p className="text-sm text-muted-foreground">Profesor de Inglés</p>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-card rounded-2xl border border-border divide-y divide-border">
        {menuItems.map(({ icon: Icon, label, action }) => (
          <button
            key={label}
            onClick={() => action === "feedback" && setFeedbackOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-4 text-left active:bg-secondary/50 transition-colors"
          >
            <Icon size={20} className="text-primary" />
            <span className="text-sm font-semibold text-foreground">{label}</span>
          </button>
        ))}
      </div>

      {/* Logout */}
      <button className="w-full mt-4 bg-card rounded-2xl border border-border px-4 py-4 text-left active:bg-secondary/50 transition-colors">
        <div className="flex items-center gap-3">
          <LogOut size={20} className="text-destructive" />
          <span className="text-sm font-semibold text-destructive">Cerrar Sesión</span>
        </div>
      </button>

      {/* Feedback Modal */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="max-w-sm mx-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold">Enviar Feedback</DialogTitle>
          </DialogHeader>
          <Textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Escribe tu comentario o sugerencia..."
            className="min-h-[120px] rounded-xl"
          />
          <button
            onClick={handleSendFeedback}
            className="w-full rounded-xl bg-primary text-primary-foreground py-3 text-sm font-bold active:scale-95 transition-transform"
          >
            Enviar
          </button>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfileView;
