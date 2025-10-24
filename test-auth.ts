import bcrypt from "bcryptjs";
import prisma from "./lib/db";

async function testAuthSetup() {
  console.log("🧪 Testing NextAuth + Prisma Integration...\n");

  try {
    // Test 1: Database Connection
    console.log("1️⃣ Testing database connection...");
    await prisma.$connect();
    console.log("✅ Database connected\n");

    // Test 2: Create Test Admin User
    console.log("2️⃣ Creating test ADMIN user...");
    
    // Check if admin exists
    const existingAdmin = await prisma.user.findUnique({
      where: { email: "admin@test.com" },
    });

    if (existingAdmin) {
      console.log("⚠️  Admin user already exists");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      console.log(`   ID: ${existingAdmin.id}\n`);
    } else {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const admin = await prisma.user.create({
        data: {
          email: "admin@test.com",
          password: hashedPassword,
          name: "Test Admin",
          role: "ADMIN",
        },
      });
      console.log("✅ Admin user created successfully!");
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin123`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin.id}\n`);
    }

    // Test 3: Create Test Customer User
    console.log("3️⃣ Creating test CUSTOMER user...");
    
    const existingCustomer = await prisma.user.findUnique({
      where: { email: "customer@test.com" },
    });

    if (existingCustomer) {
      console.log("⚠️  Customer user already exists");
      console.log(`   Email: ${existingCustomer.email}`);
      console.log(`   Role: ${existingCustomer.role}\n`);
    } else {
      const hashedPassword = await bcrypt.hash("customer123", 10);
      const customer = await prisma.user.create({
        data: {
          email: "customer@test.com",
          password: hashedPassword,
          name: "Test Customer",
          role: "CUSTOMER",
        },
      });
      console.log("✅ Customer user created successfully!");
      console.log(`   Email: ${customer.email}`);
      console.log(`   Password: customer123`);
      console.log(`   Role: ${customer.role}\n`);
    }

    // Test 4: Create Test Delivery Partner
    console.log("4️⃣ Creating test DELIVERY_PARTNER user...");
    
    const existingPartner = await prisma.user.findUnique({
      where: { email: "partner@test.com" },
    });

    if (existingPartner) {
      console.log("⚠️  Delivery partner already exists");
      console.log(`   Email: ${existingPartner.email}`);
      console.log(`   Role: ${existingPartner.role}\n`);
    } else {
      const hashedPassword = await bcrypt.hash("partner123", 10);
      const partner = await prisma.user.create({
        data: {
          email: "partner@test.com",
          password: hashedPassword,
          name: "Test Partner",
          role: "DELIVERY_PARTNER",
        },
      });
      console.log("✅ Delivery partner created successfully!");
      console.log(`   Email: ${partner.email}`);
      console.log(`   Password: partner123`);
      console.log(`   Role: ${partner.role}\n`);
    }

    // Test 5: Verify Password Hashing
    console.log("5️⃣ Testing password verification...");
    const testUser = await prisma.user.findUnique({
      where: { email: "admin@test.com" },
    });

    if (testUser && testUser.password) {
      const isValid = await bcrypt.compare("admin123", testUser.password);
      if (isValid) {
        console.log("✅ Password hashing and verification working correctly\n");
      } else {
        console.log("❌ Password verification failed\n");
      }
    }

    // Test 6: Check Schema
    console.log("6️⃣ Verifying database schema...");
    const userCount = await prisma.user.count();
    const accountCount = await prisma.account.count();
    const sessionCount = await prisma.session.count();

    console.log("✅ NextAuth tables exist:");
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Accounts: ${accountCount}`);
    console.log(`   - Sessions: ${sessionCount}\n`);

    // Summary
    console.log("📊 Test Users Summary:");
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        role: true,
        name: true,
      },
    });

    allUsers.forEach((user, index) => {
      console.log(`\n   User ${index + 1}:`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Name: ${user.name || "N/A"}`);
    });

    console.log("\n\n🎉 NextAuth Setup Complete!\n");
    console.log("📝 Test Credentials:");
    console.log("   Admin: admin@test.com / admin123");
    console.log("   Customer: customer@test.com / customer123");
    console.log("   Partner: partner@test.com / partner123\n");

    console.log("🔐 NextAuth Endpoints:");
    console.log("   Sign In: http://localhost:3000/api/auth/signin");
    console.log("   Sign Out: http://localhost:3000/api/auth/signout");
    console.log("   Session: http://localhost:3000/api/auth/session\n");

    console.log("🛡️  Protected Routes:");
    console.log("   /admin/* - ADMIN role only");
    console.log("   /dashboard/* - Authenticated users");
    console.log("   /api/admin/* - ADMIN role only\n");

    console.log("💡 Next Steps:");
    console.log("   1. Run: npm run dev");
    console.log("   2. Visit: http://localhost:3000/auth/login");
    console.log("   3. Login with test credentials");
    console.log("   4. Try accessing /admin routes\n");

  } catch (error) {
    console.error("❌ Error during auth setup:", error);
    if (error instanceof Error) {
      console.error(`   ${error.message}\n`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthSetup();
