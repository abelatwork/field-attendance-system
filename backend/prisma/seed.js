"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log("Seeding database...");
    // 1. Hash default password for admin and supervisor
    const hashedPassword = await bcryptjs_1.default.hash("Password123!", 10);
    // 2. Create Super Admin
    const admin = await prisma.user.upsert({
        where: { username: "admin" },
        update: {
            passwordHash: hashedPassword,
            firstName: "System",
            lastName: "Administrator",
            phone: "+255700000000",
            department: "Operations",
            role: client_1.Role.SUPER_ADMIN,
        },
        create: {
            username: "admin",
            passwordHash: hashedPassword,
            firstName: "System",
            lastName: "Administrator",
            phone: "+255700000000",
            department: "Operations",
            role: client_1.Role.SUPER_ADMIN,
        },
    });
    // 3. Create a Supervisor
    const supervisor = await prisma.user.upsert({
        where: { username: "supervisor" },
        update: {
            firstName: "Mary",
            lastName: "Kiboko",
            phone: "+255700000001",
            department: "Field Monitoring",
            role: client_1.Role.SUPERVISOR,
        },
        create: {
            username: "supervisor",
            passwordHash: hashedPassword,
            firstName: "Mary",
            lastName: "Kiboko",
            phone: "+255700000001",
            department: "Field Monitoring",
            role: client_1.Role.SUPERVISOR,
        },
    });
    // 4. Create Test Students linked to the Supervisor
    const student1 = await prisma.student.create({
        data: {
            firstName: "John",
            lastName: "Doe",
            phone: "+255700000001",
            status: client_1.StudentStatus.ACTIVE,
            supervisorId: supervisor.id,
        },
    });
    const student2 = await prisma.student.create({
        data: {
            firstName: "Jane",
            lastName: "Smith",
            phone: "+255700000002",
            status: client_1.StudentStatus.ACTIVE,
            supervisorId: supervisor.id,
        },
    });
    console.log("Seed completed successfully!");
    console.log({ admin, supervisor, students: [student1, student2] });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map