import { Zap } from 'lucide-react';
import { useState } from 'react';

export function LogoPrincipal({ className }: { className?: string }) {
  const [imgError, setImgError] = useState(false);
  const logoSrc = `${import.meta.env.BASE_URL}LogoPrincipal.png`;

  return (
    <div className={`flex items-center gap-2 sm:gap-3 group min-w-0 ${className || ''}`}>
      <div className="relative inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl transition-all duration-500 hover:scale-110 hover:-rotate-3">
        {/* Glow effect */}
        <div className="absolute inset-0 bg-blue-500 rounded-xl blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500 animate-pulse"></div>
        {/* Animated border/ring effect */}
        <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-600 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500"></div>
        
        {/* Image wrapper */}
        <div className="relative z-10 flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gray-900 rounded-lg overflow-hidden border border-gray-700 shadow-[0_0_15px_rgba(56,189,248,0.3)]">
          {!imgError ? (
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="w-full h-full object-cover scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
             <Zap strokeWidth={2.5} size={22} className="text-cyan-400 drop-shadow-lg" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-sans font-bold text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white transition-colors drop-shadow-sm whitespace-nowrap">
          Cambiar <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">Imagen</span>
        </span>
        <span className="hidden md:block h-5 w-px bg-slate-300/70 dark:bg-white/10"></span>
        <span className="hidden md:block text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-300 whitespace-nowrap">
          Comprime y convierte imagenes
        </span>
      </div>
    </div>
  );
}
