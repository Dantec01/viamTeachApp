import { useState, useEffect } from "react";
import { Search, Sparkles, BookHeart, Loader2 } from "lucide-react";
import { students as staticStudents } from "./StudentGrid";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

// TODO: Replace with actual backend API call for students as well later
const students = staticStudents;

const ReportsView = () => {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar el último reporte de la base de datos local
  useEffect(() => {
    if (!selectedStudent) {
      setReportData(null);
      return;
    }

    const fetchLastReport = async () => {
      setIsLoading(true);
      try {
        // Asumiendo que construiremos un endpoint que nos devuelva el último reporte de un alumno
        const response = await fetch(`http://localhost:8000/students/${selectedStudent.id}/reports/latest`);
        if (response.ok) {
          const data = await response.json();
          setReportData(data);
        } else {
          // Fallback con ceros si no hay reportes todavía
          setReportData(null);
        }
      } catch (error) {
        console.error("Error fetching report:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLastReport();
  }, [selectedStudent]);

  const filtered = query
    ? students.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
    : students;

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
                {s.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold">{s.name}</span>
            </button>
          ))}
        </div>
      )}

      {selectedStudent && (
        <div className="animate-fade-in space-y-4">
          <h2 className="text-lg font-extrabold text-foreground">
            Reporte de {selectedStudent.name}
          </h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Obteniendo datos de la IA...</p>
            </div>
          ) : !reportData ? (
            <div className="bg-card rounded-2xl p-8 border border-border text-center">
              <p className="text-sm text-muted-foreground">No hay observaciones registradas aún.</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Ve a la pestaña Clase y usa el micrófono para registrar el desempeño de {selectedStudent.name}.</p>
            </div>
          ) : (
            <>
              {/* Radar Chart */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Perfil Holístico
                </p>
                <ResponsiveContainer width="100%" height={240}>
                  <RadarChart data={[
                    { axis: "Ser", value: reportData.score_ser },
                    { axis: "Saber", value: reportData.score_saber },
                    { axis: "Hacer", value: reportData.score_hacer },
                    { axis: "Decidir", value: reportData.score_decidir },
                  ]} cx="50%" cy="50%" outerRadius="75%">
                    <PolarGrid stroke="hsl(30 15% 90%)" />
                    <PolarAngleAxis
                      dataKey="axis"
                      tick={{ fontSize: 11, fontWeight: 700, fill: "hsl(30 8% 50%)" }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      dataKey="value"
                      stroke="hsl(14 76% 55%)"
                      fill="hsl(14 76% 55%)"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* AI Summary */}
              <div className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-primary" />
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Resumen Cualitativo IA
                  </p>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {reportData.qualitative_summary}
                </p>
              </div>

              {/* Montessori Guide */}
              <div className="bg-accent/50 rounded-2xl p-4 border border-accent">
                <div className="flex items-center gap-2 mb-2">
                  <BookHeart size={16} className="text-accent-foreground" />
                  <p className="text-xs font-bold uppercase tracking-wider text-accent-foreground">
                    Guía Montessori Recomendada
                  </p>
                </div>
                <ul className="space-y-2 text-sm text-foreground/80">
                  {reportData.montessori_guide.split('\n').map((bullet: string, i: number) => {
                    if (!bullet.trim()) return null;
                    return (
                      <li key={i} className="flex gap-2">
                        <span className="text-primary font-bold">•</span>
                        {bullet.replace(/^[-*•]\s*/, '')}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsView;
