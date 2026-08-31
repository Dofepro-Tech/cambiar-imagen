import { useState, useEffect } from 'react';
import { LogoPrincipal } from './components/LogoPrincipal';
import { ImageCompressor } from './components/ImageCompressor';
import { PwaControls } from './components/PwaControls';
import { Download, LogIn, Sun, Moon, Github, Globe, Linkedin } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

function Navbar({
  isDark,
  toggleTheme,
  canInstall,
  onInstall,
  onShowComingSoon,
}: {
  isDark: boolean;
  toggleTheme: () => void;
  canInstall: boolean;
  onInstall: () => void;
  onShowComingSoon: () => void;
}) {
  return (
    <nav className="border-b sticky top-0 z-50 transition-colors" style={{ backgroundColor: 'var(--bg-nav)', borderColor: 'var(--border-strong)' }}>
      <div className="w-full max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center shrink min-w-0">
            <LogoPrincipal />
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {canInstall && (
              <button
                onClick={onInstall}
                className="px-2.5 sm:px-3 py-1.5 rounded-full transition-colors text-sm font-medium flex items-center gap-2"
                style={{ backgroundColor: 'rgba(59, 130, 246, 0.12)', borderColor: 'rgba(59, 130, 246, 0.3)', color: 'var(--text-main)', borderWidth: 1 }}
                title="Instalar app"
              >
                <Download size={16} />
                <span className="hidden md:inline">Instalar</span>
              </button>
            )}
            <button
              onClick={onShowComingSoon}
              className="px-3 sm:px-4 py-1.5 rounded-full transition-colors text-sm font-medium flex items-center gap-2 shadow-none"
              style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-strong)', color: 'var(--text-main)', borderWidth: 1 }}
              title="Proximamente"
            >
              <LogIn size={16} />
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full transition-colors flex items-center justify-center"
              style={{ color: 'var(--text-main)', backgroundColor: 'var(--bg-overlay)' }}
              title="Cambiar Tema"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

function MainLayout() {
  const [isDark, setIsDark] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showComingSoonNotice, setShowComingSoonNotice] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const result = await installPrompt.userChoice;

    if (result.outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleShowComingSoon = () => {
    setShowComingSoonNotice(true);
  };

  useEffect(() => {
    if (!showComingSoonNotice) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowComingSoonNotice(false);
    }, 2600);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [showComingSoonNotice]);

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-blue-500/30 selection:text-white transition-colors" style={{ backgroundColor: 'var(--bg-main)', color: 'var(--text-main)' }}>
      <Navbar
        isDark={isDark}
        toggleTheme={() => setIsDark(!isDark)}
        canInstall={Boolean(installPrompt)}
        onInstall={handleInstall}
        onShowComingSoon={handleShowComingSoon}
      />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="pb-20 pt-12 px-4 md:px-0 sm:pb-24 sm:pt-16 relative overflow-hidden border-b transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-subtle)', color: 'var(--text-main)' }}>
          <div className="absolute top-0 left-1/2 -ml-[40rem] w-[80rem] h-[40rem] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-500 mb-6 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              Neural Compression
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 tracking-tight" style={{ color: 'var(--text-main)' }}>
              Optimización Perfecta <br className="hidden md:block"/> para tus Imágenes.
            </h1>
            <p className="text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              Convierte formatos, reduce el tamaño y prepara tus assets gráficos
              directamente en tu navegador, con una calidad visual impecable.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 relative z-20 pb-20 sm:pb-24">
          <ImageCompressor />
        </div>
      </main>

      <footer className="border-t px-4 py-4 text-xs sm:px-8 sm:text-[11px] font-mono mt-auto transition-colors" style={{ backgroundColor: 'var(--bg-footer)', borderColor: 'var(--border-subtle)', color: 'var(--text-muted)' }}>
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:flex-wrap sm:gap-2">
          <span>© {new Date().getFullYear()} Dofepro-Tech</span>
          <span className="hidden sm:inline">•</span>
          <span>Todos los derechos reservados.</span>
          <span className="hidden sm:inline">•</span>
          <a href="mailto:dofeprotech@gmail.com" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors break-all sm:break-normal">
            dofeprotech@gmail.com
          </a>
          <span className="hidden sm:inline">•</span>
          <a href="./privacy.html" className="text-blue-500 hover:text-blue-400 hover:underline transition-colors">
            Politica de privacidad
          </a>
          <span className="hidden sm:inline">•</span>
          <div className="flex items-center gap-2">
            <a href="https://dofepro.do" target="_blank" rel="noreferrer" aria-label="Sitio web dofepro.do" title="dofepro.do" className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:text-blue-400">
              <Globe className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="https://github.com/dofepro" target="_blank" rel="noreferrer" aria-label="GitHub" title="GitHub" className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:text-blue-400">
              <Github className="h-4 w-4" aria-hidden="true" />
            </a>
            <a href="https://www.linkedin.com/in/domingo-feliz-dofepro-tech" target="_blank" rel="noreferrer" aria-label="LinkedIn" title="LinkedIn" className="inline-flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:text-blue-400">
              <Linkedin className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>
      </footer>

      <PwaControls canInstall={Boolean(installPrompt)} onInstall={handleInstall} />

      {showComingSoonNotice && (
        <div className="coming-soon-toast fixed left-1/2 top-24 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-sm transition-colors">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500"></div>
            <div className="min-w-0">
              <p className="font-semibold">Próximamente</p>
              <p className="coming-soon-toast-copy mt-1 text-xs leading-relaxed">
                El acceso de usuario se activará en una próxima versión.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return <MainLayout />;
}
