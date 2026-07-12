import { PrismaClient, Role, AssetState } from '../generated/prisma';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting AssetFlow ERP database seeder...');

  // 1. Clean existing records (in reverse order of foreign key dependencies)
  await prisma.auditRecord.deleteMany();
  await prisma.auditCycle.deleteMany();
  await prisma.maintenanceRequest.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.allocation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.assetCategory.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Create Departments
  const deptNames = ['Administration', 'IT', 'Finance', 'HR', 'Operations'];
  const departments: Record<string, any> = {};
  for (const name of deptNames) {
    departments[name] = await prisma.department.create({
      data: { name, isActive: true },
    });
  }
  console.log('✅ Created 5 Departments (Administration, IT, Finance, HR, Operations)');

  // 3. Create Employees (10 realistic employees across departments)
  const defaultPassword = await bcrypt.hash('password123', 10);

  const employeesData = [
    { name: 'Arthur Pendelton', email: 'arthur.p@assetflow.io', role: Role.ADMIN, dept: 'Administration' },
    { name: 'Elena Rostova', email: 'elena.r@assetflow.io', role: Role.DEPARTMENT_HEAD, dept: 'IT' },
    { name: 'Marcus Vance', email: 'marcus.v@assetflow.io', role: Role.ASSET_MANAGER, dept: 'IT' },
    { name: 'Sophia Chen', email: 'sophia.c@assetflow.io', role: Role.DEPARTMENT_HEAD, dept: 'Finance' },
    { name: 'David Miller', email: 'david.m@assetflow.io', role: Role.EMPLOYEE, dept: 'Finance' },
    { name: 'Priya Shah', email: 'priya.s@assetflow.io', role: Role.DEPARTMENT_HEAD, dept: 'HR' },
    { name: 'Liam OConnor', email: 'liam.o@assetflow.io', role: Role.EMPLOYEE, dept: 'HR' },
    { name: 'Carlos Gomez', email: 'carlos.g@assetflow.io', role: Role.DEPARTMENT_HEAD, dept: 'Operations' },
    { name: 'Hannah Wright', email: 'hannah.w@assetflow.io', role: Role.EMPLOYEE, dept: 'Operations' },
    { name: 'Aditi Rao', email: 'aditi.r@assetflow.io', role: Role.EMPLOYEE, dept: 'IT' },
  ];

  const users: Record<string, any> = {};
  for (const emp of employeesData) {
    users[emp.email] = await prisma.user.create({
      data: {
        name: emp.name,
        email: emp.email,
        password: defaultPassword,
        role: emp.role,
        departmentId: departments[emp.dept].id,
      },
    });
  }
  console.log('✅ Created 10 Employees with enterprise RBAC roles');

  // Assign Department Heads
  await prisma.department.update({
    where: { id: departments['IT'].id },
    data: { headId: users['elena.r@assetflow.io'].id },
  });
  await prisma.department.update({
    where: { id: departments['Finance'].id },
    data: { headId: users['sophia.c@assetflow.io'].id },
  });
  await prisma.department.update({
    where: { id: departments['HR'].id },
    data: { headId: users['priya.s@assetflow.io'].id },
  });
  await prisma.department.update({
    where: { id: departments['Operations'].id },
    data: { headId: users['carlos.g@assetflow.io'].id },
  });

  // 4. Create Asset Categories
  const categoriesData = [
    { name: 'Laptops & Workstations', description: 'Computing devices and developer laptops' },
    { name: 'AV & Conference Equip', description: 'Projectors, speakers, conference displays' },
    { name: 'Ergonomic Furniture', description: 'Standing desks and ergonomic chairs' },
    { name: 'Network & Infrastructure', description: 'Servers, routers, switches, racks' },
    { name: 'Shared Utility Vehicles', description: 'Company vans and transport vehicles' },
  ];
  const categories: Record<string, any> = {};
  for (const cat of categoriesData) {
    categories[cat.name] = await prisma.assetCategory.create({
      data: cat,
    });
  }
  console.log('✅ Created 5 Asset Categories');

  // 5. Create 20 Enterprise Assets
  const assetsList = [
    { tag: 'AF-1001', name: 'MacBook Pro M3 Max 16"', serial: 'C02G1001M3', cat: 'Laptops & Workstations', cost: 3499, status: AssetState.ALLOCATED, loc: 'Bengaluru HQ - IT' },
    { tag: 'AF-1002', name: 'MacBook Pro M3 Pro 14"', serial: 'C02G1002M3', cat: 'Laptops & Workstations', cost: 2499, status: AssetState.ALLOCATED, loc: 'Bengaluru HQ - IT' },
    { tag: 'AF-1003', name: 'Dell XPS 15 9530', serial: 'DXP15953001', cat: 'Laptops & Workstations', cost: 2199, status: AssetState.ALLOCATED, loc: 'Bengaluru HQ - Finance' },
    { tag: 'AF-1004', name: 'ThinkPad X1 Carbon Gen 11', serial: 'TPX1CG1101', cat: 'Laptops & Workstations', cost: 1899, status: AssetState.AVAILABLE, loc: 'Bengaluru HQ - IT Store' },
    { tag: 'AF-1005', name: 'MacBook Air M2 13"', serial: 'C02G1005M2', cat: 'Laptops & Workstations', cost: 1299, status: AssetState.ALLOCATED, loc: 'Bengaluru HQ - HR' },
    { tag: 'AF-1006', name: 'Dell Precision 5680 Workstation', serial: 'DPW5680001', cat: 'Laptops & Workstations', cost: 3899, status: AssetState.AVAILABLE, loc: 'Bengaluru HQ - IT Store' },
    { tag: 'AF-1007', name: 'HP EliteBook 840 G10', serial: 'HPE840G101', cat: 'Laptops & Workstations', cost: 1599, status: AssetState.UNDER_MAINTENANCE, loc: 'Service Center' },
    { tag: 'AF-1008', name: 'Sony Laser 4K Projector - Conf A', serial: 'SNYP4K0001', cat: 'AV & Conference Equip', cost: 4500, status: AssetState.AVAILABLE, loc: 'Conference Room A', bookable: true },
    { tag: 'AF-1009', name: 'Logitech Rally Bar Video System', serial: 'LOGRB00001', cat: 'AV & Conference Equip', cost: 2999, status: AssetState.AVAILABLE, loc: 'Conference Room B', bookable: true },
    { tag: 'AF-1010', name: 'Epson Pro EX9240 Projector', serial: 'EPS9240001', cat: 'AV & Conference Equip', cost: 1100, status: AssetState.AVAILABLE, loc: 'Conference Room C', bookable: true },
    { tag: 'AF-1011', name: 'Herman Miller Aeron Chair - Exec 1', serial: 'HMAER00001', cat: 'Ergonomic Furniture', cost: 1450, status: AssetState.ALLOCATED, loc: 'Floor 2 Exec Office' },
    { tag: 'AF-1012', name: 'Herman Miller Aeron Chair - Exec 2', serial: 'HMAER00002', cat: 'Ergonomic Furniture', cost: 1450, status: AssetState.ALLOCATED, loc: 'Floor 2 Exec Office' },
    { tag: 'AF-1013', name: 'Steelcase Gesture Ergonomic Chair', serial: 'STLG000001', cat: 'Ergonomic Furniture', cost: 1250, status: AssetState.AVAILABLE, loc: 'Warehouse A' },
    { tag: 'AF-1014', name: 'Uplift V2 Standing Desk 60x30', serial: 'UPV2603001', cat: 'Ergonomic Furniture', cost: 899, status: AssetState.ALLOCATED, loc: 'Floor 3 Engineering' },
    { tag: 'AF-1015', name: 'Cisco Catalyst 9300 48-Port Switch', serial: 'CSC9300001', cat: 'Network & Infrastructure', cost: 5200, status: AssetState.ALLOCATED, loc: 'Server Room 1' },
    { tag: 'AF-1016', name: 'Palo Alto PA-440 Next-Gen Firewall', serial: 'PAPA440001', cat: 'Network & Infrastructure', cost: 3600, status: AssetState.ALLOCATED, loc: 'Server Room 1' },
    { tag: 'AF-1017', name: 'APC Smart-UPS SRT 5000VA', serial: 'APCSRT5001', cat: 'Network & Infrastructure', cost: 4100, status: AssetState.UNDER_MAINTENANCE, loc: 'Server Room 1' },
    { tag: 'AF-1018', name: 'Ford Transit Custom Cargo Van', serial: 'FDTCV20241', cat: 'Shared Utility Vehicles', cost: 42000, status: AssetState.AVAILABLE, loc: 'Parking Bay 1', bookable: true },
    { tag: 'AF-1019', name: 'Toyota HiAce Executive Shuttler', serial: 'TYHAE20241', cat: 'Shared Utility Vehicles', cost: 48000, status: AssetState.AVAILABLE, loc: 'Parking Bay 2', bookable: true },
    { tag: 'AF-1020', name: 'Apple iPad Pro M2 12.9" 512GB', serial: 'DMPPRM2001', cat: 'Laptops & Workstations', cost: 1399, status: AssetState.AVAILABLE, loc: 'IT Pool' },
  ];

  const assets: Record<string, any> = {};
  for (const item of assetsList) {
    assets[item.tag] = await prisma.asset.create({
      data: {
        assetTag: item.tag,
        name: item.name,
        serialNumber: item.serial,
        categoryId: categories[item.cat].id,
        acquisitionCost: item.cost,
        status: item.status,
        location: item.loc,
        isBookable: item.bookable ?? false,
        condition: 'GOOD',
      },
    });
  }
  console.log('✅ Created 20 Realistic Enterprise Assets');

  // 6. Create Allocations
  await prisma.allocation.createMany({
    data: [
      { assetId: assets['AF-1001'].id, userId: users['elena.r@assetflow.io'].id, departmentId: departments['IT'].id, status: 'ACTIVE' },
      { assetId: assets['AF-1002'].id, userId: users['marcus.v@assetflow.io'].id, departmentId: departments['IT'].id, status: 'ACTIVE' },
      { assetId: assets['AF-1003'].id, userId: users['sophia.c@assetflow.io'].id, departmentId: departments['Finance'].id, status: 'ACTIVE' },
      { assetId: assets['AF-1005'].id, userId: users['priya.s@assetflow.io'].id, departmentId: departments['HR'].id, status: 'ACTIVE' },
      { assetId: assets['AF-1011'].id, userId: users['arthur.p@assetflow.io'].id, departmentId: departments['Administration'].id, status: 'ACTIVE' },
      { assetId: assets['AF-1012'].id, userId: users['elena.r@assetflow.io'].id, departmentId: departments['IT'].id, status: 'ACTIVE' },
    ],
  });
  console.log('✅ Created Asset Allocations');

  // 7. Create Maintenance Requests
  await prisma.maintenanceRequest.createMany({
    data: [
      {
        assetId: assets['AF-1007'].id,
        requesterId: users['aditi.r@assetflow.io'].id,
        description: 'Battery health critical; swelling detected on bottom case.',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
      },
      {
        assetId: assets['AF-1017'].id,
        requesterId: users['marcus.v@assetflow.io'].id,
        description: 'UPS annual battery replacement and self-test diagnostic.',
        priority: 'MEDIUM',
        status: 'PENDING',
      },
      {
        assetId: assets['AF-1008'].id,
        requesterId: users['elena.r@assetflow.io'].id,
        description: 'Projector color calibration and HDMI port check.',
        priority: 'LOW',
        status: 'APPROVED',
      },
    ],
  });
  console.log('✅ Created Maintenance Requests');

  // 8. Create Bookings
  const now = new Date();
  await prisma.booking.createMany({
    data: [
      {
        assetId: assets['AF-1008'].id,
        userId: users['sophia.c@assetflow.io'].id,
        startTime: new Date(now.getTime() + 3600000), // +1 hour
        endTime: new Date(now.getTime() + 7200000),   // +2 hours
        status: 'UPCOMING',
      },
      {
        assetId: assets['AF-1018'].id,
        userId: users['carlos.g@assetflow.io'].id,
        startTime: new Date(now.getTime() + 86400000), // tomorrow
        endTime: new Date(now.getTime() + 86400000 + 14400000),
        status: 'UPCOMING',
      },
    ],
  });
  console.log('✅ Created Resource Bookings');

  // 9. Create Audit Cycle & Records
  const auditCycle = await prisma.auditCycle.create({
    data: {
      name: 'Q3 Enterprise Physical Asset Audit',
      startDate: new Date(),
      endDate: new Date(now.getTime() + 14 * 86400000),
      status: 'OPEN',
      auditors: {
        connect: [{ id: users['marcus.v@assetflow.io'].id }],
      },
    },
  });

  await prisma.auditRecord.createMany({
    data: [
      { auditCycleId: auditCycle.id, assetId: assets['AF-1001'].id, status: 'VERIFIED', notes: 'Serial matches, condition excellent' },
      { auditCycleId: auditCycle.id, assetId: assets['AF-1002'].id, status: 'VERIFIED', notes: 'Verified with IT Head' },
      { auditCycleId: auditCycle.id, assetId: assets['AF-1003'].id, status: 'PENDING', notes: 'Scheduled for verification tomorrow' },
      { auditCycleId: auditCycle.id, assetId: assets['AF-1004'].id, status: 'PENDING' },
    ],
  });
  console.log('✅ Created Q3 Enterprise Audit Cycle & Records');

  // 10. Create Notifications
  await prisma.notification.createMany({
    data: [
      { userId: users['arthur.p@assetflow.io'].id, type: 'Alerts', message: 'Asset AF-1007 flagged for urgent battery replacement.' },
      { userId: users['elena.r@assetflow.io'].id, type: 'Approvals', message: 'New transfer request pending approval for AF-1005.' },
      { userId: users['sophia.c@assetflow.io'].id, type: 'Bookings', message: 'Conference Room A booking confirmed for 2:00 PM.' },
    ],
  });
  console.log('✅ Created System Notifications');

  // 11. Create Activity Logs
  await prisma.auditLog.createMany({
    data: [
      {
        userId: users['arthur.p@assetflow.io'].id,
        httpMethod: 'POST',
        module: 'assets',
        entity: 'Asset',
        entityId: assets['AF-1001'].id,
        newValues: JSON.stringify({ assetTag: 'AF-1001', name: 'MacBook Pro M3 Max 16"' }),
        ipAddress: '192.168.1.10',
      },
      {
        userId: users['marcus.v@assetflow.io'].id,
        httpMethod: 'PATCH',
        module: 'maintenance',
        entity: 'MaintenanceRequest',
        entityId: 'SYSTEM',
        newValues: JSON.stringify({ status: 'IN_PROGRESS' }),
        ipAddress: '192.168.1.24',
      },
    ],
  });
  console.log('✅ Created Automatic Activity Logs');

  console.log('\n🚀 AssetFlow ERP Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });