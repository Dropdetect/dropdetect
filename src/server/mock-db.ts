// Mock database for build time

export const prisma = {
  drop: {
    findMany: async () => {
      return [];
    },
    findUnique: async () => {
      return null;
    },
    create: async () => {
      return {};
    },
    update: async () => {
      return {};
    },
    delete: async () => {
      return {};
    },
  },
  user: {
    findMany: async () => {
      return [];
    },
    findUnique: async () => {
      return null;
    },
    create: async () => {
      return {};
    },
    update: async () => {
      return {};
    },
    delete: async () => {
      return {};
    },
  },
};