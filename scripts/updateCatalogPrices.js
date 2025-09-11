// Script to update all catalog prices using the real Hilti API
// This script fetches current pricing from Hilti's GraphQL API and updates the catalog

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const HILTI_API_URL = 'https://cloudapis.hilti.com/dus/graphql/v1';
const BATCH_SIZE = 50; // Process products in batches to avoid hitting API limits
const DELAY_BETWEEN_BATCHES = 2000; // 2 seconds delay between batches

// Headers from your Bruno configuration
const API_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'apollographql-client-name': 'hdms-frontend',
  'authorization': 'Basic ZTAwODAzZGYtMjY5YS00MDU0LTgxYTMtNDk1YjA0NTY0MGVkOjYyZmVmNDBkLWRiYjUtNDMyNS04ZDAwLTE2NTEyMzIxOWI1NA==',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Origin': 'https://www.hilti.com',
  'Referer': 'https://www.hilti.com/'
};

// GraphQL query from your Bruno request
const GRAPHQL_QUERY = `query StreetProductsPrices($filter: PricesFilterInput!, $localization: LocalizationInput!, $isFleetPriceEnabled: Boolean!, $isSubscriptionPriceEnabled: Boolean!) {
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
}`;

/**
 * Fetch prices for a batch of products from Hilti API
 */
