import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { prisma } from '@/lib/db';
import { getOrCreateStripeCustomer, createCheckoutSession } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to continue.' },
        { status: 401 }
      );
    }

    // Parse request body
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Fetch the plan from database
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    if (plan.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'This plan is not available for purchase' },
        { status: 400 }
      );
    }

    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: 'Plan is not configured for Stripe payments' },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get or create Stripe customer
    let stripeCustomerId = user.stripeCustomerId;
    
    if (!stripeCustomerId) {
      stripeCustomerId = await getOrCreateStripeCustomer(
        user.id,
        user.email,
        user.name
      );

      // Update user with Stripe customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId },
      });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await createCheckoutSession(
      stripeCustomerId,
      plan.stripePriceId,
      user.id,
      plan.id
    );

    // Create pending payment record
    await prisma.payment.create({
      data: {
        userId: user.id,
        planId: plan.id,
        amount: plan.price,
        status: 'PENDING',
        planName: plan.name,
        stripeSessionId: checkoutSession.id,
      },
    });

    // Return the checkout session URL
    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
