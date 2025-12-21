import { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, AlertCircle, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  type: ToastType;
  message: ReactNode;
  isExiting?: boolean;
};

type ToastContextType = {
  showToast: (type: ToastType, message: ReactNode, duration?: number) => string;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = (type: ToastType, message: ReactNode, duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);

    if (duration > 0) {
      // Start exit animation
      setTimeout(() => {
        setToasts((prev) => 
          prev.map(t => t.id === id ? { ...t, isExiting: true } : t)
        );
      }, duration - 500);

      // Remove from DOM
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    }

    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => 
      prev.map(t => t.id === id ? { ...t, isExiting: true } : t)
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 400)
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#3455a0]" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-rose-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-[#3455a0]" />;
    }
  };

  const getGlow = (type: ToastType) => {
    switch (type) {
      case 'success': return 'shadow-[0_8px_32px_rgba(52,85,160,0.15)] ring-[#3455a0]/20';
      case 'error': return 'shadow-[0_8px_32px_rgba(244,63,94,0.15)] ring-rose-500/20';
      case 'warning': return 'shadow-[0_8px_32px_rgba(245,158,11,0.15)] ring-amber-500/20';
      case 'info': return 'shadow-[0_8px_32px_rgba(52,85,160,0.15)] ring-[#3455a0]/20';
    }
  };

  const getAccent = (type: ToastType) => {
    switch (type) {
      case 'success': return 'bg-[#3455a0]';
      case 'error': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      case 'info': return 'bg-[#3455a0]';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 max-w-md w-full sm:w-auto overflow-visible pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`
              pointer-events-auto
              relative group overflow-hidden
              flex items-start gap-4 p-4 min-w-[320px]
              bg-white/80 backdrop-blur-xl border border-white
              rounded-2xl ring-1 shadow-2xl
              transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
              ${toast.isExiting 
                ? 'opacity-0 translate-x-12 scale-95 blur-sm' 
                : 'opacity-100 translate-x-0 scale-100'
              }
              ${getGlow(toast.type)}
            `}
          >
            {/* Animated background accent */}
            <div className={`absolute top-0 left-0 w-1.5 h-full transition-all duration-300 ${getAccent(toast.type)}`} />

            <div className="flex-shrink-0 mt-0.5">
              <div className={`p-2 rounded-xl bg-white shadow-sm ring-1 ring-black/5`}>
                {getIcon(toast.type)}
              </div>
            </div>

            <div className="flex-1 min-w-0 pr-6 pt-1">
              <div className="text-[13px] text-gray-600 font-semibold leading-relaxed">
                {toast.message}
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-1.5 right-0 h-[3px] bg-gray-100/50">
              <div 
                className={`h-full transition-all duration-[4500ms] ease-linear ${getAccent(toast.type)}`}
                style={{ width: toast.isExiting ? '0%' : '100%' }}
              />
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
