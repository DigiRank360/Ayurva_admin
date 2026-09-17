import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBanners, useDeleteBanner, useToggleBanner } from '@/hooks/useBanners';
import { Button } from '@/components/ui/button';
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
import { Plus, Edit, Trash2, Image as ImageIcon, Eye, EyeOff } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

export default function BannerList() {
    const navigate = useNavigate();
    const { data: banners = [], isLoading } = useBanners();
    const deleteMutation = useDeleteBanner();
    const toggleMutation = useToggleBanner();

    const [deleteDialog, setDeleteDialog] = useState({ open: false, banner: null });

    const handleDelete = async () => {
        if (deleteDialog.banner) {
            await deleteMutation.mutateAsync(deleteDialog.banner._id);
            setDeleteDialog({ open: false, banner: null });
        }
    };

    const handleToggle = async (id) => {
        await toggleMutation.mutateAsync(id);
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
                        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {banners.length} {banners.length === 1 ? 'banner' : 'banners'}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/banners/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Banner
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {banners.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">No banners found</p>
                            <p className="text-sm text-gray-500 mb-4">Get started by creating a new banner</p>
                            <Button
                                onClick={() => navigate('/banners/create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Banner
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 border-b border-gray-200">
                                    <TableHead className="text-xs font-semibold text-gray-700">Preview</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700">Title</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700">Link</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Order</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Status</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Dates</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.map((banner) => (
                                    <TableRow key={banner._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <TableCell className="py-4">
                                            <img
                                                src={getImageUrl(banner.imageUrl)}
                                                alt={banner.title}
                                                className="w-32 h-10 object-cover rounded border border-gray-200"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">
                                            {banner.title || <span className="text-gray-400 italic">(No Title)</span>}
                                        </TableCell>
                                        <TableCell className="text-gray-600 text-sm max-w-xs truncate">
                                            {banner.link || '-'}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="border-gray-300 text-gray-700">
                                                {banner.displayOrder}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleToggle(banner._id)}
                                                disabled={toggleMutation.isLoading}
                                                className="p-0"
                                            >
                                                {banner.isActive ? (
                                                    <Badge className="bg-green-100 text-green-700 border-0">
                                                        <Eye className="h-3 w-3 mr-1" />
                                                        Active
                                                    </Badge>
                                                ) : (
                                                    <Badge className="bg-gray-100 text-gray-700 border-0">
                                                        <EyeOff className="h-3 w-3 mr-1" />
                                                        Inactive
                                                    </Badge>
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-center text-xs text-gray-600">
                                            <div>{new Date(banner.startDate).toLocaleDateString()}</div>
                                            {banner.endDate && (
                                                <div className="text-gray-400">to {new Date(banner.endDate).toLocaleDateString()}</div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/banners/edit/${banner._id}`)}
                                                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteDialog({ open: true, banner })}
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
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, banner: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Banner</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.banner?.title}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, banner: null })}
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
