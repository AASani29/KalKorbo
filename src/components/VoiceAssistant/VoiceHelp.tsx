import { X, Mic, Lightbulb } from 'lucide-react';
import { getCommandsByCategory } from '../../utils/commandPatterns';

interface VoiceHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VoiceHelp({ isOpen, onClose }: VoiceHelpProps) {
  if (!isOpen) return null;

  const commandsByCategory = getCommandsByCategory();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 px-8 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
              <Mic className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Voice Commands</h2>
              <p className="text-sm text-brand-100 font-medium">Say these commands to control your tasks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-md"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 mb-8 border border-amber-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-amber-900 mb-2">Quick Tips</h3>
                <ul className="text-sm text-amber-800 space-y-1">
                  <li>• Speak clearly and at a normal pace</li>
                  <li>• Use exact project names (e.g., "URewards" not "U Rewards")</li>
                  <li>• Press <kbd className="px-2 py-0.5 bg-amber-200 rounded text-xs font-bold">Ctrl+Shift+V</kbd> to activate voice assistant</li>
                  <li>• Say "stop" or click the mic button to stop listening</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Command Categories */}
          <div className="space-y-8">
            {Object.entries(commandsByCategory).map(([category, commands]) => (
              <div key={category}>
                <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-brand-600 rounded-full" />
                  {category}
                </h3>
                <div className="space-y-4">
                  {commands.map((command, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-xl p-5 border border-gray-200 hover:border-brand-300 transition-colors"
                    >
                      <p className="text-sm font-bold text-gray-900 mb-2">
                        {command.description}
                      </p>
                      <div className="space-y-2">
                        {command.examples.map((example, exIdx) => (
                          <div
                            key={exIdx}
                            className="bg-white rounded-lg px-4 py-2.5 border border-gray-200 font-mono text-sm text-brand-700"
                          >
                            "{example}"
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-8 py-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 font-medium">
              Voice commands are processed locally in your browser
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold transition-colors shadow-sm"
            >
              Got it!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
