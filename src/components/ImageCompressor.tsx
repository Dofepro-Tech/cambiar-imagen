import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import { Download, UploadCloud, RefreshCw, Settings2, ArrowLeftRight } from 'lucide-react';
import { formatBytes, cn } from '../lib/utils';

interface CompressOptions {
  format: string;
  mode: 'baja' | 'media' | 'alta' | 'avanzado';
  maxSizeMB: number;
  quality: number;
  gifColors?: number;
  gifFrames?: number;
}

export function ImageCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [compressedPreviewUrl, setCompressedPreviewUrl] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [actionType, setActionType] = useState<'compress_convert' | 'compress' | 'convert'>('compress_convert');
  const [sliderPosition, setSliderPosition] = useState(50);
  const [options, setOptions] = useState<CompressOptions>({
    format: 'image/webp',
    mode: 'media',
    maxSizeMB: 1,
    quality: 0.7,
    gifColors: 256,
    gifFrames: 15,
  });

  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const selectedField = acceptedFiles[0];
      setFile(selectedField);
      setPreviewUrl(URL.createObjectURL(selectedField));
      setCompressedFile(null);
      setCompressedPreviewUrl(null);
      
      // Update max size to current file size by default so it doesn't increase
      const fileSizeMB = selectedField.size / (1024 * 1024);
      setOptions(prev => ({
        ...prev,
        maxSizeMB: parseFloat((fileSizeMB * 0.8).toFixed(2)) || 0.1 // Default to 80% of original
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif'],
      'image/bmp': ['.bmp'],
      'image/avif': ['.avif'],
      'image/tiff': ['.tiff', '.tif'],
      'image/heic': ['.heic'],
      'image/x-icon': ['.ico']
    },
    maxFiles: 1,
  } as any);

  const handleCompress = async () => {
    if (!file) return;

    setIsCompressing(true);
    try {
      const originalSizeMB = file.size / (1024 * 1024);
      let targetFormat = options.format;
      let targetQuality = options.quality;
      let targetMaxSizeMB = options.mode === 'avanzado' ? options.maxSizeMB : undefined;

      if (actionType === 'compress') {
        targetFormat = file.type; // Keep original format
      }

      if (actionType === 'convert') {
        targetQuality = 1.0; // Try to keep original quality
        targetMaxSizeMB = undefined; // Don't enforce size
      } else {
        // Enforce max size doesn't exceed original file size when compressing
        let effectiveMaxSize = targetMaxSizeMB || originalSizeMB * 0.9;
        if (effectiveMaxSize > originalSizeMB) {
          effectiveMaxSize = originalSizeMB * 0.9;
        }
        targetMaxSizeMB = effectiveMaxSize;
      }

      const compressionOptions = {
        maxSizeMB: targetMaxSizeMB || undefined,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        fileType: targetFormat,
        initialQuality: targetQuality,
        alwaysKeepResolution: actionType === 'convert'
      };

      const compressedBlob = await imageCompression(file, compressionOptions);
      
      let extension = targetFormat.split('/')[1] || 'webp';
      if (extension === 'x-icon') extension = 'ico';
      const suffix = actionType === 'convert' ? 'conv' : 'opti';
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + `_${suffix}.${extension}`;
      
      // Safety check: if compression actually increased size (can happen with trying to compress highly optimized files or formats),
      // we can just return the original file if they only wanted to compress.
      let finalBlob = compressedBlob;
      if (actionType === 'compress' && compressedBlob.size >= file.size) {
        finalBlob = file; // Fallback to original
      }

      const newFile = new File([finalBlob], newFileName, {
        type: targetFormat,
      });

      setCompressedFile(newFile);
      setCompressedPreviewUrl(URL.createObjectURL(newFile));
    } catch (error) {
      console.error('Error compressing image:', error);
      alert('Hubo un error al procesar la imagen.');
    } finally {
      setIsCompressing(false);
    }
  };

  const getEstimatedSize = () => {
    if (!file) return null;
    if (actionType === 'convert') return 'Variable (Depende del formato)';
    
    let factor = options.quality;
    if (options.format === 'image/webp') factor *= 0.7; // WebP extra savings
    if (options.format === 'image/jpeg') factor *= 0.8; // JPEG extra savings
    
    // Si ha establecido un máximo, tomamos el mínimo entre la estimación y el máximo
    const estimatedBytes = file.size * factor;
    const originalSizeMB = file.size / (1024 * 1024);
    let maxBytes = (options.mode === 'avanzado' ? options.maxSizeMB : originalSizeMB * 0.9) * 1024 * 1024;
    
    if (maxBytes > file.size) maxBytes = file.size * 0.9;
    
    if (estimatedBytes > maxBytes) {
      return formatBytes(maxBytes);
    }
    return formatBytes(estimatedBytes);
  };

  const handleDownloadConfirm = () => {
    if (!compressedFile) return;
    const link = document.createElement('a');
    link.href = URL.createObjectURL(compressedFile);
    link.download = compressedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowDownloadModal(false);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {!file ? (
        <div 
          {...getRootProps()} 
          className={cn(
            "border-2 border-dashed rounded-2xl p-8 sm:p-16 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
            isDragActive ? "border-blue-500" : ""
          )}
          style={{ 
            backgroundColor: isDragActive ? 'rgba(59, 130, 246, 0.1)' : 'var(--bg-card)', 
            borderColor: isDragActive ? '#3b82f6' : 'var(--border-strong)' 
          }}
        >
          <input {...getInputProps()} />
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <UploadCloud size={32} className="text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-main)' }}>Arrastra tu imagen aquí</h2>
          <p style={{ color: 'var(--text-muted)' }}>o haz clic para seleccionar un archivo (PNG, JPEG, WebP, GIF, AVIF, TIFF...)</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          
          <div className="lg:col-span-8 flex flex-col border-2 border-dashed rounded-2xl overflow-hidden transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}>
            <div className="p-4 sm:p-6 border-b flex justify-between items-center gap-3 backdrop-blur-md" style={{ borderColor: 'var(--border-subtle)', backgroundColor: 'var(--bg-overlay)' }}>
              <h3 className="text-xl font-bold" style={{ color: 'var(--text-main)' }}>Vista Previa</h3>
              <button 
                onClick={() => {
                  setFile(null);
                  setCompressedFile(null);
                  setPreviewUrl(null);
                  setCompressedPreviewUrl(null);
                }}
                className="text-sm font-medium text-blue-400 hover:text-white"
              >
                Elegir otra
              </button>
            </div>
            
            <div className="p-4 sm:p-6 flex-1 flex flex-col gap-6 relative">
              {compressedFile && compressedPreviewUrl && previewUrl ? (
                // Comparison Slider View
                <div className="flex-1 flex flex-col items-center">
                  <div className="w-full relative h-[300px] sm:h-[500px] rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-subtle)' }}>
                     {/* Background checkerboard pattern for transparency */}
                     <div className="absolute inset-0" style={{ 
                       backgroundImage: 'linear-gradient(45deg, var(--bg-overlay) 25%, transparent 25%), linear-gradient(-45deg, var(--bg-overlay) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--bg-overlay) 75%), linear-gradient(-45deg, transparent 75%, var(--bg-overlay) 75%)',
                       backgroundSize: '20px 20px',
                       backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                     }}></div>

                     {/* Compressed Image (Background) */}
                     <img src={compressedPreviewUrl} alt="Compressed" className="absolute inset-0 w-full h-full object-contain p-2" draggable="false" />
                     
                     {/* Original Image (Foreground, clipped) */}
                     <div className="absolute inset-0 w-full h-full" style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}>
                       <img src={previewUrl} alt="Original" className="absolute inset-0 w-full h-full object-contain p-2" draggable="false" />
                     </div>

                     {/* Slider input */}
                     <input 
                       type="range" 
                       min="0" max="100" 
                       value={sliderPosition} 
                       onChange={(e) => setSliderPosition(parseFloat(e.target.value))} 
                       className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20 m-0 p-0" 
                     />
                     
                     {/* Slider Line and Handle */}
                     <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_5px_rgba(0,0,0,0.5)] z-10 pointer-events-none" style={{ left: `${sliderPosition}%` }}>
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-md text-white border-2 border-white">
                         <ArrowLeftRight size={16} />
                       </div>
                     </div>

                     {/* Badges */}
                     <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10 text-white z-10 pointer-events-none transition-opacity" style={{ opacity: sliderPosition < 15 ? 0 : 1 }}>
                       <span className="text-[10px] uppercase font-bold tracking-widest block mb-0.5">Original</span>
                       <span className="text-xs font-mono">{formatBytes(file?.size || 0)}</span>
                     </div>

                     <div className="absolute top-4 right-4 bg-blue-900/60 backdrop-blur px-3 py-1.5 rounded-lg border border-blue-500/30 text-white z-10 pointer-events-none text-right transition-opacity" style={{ opacity: sliderPosition > 85 ? 0 : 1 }}>
                       <span className="text-[10px] uppercase font-bold tracking-widest block mb-0.5 text-blue-300">Optimizado</span>
                       <span className="text-xs font-mono text-green-400">{formatBytes(compressedFile.size)}</span>
                     </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 sm:flex-row sm:justify-between w-full mt-4 sm:items-center">
                    <p className="text-sm font-bold" style={{ color: 'var(--text-main)' }}>Desliza para comparar</p>
                    <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-lg self-start sm:self-auto">
                      <span className="text-xs font-bold text-green-500 uppercase">
                        Ahorro: {Math.round((1 - compressedFile.size / (file?.size || 1)) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                // Original View only (Before compression)
                <div className="flex-1 flex flex-col">
                  <span className="text-[10px] uppercase font-bold mb-2 tracking-widest" style={{ color: 'var(--text-muted)' }}>Original</span>
                  <div className="flex-1 rounded-xl border overflow-hidden flex items-center justify-center relative min-h-[220px] sm:min-h-[300px]" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-subtle)' }}>
                     <div className="absolute inset-0" style={{ 
                       backgroundImage: 'linear-gradient(45deg, var(--bg-overlay) 25%, transparent 25%), linear-gradient(-45deg, var(--bg-overlay) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--bg-overlay) 75%), linear-gradient(-45deg, transparent 75%, var(--bg-overlay) 75%)',
                       backgroundSize: '20px 20px',
                       backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
                     }}></div>
                    {previewUrl && <img src={previewUrl} alt="Original" className="relative z-10 max-h-full max-w-full object-contain p-2" />}
                  </div>
                  <div className="mt-3 text-center sm:text-left">
                    <p className="font-bold truncate max-w-xs" style={{ color: 'var(--text-main)' }}>{file.name}</p>
                    <p className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>{formatBytes(file.size)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border p-4 sm:p-6 transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}>
              <div className="flex items-center gap-2 mb-6" style={{ color: 'var(--text-main)' }}>
                <Settings2 size={20} />
                <h3 className="font-bold text-lg">Ajustes</h3>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">¿Qué deseas hacer?</h3>
                  <select 
                    className="w-full rounded-xl border p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none font-bold mb-6"
                    style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)', color: 'var(--text-main)' }}
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                  >
                    <option value="compress_convert" className="bg-white dark:bg-[#12151A] text-black dark:text-white">Comprimir y Convertir</option>
                    <option value="compress" className="bg-white dark:bg-[#12151A] text-black dark:text-white">Solo Comprimir (mantener formato)</option>
                    <option value="convert" className="bg-white dark:bg-[#12151A] text-black dark:text-white">Solo Convertir (mantener calidad)</option>
                  </select>
                </div>

                {actionType !== 'compress' && (
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Formato de Salida</h3>
                    <select 
                    className="w-full rounded-xl border p-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow outline-none"
                    style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
                    value={options.format}
                    onChange={(e) => setOptions({...options, format: e.target.value})}
                  >
                    <option value="image/webp" className="bg-white dark:bg-[#12151A] text-black dark:text-white">WebP (Recomendado)</option>
                    <option value="image/jpeg" className="bg-white dark:bg-[#12151A] text-black dark:text-white">JPEG</option>
                    <option value="image/png" className="bg-white dark:bg-[#12151A] text-black dark:text-white">PNG (Transparencias)</option>
                    <option value="image/gif" className="bg-white dark:bg-[#12151A] text-black dark:text-white">GIF</option>
                    <option value="image/bmp" className="bg-white dark:bg-[#12151A] text-black dark:text-white">BMP</option>
                    <option value="image/avif" className="bg-white dark:bg-[#12151A] text-black dark:text-white">AVIF (Alta compresión)</option>
                    <option value="image/tiff" className="bg-white dark:bg-[#12151A] text-black dark:text-white">TIFF</option>
                    <option value="image/heic" className="bg-white dark:bg-[#12151A] text-black dark:text-white">HEIC</option>
                    <option value="image/x-icon" className="bg-white dark:bg-[#12151A] text-black dark:text-white">ICO</option>
                  </select>
                  </div>
                )}

                {actionType !== 'convert' && (
                  <>
                  <div>
                  <h3 className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-4">Nivel de Compresión</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button 
                      onClick={() => setOptions({...options, mode: 'baja', quality: 0.9})}
                      className={cn(
                        "rounded-md py-2 text-sm font-bold border transition-colors",
                        options.mode === 'baja' ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      )}
                    >
                      Baja
                    </button>
                    <button 
                      onClick={() => setOptions({...options, mode: 'media', quality: 0.7})}
                      className={cn(
                        "rounded-md py-2 text-sm font-bold border transition-colors",
                        options.mode === 'media' ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      )}
                    >
                      Media
                    </button>
                    <button 
                      onClick={() => setOptions({...options, mode: 'alta', quality: 0.4})}
                      className={cn(
                        "rounded-md py-2 text-sm font-bold border transition-colors",
                        options.mode === 'alta' ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      )}
                    >
                      Alta
                    </button>
                    <button 
                      onClick={() => setOptions({...options, mode: 'avanzado'})}
                      className={cn(
                        "rounded-md py-2 text-sm font-bold border transition-colors",
                        options.mode === 'avanzado' ? "bg-blue-600 text-white border-blue-600" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
                      )}
                    >
                      Avanzado
                    </button>
                  </div>
                  
                  {options.mode === 'baja' && <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Baja compresión. Mantiene alta calidad visual pero el archivo resultante será más grande. Ideal para fotos detalladas.</p>}
                  {options.mode === 'media' && <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Equilibrio perfecto. Reduce significativamente el tamaño del archivo sin pérdida visual notable.</p>}
                  {options.mode === 'alta' && <p className="text-[10px] italic" style={{ color: 'var(--text-muted)' }}>Máxima compresión. Archivo muy pequeño, pero puede introducir ruido o pixelación. Ideal para web rápida.</p>}
                </div>

                {options.mode === 'avanzado' && (
                  <div className="space-y-4 p-4 rounded-xl border" style={{ backgroundColor: 'var(--bg-overlay)', borderColor: 'var(--border-subtle)' }}>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Calidad ({Math.round(options.quality * 100)}%)</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" max="1" step="0.05" 
                        value={options.quality} 
                        onChange={(e) => setOptions({...options, quality: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-slate-400 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Tamaño Max ({options.maxSizeMB} MB)</span>
                      </div>
                      <input 
                        type="range" 
                        min="0.1" max="5" step="0.1" 
                        value={options.maxSizeMB} 
                        onChange={(e) => setOptions({...options, maxSizeMB: parseFloat(e.target.value)})}
                        className="w-full h-1.5 bg-slate-400 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                      />
                    </div>
                    {options.format === 'image/gif' && (
                      <>
                        <div className="pt-2 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                          <div className="flex justify-between items-center mb-2 mt-2">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Colores (Palette): {options.gifColors}</span>
                          </div>
                          <input 
                            type="range" 
                            min="2" max="256" step="1" 
                            value={options.gifColors} 
                            onChange={(e) => setOptions({...options, gifColors: parseInt(e.target.value)})}
                            className="w-full h-1.5 bg-slate-400 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                          />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold" style={{ color: 'var(--text-main)' }}>Fotogramas (FPS): {options.gifFrames}</span>
                          </div>
                          <input 
                            type="range" 
                            min="1" max="30" step="1" 
                            value={options.gifFrames} 
                            onChange={(e) => setOptions({...options, gifFrames: parseInt(e.target.value)})}
                            className="w-full h-1.5 bg-slate-400 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" 
                          />
                          <p className="mt-2 text-[10px] italic" style={{ color: 'var(--text-muted)' }}>*Nota: La compresión con transparencia y optimización de fotogramas dependerá del soporte del navegador.</p>
                        </div>
                      </>
                    )}
                  </div>
                )}
                </>
                )}

                <div className="pt-4 border-t border-white/5 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400">Tamaño Estimado:</span>
                    <span className="font-mono font-bold text-blue-400">{getEstimatedSize()}</span>
                  </div>
                  <button 
                    onClick={handleCompress}
                    disabled={isCompressing}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isCompressing ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <RefreshCw size={18} />
                    )}
                    {isCompressing ? 'Procesando...' : actionType === 'compress' ? 'Comprimir' : actionType === 'convert' ? 'Convertir' : 'Convertir y Comprimir'}
                  </button>
                </div>
              </div>
            </div>

            {compressedFile && (
              <div className="rounded-2xl border p-4 sm:p-6 text-center space-y-4 relative overflow-hidden transition-colors" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}>
                <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
                
                <h3 className="text-xl font-bold">¡Listo para usar!</h3>
                <p className="text-sm pb-2" style={{ color: 'var(--text-muted)' }}>
                  {compressedFile.size < file.size ? (
                    <>La imagen se redujo de <b>{formatBytes(file.size)}</b> a <b>{formatBytes(compressedFile.size)}</b>.</>
                  ) : (
                    <>El tamaño final es <b>{formatBytes(compressedFile.size)}</b> (Original: {formatBytes(file.size)}).</>
                  )}
                </p>

                <button 
                  onClick={() => setShowDownloadModal(true)}
                  className="w-full font-bold p-3.5 rounded-xl flex justify-center items-center gap-2 hover:opacity-90 transition-colors shadow-lg"
                  style={{ backgroundColor: 'var(--text-main)', color: 'var(--bg-main)' }}
                >
                  <Download size={18} />
                  Descargar Imagen
                </button>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/8 px-4 py-3 text-left">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-blue-500">Procesamiento local</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Tu imagen se procesa directamente en tu navegador. No necesitas cuenta ni subir archivos a un servidor.
                  </p>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => {
                      setFile(null);
                      setCompressedFile(null);
                      setPreviewUrl(null);
                      setCompressedPreviewUrl(null);
                    }}
                    className="w-full bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-blue-400 font-bold p-3.5 rounded-xl flex justify-center items-center gap-2 transition-colors"
                  >
                    <UploadCloud size={18} />
                    Procesar Otra Imagen
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Download Modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="rounded-2xl p-6 w-full max-w-sm shadow-2xl relative border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-strong)' }}>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Confirmación</h3>
            <p className="mb-6 leading-relaxed" style={{ color: 'var(--text-muted)' }}>¿Estás seguro de que quieres descargar esta imagen?</p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowDownloadModal(false)}
                className="flex-1 px-4 py-3 border rounded-xl font-bold transition-colors"
                style={{ borderColor: 'var(--border-strong)', color: 'var(--text-main)' }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleDownloadConfirm}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20"
              >
                Descargar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
