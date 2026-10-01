<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Music extends Model
{
    use HasFactory;

    protected $table = 'music';

    protected $fillable = [
        'slug',
        'title',
        'artist',
        'album',
        'genre',
        'description',
        'cover_image',
        'audio_file',
        'youtube_url',
        'duration',
        'file_size',
        'play_count',
        'uploader_name',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'play_count' => 'integer',
        'file_size' => 'integer',
    ];

    /**
     * Get resolved cover image URL
     */
    public function getImgAttribute(): string
    {
        $val = $this->cover_image;
        if (! $val) {
            return asset('assets/covers/believer.jpg');
        }
        if (str_starts_with($val, 'http://') || str_starts_with($val, 'https://') || str_starts_with($val, 'data:')) {
            return $val;
        }

        return asset('assets/covers/'.ltrim($val, '/'));
    }

    /**
     * Get resolved audio source URL
     */
    public function getSrcAttribute(): string
    {
        $val = $this->audio_file;
        if (! $val) {
            return '';
        }
        if (str_starts_with($val, 'http://') || str_starts_with($val, 'https://')) {
            return $val;
        }

        return asset('assets/music/'.ltrim($val, '/'));
    }
}
