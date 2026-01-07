// src/post/post.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Post, PostDocument } from 'src/schemas/post.schema';
import { CreatePostDto, AddCommentDto } from './dto/create-post.dto';

@Injectable()
export class PostService {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
    ) { }

    // Create a new post
    async create(createPostDto: CreatePostDto, userId: string): Promise<Post> {
        const newPost = new this.postModel({
            ...createPostDto,
            author: userId,
        });
        await newPost.save();

        // Populate author before returning
        const populatedPost = await this.postModel
            .findById(newPost._id)
            .populate('author', 'nom prenom picture role rating')
            .exec();

        if (!populatedPost) {
            throw new NotFoundException('Post not found after creation');
        }

        return populatedPost;
    }

    // Get feed (paginated, sorted by newest)
    async getFeed(page: number = 1, limit: number = 20): Promise<Post[]> {
        const skip = (page - 1) * limit;
        return this.postModel
            .find()
            .populate('author', 'nom prenom picture role rating')
            .populate('comments.author', 'nom prenom picture')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec();
    }

    // Get single post
    async findOne(id: string): Promise<Post> {
        const post = await this.postModel
            .findById(id)
            .populate('author', 'nom prenom picture role rating')
            .populate('comments.author', 'nom prenom picture')
            .exec();

        if (!post) {
            throw new NotFoundException('Post not found');
        }
        return post;
    }

    // Delete post (only author)
    async remove(id: string, userId: string): Promise<void> {
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }
        if (post.author.toString() !== userId) {
            throw new ForbiddenException('You can only delete your own posts');
        }
        await this.postModel.findByIdAndDelete(id).exec();
    }

    // Toggle like
    async toggleLike(id: string, userId: string): Promise<Post> {
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        const likeIndex = post.likes.findIndex(
            (like) => like.toString() === userId,
        );

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
        } else {
            // Like
            post.likes.push(userId as any);
        }

        await post.save();

        // Populate author before returning for UI updates
        const updatedPost = await this.postModel
            .findById(id)
            .populate('author', 'nom prenom picture role rating')
            .populate('comments.author', 'nom prenom picture')
            .exec();

        if (!updatedPost) {
            throw new NotFoundException('Post not found after update');
        }

        return updatedPost;
    }

    // Add comment
    async addComment(id: string, addCommentDto: AddCommentDto, userId: string): Promise<Post> {
        const post = await this.postModel.findById(id).exec();
        if (!post) {
            throw new NotFoundException('Post not found');
        }

        post.comments.push({
            author: userId as any,
            content: addCommentDto.content,
            createdAt: new Date(),
        });

        return (await post.save()).populate('comments.author', 'nom prenom picture');
    }
}
