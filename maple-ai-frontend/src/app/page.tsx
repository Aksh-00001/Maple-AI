"use client";

/*
  Maple.AI Copilot
  A full-stack Next.js 14 application for AI-powered research and coding.
  This final version includes a robust theme provider and corrected styles to match the desired look and feel.
*/

import React, { useState, useEffect, createContext, useContext, FC, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Code, ArrowRight, Home, Bot, History, Upload, Loader2, BarChart2, FileText, BrainCircuit, Lightbulb, AlertCircle, Terminal, Menu, Moon, Sun, Palette, Check, LucideProps, X, Trash2 } from 'lucide-react';
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

// --- Type Definitions ---
type Page = 'landing' | 'dashboard' | 'research' | 'code';
type Theme = 'light' | 'dark';
type ColorTheme = 'default' | 'nebula' | 'meadow' | 'ocean' | 'sunset' | 'aurora' | 'galaxy';

interface ThemeContextType {
  theme: Theme;
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  colorTheme: ColorTheme;
  setColorTheme: React.Dispatch<React.SetStateAction<ColorTheme>>;
}

interface DataVisualization {
  type: string;
  title: string;
  data: {
    labels: string[];
    datasets: { label?: string; data: number[]; backgroundColor: string | string[] }[];
  };
}

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  detailedSummary: { topic: string; detail: string; }[];
  dataVisualizations: DataVisualization[];
}

type HistoryItemData = Record<string, unknown>;

interface HistoryItem {
  id: string;
  type: 'research' | 'code';
  title: string;
  timestamp: number;
  data?: HistoryItemData;
}

interface CodeSuggestion {
  icon: string;
  title: string;
  description: string;
}

// --- Utility Functions ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(inputs.filter(Boolean).join(" "));
}

// --- Theme Context & Provider ---
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as Theme) || 'dark';
    }
    return 'dark';
  });
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('colorTheme') as ColorTheme) || 'default';
    }
    return 'default';
  });

  // Effect for light/dark mode
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Effect for color themes
  useEffect(() => {
    const body = window.document.body;
    body.classList.forEach(className => {
      if (className.startsWith('theme-')) {
        body.classList.remove(className);
      }
    });
    body.classList.add(`theme-${colorTheme}`);
    localStorage.setItem('colorTheme', colorTheme);
  }, [colorTheme]);
  
  const value = { theme, setTheme, colorTheme, setColorTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// --- History Context & Provider ---
interface HistoryContextType {
  history: HistoryItem[];
  addHistoryItem: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

const HistoryProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('maple-ai-history');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('maple-ai-history', JSON.stringify(history));
    }
  }, [history]);

  const addHistoryItem = (item: Omit<HistoryItem, 'id' | 'timestamp'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const removeHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  return (
    <HistoryContext.Provider value={{ history, addHistoryItem, clearHistory, removeHistoryItem }}>
      {children}
    </HistoryContext.Provider>
  );
};

const useHistory = (): HistoryContextType => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
};

// --- Main App Component (Router) ---
export default function App() {
  const [page, setPage] = useState<Page>('landing');
  const navigate = (newPage: Page) => setPage(newPage);

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <DashboardPage navigate={navigate} />;
      case 'research': return <DashboardPage navigate={navigate} initialContent="research" />;
      case 'code': return <DashboardPage navigate={navigate} initialContent="code" />;
      default: return <LandingPage navigate={navigate} />;
    }
  };

  return (
    <ThemeProvider>
      <HistoryProvider>
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </HistoryProvider>
    </ThemeProvider>
  );
}

