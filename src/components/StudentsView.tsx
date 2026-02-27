import { useState } from "react";
import { Camera, Loader2, UserPlus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

const scannedNames = [
  "Valentina Quispe",
  "Alejandro Mamani",
  "Camila Choque",
  "Fernando Condori",
  "Isabella Flores",
];

type ScanState = "idle" | "scanning" | "done";

const StudentsView = () => {
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const handleScan = () => {
    setScanState("scanning");
    setTimeout(() => {
      setScanState("done");
      const initial: Record<string, boolean> = {};
      scannedNames.forEach((n) => (initial[n] = true));
      setChecked(initial);
    }, 2000);
  };

  const handleImport = () => {
    const selected = Object.entries(checked)
      .filter(([, v]) => v)
      .map(([k]) => k);
    toast({
      description: `${selected.length} alumnos importados al curso`,
      className: "bg-success text-success-foreground border-success",
    });
    setScanState("idle");
    setChecked({});
  };

  return (
    <div className="px-4 py-6 pb-20 flex flex-col items-center">
      {scanState === "idle" && (
        <div className="flex flex-col items-center gap-4 mt-8 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera size={36} className="text-primary" />
          </div>
          <button
            onClick={handleScan}
            className="w-full max-w-xs rounded-2xl bg-primary text-primary-foreground py-4 text-sm font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Camera size={18} />
            Escanear Lista de Asistencia (OCR)
          </button>
          <p className="text-xs text-muted-foreground text-center max-w-xs">
            Toma una foto de tu lista de alumnos en papel y la IA extraerá los nombres automáticamente.
          </p>
        </div>
      )}

      {scanState === "scanning" && (
        <div className="flex flex-col items-center gap-4 mt-16 animate-fade-in">
          <Loader2 size={40} className="text-primary animate-spin" />
          <p className="text-sm font-bold text-foreground">Extrayendo nombres con IA...</p>
          <p className="text-xs text-muted-foreground">Procesando imagen</p>
        </div>
      )}

      {scanState === "done" && (
        <div className="w-full animate-fade-in space-y-4">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Nombres detectados
          </p>
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {scannedNames.map((name) => (
              <label
                key={name}
                className="flex items-center gap-3 px-4 py-3.5 cursor-pointer active:bg-secondary/50 transition-colors"
              >
                <Checkbox
                  checked={!!checked[name]}
                  onCheckedChange={(v) =>
                    setChecked((prev) => ({ ...prev, [name]: !!v }))
                  }
                />
                <span className="text-sm font-semibold text-foreground">{name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleImport}
            className="w-full rounded-2xl bg-primary text-primary-foreground py-4 text-sm font-bold shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <UserPlus size={18} />
            Importar al Curso
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentsView;
