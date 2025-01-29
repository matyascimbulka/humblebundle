import { Actor } from 'apify';
import { HttpCrawlingContext } from 'crawlee';

import { ACTOR_STATE, BASE_URL, LABELS } from '../const.js';
import { parseGameArray } from '../parsers/game.js';
import type { State, SearchUserData } from '../types.js';

export const handleSearch = async ({ log, request, json, crawler, pushData, addRequests }: HttpCrawlingContext<SearchUserData>) => {
    const { searchPhrase } = request.userData;
    const state = await Actor.useState<State>(ACTOR_STATE);

    const { num_pages: numPages, results } = json;

    const searchParams = new URLSearchParams(request.url.split('?')[1]);
    const currentPage = Number(searchParams.get('page') ?? '1');

    const limit = state.maxResults ? state.maxResults - state.scrapedResults : undefined;
    const games = parseGameArray(results, limit);

    state.scrapedResults += games.length;
    await pushData(games);

    if (state.maxResults && state.scrapedResults >= state.maxResults) {
        log.info(`Scraped ${games.length} games on page ${currentPage}; `
            + `total games scraped: ${state.scrapedResults}; `
            + `reached max results: ${state.maxResults}`, { url: request.url });
        await crawler.stop();
        return;
    }

    if (currentPage < numPages) {
        const url = new URL(`${BASE_URL}/store/api/search`);
        url.searchParams.set('search', searchPhrase?.replace(' ', '+') ?? '');
        url.searchParams.set('page', `${currentPage + 1}`);
        url.searchParams.set('sort', 'bestselling');
        url.searchParams.set('filter', 'all');
        url.searchParams.set('request', '1');

        await addRequests([{
            url: url.toString(),
            userData: {
                searchPhrase,
            },
            label: LABELS.SEARCH,
        }]);

        log.info(`Scraped ${games.length} games on page ${currentPage}; `
            + `total games scraped: ${state.scrapedResults}; `
            + `enqueued page ${currentPage + 1}`, { url: request.url });
    } else {
        log.info(`Scraped ${games.length} games on page ${currentPage}; `
            + `total games scraped: ${state.scrapedResults}; `
            + `no more pages to scrape`, { url: request.url });
    }
};
