import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderAPI } from '@/lib/orderAPI';
import { getImageUrl } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeft, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const [manualStatus, setManualStatus] = useState('');

    const { data: order, isLoading } = useQuery({
        queryKey: ['order', id],
        queryFn: () => orderAPI.getById(id)
    });

    const processMutation = useMutation({
        mutationFn: () => orderAPI.process(id),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Order moved to Processing' });
            queryClient.invalidateQueries(['order', id]);
        },
        onError: (err) => {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to process order', variant: 'destructive' });
        }
    });

    const shipMutation = useMutation({
        mutationFn: () => orderAPI.ship(id, { trackingNumber: 'TRK' + Date.now() }), // placeholder tracking
        onSuccess: () => {
            toast({ title: 'Success', description: 'Order marked as Shipped' });
            queryClient.invalidateQueries(['order', id]);
        },
        onError: (err) => {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to ship order', variant: 'destructive' });
        }
    });

    const deliverMutation = useMutation({
        mutationFn: () => orderAPI.deliver(id),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Order marked as Delivered' });
            queryClient.invalidateQueries(['order', id]);
        },
        onError: (err) => {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to deliver order', variant: 'destructive' });
        }
    });

    const cancelMutation = useMutation({
        mutationFn: () => orderAPI.cancel(id, 'Admin Cancelled'),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Order Cancelled' });
            queryClient.invalidateQueries(['order', id]);
        },
        onError: (err) => {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to cancel order', variant: 'destructive' });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: (status) => orderAPI.updateStatus(id, status),
        onSuccess: () => {
            toast({ title: 'Success', description: 'Order status updated manually' });
            setManualStatus('');
            queryClient.invalidateQueries(['order', id]);
        },
        onError: (err) => {
            toast({ title: 'Error', description: err.response?.data?.message || 'Failed to update order status', variant: 'destructive' });
        }
    });

    if (isLoading) return <div className="text-center py-20 animate-pulse text-lg font-bold text-gray-500">Loading order details...</div>;
    if (!order) return <div className="text-center py-20 text-red-500 font-bold">Order not found</div>;

    const getStatusBadge = (status) => {
        const badges = {
            'Delivered': 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
            'Processing': 'bg-amber-100 text-amber-700 hover:bg-amber-200',
            'Shipped': 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            'Pending': 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            'Cancelled': 'bg-red-100 text-red-700 hover:bg-red-200',
        };
        return badges[status] || badges['Pending'];
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => navigate('/orders')} className="border-2 border-gray-200 hover:bg-gray-100 shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-gray-700" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Order Details</h1>
                        <p className="text-gray-500 font-medium">ID: <span className="text-purple-600 tracking-wider font-bold">{order._id.toUpperCase()}</span></p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-2">
                    {order.orderStatus === 'Pending' && (
                        <Button onClick={() => processMutation.mutate()} disabled={processMutation.isPending} className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition-all hover:-translate-y-1">
                            <Package className="w-4 h-4 mr-2" /> Process Order
                        </Button>
                    )}
                    {order.orderStatus === 'Processing' && (
                        <Button onClick={() => shipMutation.mutate()} disabled={shipMutation.isPending} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-all hover:-translate-y-1">
                            <Truck className="w-4 h-4 mr-2" /> Ship Order
                        </Button>
                    )}
                    {order.orderStatus === 'Shipped' && (
                        <Button onClick={() => deliverMutation.mutate()} disabled={deliverMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg transition-all hover:-translate-y-1">
                            <CheckCircle className="w-4 h-4 mr-2" /> Mark Delivered
                        </Button>
                    )}
                    {!['Delivered', 'Cancelled'].includes(order.orderStatus) && (
                        <Button variant="outline" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="border-red-200 text-red-600 hover:bg-red-50 transition-all">
                            <XCircle className="w-4 h-4 mr-2" /> Cancel Order
                        </Button>
                    )}
                </div>
            </div>

            {/* Manual Status Overwrite */}
            <div className="bg-white p-4 rounded-xl border-2 border-slate-100 shadow-sm flex items-center gap-3">
                <span className="text-sm font-bold text-slate-600">Manual Status Override:</span>
                <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value)}
                    className="border-2 border-slate-200 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-700 outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                >
                    <option value="" disabled>Select Status...</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                </select>
                <Button
                    disabled={!manualStatus || updateStatusMutation.isPending}
                    onClick={() => updateStatusMutation.mutate(manualStatus)}
                    size="sm"
                    className="bg-slate-800 hover:bg-slate-700 text-white"
                >
                    Apply Update
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="border-2 border-purple-100 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                            <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-purple-600" /> Ordered Items</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                {order.orderItems.map((item, index) => (
                                    <div key={index} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                                            <img src={getImageUrl(item.image)} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                                            <p className="text-xs text-purple-600 font-semibold tracking-wider">SKU: {item.product}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-black text-xl text-gray-800">₹{item.price.toLocaleString()}</p>
                                            <div className="mt-1 inline-flex bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-600">
                                                Qty: {item.qty}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-indigo-100 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100">
                            <CardTitle className="flex items-center gap-2"><Truck className="w-5 h-5 text-indigo-600" /> Shipping & Finance</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="uppercase tracking-widest text-xs font-black text-indigo-400 mb-3">Shipping Details</h3>
                                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-2 text-indigo-900">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-lg">{order.shippingAddress.name || order.user?.name}</p>
                                        {order.shippingAddress.type && (
                                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                                                {order.shippingAddress.type}
                                            </span>
                                        )}
                                    </div>
                                    <p className="font-medium text-sm">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                                    <p className="font-medium text-sm text-indigo-700">
                                        {order.shippingAddress.state ? `${order.shippingAddress.state}, ` : ''}{order.shippingAddress.country} - {order.shippingAddress.postalCode}
                                    </p>
                                    {(order.shippingAddress.phone || order.user?.phone) && (
                                        <p className="text-sm font-bold text-indigo-700 mt-2 pt-2 border-t border-indigo-100">
                                            Phone: {order.shippingAddress.phone || order.user?.phone}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className="uppercase tracking-widest text-xs font-black text-indigo-400 mb-3">Payment Summary</h3>
                                <div className="space-y-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex justify-between text-sm font-semibold text-gray-600">
                                        <span>Subtotal:</span>
                                        <span className="text-gray-900">₹{order.itemsPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold text-gray-600">
                                        <span>Shipping:</span>
                                        <span className={order.shippingPrice === 0 ? "text-emerald-600 font-bold" : "text-gray-900"}>
                                            {order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm font-semibold text-gray-600 border-b border-gray-200 pb-3">
                                        <span>Tax:</span>
                                        <span className="text-gray-900">₹{order.taxPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="pt-1 flex justify-between items-center text-xl font-black">
                                        <span className="text-gray-800">Total:</span>
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                                            ₹{order.totalPrice.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-2 border-emerald-100 shadow-lg relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <CardHeader className="border-b border-emerald-100 relative z-10">
                            <CardTitle className="text-gray-800">Status Tracking</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-5 relative z-10">
                            <div>
                                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Order Status</p>
                                <Badge className={`px-4 py-1.5 text-sm ${getStatusBadge(order.orderStatus)}`}>
                                    {order.orderStatus}
                                </Badge>
                                {order.trackingNumber && (
                                    <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold">
                                        <Truck className="w-4 h-4" /> TRK: {order.trackingNumber}
                                    </div>
                                )}
                            </div>
                            <div className="border-t border-emerald-100 pt-4">
                                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Payment Method</p>
                                <Badge variant="outline" className="border-2 font-bold px-4 py-1.5 text-sm">{order.paymentMethod}</Badge>
                            </div>
                            <div className="border-t border-emerald-100 pt-4">
                                <p className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">Payment Status</p>
                                <Badge className={`px-4 py-1.5 text-sm font-bold ${order.paymentStatus === 'Paid' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-md' : 'bg-amber-500 hover:bg-amber-600 shadow-md'} text-white`}>
                                    {order.paymentStatus}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-2 border-orange-100 shadow-lg">
                        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-orange-100">
                            <CardTitle className="text-gray-800">Customer Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-black text-xl shadow-md">
                                    {order.user?.name?.charAt(0) || 'U'}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg leading-tight">{order.user?.name || 'Unknown User'}</p>
                                </div>
                            </div>
                            <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                <p className="text-orange-900 font-medium truncate">{order.user?.email || 'No email provided'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
