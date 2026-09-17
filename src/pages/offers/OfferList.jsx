import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOffers, useDeleteOffer } from '@/hooks/useOffers';
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
import { Plus, Edit, Trash2, Ticket, Percent, IndianRupee } from 'lucide-react';

export default function OfferList() {
    const navigate = useNavigate();
    const { data: offers = [], isLoading } = useOffers();
    const deleteMutation = useDeleteOffer();

    const [deleteDialog, setDeleteDialog] = useState({ open: false, offer: null });

    const handleDelete = async () => {
        if (deleteDialog.offer) {
            await deleteMutation.mutateAsync(deleteDialog.offer._id);
            setDeleteDialog({ open: false, offer: null });
        }
    };

    const isOfferActive = (offer) => {
        const now = new Date();
        const startDate = new Date(offer.startDate);
        const endDate = new Date(offer.endDate);
        return offer.isActive && now >= startDate && now <= endDate;
    };

    const isOfferExpired = (offer) => {
        const now = new Date();
        const endDate = new Date(offer.endDate);
        return now > endDate;
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
                        <h1 className="text-2xl font-bold text-gray-900">Offers & Coupons</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {offers.length} {offers.length === 1 ? 'offer' : 'offers'}
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate('/offers/create')}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Offer
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-8 py-8">
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    {offers.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Ticket className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-900 font-medium mb-1">No offers found</p>
                            <p className="text-sm text-gray-500 mb-4">Get started by creating a new offer</p>
                            <Button
                                onClick={() => navigate('/offers/create')}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Add Offer
                            </Button>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 border-b border-gray-200">
                                    <TableHead className="text-xs font-semibold text-gray-700">Code</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700">Title</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Discount</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Min Order</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Usage</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Status</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-center">Valid Until</TableHead>
                                    <TableHead className="text-xs font-semibold text-gray-700 text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {offers.map((offer) => (
                                    <TableRow key={offer._id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <TableCell className="font-mono font-bold text-blue-600">
                                            {offer.code}
                                        </TableCell>
                                        <TableCell className="font-medium text-gray-900">
                                            {offer.title}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm font-semibold">
                                                {offer.discountType === 'percentage' ? (
                                                    <>
                                                        <Percent className="h-3 w-3" />
                                                        {offer.discountValue}%
                                                    </>
                                                ) : (
                                                    <>
                                                        <IndianRupee className="h-3 w-3" />
                                                        {offer.discountValue}
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center text-gray-600">
                                            ₹{offer.minOrderAmount}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-sm text-gray-600">
                                                {offer.usedCount}/{offer.usageLimit || '∞'}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {isOfferExpired(offer) ? (
                                                <Badge className="bg-gray-100 text-gray-700 border-0">Expired</Badge>
                                            ) : isOfferActive(offer) ? (
                                                <Badge className="bg-green-100 text-green-700 border-0">Active</Badge>
                                            ) : offer.isActive ? (
                                                <Badge className="bg-blue-100 text-blue-700 border-0">Scheduled</Badge>
                                            ) : (
                                                <Badge className="bg-red-100 text-red-700 border-0">Inactive</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-xs text-gray-600">
                                            {new Date(offer.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => navigate(`/offers/edit/${offer._id}`)}
                                                    className="text-gray-600 hover:text-blue-600 hover:bg-blue-50"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setDeleteDialog({ open: true, offer })}
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
            <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, offer: null })}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Offer</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete "{deleteDialog.offer?.code}"? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialog({ open: false, offer: null })}
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
