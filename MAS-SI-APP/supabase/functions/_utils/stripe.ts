import Stripe from 'https://esm.sh/stripe@16.6.0?target=deno&deno-std=0.132.0&no-check';

export const stripe = Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});