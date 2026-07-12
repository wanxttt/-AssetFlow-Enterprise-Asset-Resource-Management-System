import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  // Everyone's password will be 'password123' for easy testing
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create Departments
  const engineering = await prisma.department.create({
    data: { name: 'Engineering', isActive: true }
  });
  
  const operations = await prisma.department.create({
    data: { name: 'Operations', isActive: true }
  });

  // 2. Create Users 
  const adminUser = await prisma.user.create({
    data: {
      email: 'bhawika@ansharc.com',
      name: 'Bhawika Bhandari',
      password: hashedPassword,
      role: 'ADMIN',
      departmentId: engineering.id,
    }
  });

  const managerUser = await prisma.user.create({
    data: {
      email: 'tina@ansharc.com',
      name: 'Tina Khatri',
      password: hashedPassword,
      role: 'ASSET_MANAGER',
      departmentId: operations.id,
    }
  });

  const employee1 = await prisma.user.create({
    data: {
      email: 'sharad@ansharc.com',
      name: 'Sharad Pandey',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: engineering.id,
    }
  });

  const employee2 = await prisma.user.create({
    data: {
      email: 'sumanyu@ansharc.com',
      name: 'Sumanyu Singh',
      password: hashedPassword,
      role: 'EMPLOYEE',
      departmentId: engineering.id,
    }
  });

  // 3. Create Categories
  const electronics = await prisma.assetCategory.create({
    data: { name: 'Electronics', description: 'Laptops, Monitors, etc.' }
  });

  const furniture = await prisma.assetCategory.create({
    data: { name: 'Furniture', description: 'Chairs, Desks' }
  });

  // 4. Create Assets
  await prisma.asset.create({
    data: {
      assetTag: 'AF-0114',
      name: 'Dell XPS 15 Laptop',
      categoryId: electronics.id,
      status: 'AVAILABLE',
      location: 'HQ Floor 2',
      serialNumber: 'DL-XPS-9901',
    }
  });

  await prisma.asset.create({
    data: {
      assetTag: 'AF-0062',
      name: 'Conference Room Projector',
      categoryId: electronics.id,
      status: 'AVAILABLE',
      location: 'Room B2',
      isBookable: true,
    }
  });

  console.log('Database seeded successfully! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });