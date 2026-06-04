import { prisma } from '../../config/db.js';
export class RoleRepository {
  async createRole(name: string, code: string) {
    return prisma.role.create({
      data: {
        name,
        code,
      },
    });
  }

  async getRoles() {
    return prisma.role.findMany();
  }

  async assignRole(userId: string, roleId: string) {
    return prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
    });
  }

  async removeRole(userId: string, roleId: string) {
    return prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });
  }
}
