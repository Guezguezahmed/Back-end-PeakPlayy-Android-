import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
    private supabase: SupabaseClient;

    constructor() {
        // ============================================
        // 🔑 PASTE YOUR SUPABASE CREDENTIALS HERE
        // ============================================
        const supabaseUrl = 'https://peblgzzpuddqrlrsjvci.supabase.co'; // REPLACE WITH YOUR PROJECT URL
        const supabaseKey = 'sb_publishable_E5JHjvcpP5irtSiak1UoMw_EJ3X21_h'; // REPLACE WITH YOUR ANON PUBLIC KEY

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    /**
     * Upload image to Supabase Storage
     * @param file - Buffer of the image file
     * @param bucket - Bucket name ('avatars', 'posts', 'teams')
     * @param filename - Filename to save as
     * @returns Public URL of uploaded image
     */
    async uploadImage(
        file: Buffer,
        bucket: string,
        filename: string,
    ): Promise<string> {
        const { data, error } = await this.supabase.storage
            .from(bucket)
            .upload(filename, file, {
                contentType: 'image/*',
                upsert: true, // Replace if exists
            });

        if (error) {
            throw new Error(`Upload failed: ${error.message}`);
        }

        // Get public URL
        const { data: urlData } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(filename);

        return urlData.publicUrl;
    }

    /**
     * Delete image from Supabase Storage
     */
    async deleteImage(bucket: string, path: string): Promise<void> {
        const { error } = await this.supabase.storage
            .from(bucket)
            .remove([path]);

        if (error) {
            throw new Error(`Delete failed: ${error.message}`);
        }
    }

    /**
     * Get public URL for an existing image
     */
    getPublicUrl(bucket: string, path: string): string {
        const { data } = this.supabase.storage
            .from(bucket)
            .getPublicUrl(path);

        return data.publicUrl;
    }
}
