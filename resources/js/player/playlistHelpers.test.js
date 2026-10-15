import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
    DEFAULT_PLAYLIST_ICON,
    PLAYLIST_ICON_OPTIONS,
    getPlaylistIconDefinition,
    resolvePlaylistIconId,
} from './playlistHelpers.js';

void test('resolvePlaylistIconId passes through known icon ids', () => {
    assert.equal(resolvePlaylistIconId('headphones'), 'headphones');
    assert.equal(resolvePlaylistIconId('guitar'), 'guitar');
    assert.equal(resolvePlaylistIconId('orbit'), 'orbit');
});

void test('resolvePlaylistIconId maps legacy emoji to icon ids', () => {
    assert.equal(resolvePlaylistIconId('🎧'), 'headphones');
    assert.equal(resolvePlaylistIconId('🚀'), 'rocket');
    assert.equal(resolvePlaylistIconId('🪐'), 'orbit');
});

void test('resolvePlaylistIconId falls back to the default icon', () => {
    assert.equal(resolvePlaylistIconId('not-a-real-id'), DEFAULT_PLAYLIST_ICON);
    assert.equal(resolvePlaylistIconId(''), DEFAULT_PLAYLIST_ICON);
    assert.equal(resolvePlaylistIconId(null), DEFAULT_PLAYLIST_ICON);
    assert.equal(resolvePlaylistIconId(undefined), DEFAULT_PLAYLIST_ICON);
});

void test('getPlaylistIconDefinition returns a definition with an Icon', () => {
    const definition = getPlaylistIconDefinition('flame');
    assert.equal(definition.id, 'flame');
    assert.equal(typeof definition.Icon, 'function');
    assert.equal(typeof definition.label, 'string');
});

void test('getPlaylistIconDefinition resolves legacy emoji, not just default', () => {
    assert.equal(getPlaylistIconDefinition('💿').id, 'disc');
    assert.equal(getPlaylistIconDefinition('nope').id, DEFAULT_PLAYLIST_ICON);
});

void test('every icon option has a unique id and a resolvable definition', () => {
    const ids = PLAYLIST_ICON_OPTIONS.map((option) => option.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) {
        assert.equal(getPlaylistIconDefinition(id).id, id);
    }
});
