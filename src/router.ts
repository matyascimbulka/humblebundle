import { createHttpRouter } from 'crawlee';

import { LABELS } from './const.js';
import { handleSearch } from './routes/search.js';
import type { SearchUserData } from './types.js';

export const router = createHttpRouter();

router.addHandler<SearchUserData>(LABELS.SEARCH, handleSearch);
