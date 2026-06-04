import { prisma } from '../../config/db.js';

export class UserRepository {
  async getAllUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    return prisma.user.findMany({
      skip,
      take: limit,
      include: {
        company: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getUser(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        company: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async activateUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: true,
      },
    });
  }

  async deactivateUser(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }
}
