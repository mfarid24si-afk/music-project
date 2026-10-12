import assert from 'node:assert/strict';
import { test } from 'node:test';
import { findActiveLyricIndex, parseSyncedLyrics } from './lyrics.js';

void test('parseSyncedLyrics parses timestamps and text', () => {
    assert.deepEqual(parseSyncedLyrics('[00:12.34]Hello\n[01:05.60]World'), [
        { time: 12.34, text: 'Hello' },
        { time: 65.6, text: 'World' },
    ]);
});

void test('parseSyncedLyrics accepts comma-padded hundredths', () => {
    assert.deepEqual(parseSyncedLyrics('[00:01,05]One'), [
        { time: 1.05, text: 'One' },
    ]);
});

void test('parseSyncedLyrics returns null when nothing can be parsed', () => {
    assert.equal(parseSyncedLyrics(undefined), null);
    assert.equal(parseSyncedLyrics(''), null);
    assert.equal(parseSyncedLyrics('\n\n'), null);
    assert.equal(parseSyncedLyrics('no timestamps here'), null);
});

void test('findActiveLyricIndex returns the last line at or before time', () => {
    const lines = [
        { time: 0, text: 'a' },
        { time: 10, text: 'b' },
        { time: 20, text: 'c' },
    ];
    assert.equal(findActiveLyricIndex(lines, -1), -1);
    assert.equal(findActiveLyricIndex(lines, 9.99), 0);
    assert.equal(findActiveLyricIndex(lines, 10), 1);
    assert.equal(findActiveLyricIndex(lines, 99), 2);
    assert.equal(findActiveLyricIndex(null, 5), -1);
});
