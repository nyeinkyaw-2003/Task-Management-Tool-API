import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import CreateProjectDto from './dto/create-project.dto';
import GetProjectListDto from './dto/get-project-list.dto';
import UpdateProjectDto from './dto/update-project.dto';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  const prisma = {
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  let service: ProjectService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ProjectService(prisma as any);
  });

  it('create returns a project with owner summary', async () => {
    const dto: CreateProjectDto = {
      name: 'CRM Rewrite',
      goal: 'Improve support workflow',
      ownerId: 1,
    };
    const project = {
      id: 1,
      name: 'CRM Rewrite',
      goal: 'Improve support workflow',
      ownerId: 1,
      owner: { id: 1, name: 'Alice', email: 'alice@example.com' },
    };

    prisma.project.create.mockResolvedValue(project);

    await expect(service.create(dto)).resolves.toEqual(project);
    expect(prisma.project.create).toHaveBeenCalledWith({
      data: dto,
      select: expect.objectContaining({
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      }),
    });
  });

  it('create maps invalid ownerId to BadRequestException', async () => {
    const dto: CreateProjectDto = {
      name: 'CRM Rewrite',
      goal: 'Improve support workflow',
      ownerId: 999,
    };
    const prismaError = Object.assign(
      Object.create(Prisma.PrismaClientKnownRequestError.prototype),
      { code: 'P2003' },
    );

    prisma.project.create.mockRejectedValue(prismaError);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toMatchObject({
      response: {
        message: 'Owner not found',
        error: 'OWNER_NOT_FOUND',
      },
    });
  });

  it('findAll returns paginated projects with owner summary', async () => {
    const query: GetProjectListDto = {
      page: 1,
      limit: 10,
      orderBy: 'desc',
      search: '  crm  ',
    };
    const projects = [
      {
        id: 1,
        name: 'CRM Rewrite',
        goal: 'Improve support workflow',
        ownerId: 1,
        owner: { id: 1, name: 'Alice', email: 'alice@example.com' },
      },
    ];

    prisma.project.findMany.mockResolvedValue(projects);
    prisma.project.count.mockResolvedValue(1);

    const result = await service.findAll(query);

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 0,
        take: 10,
        orderBy: { id: 'desc' },
        where: {
          OR: [
            {
              name: {
                contains: 'crm',
                mode: 'insensitive',
              },
            },
            {
              goal: {
                contains: 'crm',
                mode: 'insensitive',
              },
            },
          ],
        },
      }),
    );
    expect(result).toEqual({
      data: projects,
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
    expect(result.data[0].owner).not.toHaveProperty('password');
  });

  it('findOne throws when project does not exist', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(service.findOne(33)).rejects.toThrow(
      new NotFoundException('Project not found with id 33'),
    );
  });

  it('update returns the updated project', async () => {
    const dto: UpdateProjectDto = { goal: 'New goal' };
    const project = {
      id: 1,
      name: 'CRM Rewrite',
      goal: 'New goal',
      ownerId: 1,
      owner: { id: 1, name: 'Alice', email: 'alice@example.com' },
    };

    prisma.project.findUnique.mockResolvedValue({ id: 1 });
    prisma.project.update.mockResolvedValue(project);

    await expect(service.update(1, dto)).resolves.toEqual(project);
    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
      select: expect.any(Object),
    });
  });

  it('update throws when project does not exist', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(service.update(50, { name: 'Missing' })).rejects.toThrow(
      new NotFoundException('Project not found with id 50'),
    );
  });

  it('delete throws when project does not exist', async () => {
    prisma.project.findUnique.mockResolvedValue(null);

    await expect(service.delete(7)).rejects.toThrow(
      new NotFoundException('Project not found with id 7'),
    );
  });
});
