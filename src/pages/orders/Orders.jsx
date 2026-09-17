import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/adminAPI';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';

export default function Orders() {
    const [page, setPage] = useState(1);

    const { data, isLoading } = useQuery({
        queryKey: ['adminOrders', page],
        queryFn: () => adminAPI.getAllOrders({ page, limit: 10 }),
        keepPreviousData: true
    });

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
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Orders Management</h1>
            </div>

            <Card className="border-2 border-gray-100 shadow-xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-100">
                    <CardTitle className="text-gray-800">All Orders</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="text-center py-10 font-semibold text-gray-500 animate-pulse">Loading orders...</div>
                    ) : (
                        <>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50/50">
                                            <TableHead className="font-bold">Order ID</TableHead>
                                            <TableHead className="font-bold">Date</TableHead>
                                            <TableHead className="font-bold">Customer</TableHead>
                                            <TableHead className="font-bold">Total</TableHead>
                                            <TableHead className="font-bold">Payment</TableHead>
                                            <TableHead className="font-bold">Status</TableHead>
                                            <TableHead className="text-right font-bold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data?.orders?.map((order) => (
                                            <TableRow key={order._id} className="hover:bg-purple-50/30 transition-colors">
                                                <TableCell className="font-medium text-purple-700">
                                                    {order._id.substring(order._id.length - 8).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="text-gray-600 font-medium">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-semibold text-gray-800">{order.shippingAddress?.name || order.user?.name || 'Unknown'}</TableCell>
                                                <TableCell className="font-black text-gray-900">₹{order.totalPrice.toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={order.paymentStatus === 'Paid' ? 'border-emerald-200 text-emerald-700 bg-emerald-50' : 'border-amber-200 text-amber-700 bg-amber-50'}>
                                                        {order.paymentMethod} - {order.paymentStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getStatusBadge(order.orderStatus)}>
                                                        {order.orderStatus}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link to={`/orders/${order._id}`}>
                                                        <Button variant="ghost" size="icon" className="hover:bg-purple-100 hover:text-purple-700 border border-transparent hover:border-purple-200">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {data?.orders?.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-12 text-gray-500 font-semibold text-lg">
                                                    No orders found
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Pagination */}
                            {data?.pages > 1 && (
                                <div className="flex justify-center flex-wrap gap-2 p-6 border-t border-gray-100 bg-white">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === 1}
                                        onClick={() => setPage(page - 1)}
                                    >
                                        Previous
                                    </Button>
                                    {[...Array(data?.pages)].map((_, i) => (
                                        <Button
                                            key={i}
                                            variant={page === i + 1 ? 'default' : 'outline'}
                                            size="sm"
                                            className={page === i + 1 ? 'bg-purple-600 hover:bg-purple-700' : ''}
                                            onClick={() => setPage(i + 1)}
                                        >
                                            {i + 1}
                                        </Button>
                                    ))}
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={page === data?.pages}
                                        onClick={() => setPage(page + 1)}
                                    >
                                        Next
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
