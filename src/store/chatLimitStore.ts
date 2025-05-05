import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useSubscriptionStore } from './subscriptionStore';

interface ChatLimitStore {
  messageCount: Record<string, number>;
  checkLimit: (userId: string) => boolean;
  incrementCount: (userId: string) => void;
  getRemainingMessages: (userId: string) => number;
}

const STORAGE_KEY = 'chat-limits';
const MAX_MESSAGES_PER_DAY = 5;

// Helper to get a key for the current day with robust error handling
const getCurrentDayKey = () => {
  try {
    const date = new Date();
    
    // Verify date methods are available
    if (typeof date.getFullYear !== 'function' || 
        typeof date.getMonth !== 'function' || 
        typeof date.getDate !== 'function') {
      console.warn('Date methods missing, using fallback timestamp');
      return `fallback-${Date.now()}`;
    }
    
    // Use try/catch for each method call
    let year, month, day;
    try { year = date.getFullYear(); } catch (e) { year = '2025'; }
    try { month = date.getMonth(); } catch (e) { month = '0'; }
    try { day = date.getDate(); } catch (e) { day = '1'; }
    
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error('Error generating day key:', e);
    // Return a fallback key that won't crash the app
    return 'error-fallback-key';
  }
};

export const useChatLimitStore = create<ChatLimitStore>()(
  persist(
    (set, get) => ({
      messageCount: {},

      // Check if the user has reached the message limit for the current day
      checkLimit: (userId: string) => {
        if (!userId) return false;
        
        // Check if user is premium or admin
        const { user } = useAuthStore.getState();
        const { subscription } = useSubscriptionStore.getState();
        const isPremium = user?.isAdmin || (subscription?.tier === 'premium' && subscription?.status === 'active');
        
        // Premium users have unlimited access
        if (isPremium) return true;

        const { messageCount = {} } = get();
        const userKey = `${userId}_${getCurrentDayKey()}`;
        const count = messageCount[userKey] || 0;
        
        // Get max messages with error handling
        let maxMessagesPerDay = MAX_MESSAGES_PER_DAY;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const storedValue = window.localStorage.getItem('MAX_MESSAGES_PER_DAY');
            if (storedValue) {
              const parsedValue = parseInt(storedValue, 10);
              if (!isNaN(parsedValue)) {
                maxMessagesPerDay = parsedValue;
              }
            }
          }
        } catch (e) {
          console.warn('Error accessing localStorage for message limits, using default', e);
          // Continue with default value
        }
        
        return count < maxMessagesPerDay;
      },

      // Increment the message count for the current day
      incrementCount: (userId: string) => {
        if (!userId) return;
        
        // Don't increment count for premium users
        const { user } = useAuthStore.getState();
        const { subscription } = useSubscriptionStore.getState();
        const isPremium = user?.isAdmin || (subscription?.tier === 'premium' && subscription?.status === 'active');
        
        if (isPremium) return;
        
        const { messageCount = {} } = get();
        const userKey = `${userId}_${getCurrentDayKey()}`;
        const newCount = (messageCount[userKey] || 0) + 1;
        
        set({
          messageCount: {
            ...messageCount,
            [userKey]: newCount
          }
        });

        // Store in local storage with error handling
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify({
            messageCount: {
              ...messageCount,
              [userKey]: newCount
            }
          }));
        } catch (e) {
          console.error('Error storing chat limits in localStorage:', e);
          // Continue execution even if localStorage fails
        }
      },

      // Get the remaining messages for the current day
      getRemainingMessages: (userId: string) => {
        if (!userId) return 0;
        
        // Check if user is premium or admin
        const { user } = useAuthStore.getState();
        const { subscription } = useSubscriptionStore.getState();
        const isPremium = user?.isAdmin || (subscription?.tier === 'premium' && subscription?.status === 'active');
        
        // Premium users have unlimited messages
        if (isPremium) return Infinity;
        
        const { messageCount = {} } = get();
        const userKey = `${userId}_${getCurrentDayKey()}`;
        const count = messageCount[userKey] || 0;
        
        // Get max messages with error handling
        let maxMessagesPerDay = MAX_MESSAGES_PER_DAY;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const storedValue = window.localStorage.getItem('MAX_MESSAGES_PER_DAY');
            if (storedValue) {
              const parsedValue = parseInt(storedValue, 10);
              if (!isNaN(parsedValue)) {
                maxMessagesPerDay = parsedValue;
              }
            }
          }
        } catch (e) {
          console.warn('Error accessing localStorage for message limits, using default', e);
          // Continue with default value
        }
        
        return Math.max(0, maxMessagesPerDay - count);
      }
    }),
    {
      name: STORAGE_KEY,
      getStorage: () => {
        // Safe localStorage access
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return localStorage;
          }
        } catch (e) {
          console.error('Error accessing localStorage in getStorage:', e);
          // Return a mock storage implementation that won't crash
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
          };
        }
        // Fallback storage implementation
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {}
        };
      }
    }
  )
);