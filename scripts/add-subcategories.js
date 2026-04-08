/**
 * Helper script to add subcategories to products
 * Run: node scripts/add-subcategories.js
 * This generates the mapping for all products
 */

const subcategoryMapping = {
  // Vegetables
  'oyster-mushroom': 'Specialty Vegetables',
  'button-mushroom': 'Specialty Vegetables',
  'tomato': 'Nightshades',
  'potato': 'Root Vegetables',
  'onion': 'Root Vegetables',
  'garlic': 'Root Vegetables',
  'carrot': 'Root Vegetables',
  'bell-pepper': 'Specialty Vegetables',
  'broccoli': 'Cruciferous',
  'cauliflower': 'Cruciferous',
  'cabbage': 'Cruciferous',
  'cucumber': 'Specialty Vegetables',
  'lady-finger': 'Specialty Vegetables',
  'bottle-gourd': 'Gourds & Squash',
  'ridge-gourd': 'Gourds & Squash',
  'bitter-gourd': 'Gourds & Squash',
  'beans': 'Legumes',
  'peas': 'Legumes',
  'corn': 'Legumes',
  'radish': 'Root Vegetables',
  'eggplant': 'Nightshades',
  'zucchini': 'Gourds & Squash',

  // Fruits
  'banana': 'Year-Round Fruits',
  'apple': 'Premium Fruits',
  'orange': 'Citrus',
  'mango': 'Tropical',
  'grapes': 'Year-Round Fruits',
  'papaya': 'Tropical',
  'pineapple': 'Tropical',
  'guava': 'Citrus',
  'watermelon': 'Melons',
  'mosambi': 'Citrus',
  'pomegranate': 'Berries',
  'strawberry': 'Berries',
  'blueberry': 'Berries',
  'kiwi': 'Premium Fruits',
  'coconut': 'Tropical',

  // Greens
  'spinach': 'Leafy Greens',
  'kale': 'Leafy Greens',
  'arugula': 'Leafy Greens',
  'parsley': 'Fresh Herbs',
  'cilantro': 'Fresh Herbs',
  'mint': 'Fresh Herbs',
  'dill': 'Fresh Herbs',
  'lettuce': 'Leafy Greens',
  'swiss-chard': 'Leafy Greens',
  'fenugreek': 'Fresh Herbs',

  // Microgreens
  'microgreens': 'Premium Microgreens',
  'broccoli-microgreens': 'Cruciferous Sprouts',
  'radish-microgreens': 'Cruciferous Sprouts',
  'mustard-microgreens': 'Mustard Varieties',
  'alfalfa-microgreens': 'Legume Sprouts',
  'sunflower-microgreens': 'Premium Microgreens',
  'pea-microgreens': 'Legume Sprouts',
  'fenugreek-microgreens': 'Mustard Varieties',

  // Grocery
  'honey': 'Dairy Products',
  'cheese': 'Dairy Derivatives',
  'butter': 'Dairy Products',
  'paneer': 'Dairy Derivatives',
  'ghee': 'Oils & Fats',
  'coconut-oil': 'Oils & Fats',
  'mustard-oil': 'Oils & Fats',
  'rice': 'Grains & Staples',
  'flour': 'Grains & Staples',
  'dal': 'Pulses',
  'sugar': 'Condiments',
  'salt': 'Condiments',

  // Animal Products
  'eggs': 'Eggs & Dairy',
  'chicken-whole': 'Poultry',
  'chicken-pieces': 'Poultry',
  'chicken-breast': 'Poultry',
  'milk': 'Eggs & Dairy',
  'yogurt': 'Eggs & Dairy',
  'fish-tilapia': 'Seafood',
  'fish-rohu': 'Seafood',
  'fish-catfish': 'Seafood',
  'mutton': 'Meat',
  'goat-meat': 'Meat',
};

console.log('Subcategory Mapping:');
Object.entries(subcategoryMapping).forEach(([id, subcat]) => {
  console.log(`${id} -> ${subcat}`);
});

console.log(`\nTotal products: ${Object.keys(subcategoryMapping).length}`);
