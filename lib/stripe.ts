import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-09-30.clover',
  typescript: true,
});

/**
 * Create or retrieve a Stripe customer for a user
 * @param userId - User's database ID
 * @param email - User's email address
 * @param name - User's name (optional)
 */
export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
  name?: string | null
): Promise<string> {
  // First, check if customer already exists in Stripe
  const existingCustomers = await stripe.customers.list({
    email: email,
    limit: 1,
  });

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id;
  }

  // Create new customer if not found
  const customer = await stripe.customers.create({
    email: email,
    name: name || undefined,
    metadata: {
      userId: userId,
    },
  });

  return customer.id;
}

/**
 * Create a Stripe Checkout Session for plan subscription
 * @param customerId - Stripe customer ID
 * @param priceId - Stripe price ID for the plan
 * @param userId - User's database ID
 * @param planId - Plan's database ID
 */
export async function createCheckoutSession(
  customerId: string,
  priceId: string,
  userId: string,
  planId: string
): Promise<Stripe.Checkout.Session> {
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: {
      userId: userId,
      planId: planId,
    },
  });

  return session;
}

/**
 * Verify Stripe webhook signature
 * @param payload - Raw request body
 * @param signature - Stripe signature header
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Create a Stripe product and price for a plan
 * @param planName - Name of the plan
 * @param planDescription - Description of the plan
 * @param priceInCents - Price in cents (e.g., 1999 for $19.99)
 */
export async function createStripeProduct(
  planName: string,
  planDescription: string,
  priceInCents: number
): Promise<{ productId: string; priceId: string }> {
  // Create product
  const product = await stripe.products.create({
    name: planName,
    description: planDescription,
  });

  // Create price for the product
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: priceInCents,
    currency: 'usd',
    recurring: {
      interval: 'month',
    },
  });

  return {
    productId: product.id,
    priceId: price.id,
  };
}

/**
 * Cancel a Stripe subscription
 * @param subscriptionId - Stripe subscription ID
 */
export async function cancelSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.cancel(subscriptionId);
}

/**
 * Retrieve a Stripe subscription
 * @param subscriptionId - Stripe subscription ID
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  return await stripe.subscriptions.retrieve(subscriptionId);
}
