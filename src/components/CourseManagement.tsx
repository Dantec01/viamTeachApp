import { useState, useEffect } from "react";
import { 
  ChevronLeft, Plus, Users, Trash2, Camera, Loader2, Save, X, UserPlus 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface Course {
  id: number;
  name: string;
}

interface Student {
  id: number;
  name: string;
  lastname: string;
}

interface CourseManagementProps {
  token: string | null;
  apiBase: string;
  onClose: () => void;
  onRefreshCourses: () => void;
}

const CourseManagement = ({ token, apiBase, onClose, onRefreshCourses }: CourseManagementProps) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddCourse, setShowAddCourse] = useState(false);
  const [newCourseName, setNewCourseName] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [extractedNames, setExtractedNames] = useState<string[]>([]);
  const [checkedNames, setCheckedNames] = useState<Record<string, boolean>>({});
  const [manualName, setManualName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchStudents(selectedCourse.id);
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${apiBase}/courses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setCourses(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async (courseId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/students?courseId=${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    if (!newCourseName.trim()) return;
    try {
      const res = await fetch(`${apiBase}/courses`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ name: newCourseName }),
      });
      if (res.ok) {
        const newCourse = await res.json();
        setCourses([...courses, newCourse]);
        onRefreshCourses();
        setNewCourseName("");
        setShowAddCourse(false);
        setSelectedCourse(newCourse); // Ir directo a agregar alumnos
        toast({ title: "Curso Creado", description: "Ahora puedes agregar estudiantes." });
      }
    } catch (err) {
      toast({ title: "Error", description: "No se pudo crear el curso.", variant: "destructive" });
    }
  };

  const handleAddManualStudent = async () => {
    if (!manualName.trim() || !selectedCourse) return;
    const parts = manualName.trim().split(" ");
    const name = parts[0];
    const lastname = parts.slice(1).join(" ") || "Apel.";

    try {
      const res = await fetch(`${apiBase}/students`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name, 
          lastname, 
          courseId: selectedCourse.id.toString() 
        }),
      });
      if (res.ok) {
        const newStudent = await res.json();
        setStudents([...students, newStudent]);
        setManualName("");
        toast({ title: "Estudiante Agregado" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedCourse) return;

    setIsScanning(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch(`${apiBase}/students/scan`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await res.json();
      setExtractedNames(data.names || []);
      const initial: Record<string, boolean> = {};
      (data.names || []).forEach((n: string) => (initial[n] = true));
      setCheckedNames(initial);
      setIsScanning(false);
    } catch (err) {
      setIsScanning(false);
      toast({ title: "Error en OCR", variant: "destructive" });
    }
  };

  const handleImportScanned = async () => {
    const selected = Object.entries(checkedNames)
      .filter(([, v]) => v)
      .map(([k]) => k);

    for (const fullName of selected) {
      const parts = fullName.split(" ");
      const name = parts[0];
      const lastname = parts.slice(1).join(" ") || "Apel.";
      
      await fetch(`${apiBase}/students`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          name, 
          lastname, 
          courseId: selectedCourse?.id.toString() 
        }),
      });
    }

    if (selectedCourse) fetchStudents(selectedCourse.id);
    setExtractedNames([]);
    toast({ title: "Importación Finalizada", description: `${selected.length} alumnos agregados.` });
  };

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed inset-0 bg-background z-50 flex flex-col"
    >
      {/* Header */}
      <div className="px-4 py-6 flex items-center gap-4 border-b border-border">
        <button onClick={selectedCourse ? () => setSelectedCourse(null) : () => { onRefreshCourses(); onClose(); }} className="p-2 -ml-2 rounded-full active:bg-secondary">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-extrabold tracking-tight">
          {selectedCourse ? `Gestionar ${selectedCourse.name}` : "Gestión de Cursos"}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {!selectedCourse ? (
          <>
            {/* Lista de Cursos */}
            <div className="grid gap-3">
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCourse(c)}
                  className="flex items-center justify-between p-5 bg-card rounded-[24px] border border-border active:scale-95 transition-transform"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">Toca para gestionar alumnos</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button 
              onClick={() => setShowAddCourse(true)}
              className="w-full py-4 bg-primary text-primary-foreground rounded-[24px] font-bold shadow-lg flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Crear Nuevo Curso
            </button>
          </>
        ) : (
          <>
            {/* Gestión del Curso Seleccionado */}
            <div className="space-y-6">
              <div className="bg-card rounded-[32px] p-6 border border-border">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Agregar Estudiantes</h3>
                
                <div className="space-y-4">
                  {/* Manual Input */}
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="Nombre Completo..."
                      className="flex-1 px-4 py-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <button 
                      onClick={handleAddManualStudent}
                      className="p-3 bg-primary text-primary-foreground rounded-xl active:scale-90 transition-transform"
                    >
                      <Plus size={20} />
                    </button>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground font-bold">o escanea lista</span></div>
                  </div>

                  {/* OCR Button */}
                  <label className="w-full py-4 rounded-2xl bg-secondary text-secondary-foreground text-sm font-bold flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-transform">
                    {isScanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                    {isScanning ? "Procesando Foto (Local)..." : "Tomar Foto de Lista"}
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                  </label>
                </div>
              </div>

              {/* Resultados OCR */}
              <AnimatePresence>
                {extractedNames.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-primary/5 rounded-[32px] p-6 border border-primary/20 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-primary">Nombres Detectados</h4>
                      <button onClick={() => setExtractedNames([])}><X size={16} className="text-muted-foreground" /></button>
                    </div>
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {extractedNames.map((name) => (
                        <label key={name} className="flex items-center gap-3 p-2 bg-white/50 rounded-lg">
                          <Checkbox 
                            checked={checkedNames[name]} 
                            onCheckedChange={(v) => setCheckedNames(p => ({...p, [name]: !!v}))} 
                          />
                          <span className="text-xs font-semibold">{name}</span>
                        </label>
                      ))}
                    </div>
                    <button 
                      onClick={handleImportScanned}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <UserPlus size={16} />
                      Importar Seleccionados
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Lista Actual */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">Estudiantes en el curso ({students.length})</h3>
                <div className="bg-card rounded-[32px] border border-border divide-y divide-border overflow-hidden">
                  {loading && <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>}
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                          {s.name[0]}{s.lastname[0]}
                        </div>
                        <span className="text-sm font-semibold">{s.name} {s.lastname}</span>
                      </div>
                      <button className="text-muted-foreground/30"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Add Course */}
      <AnimatePresence>
        {showAddCourse && (
          <div className="fixed inset-0 bg-black/40 z-[60] flex items-end sm:items-center justify-center p-4">
            <motion.div 
               initial={{ y: "100%" }}
               animate={{ y: 0 }}
               exit={{ y: "100%" }}
               className="w-full max-w-[400px] bg-background rounded-[40px] p-8 shadow-2xl"
            >
              <h2 className="text-xl font-extrabold mb-6">Nuevo Curso</h2>
              <p className="text-sm text-muted-foreground mb-4">Ej: 5to Sec A, 3ro Sec B, Física IV...</p>
              <input 
                autoFocus
                type="text"
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="Nombre del curso"
                className="w-full px-6 py-4 rounded-2xl border-2 border-primary/20 focus:border-primary outline-none transition-colors mb-6 text-lg font-bold"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowAddCourse(false)} className="flex-1 py-4 font-bold text-muted-foreground">Cancelar</button>
                <button onClick={handleCreateCourse} className="flex-1 py-4 bg-primary text-primary-foreground rounded-2xl font-bold shadow-lg">Crear</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CourseManagement;
