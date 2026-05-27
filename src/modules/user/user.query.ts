import { buildDateRange } from "@/common/helpers/date-helper";
import { normalizeSearch } from "@/common/helpers/query-helper";
import { Prisma } from "@prisma/client";

export const buildUserWhere = (
    search?: string,
    startDate?: Date,
    endDate?: Date
): Prisma.UserWhereInput => {
    const safeSearchTerm = normalizeSearch(search);
    const where: Prisma.UserWhereInput = {};

    if (safeSearchTerm) {
        where.OR = [
            {
                name: {
                    contains: safeSearchTerm,
                    mode: 'insensitive',
                },
            },
            {
                email: {
                    contains: safeSearchTerm,
                    mode: 'insensitive',
                },
            },
        ];
    }

    const createdAt = buildDateRange(startDate, endDate);
    if (createdAt) {
        where.createdAt = createdAt;
    }

    return where;
}