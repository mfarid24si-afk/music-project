<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        if (! Schema::hasTable('music')) {
            Schema::create('music', function (Blueprint $table) {
                $table->id();
                $table->string('slug')->unique();
                $table->string('title');
                $table->string('artist');
                $table->string('album')->nullable();
                $table->string('genre', 100)->nullable();
                $table->text('description')->nullable();
                $table->string('cover_image')->nullable();
                $table->string('audio_file');
                $table->string('youtube_url', 500)->nullable();
                $table->string('duration', 20)->nullable();
                $table->unsignedBigInteger('file_size')->default(0);
                $table->unsignedInteger('play_count')->default(0);
                $table->string('uploader_name', 100)->default('Admin');
                $table->boolean('is_active')->default(true);
                $table->timestamps();

                $table->index(['is_active', 'created_at'], 'idx_active_created');
                $table->index(['is_active', 'genre'], 'idx_genre');
                $table->index(['is_active', 'play_count'], 'idx_active_play_count');
                $table->index(['title', 'artist'], 'idx_search');
                $table->index('uploader_name', 'idx_uploader');
            });
        } else {
            Schema::table('music', function (Blueprint $table) {
                if (! Schema::hasColumn('music', 'uploader_name')) {
                    $table->string('uploader_name', 100)->default('Admin')->after('play_count');
                    $table->index('uploader_name', 'idx_uploader');
                }
            });
        }

        if (! Schema::hasTable('playlists')) {
            Schema::create('playlists', function (Blueprint $table) {
                $table->id();
                $table->string('slug')->unique();
                $table->string('name');
                $table->text('description')->nullable();
                $table->string('emoji', 20)->default('🎧');
                $table->string('gradient', 50)->default('default');
                $table->longText('custom_cover')->nullable();
                $table->string('creator_name', 100)->default('Admin');
                $table->string('status', 20)->default('pending');
                $table->string('client_token', 100)->nullable();
                $table->boolean('is_public')->default(false);
                $table->timestamps();

                $table->index(['is_public', 'created_at'], 'idx_public_created');
                $table->index(['status', 'is_public'], 'idx_status_public');
                $table->index('creator_name', 'idx_creator');
                $table->index('client_token', 'idx_client_token');
            });
        } else {
            Schema::table('playlists', function (Blueprint $table) {
                if (! Schema::hasColumn('playlists', 'status')) {
                    $table->string('status', 20)->default('pending')->after('creator_name');
                    $table->index(['status', 'is_public'], 'idx_status_public');
                }
                if (! Schema::hasColumn('playlists', 'client_token')) {
                    $table->string('client_token', 100)->nullable()->after('status');
                    $table->index('client_token', 'idx_client_token');
                }
            });
        }

        if (! Schema::hasTable('playlist_music')) {
            Schema::create('playlist_music', function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('playlist_id');
                $table->unsignedBigInteger('music_id');
                $table->unsignedInteger('order_position')->default(0);
                $table->timestamp('added_at')->useCurrent();

                $table->unique(['playlist_id', 'music_id'], 'uniq_pl_music');
                $table->index('playlist_id', 'idx_pl_id');
                $table->index('music_id', 'idx_ms_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('playlist_music');
        Schema::dropIfExists('playlists');
    }
};
