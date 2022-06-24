import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development
declare const global: NodeJS.Global & { prisma?: PrismaClient };

export const prismaClient = global.prisma || new PrismaClient();
if (process.env.NODE_ENV === 'development') global.prismaClient = prismaClient;
