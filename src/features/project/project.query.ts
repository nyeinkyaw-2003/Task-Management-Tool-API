import { Prisma } from '@prisma/client';
import { normalizeSearch } from '../../common/helpers/query-helper';

export const buildProjectWhere = (
  search?: string,
  ownerId?: number,
): Prisma.ProjectWhereInput => {
  const safeSearchTerm = normalizeSearch(search);
  const where: Prisma.ProjectWhereInput = {};

  if (typeof ownerId === 'number') {
    where.ownerId = ownerId;
  }

  if (safeSearchTerm) {
    where.OR = [
      {
        name: {
          contains: safeSearchTerm,
          mode: 'insensitive',
        },
      },
      {
        goal: {
          contains: safeSearchTerm,
          mode: 'insensitive',
        },
      },
    ];
  }

  return where;
};
