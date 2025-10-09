import { loadStripe } from '@stripe/stripe-js';

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
// Replace with your actual publishable key from Stripe Dashboard
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey && process.env.NEXT_PUBLIC_DISABLE_STRIPE !== 'true' ? loadStripe(stripeKey) : null;

export default stripePromise;
