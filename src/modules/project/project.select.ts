import { Prisma } from '@prisma/client';

export const projectPublicSelect = {
  id: true,
  name: true,
  ownerId: true,
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.ProjectSelect;
