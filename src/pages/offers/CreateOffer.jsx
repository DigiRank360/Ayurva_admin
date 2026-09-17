import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateOffer } from '@/hooks/useOffers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';

export default function CreateOffer() {
    const navigate = useNavigate();
    const createMutation = useCreateOffer();

    const [formData, setFormData] = useState({
        title: '',
        code: '',
        discountType: 'percentage',
        discountValue: '',
        minOrderAmount: '',
        maxDiscount: '',
        endDate: '',
        usageLimit: '',
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Title is required';
        if (!formData.code.trim()) newErrors.code = 'Coupon code is required';
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
            code: formData.code.toUpperCase(),
            discountValue: parseFloat(formData.discountValue),
            minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : 0,
            maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : undefined,
            usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
        };

        try {
            await createMutation.mutateAsync(offerData);
            navigate('/offers');
        } catch (error) {
            console.error('Failed to create offer:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-8 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Add an offer</h1>
                    </div>
                    <div className="flex gap-3">
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
                            disabled={createMutation.isLoading}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            {createMutation.isLoading ? 'Creating...' : 'Add offer'}
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
                                                placeholder="e.g., Summer Sale 2024"
                                                className={`border-gray-300 ${errors.title ? 'border-red-500' : ''}`}
                                            />
                                            {errors.title && <p className="text-sm text-red-500 mt-1">{errors.title}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="code" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Coupon code <span className="text-red-500">*</span>
                                            </Label>
                                            <Input
                                                id="code"
                                                name="code"
                                                value={formData.code}
                                                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                                placeholder="e.g., SUMMER50"
                                                className={`border-gray-300 font-mono ${errors.code ? 'border-red-500' : ''}`}
                                            />
                                            {errors.code && <p className="text-sm text-red-500 mt-1">{errors.code}</p>}
                                            <p className="text-xs text-gray-500 mt-2">Must be unique, will be auto-converted to uppercase</p>
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
                                            <Label htmlFor="discountType" className="text-sm font-medium text-gray-700 mb-2 block">
                                                Discount type <span className="text-red-500">*</span>
                                            </Label>
                                            <select
                                                id="discountType"
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                            >
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="fixed">Fixed Amount (₹)</option>
                                            </select>
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
                                                    placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                                                    className={`border-gray-300 ${errors.discountValue ? 'border-red-500' : ''}`}
                                                    min="0"
                                                    step={formData.discountType === 'percentage' ? '1' : '0.01'}
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
                                                        placeholder="500"
                                                        className="border-gray-300"
                                                        min="0"
                                                    />
                                                    <p className="text-xs text-gray-500 mt-2">Optional cap on discount</p>
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
                                                placeholder="0"
                                                className="border-gray-300"
                                                min="0"
                                            />
                                            <p className="text-xs text-gray-500 mt-2">Leave 0 for no minimum</p>
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
                                                    min={new Date().toISOString().split('T')[0]}
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
                                                    placeholder="Unlimited"
                                                    className="border-gray-300"
                                                    min="1"
                                                />
                                                <p className="text-xs text-gray-500 mt-2">Leave empty for unlimited</p>
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
                                                {formData.code || 'COUPON'}
                                            </p>
                                            <p className="text-sm text-gray-600 mb-3">
                                                {formData.title || 'Offer Title'}
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
                                    <h3 className="text-sm font-semibold text-gray-900 mb-3">Offer Tips</h3>
                                    <ul className="text-xs text-gray-600 space-y-2">
                                        <li>• Use unique, memorable codes</li>
                                        <li>• Set appropriate min order amounts</li>
                                        <li>• Cap percentage discounts if needed</li>
                                        <li>• Limit usage for exclusive offers</li>
                                        <li>• Track performance regularly</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