// --- Landing Page ---
const LandingPage: FC<{ navigate: (page: Page) => void }> = ({ navigate }) => {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`landing-page-wrapper min-h-screen relative overflow-hidden transition-all duration-500 ${
      isDark ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 text-gray-800'
    }`}>
      {/* Gradient Background */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-radial from-purple-900/30 via-transparent to-transparent' 
          : 'bg-gradient-radial from-purple-200/15 via-blue-200/10 to-transparent'
      }`}></div>

      {/* Theme Toggle */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`fixed top-8 right-10 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-10 backdrop-blur-md ${
          isDark 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-gray-800/10 hover:bg-gray-800/20 text-gray-800'
        }`}
      >
        {isDark ? (
          <Sun className="w-6 h-6" />
        ) : (
          <Moon className="w-6 h-6" />
        )}
      </button>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen p-5 relative z-10 w-full">
        {/* Logo and Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-center justify-center gap-5 mb-10"
        >
          {/* Animated Cube Logo */}
          <div className="w-16 h-16 relative">
            <div className="cube-animation">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`absolute w-full h-full border-2 transition-all duration-500 ${
                    isDark 
                      ? 'bg-teal-500/10 border-teal-400' 
                      : 'bg-teal-500/20 border-teal-600'
                  }`}
                  style={{
                    transform: [
                      'translateZ(32px)',
                      'rotateY(90deg) translateZ(32px)',
                      'rotateY(180deg) translateZ(32px)',
                      'rotateY(-90deg) translateZ(32px)',
                      'rotateX(90deg) translateZ(32px)',
                      'rotateX(-90deg) translateZ(32px)'
                    ][i]
                  }}
                />
              ))}
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold flex items-baseline">
            <span className={`transition-colors duration-500 ${
              isDark ? 'text-teal-400' : 'text-teal-600'
            }`}>
              Maple.AI
            </span>
            <span className={`ml-5 transition-colors duration-500 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              Copilot
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className={`text-xl md:text-2xl text-center max-w-3xl leading-relaxed mb-12 transition-colors duration-500 ${
            isDark ? 'text-white/60' : 'text-gray-700/70'
          }`}
        >
          Your integrated environment for seamless research and coding. Turn insights into implementation, instantly.
        </motion.p>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <button
            onClick={() => navigate('dashboard')}
            className={`group relative px-10 py-5 text-lg font-semibold rounded-xl transition-all duration-300 overflow-hidden ${
              isDark
                ? 'bg-gray-900 text-white hover:shadow-lg hover:shadow-teal-500/30'
                : 'bg-gray-800 text-white hover:shadow-lg hover:shadow-teal-600/30'
            }`}
          >
            <span className="relative z-10 flex items-center gap-3">
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
          </button>
        </motion.div>
      </div>
    </div>
  );
};

// ... (Rest of the components remain unchanged but are included for completeness)
// --- Dashboard Page & Layout ---
type DashboardContent = 'dashboard' | 'research' | 'code';

interface DashboardPageProps {
  navigate: (page: Page) => void;
  initialContent?: DashboardContent;
}

const DashboardPage: FC<DashboardPageProps> = ({ navigate, initialContent = 'dashboard' }) => {
  const [content, setContent] = useState<DashboardContent>(initialContent);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const renderContent = () => {
    if (showHistory) return <HistoryPage onClose={() => setShowHistory(false)} />;
    switch (content) {
      case 'research': return <ResearchPage />;
      case 'code': return <CodePage />;
      default: return <DashboardHome navigateToResearch={() => setContent('research')} />;
    }
  };

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen relative overflow-hidden transition-all duration-500 ${
      isDark ? 'bg-black text-white' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 text-gray-800'
    }`}>
      {/* Gradient Background */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-all duration-500 ${
        isDark 
          ? 'bg-gradient-radial from-purple-900/20 via-transparent to-transparent' 
          : 'bg-gradient-radial from-purple-200/10 via-blue-200/5 to-transparent'
      }`}></div>
      
      <Sidebar navigate={navigate} setContent={setContent} setShowHistory={setShowHistory} className="hidden md:flex relative z-10" />
      <MobileSidebar navigate={navigate} setContent={setContent} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} setShowHistory={setShowHistory} />
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <DashboardHeader onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

