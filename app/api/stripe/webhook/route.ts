import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { constructWebhookEvent, stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

// Disable body parsing for webhooks (we need raw body)
export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Get the raw body
    const body = await req.text();
    
    // Get the signature from headers
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    // Verify the webhook signature
    let event: Stripe.Event;
    try {
      event = constructWebhookEvent(body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutSessionCompleted(session);
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful checkout session
 */
async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const planId = session.metadata?.planId;

  if (!userId || !planId) {
    console.error('Missing metadata in checkout session:', session.id);
    return;
  }

  try {
    // Get the subscription if it exists
    const subscriptionId = session.subscription as string | null;

    // Update payment record to completed
    await prisma.payment.updateMany({
      where: {
        stripeSessionId: session.id,
        userId: userId,
      },
      data: {
        status: 'COMPLETED',
        stripePaymentIntentId: session.payment_intent as string,
        metadata: {
          subscriptionId,
          sessionId: session.id,
        },
      },
    });

    // Update user's active plan
    await prisma.user.update({
      where: { id: userId },
      data: {
        activePlanId: planId,
      },
    });

    console.log(`✅ Payment completed for user ${userId}, plan ${planId}`);
  } catch (error) {
    console.error('Error handling checkout session:', error);
  }
}

/**
 * Handle subscription created
 */
async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    console.log(`✅ Subscription created for user ${user.id}: ${subscription.id}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

/**
 * Handle subscription updated
 */
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // If subscription is canceled or past due, remove active plan
    if (subscription.status === 'canceled' || subscription.status === 'past_due') {
      await prisma.user.update({
        where: { id: user.id },
        data: { activePlanId: null },
      });
      console.log(`⚠️ Subscription ${subscription.status} for user ${user.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Remove active plan
    await prisma.user.update({
      where: { id: user.id },
      data: { activePlanId: null },
    });

    console.log(`❌ Subscription deleted for user ${user.id}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

/**
 * Handle successful invoice payment
 */
async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  const subscriptionId = (invoice as any).subscription as string | null;

  try {
    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Create payment record for recurring payment
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: (invoice.amount_paid || 0) / 100, // Convert cents to dollars
        status: 'COMPLETED',
        planName: 'Subscription renewal',
        stripePaymentIntentId: (invoice as any).payment_intent as string | null,
        metadata: {
          invoiceId: invoice.id,
          subscriptionId,
        },
      },
    });

    console.log(`✅ Invoice payment succeeded for user ${user.id}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

/**
 * Handle failed invoice payment
 */
async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    // Find user by Stripe customer ID
    const user = await prisma.user.findUnique({
      where: { stripeCustomerId: customerId },
    });

    if (!user) {
      console.error('User not found for customer:', customerId);
      return;
    }

    // Create failed payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        amount: (invoice.amount_due || 0) / 100, // Convert cents to dollars
        status: 'FAILED',
        planName: 'Subscription renewal (failed)',
        metadata: {
          invoiceId: invoice.id,
        },
      },
    });

    console.log(`❌ Invoice payment failed for user ${user.id}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}
