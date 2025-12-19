import { X, Check, AlertCircle } from 'lucide-react';

interface VoiceConfirmationProps {
  isOpen: boolean;
  transcribedText: string;
  suggestedCorrection?: string;
  alternatives?: Array<{ id: string; name: string; score: number }>;
  onConfirm: (selectedId?: string) => void;
  onCancel: () => void;
}

export function VoiceConfirmation({
  isOpen,
  transcribedText,
  suggestedCorrection,
  alternatives = [],
  onConfirm,
  onCancel
}: VoiceConfirmationProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Voice Command
            </h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* What was heard */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">You said:</p>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-gray-900 italic">"{transcribedText}"</p>
          </div>
        </div>

        {/* Suggested correction */}
        {suggestedCorrection && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Did you mean:</p>
            <button
              onClick={() => onConfirm()}
              className="w-full bg-brand-50 hover:bg-brand-100 rounded-lg p-3 border-2 border-brand-200 hover:border-brand-300 transition-all text-left group"
            >
              <div className="flex items-center justify-between">
                <p className="text-brand-900 font-medium">{suggestedCorrection}</p>
                <Check className="w-5 h-5 text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          </div>
        )}

        {/* Alternative suggestions */}
        {alternatives.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">
              {suggestedCorrection ? 'Or select from your projects:' : 'Select a project:'}
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => onConfirm(alt.id)}
                  className="w-full bg-gray-50 hover:bg-gray-100 rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-900 font-medium">{alt.name}</p>
                      <p className="text-xs text-gray-500">
                        {Math.round(alt.score * 100)}% match
                      </p>
                    </div>
                    <Check className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No suggestions */}
        {!suggestedCorrection && alternatives.length === 0 && (
          <div className="bg-red-50 rounded-lg p-3 border border-red-200">
            <p className="text-sm text-red-800">
              No matching projects found. Please try again or create a new project first.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          {(suggestedCorrection || alternatives.length > 0) && (
            <button
              onClick={() => onConfirm()}
              className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors font-medium"
            >
              Confirm
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
