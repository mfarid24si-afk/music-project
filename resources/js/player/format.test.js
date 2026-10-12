import assert from 'node:assert/strict';
import { test } from 'node:test';
import { formatSeconds } from './format.js';

void test('formatSeconds renders m:ss with zero padding', () => {
    assert.equal(formatSeconds(5), '0:05');
    assert.equal(formatSeconds(65), '1:05');
    assert.equal(formatSeconds(600), '10:00');
});

void test('formatSeconds falls back to 0:00 for empty values', () => {
    assert.equal(formatSeconds(0), '0:00');
    assert.equal(formatSeconds(undefined), '0:00');
    assert.equal(formatSeconds(NaN), '0:00');
});
