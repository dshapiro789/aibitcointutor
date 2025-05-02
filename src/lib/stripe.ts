import { loadStripe } from '@stripe/stripe-js';

// Temporarily disabled Stripe integration
// const stripePublicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
// if (!stripePublicKey) {
//   throw new Error('Missing Stripe public key');
// }

export const stripe = null; // await loadStripe(stripePublicKey);