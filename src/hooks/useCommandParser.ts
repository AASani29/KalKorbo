import { useCallback } from 'react';
import { findMatchingPattern, CommandPattern } from '../utils/commandPatterns';

export interface ParsedCommand {
    action: string;
    params: Record<string, any>;
    pattern: CommandPattern;
    confidence: number;
    rawTranscript: string;
}

export function useCommandParser() {
    const parseCommand = useCallback((transcript: string): ParsedCommand | null => {
        if (!transcript || transcript.trim().length === 0) {
            return null;
        }

        const result = findMatchingPattern(transcript);

        if (!result) {
            return null;
        }

        return {
            action: result.pattern.action,
            params: result.params,
            pattern: result.pattern,
            confidence: 1.0, // Pattern-based matching is deterministic
            rawTranscript: transcript
        };
    }, []);

    const getSuggestions = useCallback((transcript: string): string[] => {
        // If no match found, provide helpful suggestions
        const lowerTranscript = transcript.toLowerCase();
        const suggestions: string[] = [];

        if (lowerTranscript.includes('task')) {
            suggestions.push('Try: "add task [name] to [project]"');
            suggestions.push('Try: "move task [id] to [status]"');
        }

        if (lowerTranscript.includes('project')) {
            suggestions.push('Try: "create project [name]"');
            suggestions.push('Try: "open project [name]"');
        }

        if (suggestions.length === 0) {
            suggestions.push('Say "help" to see available commands');
        }

        return suggestions;
    }, []);

    return {
        parseCommand,
        getSuggestions
    };
}
