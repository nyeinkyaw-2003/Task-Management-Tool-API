import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import GetUserListDto from './dto/get-user-list.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { paginate } from '@/common/helpers/pagination-helper';
import GetProjectListDto from '../project/dto/get-project-list.dto';
import { buildProjectWhere } from '../project/project.query';
import { projectPublicSelect } from '../project/project.select';
import { buildUserWhere } from './user.query';

const userPublicSelect = {
    id: true,
    name: true,
    email: true,
    createdAt: true,
    updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) {}
    
    findAll(query: GetUserListDto) {
        const { page, limit, search, startDate, endDate, orderBy } = query;
        const where = buildUserWhere(search, startDate, endDate);

        return paginate(
            this.prisma.user,
            {
                where,
                orderBy: {
                    createdAt: orderBy,
                },
                select: userPublicSelect,
            },
            {
                page,
                limit
            }
        );
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: userPublicSelect,
        });

        if (!user) {
            throw new NotFoundException(`User not found with id ${id}`);
        }

        return user;
    }

    async findByEmail(email: string, select?: Prisma.UserSelect) {
        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                ...userPublicSelect,
                ...select,
            }
        });

        return user;
    }

    async findProjects(id: number, query: GetProjectListDto) {
        await this.ensureUserExists(id);
        const { page, limit, orderBy, search } = query;
        const where = buildProjectWhere(search, id);

        return paginate(
            this.prisma.project,
            {
                where,
                orderBy: {
                    id: orderBy,
                },
                select: projectPublicSelect,
            },
            {
                page,
                limit,
            },
        );
    }

    async create(user: CreateUserDto) {
        try {
            return await this.prisma.user.create({
                data: user,
                select: userPublicSelect,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    }

    async update(id: number, user: UpdateUserDto) {
        await this.ensureUserExists(id);

        try {
            return await this.prisma.user.update({
                where: { id },
                data: user,
                select: userPublicSelect,
            });
        } catch (error) {
            this.handlePrismaError(error);
        }
    };

    async delete(id: number) {
        await this.ensureUserExists(id);

        return this.prisma.user.delete({
            where: { id },
            select: userPublicSelect,
        });
    }

    private async ensureUserExists(id: number) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!existingUser) {
            throw new NotFoundException(`User not found with id ${id}`);
        }
    }

    private handlePrismaError(error: unknown): never {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
        ) {
            throw new BadRequestException({
                message: 'Email already exists',
                error: 'EMAIL_ALREADY_EXISTS',
            });
        }

        throw error;
    }
}
