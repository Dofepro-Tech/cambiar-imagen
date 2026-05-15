import { Download, RefreshCw, WifiOff, X } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

function PwaCard({
  title,
  description,
  onClose,
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="w-full max-w-sm rounded-2xl border p-4 shadow-2xl backdrop-blur-md"
      style={{
        backgroundColor: 'color-mix(in srgb, var(--bg-card) 92%, transparent)',
        borderColor: 'var(--border-strong)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>
            {title}
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Cerrar aviso"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

export function PwaControls({
  canInstall,
  onInstall,
}: {
  canInstall: boolean;
  onInstall: () => void;
}) {
  const [dismissInstall, setDismissInstall] = useState(false);
  const [dismissOfflineReady, setDismissOfflineReady] = useState(false);
  const [dismissUpdate, setDismissUpdate] = useState(false);
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  useEffect(() => {
    if (canInstall) {
      setDismissInstall(false);
    }
  }, [canInstall]);

  useEffect(() => {
    if (!offlineReady) {
      return;
    }

    setDismissOfflineReady(false);
    const timeoutId = window.setTimeout(() => {
      setDismissOfflineReady(true);
      setOfflineReady(false);
    }, 5000);

    return () => window.clearTimeout(timeoutId);
  }, [offlineReady, setOfflineReady]);

  useEffect(() => {
    if (needRefresh) {
      setDismissUpdate(false);
    }
  }, [needRefresh]);

  return (
    <div className="fixed bottom-4 right-4 z-[70] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
      {canInstall && !dismissInstall && (
        <PwaCard
          title="Instala la app"
          description="Puedes usar Cambiar Imagen como app instalada desde tu escritorio o movil."
          onClose={() => setDismissInstall(true)}
        >
          <button
            type="button"
            onClick={onInstall}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-500"
          >
            <Download size={16} />
            Instalar
          </button>
        </PwaCard>
      )}

      {needRefresh && !dismissUpdate && (
        <PwaCard
          title="Actualizacion disponible"
          description="Hay una nueva version lista. Recarga para usar la actualizacion mas reciente."
          onClose={() => setDismissUpdate(true)}
        >
          <button
            type="button"
            onClick={() => updateServiceWorker(true)}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            <RefreshCw size={16} />
            Actualizar
          </button>
          <button
            type="button"
            onClick={() => {
              setDismissUpdate(true);
              setNeedRefresh(false);
            }}
            className="rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            style={{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-main)' }}
          >
            Luego
          </button>
        </PwaCard>
      )}

      {offlineReady && !dismissOfflineReady && (
        <PwaCard
          title="Lista para usar sin conexion"
          description="La app ya puede abrirse aunque pierdas internet."
          onClose={() => {
            setDismissOfflineReady(true);
            setOfflineReady(false);
          }}
        >
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            style={{ backgroundColor: 'var(--bg-overlay)', color: 'var(--text-main)' }}
          >
            <WifiOff size={16} />
            Offline listo
          </span>
        </PwaCard>
      )}
    </div>
  );
}