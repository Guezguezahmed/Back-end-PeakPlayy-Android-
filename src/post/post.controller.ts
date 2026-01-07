// src/post/post.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    Patch,
    UseGuards,
    Req,
    Query,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto, AddCommentDto } from './dto/create-post.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guards';
import { Roles } from 'src/auth/decorators/role.decorators';
import {
    ApiTags,
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiParam,
    ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Posts')
@ApiBearerAuth('access-token')
@Controller('posts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PostController {
    constructor(private readonly postService: PostService) { }

    @Post()
    @Roles('OWNER', 'JOUEUR', 'COACH', 'ARBITRE')
    @ApiOperation({ summary: 'Create a new post' })
    @ApiResponse({ status: 201, description: 'Post created successfully' })
    create(@Body() createPostDto: CreatePostDto, @Req() req: any) {
        return this.postService.create(createPostDto, req.user.userId);
    }

    @Get('feed')
    @Roles('OWNER', 'JOUEUR', 'COACH', 'ARBITRE')
    @ApiOperation({ summary: 'Get social feed' })
    @ApiQuery({ name: 'page', required: false, example: 1 })
    @ApiQuery({ name: 'limit', required: false, example: 20 })
    @ApiResponse({ status: 200, description: 'Feed retrieved successfully' })
    getFeed(
        @Query('page') page?: string,
        @Query('limit') limit?: string,
    ) {
        const pageNum = page ? parseInt(page, 10) : 1;
        const limitNum = limit ? parseInt(limit, 10) : 20;
        return this.postService.getFeed(pageNum, limitNum);
    }

    @Get(':id')
    @Roles('OWNER', 'JOUEUR', 'COACH', 'ARBITRE')
    @ApiOperation({ summary: 'Get a single post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
    findOne(@Param('id') id: string) {
        return this.postService.findOne(id);
    }

    @Delete(':id')
    @Roles('OWNER', 'JOUEUR', 'COACH', 'ARBITRE')
    @ApiOperation({ summary: 'Delete a post (only author)' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Post deleted successfully' })
    remove(@Param('id') id: string, @Req() req: any) {
        return this.postService.remove(id, req.user.userId);
    }

    @Patch(':id/like')
    @Roles('OWNER', 'JOUEUR', 'COACH', 'ARBITRE')
    @ApiOperation({ summary: 'Toggle like on a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({ status: 200, description: 'Like toggled successfully' })
    toggleLike(@Param('id') id: string, @Req() req: any) {
        return this.postService.toggleLike(id, req.user.userId);
    }

    @Post(':id/comment')
    @Roles('OWNER', 'JOUEUR', 'COACH', 'ARBITRE')
    @ApiOperation({ summary: 'Add a comment to a post' })
    @ApiParam({ name: 'id', description: 'Post ID' })
    @ApiResponse({ status: 201, description: 'Comment added successfully' })
    addComment(
        @Param('id') id: string,
        @Body() addCommentDto: AddCommentDto,
        @Req() req: any,
    ) {
        return this.postService.addComment(id, addCommentDto, req.user.userId);
    }
}
