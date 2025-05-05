/**
 * Safe date utilities that prevent errors in production builds
 */

/**
 * Format a timestamp safely, with multiple fallback mechanisms
 * @param timestamp The date to format or a string/number to convert to a date
 * @param format The format function to use (e.g., toLocaleTimeString)
 * @param fallback Fallback value if date is invalid
 */
export function formatDateSafely(
  timestamp: Date | string | number | undefined | null,
  format: keyof Date = 'toLocaleTimeString',
  fallback: string = 'Just now'
): string {
  try {
    // Check if timestamp is already a Date
    let date: Date;
    
    if (timestamp instanceof Date) {
      date = timestamp;
    } else if (timestamp) {
      // Convert to Date if it's a string or number
      date = new Date(timestamp);
    } else {
      // If no timestamp provided, use current time
      return fallback;
    }
    
    // Verify it's a valid date
    if (isNaN(date.getTime())) {
      return fallback;
    }
    
    // Apply the requested format
    if (typeof date[format] === 'function') {
      // @ts-ignore - We've verified this is a function
      return date[format]();
    }
    
    return fallback;
  } catch (e) {
    console.error('Error formatting date:', e);
    return fallback;
  }
}

/**
 * Format a time string safely
 */
export function formatTimeSafely(timestamp: any): string {
  return formatDateSafely(timestamp, 'toLocaleTimeString', 'Just now');
}

/**
 * Format a date string safely
 */
export function formatDateStringSafely(timestamp: any): string {
  return formatDateSafely(timestamp, 'toLocaleDateString', 'Not available');
}

/**
 * Install global date protection in production
 * This patches the Date prototype to prevent errors
 */
export function installDateProtection(): void {
  try {
    // Only run in production
    if (process.env.NODE_ENV !== 'production') return;
    
    const originalToLocaleTimeString = Date.prototype.toLocaleTimeString;
    Date.prototype.toLocaleTimeString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
      try {
        return originalToLocaleTimeString.call(this, locales, options);
      } catch (e) {
        console.warn('Protected from toLocaleTimeString error', e);
        return 'Just now';
      }
    };
    
    const originalToLocaleDateString = Date.prototype.toLocaleDateString;
    Date.prototype.toLocaleDateString = function(locales?: string | string[], options?: Intl.DateTimeFormatOptions) {
      try {
        return originalToLocaleDateString.call(this, locales, options);
      } catch (e) {
        console.warn('Protected from toLocaleDateString error', e);
        return 'Not available';
      }
    };
    
    console.log('Date protection installed');
  } catch (e) {
    console.error('Failed to install date protection:', e);
  }
}
