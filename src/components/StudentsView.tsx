import { useState, useEffect } from "react";
import { 
  History, 
  Edit3, 
  Trash2, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface Observation {
  id: number;
  content: string;
  sentiment: string;
  tags: string;
  createdAt: string;
  student: {
    name: string;
    lastname: string;
  };
}

interface StudentsViewProps {
  token: string | null;
  courseId: number | null;
  isPrivacyMode: boolean;
  apiBase: string;
}

const StudentsView = ({ token, courseId, isPrivacyMode, apiBase }: StudentsViewProps) => {
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingObs, setEditingObs] = useState<Observation | null>(null);
  const [editContent, setEditContent] = useState("");
  
  // Chat RAG states
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const { toast } = useToast();

  const handleSendChat = async () => {
    if (!chatInput.trim() || !courseId || !token) return;
    
    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput("");
    setChatLoading(true);

    try {
        const res = await fetch(`${apiBase}/rag/ask`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ courseId, question: userMsg })
        });
        
        if (res.ok) {
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
        } else {
            console.error("Chat info Error:", await res.text());
            toast({ title: "Error", description: "GuIA no pudo responder.", variant: "destructive" });
        }
    } catch (err) {
        console.error(err);
        toast({ title: "Red", description: "Fallo de conexión", variant: "destructive" });
    } finally {
        setChatLoading(false);
    }
  };

  const fetchObservations = async () => {
    if (!token || !courseId) return;
    try {
      setLoading(true);
      const res = await fetch(`${apiBase}/observations?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setObservations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObservations();
  }, [token, courseId]);

  const handleUpdate = async () => {
    if (!editingObs || !token) return;
    try {
      const res = await fetch(`${apiBase}/observations/${editingObs.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent }),
      });
      
      if (res.ok) {
        toast({ title: "Actualizado", description: "La nota fue corregida y re-analizada por GuIA." });
        setEditingObs(null);
        fetchObservations();
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudo actualizar la nota.", variant: "destructive" });
    }
  };

  const getDisplayName = (name: string, lastname: string) => {
    return isPrivacyMode ? `${name.charAt(0)}. ${lastname.charAt(0)}.` : `${name} ${lastname}`;
  };

  return (
    <div className="px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <History size={20} className="text-primary" />
            Últimos Registros
        </h2>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsChatOpen(true)}
            className="flex items-center gap-1.5 text-[11px] font-bold bg-primary text-white px-3 py-1.5 rounded-full shadow-lg active:scale-95 transition-transform"
          >
            <Sparkles size={12} />
            Preguntar a GuIA
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full"
          />
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sincronizando...</p>
        </div>
      ) : observations.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-muted-foreground">Aún no hay registros para este curso.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {observations.map((obs, index) => (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-[28px] p-5 shadow-sm border-none relative overflow-hidden group"
              >
                {/* Sentiment side bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    obs.sentiment === 'POSITIVE' ? 'bg-success' : 
                    obs.sentiment === 'NEGATIVE' ? 'bg-destructive' : 'bg-muted'
                }`} />

                <div className="flex justify-between items-start mb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1">
                        <Clock size={10} />
                        {new Date(obs.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-xs font-extrabold text-primary">
                        {getDisplayName(obs.student.name, obs.student.lastname)}
                    </span>
                  </div>
                  
                  <button 
                    onClick={() => { setEditingObs(obs); setEditContent(obs.content); }}
                    className="p-2 rounded-xl bg-surface-variant/40 text-muted-foreground active:scale-90 transition-transform"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>

                <p className="text-sm text-foreground/80 leading-snug mb-3">
                  {obs.content}
                </p>

                <div className="flex flex-wrap gap-2">
                    {obs.tags.split(',').map(tag => (
                        <span key={tag} className="text-[9px] font-bold bg-surface-variant/50 text-muted-foreground px-2 py-0.5 rounded-lg border border-border/50">
                            #{tag.trim()}
                        </span>
                    ))}
                    <div className="ml-auto">
                        {obs.sentiment === 'POSITIVE' && <CheckCircle2 size={14} className="text-success" />}
                        {obs.sentiment === 'NEGATIVE' && <AlertCircle size={14} className="text-destructive" />}
                    </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editingObs} onOpenChange={(v) => !v && setEditingObs(null)}>
        <DialogContent className="max-w-[90%] w-[400px] rounded-[32px] p-6 border-none">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <Edit3 size={18} className="text-primary" />
                Editar Nota
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                Alumno: {editingObs && getDisplayName(editingObs.student.name, editingObs.student.lastname)}
            </p>
            <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[120px] rounded-2xl bg-surface-variant/20 border-none focus-visible:ring-primary/20 text-sm"
            />
            <div className="flex gap-3">
                <button
                    onClick={() => setEditingObs(null)}
                    className="flex-1 rounded-2xl bg-secondary text-secondary-foreground py-3.5 text-sm font-bold active:scale-95 transition-transform"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleUpdate}
                    className="flex-[2] rounded-2xl bg-primary text-primary-foreground py-3.5 text-sm font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                    <Sparkles size={16} />
                    Guardar y Analizar
                </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat GuÍA Dialog */}
      <Dialog open={isChatOpen} onOpenChange={setIsChatOpen}>
        <DialogContent className="max-w-[95%] w-[450px] rounded-[32px] p-6 border-none h-[80vh] flex flex-col pt-10">
          <DialogTitle className="text-xl font-extrabold text-primary flex items-center gap-2 mb-4 shrink-0">
            <Sparkles size={24} />
            Chat GuIA
          </DialogTitle>
          <div className="flex-1 overflow-y-auto w-full flex flex-col gap-3 pr-2 mb-4 no-scrollbar">
             {chatMessages.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-center opacity-50">
                     <Sparkles size={40} className="mb-2 text-primary" />
                     <p className="text-sm font-bold">Soy GuIA, tu asistente.</p>
                     <p className="text-xs">Pregúntame sobre el rendimiento del curso o de un alumno en específico.</p>
                 </div>
             ) : (
                 chatMessages.map((msg, idx) => (
                    <div key={idx} className={`w-full flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-[24px] p-4 text-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-sm' : 'bg-surface-variant/40 text-foreground rounded-tl-sm'}`}>
                            {msg.content}
                        </div>
                    </div>
                 ))
             )}
             {chatLoading && (
                 <div className="w-full flex justify-start">
                     <div className="bg-surface-variant/40 text-foreground rounded-[24px] rounded-tl-sm p-4 text-sm flex gap-1 items-center">
                         <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                         <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-100" />
                         <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce delay-200" />
                     </div>
                 </div>
             )}
          </div>
          <div className="shrink-0 relative">
             <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Pregúntale a GuIA..."
                className="w-full bg-surface-variant/40 rounded-full px-5 py-4 text-[15px] placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all pr-14"
             />
             <button
                onClick={handleSendChat}
                disabled={chatLoading || !chatInput.trim()}
                className="absolute right-2 top-2 p-2 rounded-full bg-primary text-white shadow-lg active:scale-90 transition-transform disabled:opacity-50"
             >
                <Sparkles size={18} />
             </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentsView;
