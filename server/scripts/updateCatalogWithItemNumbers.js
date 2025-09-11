// Script to update catalog with correct API product IDs from tag_item_numbers
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Updating catalog with correct API product IDs...');

// Load current processed catalog
const catalogPath = path.join(__dirname, '../src/data/hiltiCatalogLLM.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

// Load original product data to get tag_item_numbers
const productDataDir = path.join(__dirname, '../../product_data_en_us');
const productFiles = fs.readdirSync(productDataDir).filter(f => f.endsWith('.json'));

console.log(`📂 Found ${productFiles.length} original product files`);

// Create mapping from product names to item numbers
const nameToItemNumbers = new Map();

productFiles.forEach(file => {
  try {
    const filePath = path.join(productDataDir, file);
    const productData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    const name = productData.tag_name;
    const itemNumbers = productData.tag_item_numbers;
    
    if (name && itemNumbers) {
      // Parse the item numbers (they're stored as string representation of array)
      let parsedNumbers;
      try {
        parsedNumbers = JSON.parse(itemNumbers.replace(/'/g, '"'));
      } catch (e) {
        parsedNumbers = [itemNumbers];
      }
      
      if (Array.isArray(parsedNumbers) && parsedNumbers.length > 0) {
        nameToItemNumbers.set(name, parsedNumbers);
        console.log(`📝 ${name}: [${parsedNumbers.join(', ')}]`);
      }
    }
  } catch (error) {
    console.warn(`⚠️ Error processing ${file}:`, error.message);
  }
});

console.log(`🎯 Found item numbers for ${nameToItemNumbers.size} products`);

// Update catalog with API product IDs
let updatedCount = 0;

catalog.forEach(category => {
  if (category.products && Array.isArray(category.products)) {
    category.products.forEach(product => {
      const itemNumbers = nameToItemNumbers.get(product.name);
      if (itemNumbers && itemNumbers.length > 0) {
        product.apiProductIds = itemNumbers;
        updatedCount++;
      }
    });
  }
});

console.log(`✅ Updated ${updatedCount} products with API product IDs`);

// Save updated catalog
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
console.log(`📁 Updated catalog saved to: ${catalogPath}`);

// Also update client catalog
const clientCatalogPath = path.join(__dirname, '../../client/src/data/hiltiCatalogLLM.json');
fs.writeFileSync(clientCatalogPath, JSON.stringify(catalog, null, 2));
console.log(`📁 Client catalog also updated: ${clientCatalogPath}`);

console.log('🎉 Catalog updated with correct API product IDs!');
