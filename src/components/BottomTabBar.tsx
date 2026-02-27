import { BookOpen, BarChart3, Users, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type TabId = "clase" | "informes" | "alumnos" | "perfil";

interface BottomTabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

const tabs: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: "clase", label: "Clase", icon: BookOpen },
  { id: "informes", label: "Informes", icon: BarChart3 },
  { id: "alumnos", label: "Alumnos", icon: Users },
  { id: "perfil", label: "Perfil", icon: User },
];

const BottomTabBar = ({ activeTab, onTabChange }: BottomTabBarProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-android pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-20 px-4">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full gap-1 group"
            >
              <div className="relative flex items-center justify-center w-16 h-8">
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      className="absolute inset-0 bg-primary/20 rounded-full"
                      transition={{
                        type: "spring",
                        bounce: 0.3,
                        duration: 0.6,
                      }}
                    />
                  )}
                </AnimatePresence>
                <Icon
                  size={24}
                  className={`relative z-10 transition-colors duration-300 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-active:scale-90"
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={`text-[11px] font-medium transition-colors duration-300 ${
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomTabBar;
