// src/schemas/post.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type PostDocument = Post & Document;

@Schema({ _id: false })
export class Comment {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    author: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    content: string;

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

@Schema({ timestamps: true })
export class Post {
    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    author: MongooseSchema.Types.ObjectId;

    @Prop({ required: true })
    content: string;

    @Prop({ type: [String], default: [] })
    images: string[];

    @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'User' }], default: [] })
    likes: MongooseSchema.Types.ObjectId[];

    @Prop({ type: [CommentSchema], default: [] })
    comments: Comment[];

    @Prop()
    createdAt?: Date;

    @Prop()
    updatedAt?: Date;
}

export const PostSchema = SchemaFactory.createForClass(Post);
