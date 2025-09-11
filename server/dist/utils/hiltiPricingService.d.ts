export interface HiltiPriceRequest {
    productId: string;
    quantity: number;
}
export interface HiltiPriceResponse {
    productId: string;
    quantity: number;
    currency: string;
    standardDetails: {
        unitPriceInformation: {
            price: number;
            quantity: number;
            unit: {
                id: string;
                name: string;
            };
        };
        isConsumablesSubscriptionDiscountApplicable: boolean;
    };
    fleetDetails: {
        unitPriceInformation: {
            upfrontCost: number;
            monthlyFee: number;
        };
        period: number;
    };
}
export interface PricingResult {
    productId: string;
    standardPrice: number;
    fleetMonthlyPrice: number;
    fleetUpfrontCost: number;
    currency: string;
    success: boolean;
    error?: string;
}
declare class HiltiPricingService {
    private readonly apiUrl;
    private readonly fallbackApiUrl;
    private readonly headers;
    private readonly graphqlQuery;
    /**
     * Fetch prices for multiple products from Hilti API
     */
    fetchPrices(products: HiltiPriceRequest[], country?: string, language?: string): Promise<PricingResult[]>;
    /**
     * Fetch price for a single product
     */
    fetchSinglePrice(productId: string, quantity?: number): Promise<PricingResult>;
    /**
     * Transform Hilti API response to our internal format
     */
    private transformPriceData;
    /**
     * Extract product ID from catalog item for pricing lookup
     */
    static getProductIdFromCatalogItem(catalogItem: any): string | null;
    /**
     * Fetch prices from catalog data as fallback when API fails
     */
    fetchPricesFromCatalog(products: HiltiPriceRequest[], catalogData?: any[]): Promise<PricingResult[]>;
    /**
     * Batch fetch prices with rate limiting and error handling
     */
    fetchPricesWithRetry(products: HiltiPriceRequest[], maxRetries?: number, catalogData?: any[]): Promise<PricingResult[]>;
}
export declare const hiltiPricingService: HiltiPricingService;
export default hiltiPricingService;
