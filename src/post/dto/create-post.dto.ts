// src/post/dto/create-post.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreatePostDto {
    @ApiProperty({ description: 'Post content', example: 'Amazing victory today! Our U-17 team dominated with a 4-1 win.' })
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty({ description: 'Image URLs', example: [], required: false })
    @IsArray()
    @IsOptional()
    images?: string[];
}

export class AddCommentDto {
    @ApiProperty({ description: 'Comment content', example: 'Great job team!' })
    @IsString()
    @IsNotEmpty()
    content: string;
}
