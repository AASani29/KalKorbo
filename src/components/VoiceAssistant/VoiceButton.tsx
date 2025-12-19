import { Mic, MicOff, HelpCircle } from 'lucide-react';

interface VoiceButtonProps {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
  onHelpClick: () => void;
}

export function VoiceButton({ isListening, isSupported, onClick, onHelpClick }: VoiceButtonProps) {
  if (!isSupported) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Help Button */}
      <button
        onClick={onHelpClick}
        className="w-12 h-12 bg-white hover:bg-gray-50 rounded-full shadow-lg border border-gray-200 flex items-center justify-center transition-all duration-200 group"
        title="Voice Commands Help"
      >
        <HelpCircle className="w-5 h-5 text-gray-600 group-hover:text-brand-600 transition-colors" />
      </button>

      {/* Main Voice Button */}
      <button
        onClick={onClick}
        className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center relative ${
          isListening
            ? 'bg-red-500 hover:bg-red-600 scale-110'
            : 'bg-gradient-to-br from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800'
        }`}
        title={isListening ? 'Stop Listening (Click or say "stop")' : 'Start Voice Assistant (Ctrl+Shift+V)'}
      >
        {/* Pulsing ring when listening */}
        {isListening && (
          <>
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
            <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse opacity-50" />
          </>
        )}
        
        {/* Icon */}
        <div className="relative z-10">
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" strokeWidth={2.5} />
          ) : (
            <Mic className="w-8 h-8 text-white" strokeWidth={2.5} />
          )}
        </div>
      </button>

      {/* Keyboard shortcut hint */}
      {!isListening && (
        <div className="absolute -top-12 right-0 bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Press <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Ctrl+Shift+V</kbd>
        </div>
      )}
    </div>
  );
}
