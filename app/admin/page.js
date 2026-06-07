/* eslint-disable react-hooks/immutability */
'use client'

import { useState, useEffect } from 'react';
import {
  getProducts,
  saveProduct,
  updateProduct,
  deleteProduct,
  initializeSampleData,
} from '@/lib/products';
import { fmtMAD } from '@/lib/currency';
import { AdminShell } from '@/components/admin-shell';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Edit, Trash2, Package, X } from 'lucide-react';
import { toast } from 'sonner';

const CATEGORIES = ['Tote', 'Shoulder', 'Clutch', 'Backpack', 'Crossbody'];

// ─────────────────────────────────────────────────────────────
// Products Page Content
// ─────────────────────────────────────────────────────────────
const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductId, setDeleteProductId] = useState(null);

  const emptyForm = () => ({
    name: '',
    price: '',
    description: '',
    images: [''],
    category: '',
    inStock: true,
  });
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    initializeSampleData();
    loadProducts();
  }, []);

  const loadProducts = () => setProducts(getProducts());

  const resetForm = () => {
    setFormData(emptyForm());
    setEditingProduct(null);
  };

  const handleOpenDialog = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name || '',
        price: product.price?.toString() || '',
        description: product.description || '',
        images: product.images?.length > 0 ? product.images : [''],
        category: product.category || '',
        inStock: product.inStock ?? true,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleInputChange = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

  const handleImageChange = (index, value) => {
    const next = [...formData.images];
    next[index] = value;
    setFormData((p) => ({ ...p, images: next }));
  };

  const addImageField = () =>
    setFormData((p) => ({ ...p, images: [...p.images, ''] }));

  const removeImageField = (index) => {
    const next = formData.images.filter((_, i) => i !== index);
    setFormData((p) => ({ ...p, images: next.length > 0 ? next : [''] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.description.trim() || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }
    const price = parseFloat(formData.price);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    const validImages = formData.images.map((s) => s.trim()).filter(Boolean);
    const payload = {
      name: formData.name.trim(),
      price,
      description: formData.description.trim(),
      images: validImages,
      category: formData.category,
      inStock: formData.inStock,
    };
    if (editingProduct) {
      updateProduct(editingProduct.id, payload);
      toast.success('Product updated');
    } else {
      saveProduct(payload);
      toast.success('Product created');
    }
    loadProducts();
    handleCloseDialog();
  };

  const handleDeleteClick = (id) => {
    setDeleteProductId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteProductId) {
      deleteProduct(deleteProductId);
      toast.success('Product deleted');
      loadProducts();
      setIsDeleteDialogOpen(false);
      setDeleteProductId(null);
    }
  };

  const inStockCount = products.filter((p) => p.inStock).length;
  const outStockCount = products.length - inStockCount;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total products</div>
            <div className="mt-1 text-3xl font-semibold text-slate-900">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">In stock</div>
            <div className="mt-1 text-3xl font-semibold text-emerald-600">{inStockCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Out of stock</div>
            <div className="mt-1 text-3xl font-semibold text-rose-600">{outStockCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-slate-100">
          <div>
            <CardTitle className="text-base">All Products</CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              {products.length} {products.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2 bg-slate-900 hover:bg-slate-800">
            <Plus className="h-4 w-4" />
            Add New Product
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-slate-900">No products yet</h3>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Get started by adding your first product
              </p>
              <Button onClick={() => handleOpenDialog()} size="sm" className="gap-2 bg-slate-900 hover:bg-slate-800">
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wide">
                  <tr>
                    <th className="text-left font-medium px-5 py-3 w-20">Image</th>
                    <th className="text-left font-medium px-5 py-3">Name</th>
                    <th className="text-left font-medium px-5 py-3">Category</th>
                    <th className="text-right font-medium px-5 py-3">Price</th>
                    <th className="text-left font-medium px-5 py-3">Stock</th>
                    <th className="text-right font-medium px-5 py-3 w-32">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3">
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 border border-slate-200">
                          <img
                            src={p.images?.[0] || 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=200'}
                            alt={p.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500 line-clamp-1 max-w-md">{p.description}</div>
                      </td>
                      <td className="px-5 py-3">
                        <Badge variant="outline" className="font-normal text-slate-700">
                          {p.category || '—'}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-right font-medium text-slate-900 tabular-nums">
                        {fmtMAD(p.price)}
                      </td>
                      <td className="px-5 py-3">
                        {p.inStock ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            In stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            Out of stock
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenDialog(p)}
                            className="h-8 w-8 p-0"
                            aria-label="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteClick(p.id)}
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information.' : 'Fill in the details to create a new product.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name <span className="text-rose-500">*</span></Label>
                <Input
                  id="name"
                  placeholder="e.g. Classic Leather Tote"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (MAD) <span className="text-rose-500">*</span></Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1299.00"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category <span className="text-rose-500">*</span></Label>
                  <Select value={formData.category} onValueChange={(v) => handleInputChange('category', v)}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description <span className="text-rose-500">*</span></Label>
                <Textarea
                  id="description"
                  placeholder="Describe the product features and benefits…"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Image URLs</Label>
                <div className="space-y-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder="https://example.com/image.jpg"
                        value={image}
                        onChange={(e) => handleImageChange(index, e.target.value)}
                      />
                      {formData.images.length > 1 && (
                        <Button type="button" variant="outline" size="icon" onClick={() => removeImageField(index)} aria-label="Remove image">
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addImageField} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Image
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
                <div>
                  <Label htmlFor="inStock" className="cursor-pointer">In stock</Label>
                  <p className="text-xs text-slate-500 mt-0.5">Show this product on the storefront</p>
                </div>
                <Switch
                  id="inStock"
                  checked={formData.inStock}
                  onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" className="bg-slate-900 hover:bg-slate-800">
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your store.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

const AdminPage = () => (
  <AdminShell titleSlot="Product catalog">
    <ProductsManager />
  </AdminShell>
);

export default AdminPage;
