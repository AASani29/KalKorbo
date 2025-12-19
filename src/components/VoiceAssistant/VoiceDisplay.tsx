import { Loader2 } from 'lucide-react';

interface VoiceDisplayProps {
  isListening: boolean;
  transcript: string;
  interimTranscript: string;
  isProcessing: boolean;
  parsedCommand: string | null;
}

export function VoiceDisplay({
  isListening,
  transcript,
  interimTranscript,
  isProcessing,
  parsedCommand
}: VoiceDisplayProps) {
  if (!isListening && !transcript && !isProcessing) {
    return null;
  }

  const displayText = transcript || interimTranscript;

  return (
    <div className="fixed bottom-28 right-6 z-50 w-96 max-w-[calc(100vw-3rem)]">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className={`px-5 py-3 border-b border-gray-100 ${
          isListening ? 'bg-gradient-to-r from-red-50 to-red-100' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-400'
            }`} />
            <span className="text-sm font-bold text-gray-900">
              {isProcessing ? 'Processing...' : isListening ? 'Listening...' : 'Voice Assistant'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          {/* Transcript */}
          {displayText && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                You said:
              </p>
              <p className={`text-base font-medium ${
                interimTranscript ? 'text-gray-400 italic' : 'text-gray-900'
              }`}>
                "{displayText}"
              </p>
            </div>
          )}

          {/* Parsed Command */}
          {parsedCommand && !isProcessing && (
            <div className="space-y-1 pt-2 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Understood:
              </p>
              <p className="text-sm font-medium text-brand-600">
                {parsedCommand}
              </p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />
              <p className="text-sm font-medium text-gray-600">
                Executing command...
              </p>
            </div>
          )}

          {/* Listening Hint */}
          {isListening && !displayText && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-400 italic">
                Speak a command...
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Say "help" to see available commands
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
