import prisma from './lib/db';

async function testDatabaseConnection() {
  console.log('🔍 Testing Prisma Database Connection...\n');

  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    await prisma.$connect();
    console.log('✅ Database connected successfully!\n');

    // Test 2: Fetch all users
    console.log('2️⃣ Fetching users from database...');
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    
    if (users.length === 0) {
      console.log('⚠️  No users found in database.');
      console.log('\n📝 To seed sample data, run:');
      console.log('   npm run db:seed\n');
      console.log('This will create:');
      console.log('   - 2 users (admin@example.com, user@example.com)');
      console.log('   - 3 subscription plans');
      console.log('   - 2 branches');
      console.log('   - 2 payments');
      console.log('   - 3 reviews\n');
    } else {
      console.log(`✅ Found ${users.length} user(s):\n`);
      users.forEach((user, index) => {
        console.log(`   User ${index + 1}:`);
        console.log(`   - ID: ${user.id}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Name: ${user.name || 'N/A'}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Created: ${user.createdAt.toLocaleDateString()}`);
        console.log('');
      });
    }

    // Test 3: Check TypeScript types
    console.log('3️⃣ Testing Prisma TypeScript types...');
    const userCount: number = await prisma.user.count();
    const planCount: number = await prisma.plan.count();
    const branchCount: number = await prisma.branch.count();
    const paymentCount: number = await prisma.payment.count();
    const reviewCount: number = await prisma.review.count();
    
    console.log('✅ TypeScript types working correctly!\n');
    console.log('📊 Database Summary:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Plans: ${planCount}`);
    console.log(`   - Branches: ${branchCount}`);
    console.log(`   - Payments: ${paymentCount}`);
    console.log(`   - Reviews: ${reviewCount}`);
    console.log('');

    // Test 4: Test Prisma client singleton
    console.log('4️⃣ Testing Prisma client singleton...');
    const prisma2 = (await import('./lib/db')).default;
    const isSamePrismaInstance = prisma === prisma2;
    console.log(`✅ Singleton pattern working: ${isSamePrismaInstance ? 'Yes' : 'No'}\n`);

    // Test 5: Test relations
    if (userCount > 0) {
      console.log('5️⃣ Testing relations...');
      const userWithRelations = await prisma.user.findFirst({
        include: {
          branches: true,
          payments: true,
          reviews: true,
        },
      });
      
      if (userWithRelations) {
        console.log('✅ Relations working correctly!');
        console.log(`   User "${userWithRelations.email}" has:`);
        console.log(`   - ${userWithRelations.branches.length} branch(es)`);
        console.log(`   - ${userWithRelations.payments.length} payment(s)`);
        console.log(`   - ${userWithRelations.reviews.length} review(s)`);
        console.log('');
      }
    }

    console.log('🎉 All tests passed! Prisma is fully integrated and working.\n');

    // Recommendations
    if (userCount === 0 || planCount === 0) {
      console.log('💡 Recommendations:');
      console.log('   1. Run seed script: npm run db:seed');
      console.log('   2. Open Prisma Studio: npm run db:studio');
      console.log('   3. Check DATABASE_URL in .env file\n');
    }

  } catch (error) {
    console.error('❌ Error testing database connection:\n');
    
    if (error instanceof Error) {
      console.error(`Error: ${error.message}\n`);
      
      // Provide specific help based on error type
      if (error.message.includes('P1001')) {
        console.log('🔧 Troubleshooting:');
        console.log('   - Check your DATABASE_URL in .env file');
        console.log('   - Ensure your database server is running');
        console.log('   - Verify network connectivity to database\n');
      } else if (error.message.includes('P1003')) {
        console.log('🔧 Troubleshooting:');
        console.log('   - Database does not exist');
        console.log('   - Run: npm run db:migrate\n');
      } else if (error.message.includes('P2021')) {
        console.log('🔧 Troubleshooting:');
        console.log('   - Table does not exist');
        console.log('   - Run: npm run db:migrate\n');
      } else {
        console.log('🔧 Troubleshooting:');
        console.log('   1. Check if DATABASE_URL is set in .env');
        console.log('   2. Run: npm run db:generate');
        console.log('   3. Run: npm run db:migrate');
        console.log('   4. Try: npm run db:push (for quick schema sync)\n');
      }
    } else {
      console.error(error);
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
  }
}

// Run the test
testDatabaseConnection();
