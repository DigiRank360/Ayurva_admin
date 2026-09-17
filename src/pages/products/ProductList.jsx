import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Search, Edit, Trash2, Image as ImageIcon, Package } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export default function ProductList() {
    const navigate = useNavigate();
    const deleteMutation = useDeleteProduct();
    const { data: categories = [] } = useCategories();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [page, setPage] = useState(1);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, product: null });

    const { data: productsData, isLoading } = useProducts({
        page,
        limit: 20,
        search: searchTerm,
        category: filterCategory,
        active: filterActive === 'all' ? '' : filterActive === 'active' ? 'true' : 'false',
    });

    const products = productsData?.products || [];
    const totalPages = productsData?.pages || 1;

    const handleDelete = async () => {
        if (deleteDialog.product) {
            await deleteMutation.mutateAsync(deleteDialog.product._id);
            setDeleteDialog({ open: false, product: null });
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 space-y-6">
                <Skeleton className="h-10 w-64" />
                <Skeleton className="h-96" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-6">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {productsData?.total || 0} {productsData?.total === 1 ? 'product' : 'products'}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/products/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                {/* Filters */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 mb-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-gray-300"
                            />
                        </div>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[200px]"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <div className="flex gap-2">
                            <Button
                                variant={filterActive === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterActive('all')}
                                size="sm"
                                className={filterActive === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300'}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterActive === 'active' ? 'default' : 'outline'}
                                onClick={() => setFilterActive('active')}
                                size="sm"
                                className={filterActive === 'active' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300'}
                            >
                                Active
                            </Button>
                            <Button
                                variant={filterActive === 'inactive' ? 'default' : 'outline'}
                                onClick={() => setFilterActive('inactive')}
                                size="sm"
                                className={filterActive === 'inactive' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-300'}
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {products.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Package className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">No products found</p>
                            <p className="text-sm text-gray-500 mb-4">Get started by creating a new product</p>
                            <Button
                                onClick={() => navigate('/products/create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Product
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 border-b border-gray-200">
                                        <TableHead className="text-xs font-semibold text-gray-700">Image</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700">Name</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700">Category</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700 text-right">Price</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700 text-center">Stock</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700 text-center">Status</TableHead>
                                        <TableHead className="text-xs font-semibold text-gray-700 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product._id} className="border-b border-gray-100 hover:bg-gray-50">
                                            <TableCell className="py-4">
                                                {product.images && product.images.length > 0 ? (
                                                    <img
                                                        src={getImageUrl(product.images[0])}
                                                        alt={product.name}
                                                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                    />
                                                ) : (
                                                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                        <ImageIcon className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium text-gray-900">
                                                <div className="flex flex-col items-start gap-1">
                                                    <span>{product.name}</span>
                                                    <span className="text-xs text-gray-500 font-normal mb-1">SKU: {product.sku || 'N/A'}</span>
                                                    <div className="flex gap-2 flex-wrap">
                                                        {product.discount > 0 && (
                                                            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                                                                {product.discount}% OFF
                                                            </Badge>
                                                        )}
                                                        {product.isTrending && (
                                                            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                                                                Trending
                                                            </Badge>
                                                        )}
                                                        {product.isCODAvailable === false && (
                                                            <Badge variant="outline" className="bg-purple-50 text-purple-600 border-purple-200">
                                                                Prepaid Only
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-600 text-sm">
                                                {product.categoryName || '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-gray-900">
                                                ₹{product.price.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge variant="outline" className={`${product.stock > 10
                                                    ? 'border-green-300 text-green-700'
                                                    : product.stock > 0
                                                        ? 'border-yellow-300 text-yellow-700'
                                                        : 'border-red-300 text-red-700'
                                                    }`}>
                                                    {product.stock}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    className={
                                                        product.isActive
                                                            ? 'bg-green-100 text-green-700 border-0'
                                                            : 'bg-gray-100 text-gray-700 border-0'
                                                    }
                                                >
                                                    {product.isActive ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => navigate(`/products/edit/${product._id}`)}
                                                        className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteDialog({ open: true, product })}
                                                        className="text-gray-600 hover:text-red-600 hover:bg-red-50"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Page {page} of {totalPages}
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.max(1, p - 1))}
                                            disabled={page === 1}
                                            className="border-gray-300"
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                            disabled={page === totalPages}
                                            className="border-gray-300"
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Product</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.product?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, product: null })}
                            className="border-gray-300"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            disabled={deleteMutation.isLoading}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {deleteMutation.isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
