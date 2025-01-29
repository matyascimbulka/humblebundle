import { describe, test, expect } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';
import { parseGameArray } from '../../src/parsers/game.js';

const BASE_PATH = path.join(__dirname, '../../sample-data');

describe('gameParser', () => {
    test('should parse search results', async () => {
        const filePath = path.join(BASE_PATH, 'search-response.json');
        const file = await fs.readFile(filePath, { encoding: 'utf8' });
        const data = JSON.parse(file.toString());
        const games = parseGameArray(data.results);

        expect(games).toBeDefined();
        expect(games.length).toBe(20);
    });
});
