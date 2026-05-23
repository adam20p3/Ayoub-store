// Utility functions for localStorage CRUD operations

const STORAGE_KEY = 'bag_store_products';

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Get all products from localStorage
 * @returns {Array} Array of product objects
 */
export const getProducts = () => {
  if (!isBrowser) return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

/**
 * Save a new product to localStorage
 * @param {Object} product - Product object to save
 * @returns {Object} Saved product with generated id
 */
export const saveProduct = (product) => {
  if (!isBrowser) return null;
  
  try {
    const products = getProducts();
    const newProduct = {
      ...product,
      id: product.id || `product_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    products.push(newProduct);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return newProduct;
  } catch (error) {
    console.error('Error saving product:', error);
    return null;
  }
};

/**
 * Update an existing product
 * @param {string} id - Product id
 * @param {Object} updatedData - Updated product data
 * @returns {Object|null} Updated product or null if not found
 */
export const updateProduct = (id, updatedData) => {
  if (!isBrowser) return null;
  
  try {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      console.error('Product not found');
      return null;
    }
    
    products[index] = {
      ...products[index],
      ...updatedData,
      id: products[index].id, // Preserve original id
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return products[index];
  } catch (error) {
    console.error('Error updating product:', error);
    return null;
  }
};

/**
 * Delete a product from localStorage
 * @param {string} id - Product id to delete
 * @returns {boolean} True if deleted successfully
 */
export const deleteProduct = (id) => {
  if (!isBrowser) return false;
  
  try {
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredProducts));
    return true;
  } catch (error) {
    console.error('Error deleting product:', error);
    return false;
  }
};

/**
 * Get a single product by id
 * @param {string} id - Product id
 * @returns {Object|null} Product object or null if not found
 */
export const getProductById = (id) => {
  if (!isBrowser) return null;
  
  try {
    const products = getProducts();
    return products.find(p => p.id === id) || null;
  } catch (error) {
    console.error('Error getting product by id:', error);
    return null;
  }
};

/**
 * Get all unique categories
 * @returns {Array} Array of category strings
 */
export const getCategories = () => {
  if (!isBrowser) return [];
  
  try {
    const products = getProducts();
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))];
    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    return [];
  }
};

/**
 * Initialize with sample data if empty
 */
export const initializeSampleData = () => {
  if (!isBrowser) return;
  
  const products = getProducts();
  if (products.length === 0) {
    const sampleProducts = [
      {
        id: 'sample_1',
        name: 'Classic Leather Tote',
        price: 89.99,
        description: 'A timeless leather tote bag perfect for everyday use. Features multiple compartments and durable construction.',
        images: ['https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800', 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'],
        category: 'Tote',
        inStock: true
      },
      {
        id: 'sample_2',
        name: 'Modern Backpack',
        price: 129.99,
        description: 'Sleek and functional backpack with laptop compartment and water-resistant material.',
        images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800', 'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800'],
        category: 'Backpack',
        inStock: true
      },
      {
        id: 'sample_3',
        name: 'Elegant Crossbody',
        price: 69.99,
        description: 'Compact crossbody bag with adjustable strap. Perfect for hands-free convenience.',
        images: ['https://images.unsplash.com/photo-1564422167509-4f3a6c9c010f?w=800'],
        category: 'Crossbody',
        inStock: true
      },
      {
        id: 'sample_4',
        name: 'Weekend Duffel',
        price: 149.99,
        description: 'Spacious duffel bag ideal for weekend trips. Features padded shoulder strap and multiple pockets.',
        images: ['https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800'],
        category: 'Shoulder',
        inStock: true
      },
      {
        id: 'sample_5',
        name: 'Mini Shoulder Bag',
        price: 49.99,
        description: 'Compact shoulder bag for essentials. Stylish design with chain strap.',
        images: ['https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=800'],
        category: 'Clutch',
        inStock: false
      }
    ];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProducts));
  }
};