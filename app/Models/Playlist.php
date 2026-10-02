<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Playlist extends Model
{
    protected $table = 'playlists';

    protected $fillable = [
        'slug',
        'name',
        'description',
        'emoji',
        'gradient',
        'custom_cover',
        'creator_name',
        'status',
        'client_token',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Songs belonging to this playlist.
     *
     * @return BelongsToMany<Music, $this>
     */
    public function songs(): BelongsToMany
    {
        return $this->belongsToMany(Music::class, 'playlist_music', 'playlist_id', 'music_id')
            ->withPivot('order_position', 'added_at')
            ->orderByPivot('order_position', 'asc');
    }
}
