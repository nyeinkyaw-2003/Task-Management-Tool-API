import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import CreateUserDto from './dto/create-user.dto';
import GetUserListDto from './dto/get-user-list.dto';
import UpdateUserDto from './dto/update-user.dto';
import { UserService } from './user.service';

describe('UserService', () => {
  const prisma = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService(prisma as any);
  });

  it('findAll returns paginated public users without password', async () => {
    const query: GetUserListDto = {
      page: 2,
      limit: 5,
      orderBy: 'desc',
      search: '  alice@example.com  ',
      startDate: new Date('2024-01-01T12:00:00.000Z'),
      endDate: new Date('2024-01-05T12:00:00.000Z'),
    };
    const users = [
      {
        id: 1,
        name: 'Alice',
        email: 'alice@example.com',
        createdAt: new Date('2024-01-02T00:00:00.000Z'),
        updatedAt: new Date('2024-01-02T00:00:00.000Z'),
      },
    ];

    prisma.user.findMany.mockResolvedValue(users);
    prisma.user.count.mockResolvedValue(6);

    const result = await service.findAll(query);
    const expectedStartDate = new Date(query.startDate!);
    expectedStartDate.setHours(0, 0, 0, 0);
    const expectedEndDate = new Date(query.endDate!);
    expectedEndDate.setHours(23, 59, 59, 999);

    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: expect.objectContaining({
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        }),
        where: expect.objectContaining({
          OR: [
            {
              name: {
                contains: 'alice@example.com',
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: 'alice@example.com',
                mode: 'insensitive',
              },
            },
          ],
          createdAt: {
            gte: expectedStartDate,
            lte: expectedEndDate,
          },
        }),
      }),
    );
    expect(prisma.user.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.any(Object),
      }),
    );
    expect(result).toEqual({
      data: users,
      meta: {
        page: 2,
        limit: 5,
        total: 6,
        totalPages: 2,
      },
    });
    expect(result.data[0]).not.toHaveProperty('password');
  });

  it('findOne throws when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne(99)).rejects.toThrow(
      new NotFoundException('User not found with id 99'),
    );
  });

  it('findProjects throws when user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(
      service.findProjects(4, { page: 1, limit: 10, orderBy: 'asc' } as any),
    ).rejects.toThrow(new NotFoundException('User not found with id 4'));
  });

  it('findProjects returns only that user’s paginated projects', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.project.findMany.mockResolvedValue([
      {
        id: 10,
        name: 'CRM Rewrite',
        goal: 'Improve support workflow',
        ownerId: 1,
        owner: { id: 1, name: 'Alice', email: 'alice@example.com' },
      },
    ]);
    prisma.project.count.mockResolvedValue(1);

    const result = await service.findProjects(1, {
      page: 1,
      limit: 10,
      orderBy: 'desc',
      search: 'crm',
    } as any);

    expect(prisma.project.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          ownerId: 1,
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
        orderBy: { id: 'desc' },
      }),
    );
    expect(result).toEqual({
      data: [
        {
          id: 10,
          name: 'CRM Rewrite',
          goal: 'Improve support workflow',
          ownerId: 1,
          owner: { id: 1, name: 'Alice', email: 'alice@example.com' },
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });
  });

  it('create maps duplicate email errors to BadRequestException', async () => {
    const dto: CreateUserDto = {
      name: 'Alice',
      email: 'alice@example.com',
      password: 'secret',
    };
    const prismaError = Object.assign(
      Object.create(Prisma.PrismaClientKnownRequestError.prototype),
      { code: 'P2002' },
    );

    prisma.user.create.mockRejectedValue(prismaError);

    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    await expect(service.create(dto)).rejects.toMatchObject({
      response: {
        message: 'Email already exists',
        error: 'EMAIL_ALREADY_EXISTS',
      },
    });
  });

  it('update returns the updated public user', async () => {
    const dto: UpdateUserDto = { name: 'Updated Alice' };
    const updatedUser = {
      id: 1,
      name: 'Updated Alice',
      email: 'alice@example.com',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-02T00:00:00.000Z'),
    };

    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.user.update.mockResolvedValue(updatedUser);

    await expect(service.update(1, dto)).resolves.toEqual(updatedUser);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
      select: expect.any(Object),
    });
  });

  it('update throws when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.update(50, { name: 'Missing' })).rejects.toThrow(
      new NotFoundException('User not found with id 50'),
    );
  });

  it('delete throws when the user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.delete(7)).rejects.toThrow(
      new NotFoundException('User not found with id 7'),
    );
  });
});
