import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import CreateUserDto from './dto/create-user.dto';
import UpdateUserDto from './dto/update-user.dto';
import GetUserListDto from './dto/get-user-list.dto';
import { ApiResponse } from '../../common/response/api-response';
import GetProjectListDto from '../project/dto/get-project-list.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    async getAllUsers(@Query() query: GetUserListDto) {
        const result = await this.userService.findAll(query);
        return ApiResponse.success(result.data, "Users fetched successfully", result.meta);
    }

    @Get(':id')
    async getUserById(@Param('id', ParseIntPipe) id: number) {
        const user = await this.userService.findOne(id);
        return ApiResponse.success(user, "User fetched successfully");
    }

    @Get(':id/projects')
    async getUserProjects(
        @Param('id', ParseIntPipe) id: number,
        @Query() query: GetProjectListDto,
    ) {
        const result = await this.userService.findProjects(id, query);
        return ApiResponse.success(
            result.data,
            "User projects fetched successfully",
            result.meta,
        );
    }

    @Post()
    async createUser(@Body(new ValidationPipe({transform: true})) dto: CreateUserDto) {
        const user = await this.userService.create(dto);
        return ApiResponse.success(user, "User created successfully");
    }

    @Patch(':id')
    async updateUser(@Param('id', ParseIntPipe) id: number, @Body(new ValidationPipe({transform: true})) user: UpdateUserDto) {
        const updatedUser = await this.userService.update(id, user);
        return ApiResponse.success(updatedUser, "User updated successfully");
    }

    @Delete(':id')
    async deleteUser(@Param('id', ParseIntPipe) id: number) {
        const deletedUser = await this.userService.delete(id);
        return ApiResponse.success(deletedUser, "User deleted successfully");
    }
} 
