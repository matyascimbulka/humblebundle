import { Actor } from 'apify';
import { ApifyApiError } from 'apify-client';
import { HttpCrawlingContext } from 'crawlee';

import { ACTOR_STATE, BASE_URL, LABELS } from '../const.js';
import { parseGameArray } from '../parsers/game.js';
import type { State, SearchUserData } from '../types.js';

export const handleSearch = async ({ log, request, json, crawler, pushData, addRequests }: HttpCrawlingContext<SearchUserData>) => {
    const { searchPhrase } = request.userData;
    const state = await Actor.useState<State>(ACTOR_STATE);

    const { page_index: pageIndex, num_pages: numPages, results } = json;

    const limit = state.maxResults ? state.maxResults - state.scrapedResults : undefined;
    const games = parseGameArray(results, limit);

    state.scrapedResults += games.length;
    try {
        await pushData(games);
    } catch (error) {
        if (error instanceof ApifyApiError) {
            if (!error.data?.invalidItems) throw error;
            (error.data.invalidItems as Array<any>).forEach((item) => {
                log.error('Validation failed', item.validationErrors);
            });
        }

        log.error('Failed to push data', { error });
    }

    if (state.maxResults && state.scrapedResults >= state.maxResults) {
        log.info(`Scraped ${games.length} games on page ${pageIndex + 1}; `
            + `total games scraped: ${state.scrapedResults}; `
            + `reached max results: ${state.maxResults}`, { url: request.url });
        await crawler.stop();
        return;
    }

    if (pageIndex + 1 < numPages) {
        const url = new URL(`${BASE_URL}/store/api/search`);
        url.searchParams.set('search', searchPhrase?.replace(' ', '+') ?? '');
        url.searchParams.set('page', `${pageIndex + 1}`);
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

        log.info(`Scraped ${games.length} games on page ${pageIndex + 1}; `
            + `total games scraped: ${state.scrapedResults}; `
            + `enqueued page ${pageIndex + 2}`, { url: request.url });
    } else {
        log.info(`Scraped ${games.length} games on page ${pageIndex + 1}; `
            + `total games scraped: ${state.scrapedResults}; `
            + `no more pages to scrape`, { url: request.url });
    }
};
