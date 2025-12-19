import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface VoiceFeedbackProps {
  type: 'success' | 'error' | 'info' | null;
  message: string;
  onClose: () => void;
  autoCloseDuration?: number;
}

export function VoiceFeedback({ 
  type, 
  message, 
  onClose, 
  autoCloseDuration = 4000 
}: VoiceFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (type && message) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, autoCloseDuration);

      return () => clearTimeout(timer);
    }
  }, [type, message, autoCloseDuration, onClose]);

  if (!type || !message) {
    return null;
  }

  const config = {
    success: {
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-900',
      iconColor: 'text-emerald-600'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-900',
      iconColor: 'text-red-600'
    },
    info: {
      icon: AlertCircle,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600'
    }
  };

  const { icon: Icon, bgColor, borderColor, textColor, iconColor } = config[type];

  return (
    <div className={`fixed top-6 right-6 z-50 transition-all duration-300 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
    }`}>
      <div className={`${bgColor} ${borderColor} border rounded-xl shadow-lg p-4 flex items-start gap-3 max-w-md`}>
        <Icon className={`w-5 h-5 ${iconColor} shrink-0 mt-0.5`} strokeWidth={2.5} />
        <div className="flex-1">
          <p className={`text-sm font-semibold ${textColor}`}>
            {message}
          </p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className={`${textColor} hover:opacity-70 transition-opacity`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
