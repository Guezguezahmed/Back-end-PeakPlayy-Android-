import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Uploads')
@ApiBearerAuth('access-token')
@Controller('uploads')
export class UploadsController {

    @Post('team-logo')
    @ApiOperation({ summary: 'Upload team logo image' })
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
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads/team-logos',
                filename: (req, file, callback) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    callback(null, `${uniqueSuffix}${ext}`);
                },
            }),
            fileFilter: (req, file, callback) => {
                if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
                    return callback(
                        new BadRequestException('Only image files are allowed!'),
                        false,
                    );
                }
                callback(null, true);
            },
            limits: {
                fileSize: 5 * 1024 * 1024, // 5MB max
            },
        }),
    )
    uploadTeamLogo(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Return the URL where the file can be accessed
        // Use 10.0.2.2 for Android emulator (maps to host's localhost)
        const baseUrl = process.env.ANDROID_BACKEND_URL || 'http://10.0.2.2:3001';
        const fileUrl = `${baseUrl}/uploads/team-logos/${file.filename}`;

        return {
            url: fileUrl,
            filename: file.filename,
            originalname: file.originalname,
            size: file.size,
            mimetype: file.mimetype,
        };
    }
}
