import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './authStore';
import { useSubscriptionStore } from './subscriptionStore';

interface ChatLimit {
  messageCount: number;
  lastReset: number;
  dailyLimit: number;
}

interface ChatLimitStore {
  limits: Record<string, ChatLimit>;
  checkLimit: (userId: string) => boolean;
  incrementCount: (userId: string) => void;
  getRemainingMessages: (userId: string) => number;
}

const DAILY_LIMIT = 5;
const DAY_IN_MS = 86400000; // 24 hours in milliseconds

export const useChatLimitStore = create<ChatLimitStore>()(
  persist(
    (set, get) => ({
      limits: {},
      
      checkLimit: (userId: string) => {
        // Check if user is premium or admin
        const { user } = useAuthStore.getState();
        const { subscription } = useSubscriptionStore.getState();
        const isPremium = user?.isAdmin || (subscription?.tier === 'premium' && subscription?.status === 'active');
        
        // Premium users have unlimited access
        if (isPremium) return true;

        const limit = get().limits[userId];
        if (!limit) return true;

        const now = Date.now();
        const dayAgo = now - DAY_IN_MS;

        // Reset counter if it's been more than a day
        if (limit.lastReset < dayAgo) {
          set((state) => ({
            limits: {
              ...state.limits,
              [userId]: {
                messageCount: 0,
                lastReset: now,
                dailyLimit: DAILY_LIMIT
              }
            }
          }));
          return true;
        }

        return limit.messageCount < limit.dailyLimit;
      },

      incrementCount: (userId: string) => {
        // Don't increment count for premium users
        const { user } = useAuthStore.getState();
        const { subscription } = useSubscriptionStore.getState();
        const isPremium = user?.isAdmin || (subscription?.tier === 'premium' && subscription?.status === 'active');
        
        if (isPremium) return;

        const now = Date.now();
        const limit = get().limits[userId];
        const dayAgo = now - DAY_IN_MS;

        // If it's been more than a day, reset the counter
        if (!limit || limit.lastReset < dayAgo) {
          set((state) => ({
            limits: {
              ...state.limits,
              [userId]: {
                messageCount: 1,
                lastReset: now,
                dailyLimit: DAILY_LIMIT
              }
            }
          }));
          return;
        }

        // Otherwise increment the existing counter
        set((state) => ({
          limits: {
            ...state.limits,
            [userId]: {
              ...limit,
              messageCount: limit.messageCount + 1
            }
          }
        }));
      },

      getRemainingMessages: (userId: string) => {
        // Check if user is premium or admin
        const { user } = useAuthStore.getState();
        const { subscription } = useSubscriptionStore.getState();
        const isPremium = user?.isAdmin || (subscription?.tier === 'premium' && subscription?.status === 'active');
        
        // Premium users have unlimited messages
        if (isPremium) return Infinity;

        const limit = get().limits[userId];
        if (!limit) return DAILY_LIMIT;

        const now = Date.now();
        const dayAgo = now - DAY_IN_MS;

        if (limit.lastReset < dayAgo) {
          return DAILY_LIMIT;
        }

        return Math.max(0, limit.dailyLimit - limit.messageCount);
      }
    }),
    {
      name: 'chat-limits'
    }
  )
);