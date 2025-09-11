// Enhanced Script to process the Hilti product catalog
// Run with: node scripts/processCatalog.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper function to extract technical specifications from content
function extractTechnicalSpecs(content) {
  const specs = [];
  if (!content) return specs;
  
  // Look for technical data section
  const techDataMatch = content.match(/### TECHNICAL DATA:(.*?)(?:###|$)/s);
  if (techDataMatch) {
    const techSection = techDataMatch[1];
    // Extract key-value pairs from the technical data
    const lines = techSection.split('|').filter(line => line.trim());
    for (let i = 0; i < lines.length - 1; i += 2) {
      const key = lines[i]?.trim();
      const value = lines[i + 1]?.trim();
      if (key && value && key !== 'Technical Data' && value.length < 100) {
        specs.push(`${key}: ${value}`);
      }
    }
  }
  
  return specs.slice(0, 5); // Limit to 5 key specs
}

// Helper function to extract features from content
function extractFeatures(content) {
  const features = [];
  if (!content) return features;
  
  // Look for features section
  const featuresMatch = content.match(/### FEATURES:(.*?)(?:###|$)/s);
  if (featuresMatch) {
    const featuresSection = featuresMatch[1].replace(/Features\s+/g, '');
    // Split by common separators and clean up
    const rawFeatures = featuresSection.split(/(?=\s[A-Z])|(?<=\.)(?=\s[A-Z])/)
      .map(f => f.trim())
      .filter(f => f.length > 10 && f.length < 200);
    
    features.push(...rawFeatures.slice(0, 4));
  }
  
  return features;
}

// Helper function to extract applications from content
function extractApplications(content) {
  const applications = [];
  if (!content) return applications;
  
  // Look for applications section
  const applicationsMatch = content.match(/Applications(.*?)(?:###|$)/s);
  if (applicationsMatch) {
    const appSection = applicationsMatch[1];
    // Split by common patterns
    const rawApplications = appSection.split(/(?=\s[A-Z])/)
      .map(a => a.trim())
      .filter(a => a.length > 10 && a.length < 150);
    
    applications.push(...rawApplications.slice(0, 3));
  }
  
  return applications;
}

// Helper function to extract price/cost information if available
function extractPriceInfo(content) {
  const priceMatch = content.match(/\$[\d,]+\.?\d*/g);
  return priceMatch ? priceMatch[0] : null;
}

// Extract and process the product catalog
async function processCatalog() {
  try {
    console.log('🔄 Processing Hilti product catalog...');
    
    // Check if catalog is already extracted
    const catalogDir = path.join(__dirname, '../product_data_en_us');
    if (!fs.existsSync(catalogDir)) {
      console.log('📦 Extracting product catalog...');
      console.log('⚠️  Please extract product_data_en_us.zip manually first');
      return;
    }

    // Read all JSON files
    const files = fs.readdirSync(catalogDir).filter(file => file.endsWith('.json'));
    console.log(`📁 Found ${files.length} product files`);

    // Process ALL files (removed the 100 file limit)
    const products = [];
    const errors = [];

    console.log('🔄 Processing all product files...');
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(catalogDir, files[i]);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const product = JSON.parse(content);
        products.push(product);
        
        // Progress indicator
        if ((i + 1) % 100 === 0 || i === files.length - 1) {
          console.log(`📊 Processed ${i + 1}/${files.length} files`);
        }
      } catch (error) {
        errors.push({ file: files[i], error: error.message });
      }
    }

    console.log(`✅ Successfully processed ${products.length} products`);
    if (errors.length > 0) {
      console.log(`⚠️  Failed to parse ${errors.length} files`);
    }

    // Create enhanced catalog for the app with full product details
    const enhancedCatalog = products.map(product => {
      const technicalSpecs = extractTechnicalSpecs(product.content || '');
      const features = extractFeatures(product.content || '');
      const applications = extractApplications(product.content || '');
      const priceInfo = extractPriceInfo(product.content || '');
      
      return {
        sku: product.tag_sku,
        name: product.tag_name || 'Unknown Product',
        description: product.tag_description || '',
        category: product.tag_categories_leaf || 'Uncategorized',
        categoryPath: product.tag_categories_branch || '',
        url: product.tag_public_url,
        itemNumbers: product.tag_item_numbers ? JSON.parse(product.tag_item_numbers.replace(/'/g, '"')) : [],
        technicalSpecs: technicalSpecs,
        features: features,
        applications: applications,
        priceInfo: priceInfo,
        fullContent: product.content || '',
        contentPreview: (product.content || '').substring(0, 500) + '...'
      };
    }).filter(product => product.name !== 'Unknown Product' && product.sku);

    // Create category-based index for faster LLM queries
    const categoryIndex = {};
    enhancedCatalog.forEach(product => {
      const category = product.category;
      if (!categoryIndex[category]) {
        categoryIndex[category] = [];
      }
      categoryIndex[category].push(product);
    });

    // Create LLM-optimized catalog for AI prompts (this is what the app actually uses)
    const llmCatalog = Object.keys(categoryIndex).map(category => ({
      category: category,
      productCount: categoryIndex[category].length,
      products: categoryIndex[category].map(product => ({
        name: product.name,
        sku: product.sku,
        description: product.description,
        features: product.features,
        applications: product.applications,
        technicalSpecs: product.technicalSpecs,
        priceInfo: product.priceInfo,
        url: product.url
      }))
    }));

    // Save LLM-optimized catalog for both client and server
    const clientLlmOutputPath = path.join(__dirname, '../client/src/data/hiltiCatalogLLM.json');
    const serverLlmOutputPath = path.join(__dirname, '../server/src/data/hiltiCatalogLLM.json');
    
    fs.writeFileSync(clientLlmOutputPath, JSON.stringify(llmCatalog, null, 2));
    fs.writeFileSync(serverLlmOutputPath, JSON.stringify(llmCatalog, null, 2));
    
    console.log(`🤖 Saved LLM-optimized catalog to ${clientLlmOutputPath}`);
    console.log(`🤖 Saved LLM-optimized catalog to ${serverLlmOutputPath}`);

    console.log(`📊 Total products: ${enhancedCatalog.length}`);
    console.log(`📋 Categories found: ${Object.keys(categoryIndex).length}`);
    
    // Show sample products by category
    const sampleCategories = Object.keys(categoryIndex).slice(0, 5);
    console.log('\n🔍 Sample products by category:');
    sampleCategories.forEach(category => {
      const products = categoryIndex[category];
      console.log(`\n📂 ${category} (${products.length} products):`);
      products.slice(0, 3).forEach(product => {
        console.log(`  - ${product.name} (${product.sku})`);
      });
    });

    // Generate summary stats
    console.log('\n📈 Processing Summary:');
    console.log(`✅ Total products processed: ${enhancedCatalog.length}`);
    console.log(`🗂️  Categories identified: ${Object.keys(categoryIndex).length}`);
    console.log(`❌ Processing errors: ${errors.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ Files with errors:');
      errors.slice(0, 5).forEach(error => {
        console.log(`  - ${error.file}: ${error.error}`);
      });
      if (errors.length > 5) {
        console.log(`  ... and ${errors.length - 5} more`);
      }
    }

  } catch (error) {
    console.error('❌ Error processing catalog:', error);
  }
}

// Run the processing
processCatalog();
