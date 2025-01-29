import { BASE_URL } from '../const.js';
import type { Game } from '../types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseGameArray = (data: any, limit?: number): Game[] => {
    const games: Game[] = [];

    for (const gameResult of data) {
        const sale = gameResult.sale_end ? {
            end: new Date(gameResult.sale_end),
            type: gameResult.sale_type,
        } : undefined;

        const game: Game = {
            name: gameResult.human_name,
            url: `${BASE_URL}/store/${gameResult.human_url}`,
            delivery_methods: gameResult.delivery_methods,
            content_types: gameResult.content_types,
            platforms: gameResult.platforms,
            required_account_links: gameResult.required_account_links,
            full_price: gameResult.full_price,
            current_price: gameResult.current_price,
            nonrefundable: gameResult.nonrefundable,
            sale,
        };

        games.push(game);

        if (limit && games.length >= limit) {
            break;
        }
    }

    return games;
};