const DashboardHome: FC<{ navigateToResearch: () => void }> = ({ navigateToResearch }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-center"
    >
      <motion.div
        animate={{ 
          y: [0, -10, 0],
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Bot size={80} className={`${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`text-3xl font-bold mt-4 ${isDark ? 'text-white' : 'text-gray-800'}`}
      >
        Welcome to your Copilot
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`mt-2 max-w-md ${isDark ? 'text-white/60' : 'text-gray-700/70'}`}
      >
        Select a mode from the sidebar to begin. Start by analyzing a research paper or jump right into coding.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <button
          onClick={navigateToResearch}
          className={`group relative px-8 py-4 text-base font-semibold rounded-xl transition-all duration-300 overflow-hidden mt-6 ${
            isDark
              ? 'bg-gray-900 text-white hover:shadow-lg hover:shadow-teal-500/30'
              : 'bg-gray-800 text-white hover:shadow-lg hover:shadow-teal-600/30'
          }`}
        >
          <span className="relative z-10 flex items-center gap-2">
            Start with Research
            <Book className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
        </button>
      </motion.div>
    </motion.div>
  );
};

// --- Layout Components ---
interface SidebarProps {
  navigate: (page: Page) => void;
  setContent: (content: DashboardContent) => void;
  className?: string;
}

const Sidebar: FC<SidebarProps & { setShowHistory: (show: boolean) => void }> = ({ navigate, setContent, className, setShowHistory }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.aside 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={cn("w-64 flex-col p-4 border-r backdrop-blur-md transition-all duration-500", className, 
                isDark 
                    ? 'bg-black/40 border-white/10' 
                    : 'bg-white/40 border-gray-200/50'
            )}
        >
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 mb-8"
            >
                <Logo size={32} />
                <h2 className="text-2xl font-bold">
                    <span className={isDark ? 'text-teal-400' : 'text-teal-600'}>Maple.AI</span>
                </h2>
            </motion.div>
            <nav className="flex flex-col gap-2">
                <SidebarButton icon={Home} label="Main Page" onClick={() => navigate('landing')} />
                <SidebarButton icon={Bot} label="Dashboard" onClick={() => { setContent('dashboard'); setShowHistory(false); }} />
                <SidebarButton icon={Book} label="Research Mode" onClick={() => { setContent('research'); setShowHistory(false); }} />
                <SidebarButton icon={Code} label="Coding Mode" onClick={() => { setContent('code'); setShowHistory(false); }} />
                <SidebarButton icon={History} label="History" onClick={() => { setShowHistory(true); setContent('dashboard'); }} />
            </nav>
        </motion.aside>
    );
};

interface MobileSidebarProps extends SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const MobileSidebar: FC<MobileSidebarProps & { setShowHistory: (show: boolean) => void }> = ({ navigate, setContent, isOpen, setIsOpen, setShowHistory }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setIsOpen(false)}
      />
      {/* Panel */}
      <motion.aside
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`absolute left-0 top-0 h-full w-72 flex flex-col p-4 border-r backdrop-blur-md transition-all duration-500 ${
          isDark ? 'bg-black/90 border-white/10' : 'bg-white/90 border-gray-200/50'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Logo size={32} />
            <h2 className="text-2xl font-bold">
              <span className={isDark ? 'text-teal-400' : 'text-teal-600'}>Maple.AI</span>
            </h2>
          </div>
          <button onClick={() => setIsOpen(false)} className={`p-2 rounded-lg ${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          <SidebarButton icon={Home} label="Main Page" onClick={() => { navigate('landing'); setIsOpen(false); }} />
          <SidebarButton icon={Bot} label="Dashboard" onClick={() => { setContent('dashboard'); setShowHistory(false); setIsOpen(false); }} />
          <SidebarButton icon={Book} label="Research Mode" onClick={() => { setContent('research'); setShowHistory(false); setIsOpen(false); }} />
          <SidebarButton icon={Code} label="Coding Mode" onClick={() => { setContent('code'); setShowHistory(false); setIsOpen(false); }} />
          <SidebarButton icon={History} label="History" onClick={() => { setShowHistory(true); setContent('dashboard'); setIsOpen(false); }} />
        </nav>
      </motion.aside>
    </div>
  );
};

interface SidebarButtonProps {
    icon: React.ElementType<LucideProps>;
    label: string;
    onClick: () => void;
}

const SidebarButton: FC<SidebarButtonProps> = ({ icon: Icon, label, onClick }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.button
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ${
                isDark
                    ? 'text-white/70 hover:text-white hover:bg-white/10'
                    : 'text-gray-700/70 hover:text-gray-900 hover:bg-gray-100/50'
            }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{label}</span>
        </motion.button>
    );
};

// LandingHeader removed - theme toggle is now integrated in LandingPage component

const DashboardHeader: FC<{ onMenuClick: () => void }> = ({ onMenuClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex items-center justify-between p-4 backdrop-blur-md transition-all duration-500 md:justify-end ${
        isDark ? 'border-b border-white/10' : 'border-b border-gray-200/50'
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onMenuClick}
        className={`md:hidden p-2 rounded-lg transition-all ${
          isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Menu className="h-6 w-6" />
      </motion.button>
      <div className="flex items-center gap-2">
        <ThemeCustomizer />
        <ThemeToggle />
      </div>
    </motion.header>
  );
};

// --- Theme Components ---
const ThemeToggle: FC = () => {
  const { theme, setTheme } = useTheme();
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
};

const ThemeCustomizer: FC = () => {
    const { colorTheme, setColorTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const themes: { name: ColorTheme; color: string }[] = [
        { name: 'default', color: 'hsl(var(--primary))' },
        { name: 'nebula', color: '#a855f7' },
        { name: 'meadow', color: '#22c55e' },
        { name: 'ocean', color: '#3b82f6' },
        { name: 'sunset', color: '#f97316' },
        { name: 'aurora', color: '#89f7fe' },
        { name: 'galaxy', color: '#a78bfa' },
    ];

    return (
        <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
                <Palette className="h-5 w-5" />
            </Button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 top-12 w-40 bg-popover border p-2 rounded-lg shadow-lg z-50"
                    >
                        <p className="text-sm font-medium text-popover-foreground px-2 py-1.5">Color Theme</p>
                        <div className="grid grid-cols-3 gap-2 mt-2">
                            {themes.map(theme => (
                                <button
                                    key={theme.name}
                                    onClick={() => {
                                        setColorTheme(theme.name);
                                        setIsOpen(false);
                                    }}
                                    className="h-8 w-8 rounded-full flex items-center justify-center"
                                    style={{ backgroundColor: theme.color }}
                                >
                                    {colorTheme === theme.name && <Check className="h-5 w-5 text-white" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Research Mode Page ---
const ResearchPage: FC = () => {
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addHistoryItem } = useHistory();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setUrl(''); setError(null);
    } else {
      setFile(null); setError("Please upload a valid PDF file.");
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
    if (file) setFile(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!file && !url) { setError("Please upload a file or enter a URL."); return; }
    setIsLoading(true); setResults(null); setError(null);
    try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
        let response: Response;

        if (file) {
          const formData = new FormData();
          formData.append('file', file);
          response = await fetch(`${apiUrl}/analyze-pdf/`, { method: 'POST', body: formData });
        } else {
          // URL analysis — backend fetches and parses the PDF
          response = await fetch(`${apiUrl}/analyze-url/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url }),
          });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || `Server error: ${response.status}`);
        }
        const data: AnalysisResult = await response.json();
        setResults(data);
        
        // Save to history
        addHistoryItem({
          type: 'research',
          title: file ? file.name : (url || 'Research Analysis'),
          data: data as unknown as HistoryItemData
        });
    } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred. Is the backend running?");
    } finally {
        setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === "application/pdf") {
      setFile(droppedFile);
      setUrl('');
      setError(null);
    } else {
      setError("Please drop a valid PDF file.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto"
    >
      <motion.h1 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}
      >
        Research Mode
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`mb-6 ${isDark ? 'text-white/60' : 'text-gray-700/70'}`}
      >
        Upload a research paper (PDF) to get AI-powered insights.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={`backdrop-blur-md rounded-xl p-6 border transition-all duration-500 ${
          isDark 
            ? 'bg-black/40 border-white/10' 
            : 'bg-white/40 border-gray-200/50'
        }`}
      >
        <div className="space-y-4">
            <div>
              <label htmlFor="url-input" className={`text-sm font-medium mb-2 block ${isDark ? 'text-white/80' : 'text-gray-700'}`}>
                Or enter PDF URL
              </label>
              <div className="flex gap-2">
                <input
                  id="url-input"
                  type="url"
                  placeholder="https://example.com/research.pdf"
                  value={url}
                  onChange={handleUrlChange}
                  disabled={!!file}
                  className={`flex-1 px-4 py-2 rounded-lg border transition-all ${
                    isDark
                      ? 'bg-black/40 border-white/10 text-white placeholder-white/40 focus:border-teal-400'
                      : 'bg-white/60 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-teal-600'
                  }`}
                />
                {url && (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setUrl('')}
                    className={`p-2 rounded-lg ${isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className={`flex-1 flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                  isDark
                    ? 'border-teal-400/30 hover:border-teal-400/50 bg-black/20'
                    : 'border-teal-600/30 hover:border-teal-600/50 bg-white/20'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className={`h-10 w-10 mb-3 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <label htmlFor="file-upload" className={`mt-2 text-sm font-medium cursor-pointer ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  {file ? "File selected!" : "Upload PDF"}
                  <input 
                    ref={fileInputRef}
                    id="file-upload" 
                    type="file" 
                    className="sr-only" 
                    onChange={handleFileChange} 
                    accept=".pdf" 
                  />
                </label>
                <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                  {file ? file.name : "or drag and drop"}
                </p>
                {file && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className={`mt-3 px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 ${
                      isDark ? 'text-white/70 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <X className="h-3 w-3" /> Clear
                  </motion.button>
                )}
              </motion.div>
            </div>
          </div>
          {error && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-sm mt-4 text-center"
            >
              {error}
            </motion.p>
          )}
          <div className="mt-6 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyze}
              disabled={isLoading || (!file && !url)}
              className={`group relative px-8 py-3 text-base font-semibold rounded-xl transition-all duration-300 overflow-hidden ${
                isDark
                  ? 'bg-gray-900 text-white hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50'
                  : 'bg-gray-800 text-white hover:shadow-lg hover:shadow-teal-600/30 disabled:opacity-50'
              }`}
            >
              <span className="relative z-10 flex items-center gap-2">
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Analyzing..." : "Analyze"}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
            </motion.button>
          </div>
      </motion.div>
      {results && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-6"
        >
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-3xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}
            >
              Analysis Results
            </motion.h2>
            <ResultCard icon={FileText} title="Quick Summary"><p className="whitespace-pre-wrap">{results.summary}</p></ResultCard>
            <ResultCard icon={BrainCircuit} title="Detailed Analysis">
                <div className="space-y-4">
                  {results.detailedSummary.map((item, i) => (
                    <div key={i} className="border-l-2 border-primary pl-4">
                      <h4 className="font-semibold mb-1">{item.topic}</h4>
                      <p className="text-muted-foreground">{item.detail}</p>
                    </div>
                  ))}
                </div>
            </ResultCard>
            <ResultCard icon={Lightbulb} title="Key Points">
              <ul className="space-y-2 list-disc list-inside">
                {results.keyPoints.map((p, i) => (
                  <li key={i} className="text-muted-foreground">{p}</li>
                ))}
              </ul>
            </ResultCard>
            <ResultCard icon={BarChart2} title="Data Visualizations">
              <div className="space-y-6">
                {results.dataVisualizations.map((viz, i) => (
                  <BarChartViz key={i} viz={viz} />
                ))}
              </div>
            </ResultCard>
        </motion.div>
      )}
    </motion.div>
  );
};

interface ResultCardProps { icon: React.ElementType<LucideProps>; title: string; children: ReactNode; }

const ResultCard: FC<ResultCardProps> = ({ icon: Icon, title, children }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`backdrop-blur-md rounded-xl p-6 border transition-all duration-500 ${
                isDark 
                    ? 'bg-black/40 border-white/10' 
                    : 'bg-white/40 border-gray-200/50'
            }`}
        >
            <div className={`flex items-center gap-3 mb-4`}>
                <Icon className={`h-6 w-6 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {title}
                </h3>
            </div>
            <div className={`mt-4 ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
                {children}
            </div>
        </motion.div>
    );
};

// --- Bar Chart Visualization Component ---
const BarChartViz: FC<{ viz: DataVisualization }> = ({ viz }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const dataset = viz.data?.datasets?.[0];
  const labels: string[] = viz.data?.labels || [];
  const values: number[] = dataset?.data || [];
  const colors: string[] = Array.isArray(dataset?.backgroundColor)
    ? (dataset.backgroundColor as string[])
    : labels.map(() => (typeof dataset?.backgroundColor === 'string' ? dataset.backgroundColor : 'rgba(20,184,166,0.7)'));
  const maxVal = Math.max(...values, 1);

  return (
    <div className={`rounded-lg p-4 border transition-all duration-500 ${
      isDark ? 'border-white/10 bg-black/20' : 'border-gray-200/50 bg-white/20'
    }`}>
      <h4 className={`font-semibold mb-4 text-sm ${isDark ? 'text-white/80' : 'text-gray-700'}`}>{viz.title}</h4>
      <div className="flex items-end gap-2 h-36">
        {values.map((val, idx) => {
          const heightPct = maxVal > 0 ? (val / maxVal) * 100 : 0;
          return (
            <div key={idx} className="flex flex-col items-center flex-1 gap-1">
              <span className={`text-xs font-mono ${isDark ? 'text-white/60' : 'text-gray-500'}`}>{val}</span>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${heightPct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1, ease: 'easeOut' }}
                className="w-full rounded-t-md min-h-[4px]"
                style={{ backgroundColor: colors[idx] || 'rgba(20,184,166,0.7)' }}
                title={`${labels[idx]}: ${val}`}
              />
              <span className={`text-xs text-center leading-tight ${isDark ? 'text-white/50' : 'text-gray-500'}`}
                style={{ fontSize: '10px', maxWidth: '60px', wordBreak: 'break-word' }}>
                {labels[idx]}
              </span>
            </div>
          );
        })}
      </div>
      {dataset?.label && (
        <p className={`text-xs mt-3 text-center ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{dataset.label}</p>
      )}
    </div>
  );
};

// --- Coding Mode Page ---
const CodePage: FC = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [code, setCode] = useState(`/* Welcome to the AI Coding Copilot! */\n\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("World"));`);
    const [aiSuggestions, setAiSuggestions] = useState<{ title: string; suggestions: Array<{ icon: React.ElementType<LucideProps>; title: string; description: string }> }>({ 
        title: "AI Analysis", 
        suggestions: [] 
    });
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [fileName, setFileName] = useState('code.js');
    const codeRef = useRef<HTMLTextAreaElement>(null);
    const { addHistoryItem } = useHistory();

    const iconMap: Record<string, React.ElementType<LucideProps>> = {
        'AlertCircle': AlertCircle,
        'Lightbulb': Lightbulb,
        'Check': Check,
        'Terminal': Terminal
    };

    const handleEditorChange = (value: string) => {
        setCode(value);
        // Debounce analysis
        const timeoutId = setTimeout(() => {
            analyzeCode(value);
        }, 1000);
        return () => clearTimeout(timeoutId);
    };

    const analyzeCode = async (codeToAnalyze: string) => {
        if (!codeToAnalyze || codeToAnalyze.length < 10) {
            setAiSuggestions({ title: "AI Analysis", suggestions: [] });
            return;
        }

        setIsAnalyzing(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
            const response = await fetch(`${apiUrl}/analyze-code/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: codeToAnalyze })
            });

            if (response.ok) {
                const data = await response.json();
                const suggestions = data.suggestions.map((s: CodeSuggestion) => ({
                    icon: iconMap[s.icon] || AlertCircle,
                    title: s.title,
                    description: s.description
                }));
                setAiSuggestions({ title: "AI Analysis", suggestions });
            }
        } catch (err) {
            console.error('Code analysis error:', err);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        if (code.length > 10) {
            analyzeCode(code);
        }
        // Run once on mount only — intentionally omitting deps
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSave = () => {
        addHistoryItem({
            type: 'code',
            title: fileName,
            data: { code, suggestions: aiSuggestions }
        });
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row gap-6 h-full max-w-7xl mx-auto w-full"
        >
            <div className="flex-1 flex flex-col h-[60vh] md:h-full">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}
                        >
                            Coding Mode
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className={`mt-1 ${isDark ? 'text-white/60' : 'text-gray-700/70'}`}
                        >
                            Your AI pair programmer.
                        </motion.p>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            isDark
                                ? 'bg-gray-900 text-white hover:bg-gray-800 border border-white/10'
                                : 'bg-white/60 text-gray-800 hover:bg-white/80 border border-gray-200'
                        }`}
                    >
                        Save to History
                    </motion.button>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`flex-1 flex flex-col backdrop-blur-md rounded-xl border transition-all duration-500 ${
                        isDark 
                            ? 'bg-black/40 border-white/10' 
                            : 'bg-white/40 border-gray-200/50'
                    }`}
                >
                    <div className={`p-3 border-b rounded-t-xl flex items-center justify-between ${
                        isDark ? 'bg-black/20 border-white/10' : 'bg-white/20 border-gray-200/50'
                    }`}>
                        <input
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            className={`border-0 bg-transparent p-0 h-auto font-mono text-sm focus:outline-none ${
                                isDark ? 'text-white/70' : 'text-gray-700'
                            }`}
                        />
                        {isAnalyzing && <Loader2 className={`h-4 w-4 animate-spin ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />}
                    </div>
                    <div className="flex-1 relative">
                        <textarea 
                            ref={codeRef}
                            value={code} 
                            onChange={(e) => handleEditorChange(e.target.value)} 
                            className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none ${
                                isDark 
                                    ? 'bg-black/20 text-white/90 placeholder-white/30' 
                                    : 'bg-white/20 text-gray-800 placeholder-gray-400'
                            }`}
                            spellCheck={false}
                            placeholder="Start typing your code..."
                        />
                    </div>
                </motion.div>
            </div>
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="w-full md:w-80 lg:w-96"
            >
                <ResultCard icon={Terminal} title={aiSuggestions.title}>
                    {aiSuggestions.suggestions.length === 0 ? (
                        <div className={`text-center py-8 ${isDark ? 'text-white/50' : 'text-gray-600'}`}>
                            <Terminal className={`h-12 w-12 mx-auto mb-2 opacity-50 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                            <p className="text-sm">Start coding to see AI suggestions</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {aiSuggestions.suggestions.map((item, index) => {
                                const Icon = item.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`flex gap-3 p-3 rounded-lg ${
                                            isDark ? 'bg-black/20' : 'bg-white/20'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                                        <div className="flex-1">
                                            <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                                {item.title}
                                            </h4>
                                            <p className={`text-xs mt-1 ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </ResultCard>
            </motion.div>
        </motion.div>
    );
};

// --- Custom Icon Components ---
const Logo: FC<{ size?: number }> = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" className="fill-green-400" />
        <path d="M2 17L12 22L22 17L12 12L2 17Z" className="fill-green-500" />
        <path d="M2 7L12 12L22 7L12 2L2 7Z" stroke="hsl(var(--foreground))" strokeWidth="0.5"/>
        <path d="M2 17L12 22L22 17L12 12L2 17Z" stroke="hsl(var(--foreground))" strokeWidth="0.5"/>
        <path d="M2 7V17L12 22V12L2 7Z" stroke="hsl(var(--foreground))" strokeWidth="0.5"/>
        <path d="M22 7V17L12 22V12L22 7Z" stroke="hsl(var(--foreground))" strokeWidth="0.5"/>
    </svg>
);

// --- UI Primitives (from shadcn/ui) ---
const buttonVariants = cva( "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground hover:bg-primary/90",
            outline: "border bg-transparent hover:bg-accent",
            ghost: "bg-transparent hover:bg-accent hover:text-accent-foreground",
        },
        size: { default: "h-10 px-4", lg: "h-11 px-8", icon: "h-10 w-10", sm: "h-8 px-3 text-xs" },
    },
    defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
    <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));
Button.displayName = "Button";
const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => <div ref={ref} {...props} />);
Card.displayName = "Card";

// --- History Page ---
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const HistoryPage: FC<{ onClose: () => void }> = (_onClose) => {
    const { history, clearHistory, removeHistoryItem } = useHistory();

    const formatDate = (timestamp: number) => {
        const date = new Date(timestamp);
        return date.toLocaleString();
    };

    const getIcon = (type: string) => {
        return type === 'research' ? Book : Code;
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold">History</h1>
                    <p className="text-muted-foreground mt-1">View your past research and code sessions</p>
                </div>
                {history.length > 0 && (
                    <Button variant="outline" onClick={clearHistory}>
                        <Trash2 className="h-4 w-4 mr-2" /> Clear All
                    </Button>
                )}
            </div>

            {history.length === 0 ? (
                <Card className="p-12 text-center">
                    <History className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
                    <p className="text-muted-foreground">Your research analyses and code sessions will appear here</p>
                </Card>
            ) : (
                <div className="space-y-4">
                    {history.map((item) => {
                        const Icon = getIcon(item.type);
                        return (
                            <Card key={item.id} className="p-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 flex-1">
                                        <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.title}</h3>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {formatDate(item.timestamp)} • {item.type === 'research' ? 'Research Analysis' : 'Code Session'}
                                            </p>
                                            {item.type === 'research' && typeof item.data?.summary === 'string' && (
                                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                                    {item.data.summary.substring(0, 150)}...
                                                </p>
                                            )}
                                            {item.type === 'code' && typeof item.data?.code === 'string' && (
                                                <pre className="text-xs bg-muted/40 p-2 rounded mt-2 overflow-x-auto">
                                                    {item.data.code.substring(0, 100)}...
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon"
                                        onClick={() => removeHistoryItem(item.id)}
                                        className="ml-2"
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </motion.div>
    );
};

