import { useState } from "react";
import { Search, Sparkles, BookHeart } from "lucide-react";
import { students } from "./StudentGrid";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const radarData = [
  { axis: "Ser", value: 68 },
  { axis: "Saber", value: 88 },
  { axis: "Hacer", value: 85 },
  { axis: "Decidir", value: 62 },
];

const ReportsView = () => {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<typeof students[0] | null>(null);

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

          {/* Radar Chart with recharts */}
          <div className="bg-card rounded-2xl p-4 border border-border">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
              Perfil Holístico
            </p>
            <ResponsiveContainer width="100%" height={240}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
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
              {selectedStudent.name} muestra un desarrollo destacado en la dimensión práctica (Hacer), con habilidades sólidas
              para aplicar conocimientos en situaciones reales. Se recomienda fortalecer la participación comunitaria
              y la toma de decisiones colaborativa para un crecimiento más equilibrado.
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
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                Implementar actividades de "gracia y cortesía" para reforzar valores de convivencia y respeto mutuo.
              </li>
              <li className="flex gap-2">
                <span className="text-primary font-bold">•</span>
                Incorporar proyectos grupales con roles rotativos para estimular la toma de decisiones y el liderazgo compartido.
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
