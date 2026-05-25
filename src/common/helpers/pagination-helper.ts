import { Prisma } from '@prisma/client';

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}

type PaginationDelegate = {
  findMany: (args?: any) => Promise<any>;
  count: (args?: any) => Promise<number>;
};

type FindManyArgs<TDelegate extends PaginationDelegate> = Omit<
  Prisma.Args<TDelegate, 'findMany'>,
  'skip' | 'take'
>;

type CountWhere<TDelegate extends PaginationDelegate> =
  Prisma.Args<TDelegate, 'count'> extends { where?: infer TWhere }
    ? TWhere
    : never;

type FindManyItem<
  TDelegate extends PaginationDelegate,
  TArgs extends FindManyArgs<TDelegate>,
> = Prisma.Result<TDelegate, TArgs, 'findMany'> extends Array<infer TItem>
  ? TItem
  : never;

export async function paginate<
  TDelegate extends PaginationDelegate,
  TArgs extends FindManyArgs<TDelegate>,
>(
  model: TDelegate,
  args: TArgs,
  options: PaginationOptions,
): Promise<PaginationResult<FindManyItem<TDelegate, TArgs>>> {
  const page = Math.max(options.page || 1, 1);
  const limit = Math.min(Math.max(options.limit || 10, 1), 100);
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.findMany({
      skip,
      take: limit,
      ...args,
    }),

    model.count({
      where: (args as { where?: CountWhere<TDelegate> }).where,
    }),
  ]);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
