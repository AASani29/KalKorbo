/**
 * Calculate similarity between two strings using Levenshtein distance
 * Returns a score between 0 and 1 (1 = identical)
 */
export function calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();

    if (s1 === s2) return 1;

    const len1 = s1.length;
    const len2 = s2.length;

    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;

    // Create matrix
    const matrix: number[][] = [];
    for (let i = 0; i <= len1; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
        matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost // substitution
            );
        }
    }

    const distance = matrix[len1][len2];
    const maxLen = Math.max(len1, len2);
    return 1 - distance / maxLen;
}

/**
 * Find best matches from a list of options
 */
export function findBestMatches<T extends { name: string; id: string }>(
    searchTerm: string,
    options: T[],
    threshold: number = 0.3,
    maxResults: number = 5
): Array<T & { score: number }> {
    const matches = options
        .map(option => ({
            ...option,
            score: calculateSimilarity(searchTerm, option.name)
        }))
        .filter(match => match.score >= threshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, maxResults);

    return matches;
}

/**
 * Check if a string is likely a misheard version of another
 * Uses phonetic similarity and common speech recognition errors
 */
export function isProbableMishearing(heard: string, actual: string): boolean {
    const similarity = calculateSimilarity(heard, actual);

    // High similarity = likely mishearing
    if (similarity > 0.6) return true;

    // Check for common speech recognition errors
    const heardLower = heard.toLowerCase();
    const actualLower = actual.toLowerCase();

    // Common substitutions
    const commonErrors = [
        ['you', 'u'],
        ['rewards', 'rewards'],
        ['to', '2'],
        ['for', '4'],
        ['ate', '8'],
    ];

    for (const [error, correct] of commonErrors) {
        if (heardLower.includes(error) && actualLower.includes(correct)) {
            return true;
        }
        if (heardLower.includes(correct) && actualLower.includes(error)) {
            return true;
        }
    }

    return false;
}
