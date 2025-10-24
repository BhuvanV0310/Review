/**
 * Script to sync plans with Stripe
 * This creates Stripe products and prices for existing plans in the database
 * 
 * Usage:
 * 1. Ensure DATABASE_URL and STRIPE_SECRET_KEY are set in .env
 * 2. Run: npm run stripe:sync-plans
 */

import { prisma } from './lib/db';
import { createStripeProduct } from './lib/stripe';

async function syncPlansWithStripe() {
  try {
    console.log('🔄 Starting Stripe plan synchronization...\n');

    // Get all plans that don't have Stripe IDs yet
    const plansToSync = await prisma.plan.findMany({
      where: {
        OR: [
          { stripePriceId: null },
          { stripeProductId: null },
        ],
      },
    });

    if (plansToSync.length === 0) {
      console.log('✅ All plans are already synced with Stripe!');
      return;
    }

    console.log(`Found ${plansToSync.length} plan(s) to sync:\n`);

    for (const plan of plansToSync) {
      console.log(`📦 Processing: ${plan.name} ($${plan.price}/month)`);

      try {
        // Create Stripe product and price
        const { productId, priceId } = await createStripeProduct(
          plan.name,
          plan.description,
          Math.round(plan.price * 100) // Convert dollars to cents
        );

        // Update plan in database
        await prisma.plan.update({
          where: { id: plan.id },
          data: {
            stripeProductId: productId,
            stripePriceId: priceId,
          },
        });

        console.log(`   ✅ Created Stripe product: ${productId}`);
        console.log(`   ✅ Created Stripe price: ${priceId}`);
        console.log(`   ✅ Updated database record\n`);
      } catch (error) {
        console.error(`   ❌ Error syncing ${plan.name}:`, error);
        console.log('');
      }
    }

    console.log('🎉 Stripe synchronization completed!\n');

    // Display summary
    const syncedPlans = await prisma.plan.findMany({
      where: {
        stripePriceId: { not: null },
        stripeProductId: { not: null },
      },
    });

    console.log('📊 Summary:');
    console.log(`   Total plans: ${await prisma.plan.count()}`);
    console.log(`   Synced with Stripe: ${syncedPlans.length}`);
    console.log(`   Pending sync: ${await prisma.plan.count() - syncedPlans.length}\n`);

    console.log('🎯 Synced Plans:');
    for (const plan of syncedPlans) {
      console.log(`   • ${plan.name} - $${plan.price}/month`);
      console.log(`     Product: ${plan.stripeProductId}`);
      console.log(`     Price: ${plan.stripePriceId}\n`);
    }

  } catch (error) {
    console.error('❌ Synchronization failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the sync
syncPlansWithStripe()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
