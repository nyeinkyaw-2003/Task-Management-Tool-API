import { UserController } from './user.controller';

describe('UserController', () => {
  const userService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findProjects: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let controller: UserController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UserController(userService as any);
  });

  it('wraps list responses with ApiResponse.success', async () => {
    userService.findAll.mockResolvedValue({
      data: [{ id: 1, name: 'Alice', email: 'alice@example.com' }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    await expect(controller.getAllUsers({ page: 1, limit: 10, orderBy: 'asc' } as any))
      .resolves.toEqual({
        success: true,
        message: 'Users fetched successfully',
        data: [{ id: 1, name: 'Alice', email: 'alice@example.com' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
  });

  it('wraps single-user responses with ApiResponse.success', async () => {
    userService.findOne.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@example.com' });

    await expect(controller.getUserById(1)).resolves.toEqual({
      success: true,
      message: 'User fetched successfully',
      data: { id: 1, name: 'Alice', email: 'alice@example.com' },
    });
  });

  it('wraps create responses with ApiResponse.success', async () => {
    userService.create.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@example.com' });

    await expect(
      controller.createUser({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'secret',
      } as any),
    ).resolves.toEqual({
      success: true,
      message: 'User created successfully',
      data: { id: 1, name: 'Alice', email: 'alice@example.com' },
    });
  });

  it('wraps user project responses with ApiResponse.success', async () => {
    userService.findProjects.mockResolvedValue({
      data: [{ id: 10, name: 'CRM Rewrite', ownerId: 1 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    await expect(
      controller.getUserProjects(1, { page: 1, limit: 10, orderBy: 'asc' } as any),
    ).resolves.toEqual({
      success: true,
      message: 'User projects fetched successfully',
      data: [{ id: 10, name: 'CRM Rewrite', ownerId: 1 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });
  });

  it('wraps update responses with ApiResponse.success', async () => {
    userService.update.mockResolvedValue({ id: 1, name: 'Updated Alice', email: 'alice@example.com' });

    await expect(controller.updateUser(1, { name: 'Updated Alice' } as any)).resolves.toEqual({
      success: true,
      message: 'User updated successfully',
      data: { id: 1, name: 'Updated Alice', email: 'alice@example.com' },
    });
  });

  it('wraps delete responses with ApiResponse.success', async () => {
    userService.delete.mockResolvedValue({ id: 1, name: 'Alice', email: 'alice@example.com' });

    await expect(controller.deleteUser(1)).resolves.toEqual({
      success: true,
      message: 'User deleted successfully',
      data: { id: 1, name: 'Alice', email: 'alice@example.com' },
    });
  });
});
