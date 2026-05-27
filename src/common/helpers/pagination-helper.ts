import { Prisma } from '@prisma/client';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

type PaginationDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: any) => Promise<number>;
};

function calculateOffsets(options: PaginationOptions) {
  const defaultLimit = 10;
  const absoulateLimit = options.maxLimit || defaultLimit;

  const page = Math.max(Number(options.page) || 1, 1);
  const limit = Math.min(Math.max(Number(options.limit) || defaultLimit, 1, absoulateLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

export async function paginate<
  TDelegate extends PaginationDelegate,
  TArgs extends Omit<Prisma.Args<TDelegate, "findMany">, 'skip' | 'limit'>
>(
  model: TDelegate,
  args: TArgs,
  options: PaginationOptions
) {
  const { page, limit, skip } = calculateOffsets(options);

  const orderBy = (args as any)?.orderBy ?? { createdAt: "desc" };

  const [data, total] = await Promise.all([
    model.findMany({
      ...(args as any),
      skip,
      take: limit,
      orderBy
    }),
    model.count({
      where: (args as any).where
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}