import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProduct } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, X } from 'lucide-react';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import ImageCropper from '@/components/ImageCropper';

export default function CreateProduct() {
    const navigate = useNavigate();
    const createMutation = useCreateProduct();
    const { data: categories = [] } = useCategories();

    const [sections, setSections] = useState([
        { title: 'Product Details', content: '' },
        { title: 'Care Instructions', content: '' },
        { title: 'Shipping & Delivery Policy', content: '' }
    ]);

    const [formData, setFormData] = useState({
        sku: '',
        name: '',
        description: '',
        mrp: '',
        price: '',
        discount: '',
        categoryId: '',
        stock: '',
        images: [],
        availableSizes: [],
        availableColors: [],
        isTrending: false,
        isActive: true,
        isCODAvailable: true,
    });

    const [errors, setErrors] = useState({});
    const [uploadingImage, setUploadingImage] = useState(false);
    const [cropperOpen, setCropperOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);



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
            setErrors(prev => ({ ...prev, images: 'Only image files are allowed' }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, images: 'Image size must be less than 5MB' }));
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setSelectedImage(reader.result);
            setCropperOpen(true);
        };
        reader.readAsDataURL(file);

        // Clear input
        e.target.value = null;
    };

    const handleCropComplete = async (croppedFile) => {
        await handleUpload(croppedFile);
    };

    const handleUpload = async (file) => {
        setUploadingImage(true);
        try {
            const formDataToUpload = new FormData();
            formDataToUpload.append('image', file);

            const { data } = await api.post('/upload', formDataToUpload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, data.imageUrl],
            }));
            setErrors(prev => ({ ...prev, images: '' }));
        } catch (error) {
            setErrors(prev => ({
                ...prev,
                images: error.response?.data?.message || 'Failed to upload images'
            }));
        } finally {
            setUploadingImage(false);
        }
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const toggleSize = (size) => {
        setFormData(prev => ({
            ...prev,
            availableSizes: prev.availableSizes.includes(size)
                ? prev.availableSizes.filter(s => s !== size)
                : [...prev.availableSizes, size],
        }));
    };

    const toggleColor = (color) => {
        setFormData(prev => ({
            ...prev,
            availableColors: prev.availableColors.includes(color)
                ? prev.availableColors.filter(c => c !== color)
                : [...prev.availableColors, color],
        }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.price) newErrors.price = 'Price is required';
        if (!formData.categoryId) newErrors.categoryId = 'Category is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSectionChange = (index, field, value) => {
        const newSections = [...sections];
        newSections[index][field] = value;
        setSections(newSections);
    };

    const addSection = () => {
        setSections([...sections, { title: '', content: '' }]);
    };

    const removeSection = (index) => {
        const newSections = sections.filter((_, i) => i !== index);
        setSections(newSections);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const productData = {
            ...formData,
            additionalSections: sections,
            mrp: formData.mrp ? parseFloat(formData.mrp) : 0,
            price: parseFloat(formData.price),
            discount: formData.discount ? parseFloat(formData.discount) : 0,
            stock: parseInt(formData.stock) || 0,
        };

        try {
            await createMutation.mutateAsync(productData);
            navigate('/products');
        } catch (error) {
            console.error('Failed to create product:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add a product</h1>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/products')}
                            className="border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                            Discard
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={createMutation.isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {createMutation.isLoading ? 'Adding...' : 'Add product'}
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
                                            <Label htmlFor="sku" className="text-sm font-medium text-gray-700 mb-2 block">
                                                SKU (Stock Keeping Unit) <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="sku"
                                                name="sku"
                                                value={formData.sku}
                                                onChange={handleChange}
                                                placeholder="e.g. LUG-SAR-001"
                                                className={`border-gray-300 ${errors.sku ? 'border-red-500' : ''}`}
                                            />
                                            {errors.sku && <p className="text-sm text-red-500 mt-1">{errors.sku}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Product name <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                placeholder="e.g., Banarasi Silk Saree"
                                                className={`border-gray-300 ${errors.name ? 'border-red-500' : ''}`}
                                            />
                                            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Description <span className="text-red-500">*</span>
                                            </Label>
                                            <Textarea
                                                id="description"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleChange}
                                                placeholder="Enter product description..."
                                                rows={4}
                                                className={`border-gray-300 resize-none ${errors.description ? 'border-red-500' : ''}`}
                                            />
                                            {errors.description && <p className="text-sm text-red-500 mt-1">{errors.description}</p>}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Additional Information Sections (Dynamic) */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-base font-semibold text-gray-900">Additional Information Sections</h3>
                                        <Button type="button" onClick={addSection} variant="outline" size="sm" className="bg-gray-50 text-gray-700 hover:bg-gray-100">
                                            + Add Section
                                        </Button>
                                    </div>

                                    <div className="space-y-6">
                                        {sections.map((section, index) => (
                                            <div key={index} className="flex items-start gap-4 p-4 border border-gray-100 bg-gray-50 rounded-lg relative group">
                                                <button
                                                    type="button"
                                                    onClick={() => removeSection(index)}
                                                    className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove section"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                                <div className="w-full space-y-4">
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                                            Section Title ({index + 1})
                                                        </Label>
                                                        <Input
                                                            value={section.title}
                                                            onChange={(e) => handleSectionChange(index, 'title', e.target.value)}
                                                            placeholder="e.g. Material & Fit"
                                                            className="border-gray-300 bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                                            Section Content
                                                        </Label>
                                                        <Textarea
                                                            value={section.content}
                                                            onChange={(e) => handleSectionChange(index, 'content', e.target.value)}
                                                            placeholder="Enter section description here..."
                                                            rows={2}
                                                            className="border-gray-300 resize-none bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {sections.length === 0 && (
                                            <p className="text-sm text-gray-500 text-center py-4">No additional sections added.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Product Images */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Product Images</h3>

                                    {/* Image Grid */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-4 gap-4 mb-4">
                                            {formData.images.map((img, index) => (
                                                <div key={index} className="relative">
                                                    <img
                                                        src={getImageUrl(img)}
                                                        alt={`Product ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                                    />
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full bg-red-600 hover:bg-red-700"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Upload Area */}
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
                                                        Drag your images here, or <span className="text-blue-600 font-medium">Browse</span>
                                                    </p>
                                                    <p className="text-xs text-gray-400">Supports: JPG, PNG, GIF, WEBP (Max: 5MB each)</p>
                                                </>
                                            )}
                                        </label>
                                        {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Pricing */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Pricing</h3>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                                        <div>
                                            <Label htmlFor="mrp" className="text-sm font-medium text-gray-700 mb-2 block">
                                                MRP (Original Price)
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                                <Input
                                                    id="mrp"
                                                    name="mrp"
                                                    type="number"
                                                    value={formData.mrp}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className="pl-8 border-gray-300"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Offer Price <span className="text-red-500">*</span>
                                            </Label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                                <Input
                                                    id="price"
                                                    name="price"
                                                    type="number"
                                                    value={formData.price}
                                                    onChange={handleChange}
                                                    placeholder="0.00"
                                                    className={`pl-8 border-gray-300 ${errors.price ? 'border-red-500' : ''}`}
                                                />
                                            </div>
                                            {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="discount" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Discount (%)
                                            </Label>
                                            <Input
                                                id="discount"
                                                name="discount"
                                                type="number"
                                                value={formData.discount}
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="border-gray-300"
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="stock" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Stock
                                            </Label>
                                            <Input
                                                id="stock"
                                                name="stock"
                                                type="number"
                                                value={formData.stock}
                                                onChange={handleChange}
                                                placeholder="0"
                                                className="border-gray-300"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Variants */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Variants</h3>

                                    <div className="space-y-5">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Available Sizes (Press Enter to add)</Label>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.availableSizes.map(size => (
                                                    <span key={size} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-md text-sm flex items-center gap-2">
                                                        {size}
                                                        <button type="button" onClick={() => toggleSize(size)} className="text-blue-400 hover:text-red-500 transition-colors">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <Input
                                                type="text"
                                                placeholder="e.g. XL, 42, Free Size..."
                                                className="border-gray-300"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.target.value.trim();
                                                        if (val && !formData.availableSizes.includes(val)) toggleSize(val);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-3 block">Available Colors (Press Enter to add)</Label>
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {formData.availableColors.map(color => (
                                                    <span key={color} className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-md text-sm flex items-center gap-2">
                                                        {color}
                                                        <button type="button" onClick={() => toggleColor(color)} className="text-green-400 hover:text-red-500 transition-colors">
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </span>
                                                ))}
                                            </div>
                                            <Input
                                                type="text"
                                                placeholder="e.g. Navy Blue, Peach..."
                                                className="border-gray-300"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        const val = e.target.value.trim();
                                                        if (val && !formData.availableColors.includes(val)) toggleColor(val);
                                                        e.target.value = '';
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Category */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Category</h3>

                                    <div>
                                        <Label htmlFor="categoryId" className="text-sm font-medium text-gray-700 mb-2 block">
                                            Select category <span className="text-red-500">*</span>
                                        </Label>
                                        <select
                                            id="categoryId"
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleChange}
                                            className={`w-full px-3 py-2 border rounded-md text-sm ${errors.categoryId ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            <option value="">Select</option>
                                            {categories.map((cat) => (
                                                <option key={cat._id} value={cat._id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.categoryId && <p className="text-sm text-red-500 mt-1">{errors.categoryId}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Status & Visibility */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Status & Visibility</h3>

                                    <div className="space-y-4">
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

                                        <div className="flex items-center gap-3">
                                            <input
                                                id="isTrending"
                                                name="isTrending"
                                                type="checkbox"
                                                checked={formData.isTrending}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor="isTrending" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Mark as Trending (Appears on Homepage)
                                            </Label>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <input
                                                id="isCODAvailable"
                                                name="isCODAvailable"
                                                type="checkbox"
                                                checked={formData.isCODAvailable}
                                                onChange={handleChange}
                                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <Label htmlFor="isCODAvailable" className="text-sm font-medium text-gray-700 cursor-pointer">
                                                Cash on Delivery Available
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tips */}
                            <Card className="border-gray-200 shadow-sm bg-blue-50">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Product Tips</h3>
                                    <ul className="text-xs text-gray-600 space-y-2">
                                        <li>• Add multiple images for better visibility</li>
                                        <li>• Write detailed descriptions</li>
                                        <li>• Select appropriate category</li>
                                        <li>• Add size and color variants</li>
                                        <li>• Set competitive pricing</li>
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
                aspectRatio={3 / 4} // Vertical crop for fashion products
                targetWidth={900}
                targetHeight={1200}
                title="Crop Product Image"
            />
        </div>
    );
}
