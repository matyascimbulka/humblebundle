export type State = {
    scrapedResults: number;
    maxResults?: number;
};

export type SearchUserData = {
    searchPhrase?: string;
};

export type Game = {
    name: string;
    url: string;
    delivery_methods: string[];
    content_types: string[];
    platforms: string[];
    required_account_links: string[];
    full_price: Price;
    current_price: Price;
    nonrefundable: boolean;
    sale?: Sale;
};

export type Price = {
    currency: string;
    amount: number;
};

export type Sale = {
    end: Date;
    type: string;
}
