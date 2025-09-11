// Hilti Pricing Service - Fetch real prices from Hilti GraphQL API
import fetch from 'node-fetch';

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

class HiltiPricingService {
  private readonly apiUrl = 'https://cloudapis.hilti.com/dus/graphql/v1';
  private readonly fallbackApiUrl = 'https://www.hilti.com/api/pricing/v1';
  
  private getHeaders() {
    // Use the working headers from Bruno configuration
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'apollographql-client-name': 'hdms-frontend',
      'authorization': 'Basic ZTAwODAzZGYtMjY5YS00MDU0LTgxYTMtNDk1YjA0NTY0MGVkOjYyZmVmNDBkLWRiYjUtNDMyNS04ZDAwLTE2NTEyMzIxOWI1NA==',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Origin': 'https://www.hilti.com',
      'Referer': 'https://www.hilti.com/'
    };
    
    console.log('🔑 Using verified Hilti API authentication headers from Bruno configuration');
    
    return headers;
  }

  private readonly graphqlQuery = `
    query StreetProductsPrices($filter: PricesFilterInput!, $localization: LocalizationInput!, $isFleetPriceEnabled: Boolean!, $isSubscriptionPriceEnabled: Boolean!) {
      streetPrices(filter: $filter) {
        ...MakeItFitProductPrice
        __typename
      }
    }

    fragment MakeItFitProductPrice on Price {
      productId
      quantity
      currency
      standardDetails {
        ...StandardMakeItFitProductPriceDetails
        __typename
      }
      fleetDetails @include(if: $isFleetPriceEnabled) {
        ...FleetMakeItFitProductDetails
        __typename
      }
      subscriptionDetails @include(if: $isSubscriptionPriceEnabled) {
        ...SubscriptionMakeItFitProductPriceDetails
        __typename
      }
      __typename
    }

    fragment StandardMakeItFitProductPriceDetails on StandardPriceDetails {
      unitPriceInformation {
        ...StandardMakeItFitProductPriceInformation
        __typename
      }
      isConsumablesSubscriptionDiscountApplicable
      __typename
    }

    fragment StandardMakeItFitProductPriceInformation on StandardPrice {
      price
      quantity
      unit {
        id
        name(localization: $localization)
        __typename
      }
      __typename
    }

    fragment FleetMakeItFitProductDetails on FleetPriceDetails {
      unitPriceInformation {
        ...FleetMakeItFitProductPriceInformation
        __typename
      }
      period
      __typename
    }

    fragment FleetMakeItFitProductPriceInformation on FleetPrice {
      upfrontCost
      monthlyFee
      __typename
    }

    fragment SubscriptionMakeItFitProductPriceDetails on SubscriptionPriceDetails {
      unitPriceInformation {
        ...SubscriptionMakeItFitProductPriceInformation
        __typename
      }
      billingType
      __typename
    }

    fragment SubscriptionMakeItFitProductPriceInformation on SubscriptionPrice {
      monthlyPrice
      yearlyPrice
      unit {
        id
        name(localization: $localization)
        __typename
      }
      __typename
    }
  `;

  /**
   * Fetch prices for multiple products from Hilti API
   */
  async fetchPrices(products: HiltiPriceRequest[], country = 'US', language = 'en'): Promise<PricingResult[]> {
    try {
      console.log(`🔍 Fetching prices for ${products.length} products from Hilti API`);

      const requestBody = {
        operationName: 'StreetProductsPrices',
        variables: {
          filter: {
            products: products.map(p => ({
              productId: p.productId.toString(),
              quantity: p.quantity || 10
            })),
            types: ['FLEET', 'STANDARD'],
            currency: 'USD',
            country: country
          },
          skipFleetDetails: true,
          localization: {
            country: country,
            language: language
          },
          isFleetPriceEnabled: true,
          isSubscriptionPriceEnabled: false
        },
        query: this.graphqlQuery
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ API Error ${response.status}:`, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      const responseData = data as any;
      if (responseData.errors) {
        console.warn('⚠️ GraphQL errors in pricing response:', responseData.errors);
        // Still try to use data if available
      }

      const streetPrices = responseData.data?.streetPrices || [];
      console.log(`✅ Received pricing data for ${streetPrices.length} products`);
      
      // Log first few results for debugging
      if (streetPrices.length > 0) {
        console.log('Sample pricing result:', JSON.stringify(streetPrices[0], null, 2));
      }

      return streetPrices.map((price: any) => this.transformPriceData(price));

    } catch (error) {
      console.error('❌ Error fetching Hilti prices:', error);
      return products.map(p => ({
        productId: p.productId,
        standardPrice: 0,
        fleetMonthlyPrice: 0,
        fleetUpfrontCost: 0,
        currency: 'USD',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }

  /**
   * Fetch price for a single product
   */
  async fetchSinglePrice(productId: string, quantity: number = 1): Promise<PricingResult> {
    const results = await this.fetchPrices([{ productId, quantity }]);
    return results[0];
  }

  /**
   * Transform Hilti API response to our internal format
   */
  private transformPriceData(price: any): PricingResult {
    try {
      return {
        productId: price.productId,
        standardPrice: price.standardDetails?.unitPriceInformation?.price || 0,
        fleetMonthlyPrice: price.fleetDetails?.unitPriceInformation?.monthlyFee || 0,
        fleetUpfrontCost: price.fleetDetails?.unitPriceInformation?.upfrontCost || 0,
        currency: price.currency || 'USD',
        success: true
      };
    } catch (error) {
      return {
        productId: price.productId || 'unknown',
        standardPrice: 0,
        fleetMonthlyPrice: 0,
        fleetUpfrontCost: 0,
        currency: 'USD',
        success: false,
        error: error instanceof Error ? error.message : 'Transform error'
      };
    }
  }

  /**
   * Extract product ID from catalog item for pricing lookup
   */
  static getProductIdFromCatalogItem(catalogItem: any): string | null {
    // The productId for the API is the tag_sku from our catalog
    return catalogItem.sku || catalogItem.tag_sku || null;
  }

  /**
   * Fetch prices from catalog data as fallback when API fails
   */
  async fetchPricesFromCatalog(products: HiltiPriceRequest[], catalogData?: any[]): Promise<PricingResult[]> {
    if (!catalogData) {
      console.warn('⚠️ No catalog data available for fallback pricing');
      return products.map(p => ({
        productId: p.productId,
        standardPrice: 0,
        fleetMonthlyPrice: 0,
        fleetUpfrontCost: 0,
        currency: 'USD',
        success: false,
        error: 'No catalog data available'
      }));
    }

    console.log('📊 Using catalog pricing data as fallback');
    
    // Create product lookup map
    const productLookup = new Map();
    catalogData.forEach(category => {
      category.products?.forEach((product: any) => {
        if (product.apiProductIds) {
          product.apiProductIds.forEach((id: string) => {
            productLookup.set(id.toString(), product);
          });
        }
        // Also map by SKU
        if (product.sku) {
          productLookup.set(product.sku.toString(), product);
        }
      });
    });

    return products.map(req => {
      const catalogProduct = productLookup.get(req.productId.toString());
      
      if (catalogProduct?.pricing) {
        return {
          productId: req.productId,
          standardPrice: catalogProduct.pricing.standardPrice || 0,
          fleetMonthlyPrice: catalogProduct.pricing.fleetMonthlyPrice || 0,
          fleetUpfrontCost: catalogProduct.pricing.fleetUpfrontCost || 0,
          currency: catalogProduct.pricing.currency || 'USD',
          success: true
        };
      } else {
        return {
          productId: req.productId,
          standardPrice: 0,
          fleetMonthlyPrice: 0,
          fleetUpfrontCost: 0,
          currency: 'USD',
          success: false,
          error: 'Product not found in catalog'
        };
      }
    });
  }

  /**
   * Batch fetch prices with rate limiting and error handling
   */
  async fetchPricesWithRetry(products: HiltiPriceRequest[], maxRetries = 2, catalogData?: any[]): Promise<PricingResult[]> {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const results = await this.fetchPrices(products);
        
        // If some products have successful pricing, return the results
        const successCount = results.filter(r => r.success).length;
        if (successCount > 0) {
          console.log(`✅ Successfully fetched ${successCount}/${products.length} prices from API`);
          return results;
        }
        
        // If no successful results but no error thrown, continue to next attempt
        throw new Error('No successful price results returned');
        
      } catch (error) {
        lastError = error;
        console.log(`⚠️ API attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : 'Unknown error');
        
        if (attempt < maxRetries) {
          // Wait with exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    console.warn('❌ All API attempts failed, trying catalog fallback...');
    
    // Try catalog fallback before giving up
    if (catalogData) {
      try {
        const catalogResults = await this.fetchPricesFromCatalog(products, catalogData);
        const catalogSuccessCount = catalogResults.filter(r => r.success).length;
        
        if (catalogSuccessCount > 0) {
          console.log(`✅ Using catalog pricing for ${catalogSuccessCount}/${products.length} products`);
          return catalogResults;
        }
      } catch (catalogError) {
        console.error('❌ Catalog fallback also failed:', catalogError);
      }
    }
    
    console.error('❌ All pricing methods exhausted:', lastError);
    return products.map(p => ({
      productId: p.productId,
      standardPrice: 0,
      fleetMonthlyPrice: 0,
      fleetUpfrontCost: 0,
      currency: 'USD',
      success: false,
      error: 'All pricing methods failed'
    }));
  }
}

export const hiltiPricingService = new HiltiPricingService();
export default hiltiPricingService;
