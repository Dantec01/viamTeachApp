import { Wifi, CloudOff, Search, Settings } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

const EduHeader = () => {
  const [isOnline] = useState(true);

  return (
    <header className="sticky top-0 z-30 flex flex-col pt-2 bg-background/80 backdrop-blur-xl">
      <div className="flex items-center justify-between h-16 px-4">
        <button className="p-2 transition-colors rounded-full active:bg-primary/10">
          <Settings size={22} className="text-foreground/70" />
        </button>
        
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          EduTrack
        </motion.h1>

        <div className="flex items-center">
          <button className="p-2 transition-colors rounded-full active:bg-primary/10">
            <Search size={22} className="text-foreground/70" />
          </button>
        </div>
      </div>
      
      <div className="flex justify-center pb-2">
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-medium transition-all duration-500 ${
          isOnline ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
        }`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
          {isOnline ? "Sincronizado" : "Sin conexión"}
        </div>
      </div>
    </header>
  );
};

export default EduHeader;

