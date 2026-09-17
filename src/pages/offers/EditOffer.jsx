import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOffer, useUpdateOffer, useDeleteOffer } from '@/hooks/useOffers';
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
import { Trash2 } from 'lucide-react';

export default function EditOffer() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { data: offer, isLoading } = useOffer(id);
    const updateMutation = useUpdateOffer();
    const deleteMutation = useDeleteOffer();

    const [formData, setFormData] = useState({
        title: '',
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        endDate: '',
        usageLimit: '',
        isActive: true,
    });

    const [errors, setErrors] = useState({});
    const [deleteDialog, setDeleteDialog] = useState(false);

    useEffect(() => {
        if (offer) {
            setFormData({
                title: offer.title || '',
                code: offer.code || '',
                discountType: offer.discountType || 'percentage',
                discountValue: offer.discountValue?.toString() || '',
                minOrderAmount: offer.minOrderAmount?.toString() || '',
                maxDiscount: offer.maxDiscount?.toString() || '',
                endDate: offer.endDate ? new Date(offer.endDate).toISOString().split('T')[0] : '',
                usageLimit: offer.usageLimit?.toString() || '',
                isActive: offer.isActive ?? true,
            });
        }
    }, [offer]);

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

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.discountValue) newErrors.discountValue = 'Discount value is required';
        if (!formData.endDate) newErrors.endDate = 'End date is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        const offerData = {
            ...formData,
            discountValue: parseFloat(formData.discountValue),
            minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        };

        try {
            await updateMutation.mutateAsync({ id, data: offerData });
            navigate('/offers');
        } catch (error) {
            console.error('Failed to update offer:', error);
        }
    };

    const handleDelete = async () => {
        try {
            await deleteMutation.mutateAsync(id);
            navigate('/offers');
        } catch (error) {
            console.error('Failed to delete offer:', error);
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

    if (!offer) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-500 mb-4">Offer not found</p>
                    <Button onClick={() => navigate('/offers')}>Back to Offers</Button>
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
                        <h1 className="text-2xl font-bold text-gray-900">Edit offer</h1>
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
                            onClick={() => navigate('/offers')}
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
                                                Offer title <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="title"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleChange}
                                                className={`border-gray-300 ${errors.title ? 'border-red-500' : ''}`}
                                            />
                                            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="code" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Coupon code
                                            </Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                value={formData.code}
                                                disabled
                                                className="border-gray-300 font-mono bg-gray-50"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Code cannot be changed after creation</p>
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
                                                Active (Available for use)
                                            </Label>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Discount Details */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Discount Details</h3>

                                    <div className="space-y-5">
                                        <div>
                                            <Label className="text-sm font-medium text-gray-700 mb-2 block">
                                                Discount type
                                            </Label>
                                            <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm">
                                                {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Fixed Amount (₹)'}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-2">Type cannot be changed after creation</p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <Label htmlFor="discountValue" className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Discount value <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="discountValue"
                                                    name="discountValue"
                                                    type="number"
                                                    value={formData.discountValue}
                                                    onChange={handleChange}
                                                    className={`border-gray-300 ${errors.discountValue ? 'border-red-500' : ''}`}
                                                    min="0"
                                                />
                                                {errors.discountValue && <p className="text-sm text-red-500 mt-1">{errors.discountValue}</p>}
                                            </div>

                                            {formData.discountType === 'percentage' && (
                                                <div>
                                                    <Label htmlFor="maxDiscount" className="text-sm font-medium text-gray-700 mb-2 block">
                                                        Max discount (₹)
                                                    </Label>
                                                    <Input
                                                        id="maxDiscount"
                                                        name="maxDiscount"
                                                        type="number"
                                                        value={formData.maxDiscount}
                                                        onChange={handleChange}
                                                        className="border-gray-300"
                                                        min="0"
                                                    />
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="minOrderAmount" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Minimum order amount (₹)
                                            </Label>
                                            <Input
                                                id="minOrderAmount"
                                                name="minOrderAmount"
                                                type="number"
                                                value={formData.minOrderAmount}
                                                onChange={handleChange}
                                                className="border-gray-300"
                                                min="0"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Usage & Validity */}
                            <Card className="border-gray-200 shadow-sm">
                                <CardContent className="p-6">
                                    <h3 className="text-base font-semibold text-gray-900 mb-6">Usage & Validity</h3>

                                    <div className="space-y-5">
                                        <div className="grid grid-cols-2 gap-5">
                                            <div>
                                                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700 mb-2 block">
                                                    End date <span className="text-red-500">*</span>
                                                </Label>
                                                <Input
                                                    id="endDate"
                                                    name="endDate"
                                                    type="date"
                                                    value={formData.endDate}
                                                    onChange={handleChange}
                                                    className={`border-gray-300 ${errors.endDate ? 'border-red-500' : ''}`}
                                                />
                                                {errors.endDate && <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>}
                                            </div>

                                            <div>
                                                <Label htmlFor="usageLimit" className="text-sm font-medium text-gray-700 mb-2 block">
                                                    Usage limit
                                                </Label>
                                                <Input
                                                    id="usageLimit"
                                                    name="usageLimit"
                                                    type="number"
                                                    value={formData.usageLimit}
                                                    onChange={handleChange}
                                                    className="border-gray-300"
                                                    min="1"
                                                />
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-gray-600">Times used:</span>
                                                    <span className="font-semibold text-gray-900 ml-2">{offer.usedCount || 0}</span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-600">Created:</span>
                                                    <span className="font-semibold text-gray-900 ml-2">
                                                        {new Date(offer.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            {/* Preview */}
                            <Card className="border-gray-200 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Coupon Preview</h3>
                                    <div className="bg-white rounded-lg p-4 border-2 border-dashed border-blue-300">
                                        <div className="text-center">
                                            <p className="text-2xl font-bold font-mono text-blue-600 mb-2">
                                                {formData.code}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {formData.title}
                                            </p>
                                            <div className="bg-green-100 text-green-700 rounded-md py-2 px-3 inline-block font-bold">
                                                {formData.discountType === 'percentage'
                                                    ? `${formData.discountValue || 0}% OFF`
                                                    : `₹${formData.discountValue || 0} OFF`
                                                }
                                            </div>
                                            {formData.minOrderAmount > 0 && (
                                                <p className="text-xs text-gray-500 mt-3">
                                                    Min order: ₹{formData.minOrderAmount}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Tips */}
                            <Card className="border-gray-200 shadow-sm bg-blue-50">
                                <CardContent className="p-6">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Update Tips</h3>
                                    <ul className="text-xs text-gray-600 space-y-2">
                                        <li>• Changes save immediately</li>
                                        <li>• Cannot edit code after creation</li>
                                        <li>• Toggle active status anytime</li>
                                        <li>• Monitor usage statistics</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            {/* Delete Dialog */}
            <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Offer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{offer.code}"? This action cannot be undone.
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
