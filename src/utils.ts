// src/utils.ts

/**
 * Formats a duration given in minutes into a human-readable string (e.g., "1h 30m").
 * @param minutes The total duration in minutes.
 * @returns Formatted string.
 */
export const formatDuration = (minutes: number): string => {
    if (minutes < 0) return '0m';
    const totalMinutes = Math.round(minutes);
    const hours = Math.floor(totalMinutes / 60);
    const remainingMinutes = totalMinutes % 60;

    if (hours > 0 && remainingMinutes > 0) {
        return `${hours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
        return `${hours}h`;
    } else if (remainingMinutes > 0) {
        return `${remainingMinutes}m`;
    } else {
        return '0m';
    }
};

// Note: The specific function 'logSum' seems to be a custom reducer/aggregator.
// Since you used 'formatDuration' explicitly in the component props, this is defined here.
// You can integrate the specific daily calculation logic (like calculating todaySleepMinutes) 
// directly into the components like you did in OverviewTab, or move those complex
// calculations into a dedicated utility function here if they are reused often.