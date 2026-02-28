import { useState, useEffect } from "react";
import { Search, Sparkles, BookHeart, History, Loader2 } from "lucide-react";
import { type Student } from "./StudentGrid";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";

interface ReportsViewProps {
  students: Student[];
  isPrivacyMode?: boolean;
  token: string | null;
  apiBase: string;
}

interface Observation {
    id: number;
    content: string;
    sentiment: string;
    tags: string;
}

const ReportsView = ({ students, isPrivacyMode, token, apiBase }: ReportsViewProps) => {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedStudent && token) {
      const fetchObs = async () => {
        setLoading(true);
        try {
          const res = await fetch(`${apiBase}/observations?studentId=${selectedStudent.id}`, {
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
      fetchObs();
    }
  }, [selectedStudent, token]);

  const filtered = query
    ? students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : students;
    
  const getDisplayName = (name: string, lastname?: string) => {
      if (isPrivacyMode) {
          return `${name.charAt(0)}. ${lastname?.charAt(0) || ""}.`;
      }
      return name;
  };

  // Calculate radar data from real observations
  const sentimentCounts = {
      POSITIVE: observations.filter(o => o.sentiment === 'POSITIVE').length,
      NEUTRAL: observations.filter(o => o.sentiment === 'NEUTRAL').length,
      NEGATIVE: observations.filter(o => o.sentiment === 'NEGATIVE').length,
  };

  const total = observations.length || 1;
  const radarData = [
    { axis: "Social", value: observations.filter(o => o.tags.toLowerCase().includes('social')).length * 20 + 40 },
    { axis: "Académico", value: observations.filter(o => o.tags.toLowerCase().includes('acad')).length * 20 + 40 },
    { axis: "Conducta", value: (sentimentCounts.POSITIVE - sentimentCounts.NEGATIVE) * 10 + 60 },
    { axis: "Participación", value: observations.filter(o => o.tags.toLowerCase().includes('part')).length * 20 + 40 },
  ];

  return (
    <div className="px-4 py-4 pb-20">
      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedStudent(null);
          }}
          placeholder="Buscar alumno..."
          className="w-full rounded-xl border border-input bg-card pl-9 pr-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      {!selectedStudent && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          {filtered.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSelectedStudent(s); setQuery(s.name); }}
              className="flex flex-col items-center gap-1 py-3 rounded-xl bg-card hover:bg-secondary transition-colors active:scale-95"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-foreground/70"
                style={{ backgroundColor: `hsl(${s.avatarColor})` }}
              >
                {getDisplayName(s.name, s.lastname).charAt(0)}
              </div>
              <span className="text-xs font-semibold">{getDisplayName(s.name, s.lastname)}</span>
            </button>
          ))}
        </div>
      )}

      {selectedStudent && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              Reporte de {getDisplayName(selectedStudent.name, selectedStudent.lastname)}
            </h2>
            <button onClick={() => setSelectedStudent(null)} className="text-[10px] uppercase font-bold text-primary">
                Cambiar Alumno
            </button>
          </div>

          {loading ? (
              <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-primary" size={32} />
              </div>
          ) : observations.length === 0 ? (
              <div className="bg-card rounded-[32px] p-8 text-center border-none">
                  <p className="text-sm text-muted-foreground">No hay observaciones grabadas aún para este alumno.</p>
              </div>
          ) : (
            <>
              {/* Radar Chart */}
              <div className="bg-card rounded-[32px] p-6 shadow-sm border-none">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Análisis Holístico Real
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Radar
                       dataKey="value"
                       stroke="hsl(var(--primary))"
                       fill="hsl(var(--primary))"
                       fillOpacity={0.15}
                       strokeWidth={3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Real Insights */}
              <div className="grid gap-3">
                 <div className="bg-card rounded-[32px] p-5 border-none shadow-sm relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Sparkles size={16} />
                      </div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        Resumen de GuIA
                      </p>
                    </div>
                    <p className="text-[15px] text-foreground/90 leading-relaxed font-medium">
                      Con {observations.length} observaciones registradas, GuIA detectó un sentimiento predominantemente **{sentimentCounts.POSITIVE > sentimentCounts.NEGATIVE ? 'Positivo' : 'Neutral'}**. 
                      Las áreas más recurrentes son **{radarData.sort((a,b) => b.value - a.value)[0].axis}**.
                    </p>
                 </div>

                 <div className="bg-surface-variant/40 rounded-[32px] p-5 border-none">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-xl bg-accent/20 flex items-center justify-center text-accent-foreground">
                            <BookHeart size={16} />
                        </div>
                        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                            Histórico Reciente
                        </p>
                    </div>
                    <div className="space-y-2">
                        {observations.slice(0, 2).map((obs) => (
                            <div key={obs.id} className="text-xs bg-white/50 p-2 rounded-lg">
                                <span className="font-bold text-primary block">{obs.sentiment}</span>
                                <p className="italic">"{obs.content?.substring(0, 60)}..."</p>
                            </div>
                        ))}
                    </div>
                 </div>
              </div>
            </>
          )}

          {/* MAGIC LINK BUTTON */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            className="w-full py-4 bg-primary text-white rounded-[24px] font-bold text-sm shadow-xl shadow-primary/25 flex items-center justify-center gap-2 group overflow-hidden relative"
          >
             <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Search size={16} className="text-white/80" />
            Generar Informe Real para Padres
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default ReportsView;
