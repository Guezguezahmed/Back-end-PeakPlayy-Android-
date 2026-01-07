import {
    Controller,
    Post,
    UploadedFile,
    UploadedFiles,
    UseInterceptors,
    BadRequestException,
    Req,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../users/users.service';

@ApiTags('Upload')
@ApiBearerAuth('access-token')
@Controller('upload')
export class UploadController {
    constructor(
        private readonly uploadService: UploadService,
        private readonly usersService: UsersService,
    ) { }

    // ============================================
    // Upload User Avatar
    // ============================================
    @Post('avatar')
    @ApiOperation({ summary: 'Upload user avatar (profile picture)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Only image files are allowed');
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('File size must be less than 5MB');
        }

        const userId = req.user?.userId || 'anonymous';
        const filename = `${userId}-${Date.now()}.${file.originalname.split('.').pop()}`;

        const url = await this.uploadService.uploadImage(
            file.buffer,
            'avatars',
            filename,
        );

        // Update user's avatar in database only if user is authenticated
        if (userId !== 'anonymous') {
            try {
                await this.usersService.update(userId, { avatar: url });
            } catch (error) {
                // Log error but still return success since file was uploaded
                console.error('Failed to update user avatar in database:', error);
            }
        }

        return {
            url,
            filename,
            message: 'Avatar uploaded successfully',
        };
    }

    // ============================================
    // Upload Single Post Image
    // ============================================
    @Post('post-image')
    @ApiOperation({ summary: 'Upload single post image' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadPostImage(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        // Validate file type
        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Only image files are allowed');
        }

        // Validate file size (10MB max for post images)
        if (file.size > 10 * 1024 * 1024) {
            throw new BadRequestException('File size must be less than 10MB');
        }

        const userId = req.user?.userId || 'anonymous';
        const filename = `${userId}-post-${Date.now()}.${file.originalname.split('.').pop()}`;

        const url = await this.uploadService.uploadImage(
            file.buffer,
            'posts',
            filename,
        );

        return {
            url,
            filename,
            message: 'Image uploaded successfully',
        };
    }

    // ============================================
    // Upload Post Images (Multiple - Max 4)
    // ============================================
    @Post('post-images')
    @ApiOperation({ summary: 'Upload post images (max 4)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                files: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
        },
    })
    @UseInterceptors(FilesInterceptor('files', 4)) // Max 4 images
    async uploadPostImages(
        @UploadedFiles() files: Express.Multer.File[],
        @Req() req: any,
    ) {
        if (!files || files.length === 0) {
            throw new BadRequestException('No files provided');
        }

        if (files.length > 4) {
            throw new BadRequestException('Maximum 4 images allowed per post');
        }

        // Validate all files
        for (const file of files) {
            if (!file.mimetype.startsWith('image/')) {
                throw new BadRequestException('Only image files are allowed');
            }
            if (file.size > 10 * 1024 * 1024) {
                throw new BadRequestException('Each file must be less than 10MB');
            }
        }

        const userId = req.user?.userId || 'anonymous';
        const urls: string[] = [];

        // Upload all files
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filename = `${userId}-post-${Date.now()}-${i}.${file.originalname.split('.').pop()}`;

            const url = await this.uploadService.uploadImage(
                file.buffer,
                'posts',
                filename,
            );

            urls.push(url);
        }

        return {
            urls,
            count: urls.length,
            message: 'Images uploaded successfully',
        };
    }

    // ============================================
    // Upload Team Logo
    // ============================================
    @Post('team-logo')
    @ApiOperation({ summary: 'Upload team logo' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadTeamLogo(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
        if (!file) {
            throw new BadRequestException('No file provided');
        }

        if (!file.mimetype.startsWith('image/')) {
            throw new BadRequestException('Only image files are allowed');
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('File size must be less than 5MB');
        }

        const teamId = req.body.teamId || Date.now();
        const filename = `team-${teamId}-${Date.now()}.${file.originalname.split('.').pop()}`;

        const url = await this.uploadService.uploadImage(
            file.buffer,
            'teams',
            filename,
        );

        return {
            url,
            filename,
            message: 'Team logo uploaded successfully',
        };
    }
}
