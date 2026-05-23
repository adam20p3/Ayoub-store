'use client'

import { useState, useEffect } from 'react';
import { getProducts, getCategories, initializeSampleData } from '@/lib/products';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShoppingBag, Filter, Tag } from 'lucide-react';
import Link from 'next/link';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Initialize sample data if needed
    initializeSampleData();
    loadProducts();
  }, []);

  const loadProducts = () => {
    const allProducts = getProducts();
    // Only show in-stock products on storefront
    const inStockProducts = allProducts.filter(p => p.inStock);
    setProducts(inStockProducts);
    setFilteredProducts(inStockProducts);
    
    const cats = getCategories();
    setCategories(cats);
  };

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(p => p.category === selectedCategory));
    }
  }, [selectedCategory, products]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-xl shadow-lg">
                <ShoppingBag className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Luxe Bags</h1>
                <p className="text-sm text-slate-500">Premium bag collection</p>
              </div>
            </div>
            <Link href="/admin">
              <Button variant="outline" className="gap-2">
                <Tag className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Discover Your Perfect Bag</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">Handcrafted quality, timeless style. Find bags that match your lifestyle.</p>
        </div>
      </section>

      {/* Filter Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
          <Filter className="h-5 w-5 text-slate-600" />
          <span className="font-medium text-slate-700">Filter by category:</span>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="ml-auto">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
          </Badge>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 pb-16">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No products found</h3>
            <p className="text-slate-500">Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <Card key={product.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 border-0 shadow-md">
                <div className="aspect-square relative bg-slate-100 overflow-hidden">
                  <img
                    src={product.images?.[0] || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800'}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {product.category && (
                    <Badge className="absolute top-3 right-3 bg-white/90 text-slate-700 hover:bg-white">
                      {product.category}
                    </Badge>
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">${product.price?.toFixed(2)}</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-400">© 2024 Luxe Bags. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;