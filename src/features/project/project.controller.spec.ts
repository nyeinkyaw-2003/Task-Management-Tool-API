import { ProjectController } from './project.controller';

describe('ProjectController', () => {
  const projectService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  let controller: ProjectController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new ProjectController(projectService as any);
  });

  it('wraps list responses with ApiResponse.success', async () => {
    projectService.findAll.mockResolvedValue({
      data: [{ id: 1, name: 'CRM Rewrite', ownerId: 1 }],
      meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    });

    await expect(controller.getAllProjects({ page: 1, limit: 10, orderBy: 'asc' } as any))
      .resolves.toEqual({
        success: true,
        message: 'Projects fetched successfully',
        data: [{ id: 1, name: 'CRM Rewrite', ownerId: 1 }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      });
  });

  it('wraps single-project responses with ApiResponse.success', async () => {
    projectService.findOne.mockResolvedValue({ id: 1, name: 'CRM Rewrite', ownerId: 1 });

    await expect(controller.getProjectById(1)).resolves.toEqual({
      success: true,
      message: 'Project fetched successfully',
      data: { id: 1, name: 'CRM Rewrite', ownerId: 1 },
    });
  });

  it('wraps create responses with ApiResponse.success', async () => {
    projectService.create.mockResolvedValue({ id: 1, name: 'CRM Rewrite', ownerId: 1 });

    await expect(
      controller.createProject({
        name: 'CRM Rewrite',
        ownerId: 1,
      } as any),
    ).resolves.toEqual({
      success: true,
      message: 'Project created successfully',
      data: { id: 1, name: 'CRM Rewrite', ownerId: 1 },
    });
  });

  it('wraps update responses with ApiResponse.success', async () => {
    projectService.update.mockResolvedValue({ id: 1, name: 'CRM Rewrite', ownerId: 1 });

    await expect(controller.updateProject(1, { goal: 'New goal' } as any)).resolves.toEqual({
      success: true,
      message: 'Project updated successfully',
      data: { id: 1, name: 'CRM Rewrite', ownerId: 1 },
    });
  });

  it('wraps delete responses with ApiResponse.success', async () => {
    projectService.delete.mockResolvedValue({ id: 1, name: 'CRM Rewrite', ownerId: 1 });

    await expect(controller.deleteProject(1)).resolves.toEqual({
      success: true,
      message: 'Project deleted successfully',
      data: { id: 1, name: 'CRM Rewrite', ownerId: 1 },
    });
  });
});
