import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { paginate } from '../../common/helpers/pagination-helper';
import { PrismaService } from '../../prisma/prisma.service';
import CreateProjectDto from './dto/create-project.dto';
import GetProjectListDto from './dto/get-project-list.dto';
import UpdateProjectDto from './dto/update-project.dto';
import { buildProjectWhere } from './project.query';
import { projectPublicSelect } from './project.select';

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query: GetProjectListDto) {
    const { page, limit, orderBy, search } = query;
    const where = buildProjectWhere(search);

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

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      select: projectPublicSelect,
    });

    if (!project) {
      throw new NotFoundException(`Project not found with id ${id}`);
    }

    return project;
  }

  async create(project: CreateProjectDto) {
    try {
      return await this.prisma.project.create({
        data: project,
        select: projectPublicSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: number, project: UpdateProjectDto) {
    await this.ensureProjectExists(id);

    try {
      return await this.prisma.project.update({
        where: { id },
        data: project,
        select: projectPublicSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(id: number) {
    await this.ensureProjectExists(id);

    return this.prisma.project.delete({
      where: { id },
      select: projectPublicSelect,
    });
  }

  private async ensureProjectExists(id: number) {
    const existingProject = await this.prisma.project.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existingProject) {
      throw new NotFoundException(`Project not found with id ${id}`);
    }
  }

  private handlePrismaError(error: unknown): never {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException({
        message: 'Owner not found',
        error: 'OWNER_NOT_FOUND',
      });
    }

    throw error;
  }
}
