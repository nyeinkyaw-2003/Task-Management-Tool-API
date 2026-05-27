import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { ApiResponse } from '../../common/response/api-response';
import CreateProjectDto from './dto/create-project.dto';
import GetProjectListDto from './dto/get-project-list.dto';
import UpdateProjectDto from './dto/update-project.dto';
import { ProjectService } from './project.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(
    @Body(new ValidationPipe({ transform: true })) dto: CreateProjectDto,
  ) {
    const project = await this.projectService.create(dto);
    return ApiResponse.success(project, 'Project created successfully');
  }

  @Get()
  async getAllProjects(@Query() query: GetProjectListDto) {
    const result = await this.projectService.findAll(query);
    return ApiResponse.success(
      result.data,
      'Projects fetched successfully',
      result.meta,
    );
  }

  @Get(':id')
  async getProjectById(@Param('id', ParseIntPipe) id: number) {
    const project = await this.projectService.findOne(id);
    return ApiResponse.success(project, 'Project fetched successfully');
  }

  @Patch(':id')
  async updateProject(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ValidationPipe({ transform: true })) dto: UpdateProjectDto,
  ) {
    const updatedProject = await this.projectService.update(id, dto);
    return ApiResponse.success(updatedProject, 'Project updated successfully');
  }

  @Delete(':id')
  async deleteProject(@Param('id', ParseIntPipe) id: number) {
    const deletedProject = await this.projectService.delete(id);
    return ApiResponse.success(deletedProject, 'Project deleted successfully');
  }
}
