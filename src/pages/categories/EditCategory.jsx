import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Upload, Trash2, X } from 'lucide-react';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import ImageCropper from '@/components/ImageCropper';

export default function EditCategory() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: category, isLoading } = useCategory(id);
    const updateMutation = useUpdateCategory();
    const deleteMutation = useDeleteCategory();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        displayOrder: 0,
        isActive: true,
    });

    const [errors, setErrors] = useState({});
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                description: category.description || '',
                imageUrl: category.imageUrl || '',
                displayOrder: category.displayOrder || 0,
                isActive: category.isActive !== undefined ? category.isActive : true,
            });
        }
    }, [category]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, image: 'Only image files are allowed (JPEG, PNG, GIF, WEBP)' }));
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, image: 'Image size must be less than 5MB' }));
            return;
        }

        // Open cropper with selected image
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedFile) => {
        await handleUpload(croppedFile);
    };

    const handleUpload = async (file) => {
        const formDataToUpload = new FormData();
        formDataToUpload.append('image', file);

        setUploadingImage(true);
        try {
            const { data } = await api.post('/upload', formDataToUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Save only relative path, not full URL
            setFormData(prev => ({
                ...prev,
                imageUrl: data.imageUrl, // This is already "/uploads/image-123.jpg"
            }));
            setErrors(prev => ({ ...prev, image: '' }));
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                image: error.response?.data?.message || 'Failed to upload image'
            }));
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, imageUrl: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Category name is required';
        if (!formData.imageUrl) newErrors.image = 'Category image is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await updateMutation.mutateAsync({ id, data: formData });
            navigate('/categories');
        } catch (error) {
            console.error('Failed to update category:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(id);
            navigate('/categories');
        } catch (error) {
            console.error('Failed to delete category:', error);
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

    if (!category) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Category not found</p>
                    <Button onClick={() => navigate('/categories')}>Back to Categories</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Edit category</h1>
                        <p className="text-sm text-gray-500 mt-1">Update category information</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setDeleteDialog(true)}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/categories')}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={updateMutation.isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {updateMutation.isLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Main Information */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Basic Information</h3>

                                    <div className="space-y-5">
                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Category name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Sarees, Suits, Lehengas"
                                                className={`border-gray-300 ${errors.name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Enter category description..."
                                                rows={6}
                                                className="border-gray-300 resize-none"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="displayOrder" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Display order
                                            </Label>
                                            <Input
                                                id="displayOrder"
                                                name="displayOrder"
                                                type="number"
                                                value={formData.displayOrder}
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="border-gray-300"
                                                min="0"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Lower numbers appear first</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Category Image */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Category Image  <span className="text-red-500">*</span></h3>

                                    {formData.imageUrl ? (
                                        <div className="relative max-w-sm mx-auto">
                                            <img
                                                src={getImageUrl(formData.imageUrl)}
                                                alt={formData.name}
                                                className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                                            />
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                onClick={removeImage}
                                                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700"
                                            >
                                                <X className="h-4 w-4 mr-1" />
                                                Remove
                                            </Button>
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="imageUpload"
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer block"
                                            >
                                                {uploadingImage ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                                        <p className="text-sm text-gray-600">Uploading...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            Drag your image here, or <span className="text-blue-600 font-medium">Browse</span>
                                                        </p>
                                                        <p className="text-xs text-gray-400">Supports: JPG, PNG, GIF, WEBP (Max: 5MB)</p>
                                                        <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-wider">Note: Image will be cropped to square (1:1)</p>
                                                    </>
                                                )}
                                            </label>
                                            {errors.image && <p className="text-sm text-red-500 mt-2 text-center">{errors.image}</p>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Settings */}
                        <div className="space-y-6">
                            {/* Status */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Status</h3>

                                    <div className="flex items-center gap-3">
                                        <input
                                            id="isActive"
                                            name="isActive"
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                        <Label htmlFor="isActive" className="text-sm font-medium text-gray-700 cursor-pointer">
                                            Active (Show on website)
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Info Card */}
                            <Card className="border-gray-200 shadow-sm bg-blue-50">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Tips</h3>
                                    <ul className="text-xs text-gray-600 space-y-2">
                                        <li>• Use square images for best vertical fit</li>
                                        <li>• Changes are saved immediately</li>
                                        <li>• Upload new image to replace current</li>
                                        <li>• Inactive categories won't show on website</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            {/* Image Cropper */}
            <ImageCropper
                open={cropperOpen}
                onClose={() => setCropperOpen(false)}
                imageSrc={selectedImage}
                onCropComplete={handleCropComplete}
                aspectRatio={1} // Square crop for categories
                targetWidth={800}
                targetHeight={800}
                title="Crop Category Image"
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Category</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{category.name}"? This action cannot be undone
                            and may affect related products.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog(false)}
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
