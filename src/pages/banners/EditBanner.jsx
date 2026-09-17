import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/useBanners';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Upload, X, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import ImageCropper from '@/components/ImageCropper';

export default function EditBanner() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: banner, isLoading } = useBanner(id);
    const updateMutation = useUpdateBanner();
    const deleteMutation = useDeleteBanner();

    const [formData, setFormData] = useState({
        title: '',
        imageUrl: '',
        mobileImageUrl: '',
        link: '',
        displayOrder: 0,
        isActive: true,
        startDate: '',
        endDate: '',
    });

    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [uploadingMobileImage, setUploadingMobileImage] = useState(false);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [cropType, setCropType] = useState('desktop');
    const [selectedImage, setSelectedImage] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState(false);

    useEffect(() => {
        if (banner) {
            setFormData({
                title: banner.title || '',
                imageUrl: banner.imageUrl || '',
                mobileImageUrl: banner.mobileImageUrl || '',
                link: banner.link || '',
                displayOrder: banner.displayOrder || 0,
                isActive: banner.isActive,
                startDate: banner.startDate ? new Date(banner.startDate).toISOString().split('T')[0] : '',
                endDate: banner.endDate ? new Date(banner.endDate).toISOString().split('T')[0] : '',
            });
        }
    }, [banner]);

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

    const handleFileSelect = (e, type = 'desktop') => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setErrors(prev => ({ ...prev, [type === 'desktop' ? 'image' : 'mobileImage']: 'Only image files are allowed' }));
            return;
        }

        // Validate file size (10MB for banners)
        if (file.size > 10 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, [type === 'desktop' ? 'image' : 'mobileImage']: 'Image size must be less than 10MB' }));
            return;
        }

        // Open cropper with selected image
        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropType(type);
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);
    };

    const handleCropComplete = async (croppedFile) => {
        await handleUpload(croppedFile, cropType);
    };

    const handleUpload = async (file, type = 'desktop') => {
        const formDataToUpload = new FormData();
        formDataToUpload.append('image', file);

        if (type === 'desktop') setUploadingImage(true);
        else setUploadingMobileImage(true);

        try {
            const { data } = await api.post('/upload', formDataToUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setFormData(prev => ({
                ...prev,
                [type === 'desktop' ? 'imageUrl' : 'mobileImageUrl']: data.imageUrl,
            }));
            setErrors(prev => ({ ...prev, [type === 'desktop' ? 'image' : 'mobileImage']: '' }));
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                [type === 'desktop' ? 'image' : 'mobileImage']: error.response?.data?.message || 'Failed to upload image'
            }));
        } finally {
            if (type === 'desktop') setUploadingImage(false);
            else setUploadingMobileImage(false);
        }
    };

    const removeImage = (type) => {
        if (type === 'desktop') {
            setFormData(prev => ({ ...prev, imageUrl: '' }));
            setErrors(prev => ({ ...prev, image: '' }));
        } else if (type === 'mobile') {
            setFormData(prev => ({ ...prev, mobileImageUrl: '' }));
            setErrors(prev => ({ ...prev, mobileImage: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.imageUrl) newErrors.image = 'Banner image is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            await updateMutation.mutateAsync({ id, data: formData });
            navigate('/banners');
        } catch (error) {
            console.error('Failed to update banner:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(id);
            navigate('/banners');
        } catch (error) {
            console.error('Failed to delete banner:', error);
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

    if (!banner) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Banner not found</p>
                    <Button onClick={() => navigate('/banners')}>Back to Banners</Button>
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
                        <h1 className="text-2xl font-bold text-gray-900">Edit banner</h1>
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
                            onClick={() => navigate('/banners')}
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
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Basic Information */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Basic Information</h3>

                                    <div className="space-y-5">
                                        <div>
                                            <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Banner title (Optional)
                                            </Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className="border-gray-300"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="link" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Link URL
                                            </Label>
                                            <Input
                                                id="link"
                                                name="link"
                                                type="url"
                                                value={formData.link}
                                                onChange={handleChange}
                                                className="border-gray-300"
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Start date
                                                </Label>
                                                <Input
                                                    id="startDate"
                                                    name="startDate"
                                                    type="date"
                                                    value={formData.startDate}
                                                    onChange={handleChange}
                                                    className="border-gray-300"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 block">
                                                    End date
                                                </Label>
                                                <Input
                                                    id="endDate"
                                                    name="endDate"
                                                    type="date"
                                                    value={formData.endDate}
                                                    onChange={handleChange}
                                                    className="border-gray-300"
                                                />
                                            </div>
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
                                                className="border-gray-300"
                                                min="0"
                                            />
                                        </div>

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
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Desktop Banner Image */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">
                                        Desktop Banner Image <span className="text-red-500">*</span>
                                    </h3>

                                    {formData.imageUrl ? (
                                        <div className="relative">
                                            <img
                                                src={getImageUrl(formData.imageUrl)}
                                                alt="Banner preview"
                                                className="w-full h-auto rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage('desktop')}
                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="file"
                                                id="imageUpload"
                                                accept="image/*"
                                                onChange={(e) => handleFileSelect(e, 'desktop')}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="imageUpload"
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-blue-400 transition-colors cursor-pointer block"
                                            >
                                                {uploadingImage ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                                        <p className="text-sm text-gray-600">Uploading...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            Desktop Image (1920x600px)
                                                        </p>
                                                        <p className="text-xs text-gray-400">Recommended 16:5 ratio</p>
                                                    </>
                                                )}
                                            </label>
                                            {errors.image && <p className="text-sm text-red-500 mt-2">{errors.image}</p>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Mobile Banner Image */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">
                                        Mobile Banner Image (Optional)
                                    </h3>

                                    {formData.mobileImageUrl ? (
                                        <div className="relative max-w-[250px] mx-auto">
                                            <img
                                                src={getImageUrl(formData.mobileImageUrl)}
                                                alt="Mobile banner preview"
                                                className="w-full h-auto rounded-lg border border-gray-200"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage('mobile')}
                                                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <input
                                                type="file"
                                                id="mobileImageUpload"
                                                accept="image/*"
                                                onChange={(e) => handleFileSelect(e, 'mobile')}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="mobileImageUpload"
                                                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center hover:border-blue-400 transition-colors cursor-pointer block"
                                            >
                                                {uploadingMobileImage ? (
                                                    <div className="flex flex-col items-center">
                                                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                                                        <p className="text-sm text-gray-600">Uploading...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Upload className="h-10 w-10 text-gray-400 mx-auto mb-4" />
                                                        <p className="text-sm text-gray-600 mb-1">
                                                            Mobile Image (e.g., 800x1000px)
                                                        </p>
                                                        <p className="text-xs text-gray-400">Recommended 4:5 or 1:1 ratio</p>
                                                    </>
                                                )}
                                            </label>
                                            {errors.mobileImage && <p className="text-sm text-red-500 mt-2">{errors.mobileImage}</p>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <Card className="border-gray-200 shadow-sm bg-blue-50">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Tips</h3>
                                    <ul className="text-xs text-gray-600 space-y-2">
                                        <li>• Upload Mobile image for better vertical fit</li>
                                        <li>• Recommended ratio: 16:5 (Desktop) & 4:5 (Mobile)</li>
                                        <li>• Mobile image is optional (defaults to Desktop)</li>
                                        <li>• Set display order for positioning</li>
                                        <li>• Leave title empty for image-only banners</li>
                                        <li>• Link applies to whole banner if no title</li>
                                        <li>• Update dates for campaigns</li>
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
                aspectRatio={cropType === 'desktop' ? 16 / 5 : 4 / 5}
                targetWidth={cropType === 'desktop' ? 1920 : 800}
                targetHeight={cropType === 'desktop' ? 600 : 1000}
                title={cropType === 'desktop' ? "Crop Desktop Banner" : "Crop Mobile Banner"}
            />

            {/* Delete Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Banner</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{banner.title}"? This action cannot be undone.
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
