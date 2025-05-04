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

// Helper to get a key for the current day
const getCurrentDayKey = () => {
  const date = new Date();
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
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
        const maxMessagesPerDay = typeof window !== 'undefined' && 
          window.localStorage.getItem('MAX_MESSAGES_PER_DAY') ? 
          parseInt(window.localStorage.getItem('MAX_MESSAGES_PER_DAY') || '5') : 
          MAX_MESSAGES_PER_DAY;
        
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

        // Store in local storage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          messageCount: {
            ...messageCount,
            [userKey]: newCount
          }
        }));
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
        const maxMessagesPerDay = typeof window !== 'undefined' && 
          window.localStorage.getItem('MAX_MESSAGES_PER_DAY') ? 
          parseInt(window.localStorage.getItem('MAX_MESSAGES_PER_DAY') || '5') : 
          MAX_MESSAGES_PER_DAY;
        
        return Math.max(0, maxMessagesPerDay - count);
      }
    }),
    {
      name: STORAGE_KEY,
      getStorage: () => localStorage
    }
  )
);