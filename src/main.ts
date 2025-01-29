import { Actor } from 'apify';
import { HttpCrawler } from 'crawlee';

import { router } from './router.js';
import { LABELS, ACTOR_STATE, BASE_URL } from './const.js';
import type { State } from './types.js';

interface Input {
    searchPhrase?: string;
    maxResults?: number;
}

// The init() call configures the Actor for its environment. It's recommended to start every Actor with an init()
await Actor.init();

// Structure of input is defined in input_schema.json
const {
    searchPhrase,
    maxResults,
} = await Actor.getInput<Input>() ?? {} as Input;

await Actor.useState<State>(ACTOR_STATE, {
    scrapedResults: 0,
    maxResults,
});

const proxyConfiguration = await Actor.createProxyConfiguration();

const crawler = new HttpCrawler({
    proxyConfiguration,
    requestHandler: router,
    maxRequestRetries: 15,
});

const url = `${BASE_URL}/store/api/search?sort=bestselling&filter=all&request=1&search=${searchPhrase?.replace(' ', '+') ?? ''}`;

await crawler.run([
    {
        url,
        label: LABELS.SEARCH,
        userData: {
            searchPhrase,
        },
    },
]);

// Gracefully exit the Actor process. It's recommended to quit all Actors with an exit()
await Actor.exit();
