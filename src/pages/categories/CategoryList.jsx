import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategories, useDeleteCategory } from '@/hooks/useCategories';
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
import { Plus, Search, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export default function CategoryList() {
    const navigate = useNavigate();
    const { data: categories = [], isLoading } = useCategories();
    const deleteMutation = useDeleteCategory();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState('all');
    const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

    const filteredCategories = categories.filter((category) => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filterActive === 'all' ||
            (filterActive === 'active' && category.isActive) ||
            (filterActive === 'inactive' && !category.isActive);
        return matchesSearch && matchesFilter;
    });

    const handleDelete = async () => {
        if (deleteDialog.category) {
            await deleteMutation.mutateAsync(deleteDialog.category._id);
            setDeleteDialog({ open: false, category: null });
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
                        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/categories/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Category
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
                                placeholder="Search categories..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 border-gray-300"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterActive === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterActive('all')}
                                size="sm"
                                className={filterActive === 'all' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300'}
                            >
                                All
                            </Button>
                            <Button
                                variant={filterActive === 'active' ? 'default' : 'outline'}
                                onClick={() => setFilterActive('active')}
                                size="sm"
                                className={filterActive === 'active' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300'}
                            >
                                Active
                            </Button>
                            <Button
                                variant={filterActive === 'inactive' ? 'default' : 'outline'}
                                onClick={() => setFilterActive('inactive')}
                                size="sm"
                                className={filterActive === 'inactive' ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-300'}
                            >
                                Inactive
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {filteredCategories.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">No categories found</p>
                            <p className="text-sm text-gray-500 mb-4">Get started by creating a new category</p>
                            <Button
                                onClick={() => navigate('/categories/create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Category
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 border-b border-gray-200">
                                    <TableHead className="text-xs font-semibold text-gray-700">Image</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700">Name</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700">Description</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Order</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Status</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCategories.map((category) => (
                                    <TableRow key={category._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <TableCell className="py-4">
                                            {category.imageUrl ? (
                                                <img
                                                    src={getImageUrl(category.imageUrl)}
                                                    alt={category.name}
                                                    className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                                    <ImageIcon className="h-6 w-6 text-gray-400" />
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">{category.name}</TableCell>
                                        <TableCell className="text-gray-600 text-sm max-w-md truncate">
                                            {category.description || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="border-gray-300 text-gray-700">
                                                {category.displayOrder}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge
                                                className={
                                                    category.isActive
                                                        ? 'bg-green-100 text-green-700 border-0'
                                                        : 'bg-gray-100 text-gray-700 border-0'
                                                }
                                            >
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/categories/edit/${category._id}`)}
                                                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteDialog({ open: true, category })}
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
                    )}
                </div>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, category: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.category?.name}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, category: null })}
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