async function fetchPricesForProducts(productIds, country = 'US', language = 'en') {
  try {
    console.log(`🔍 Fetching prices for batch of ${productIds.length} products...`);

    const requestBody = {
      operationName: 'StreetProductsPrices',
      variables: {
        filter: {
          products: productIds.map(id => ({
            productId: id.toString(),
            quantity: 10
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
      query: GRAPHQL_QUERY
    };

    const response = await fetch(HILTI_API_URL, {
      method: 'POST',
      headers: API_HEADERS,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ API Error ${response.status}:`, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      console.warn('⚠️ GraphQL errors in pricing response:', data.errors);
    }

    const streetPrices = data.data?.streetPrices || [];
    console.log(`✅ Received pricing data for ${streetPrices.length}/${productIds.length} products`);
    
    return streetPrices;

  } catch (error) {
    console.error('❌ Error fetching prices:', error.message);
    return [];
  }
}

/**
 * Transform API price data to our internal format
 */
function transformPriceData(apiPrice) {
  try {
    return {
      productId: apiPrice.productId,
      standardPrice: apiPrice.standardDetails?.unitPriceInformation?.price || 0,
      fleetMonthlyPrice: apiPrice.fleetDetails?.unitPriceInformation?.monthlyFee || 0,
      fleetUpfrontCost: apiPrice.fleetDetails?.unitPriceInformation?.upfrontCost || 0,
      currency: apiPrice.currency || 'USD',
      lastUpdated: new Date().toISOString().split('T')[0],
      success: true
    };
  } catch (error) {
    console.warn(`⚠️ Error transforming price data for ${apiPrice.productId}:`, error.message);
    return {
      productId: apiPrice.productId,
      standardPrice: 0,
      fleetMonthlyPrice: 0,
      fleetUpfrontCost: 0,
      currency: 'USD',
      lastUpdated: new Date().toISOString().split('T')[0],
      success: false
    };
  }
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Main function to update catalog prices
 */
async function updateCatalogPrices() {
  try {
    console.log('🔄 Starting catalog price update process...\n');

    // Load current catalog
    const catalogPath = path.join(__dirname, '../client/src/data/hiltiCatalogLLM.json');
    const serverCatalogPath = path.join(__dirname, '../server/src/data/hiltiCatalogLLM.json');
    
    if (!fs.existsSync(catalogPath)) {
      console.error('❌ Catalog file not found:', catalogPath);
      return;
    }

    const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    console.log(`📂 Loaded catalog with ${catalog.length} categories`);

    // Collect all products with API IDs
    const allProducts = [];
    let totalProducts = 0;

    catalog.forEach(category => {
      if (category.products && Array.isArray(category.products)) {
        category.products.forEach(product => {
          totalProducts++;
          if (product.apiProductIds && product.apiProductIds.length > 0) {
            // Use the first API product ID
            allProducts.push({
              categoryIndex: catalog.indexOf(category),
              productIndex: category.products.indexOf(product),
              product: product,
              apiProductId: product.apiProductIds[0].toString()
            });
          }
        });
      }
    });

    console.log(`📊 Found ${allProducts.length} products with API IDs out of ${totalProducts} total products\n`);

    if (allProducts.length === 0) {
      console.warn('⚠️ No products found with API IDs. Run updateCatalogWithItemNumbers.js first.');
      return;
    }

    // Group products into batches
    const batches = [];
    for (let i = 0; i < allProducts.length; i += BATCH_SIZE) {
      batches.push(allProducts.slice(i, i + BATCH_SIZE));
    }

    console.log(`🎯 Processing ${batches.length} batches of ${BATCH_SIZE} products each\n`);

    let totalUpdated = 0;
    let totalFailed = 0;

    // Process each batch
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex];
      const productIds = batch.map(item => item.apiProductId);
      
      console.log(`📦 Processing batch ${batchIndex + 1}/${batches.length}...`);
      
      try {
        const priceResults = await fetchPricesForProducts(productIds);
        
        // Create lookup map for quick access
        const priceMap = new Map();
        priceResults.forEach(price => {
          const transformedPrice = transformPriceData(price);
          priceMap.set(price.productId.toString(), transformedPrice);
        });

        // Update products in this batch
        let batchUpdated = 0;
        batch.forEach(item => {
          const priceData = priceMap.get(item.apiProductId);
          
          if (priceData && priceData.success) {
            // Update the product in the catalog
            catalog[item.categoryIndex].products[item.productIndex].pricing = {
              standardPrice: priceData.standardPrice,
              fleetMonthlyPrice: priceData.fleetMonthlyPrice,
              fleetUpfrontCost: priceData.fleetUpfrontCost,
              currency: priceData.currency,
              lastUpdated: priceData.lastUpdated
            };
            batchUpdated++;
            totalUpdated++;
          } else {
            console.warn(`⚠️ No price data for product: ${item.product.name} (ID: ${item.apiProductId})`);
            totalFailed++;
          }
        });

        console.log(`✅ Batch ${batchIndex + 1} complete: ${batchUpdated}/${batch.length} products updated`);

        // Add delay between batches to respect API rate limits
        if (batchIndex < batches.length - 1) {
          console.log(`⏸️ Waiting ${DELAY_BETWEEN_BATCHES}ms before next batch...\n`);
          await sleep(DELAY_BETWEEN_BATCHES);
        }

      } catch (error) {
        console.error(`❌ Error processing batch ${batchIndex + 1}:`, error.message);
        totalFailed += batch.length;
      }
    }

    // Save updated catalogs
    console.log('\n💾 Saving updated catalogs...');
    
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
    console.log(`✅ Client catalog updated: ${catalogPath}`);
    
    if (fs.existsSync(serverCatalogPath)) {
      fs.writeFileSync(serverCatalogPath, JSON.stringify(catalog, null, 2));
      console.log(`✅ Server catalog updated: ${serverCatalogPath}`);
    }

    // Summary
    console.log('\n🎉 Price update process completed!');
    console.log(`📊 Summary:`);
    console.log(`   • Total products processed: ${allProducts.length}`);
    console.log(`   • Successfully updated: ${totalUpdated}`);
    console.log(`   • Failed to update: ${totalFailed}`);
    console.log(`   • Success rate: ${((totalUpdated / allProducts.length) * 100).toFixed(1)}%`);

    if (totalUpdated > 0) {
      console.log('\n✨ Catalog prices have been updated with real Hilti API data!');
    }

  } catch (error) {
    console.error('❌ Fatal error during price update:', error);
  }
}

// Run the price update
updateCatalogPrices().catch(console.error);
