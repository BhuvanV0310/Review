import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: hashedAdminPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create regular user
  const hashedUserPassword = await bcrypt.hash('user123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: hashedUserPassword,
      name: 'Regular User',
      role: 'USER',
    },
  });
  console.log('✅ Regular user created:', user.email);

  // Create sample subscription plans
  const plans = await Promise.all([
    prisma.plan.create({
      data: {
        name: 'Basic Plan',
        price: 49.99,
        description: 'Perfect for small businesses',
        features: [
          'Up to 5 branches',
          'Basic sentiment analysis',
          'Monthly reports',
          'Email support',
        ],
        status: 'ACTIVE',
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Pro Plan',
        price: 99.99,
        description: 'Great for growing businesses',
        features: [
          'Up to 20 branches',
          'Advanced sentiment analysis',
          'Weekly reports',
          'Priority support',
          'Custom integrations',
        ],
        status: 'ACTIVE',
      },
    }),
    prisma.plan.create({
      data: {
        name: 'Enterprise Plan',
        price: 299.99,
        description: 'For large organizations',
        features: [
          'Unlimited branches',
          'AI-powered insights',
          'Real-time analytics',
          'Dedicated account manager',
          'Custom development',
          'SLA guarantee',
        ],
        status: 'ACTIVE',
      },
    }),
  ]);
  console.log(`✅ Created ${plans.length} subscription plans`);

  // Create sample branches for the regular user
  const branches = await Promise.all([
    prisma.branch.create({
      data: {
        name: 'Downtown Branch',
        location: 'New York, NY',
        address: '123 Main Street, New York, NY 10001',
        userId: user.id,
      },
    }),
    prisma.branch.create({
      data: {
        name: 'Uptown Branch',
        location: 'Brooklyn, NY',
        address: '456 Park Avenue, Brooklyn, NY 11201',
        userId: user.id,
      },
    }),
  ]);
  console.log(`✅ Created ${branches.length} branches`);

  // Create sample payments
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        userId: user.id,
        amount: 99.99,
        status: 'COMPLETED',
        planName: 'Pro Plan',
      },
    }),
    prisma.payment.create({
      data: {
        userId: user.id,
        amount: 99.99,
        status: 'PENDING',
        planName: 'Pro Plan',
      },
    }),
  ]);
  console.log(`✅ Created ${payments.length} payments`);

  // Create sample reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: user.id,
        branchId: branches[0].id,
        text: 'Great service! Very satisfied with the experience.',
        rating: 5,
        sentiment: 'positive',
        category: 'service',
      },
    }),
    prisma.review.create({
      data: {
        userId: user.id,
        branchId: branches[0].id,
        text: 'The staff was helpful but the wait time was too long.',
        rating: 3,
        sentiment: 'neutral',
        category: 'service',
      },
    }),
    prisma.review.create({
      data: {
        userId: user.id,
        branchId: branches[1].id,
        text: 'Disappointed with the quality. Expected better.',
        rating: 2,
        sentiment: 'negative',
        category: 'quality',
      },
    }),
  ]);
  console.log(`✅ Created ${reviews.length} reviews`);

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin - Email: admin@example.com, Password: admin123');
  console.log('User  - Email: user@example.com, Password: user123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
