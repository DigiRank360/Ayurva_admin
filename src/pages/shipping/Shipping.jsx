import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PackageCheck, Truck } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Shipping() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [manualOrder, setManualOrder] = useState(null);
    const [shipment, setShipment] = useState({ trackingNumber: '', courierName: '', courierPhone: '' });
    const ordersQuery = useQuery({ queryKey: ['shippingOrders', page], queryFn: () => adminAPI.getAllOrders({ page, limit: 20, status: 'Processing' }) });
    const refreshOrders = () => {
        queryClient.invalidateQueries({ queryKey: ['shippingOrders'] });
        queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
    };
    const manualMutation = useMutation({ mutationFn: ({ id, payload }) => adminAPI.shipManually(id, payload), onSuccess: () => { setManualOrder(null); setShipment({ trackingNumber: '', courierName: '', courierPhone: '' }); refreshOrders(); } });
    const shiprocketMutation = useMutation({ mutationFn: adminAPI.shipWithShiprocket, onSuccess: refreshOrders });
    const orders = ordersQuery.data?.orders || [];
    const mutationError = manualMutation.error || shiprocketMutation.error;

    return (
        <div className="space-y-6 pb-10">
            <div>
                <p className="text-sm font-semibold uppercase text-teal-700">Fulfillment</p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">Shipping queue</h1>
                <p className="mt-1 text-sm text-gray-500">{ordersQuery.data?.total ?? 0} orders ready to ship</p>
            </div>

            {mutationError && <p role="alert" className="text-sm font-medium text-red-700">{mutationError.response?.data?.message || 'Unable to create shipment.'}</p>}
            {shiprocketMutation.data?.tracking?.trackUrl && <p className="text-sm text-emerald-700">Shipment booked. <a className="underline" href={shiprocketMutation.data.tracking.trackUrl} target="_blank" rel="noreferrer">Track shipment</a></p>}

            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-white"><CardTitle className="flex items-center gap-2 text-base"><Truck className="h-5 w-5 text-teal-700" />Processing orders</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {ordersQuery.isLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading shipping queue...</p> : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Destination</TableHead><TableHead>Placed</TableHead><TableHead className="text-right">Shipment</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <React.Fragment key={order._id}>
                                            <TableRow>
                                                <TableCell className="font-semibold">#{order._id.slice(-8).toUpperCase()}<p className="text-xs font-normal text-gray-500">{order.orderItems?.length || 0} line items · ₹{Number(order.totalPrice || 0).toLocaleString()}</p></TableCell>
                                                <TableCell>{order.shippingAddress?.name || order.user?.name || 'Customer'}</TableCell>
                                                <TableCell>{[order.shippingAddress?.city, order.shippingAddress?.state, order.shippingAddress?.postalCode].filter(Boolean).join(', ') || '—'}</TableCell>
                                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button size="sm" variant="outline" disabled={shiprocketMutation.isPending} onClick={() => shiprocketMutation.mutate(order._id)}><PackageCheck className="mr-2 h-4 w-4" />Shiprocket</Button>
                                                        <Button size="sm" onClick={() => { setManualOrder(manualOrder === order._id ? null : order._id); setShipment({ trackingNumber: '', courierName: '', courierPhone: '' }); }}>Manual</Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {manualOrder === order._id && (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="bg-gray-50">
                                                        <form className="grid gap-3 sm:grid-cols-4" onSubmit={(event) => { event.preventDefault(); manualMutation.mutate({ id: order._id, payload: shipment }); }}>
                                                            <Input aria-label="Courier name" placeholder="Courier name" value={shipment.courierName} onChange={(event) => setShipment({ ...shipment, courierName: event.target.value })} />
                                                            <Input aria-label="Tracking number" placeholder="Tracking number" value={shipment.trackingNumber} onChange={(event) => setShipment({ ...shipment, trackingNumber: event.target.value })} />
                                                            <Input aria-label="Courier phone" placeholder="Courier phone" value={shipment.courierPhone} onChange={(event) => setShipment({ ...shipment, courierPhone: event.target.value })} />
                                                            <Button type="submit" disabled={manualMutation.isPending}>{manualMutation.isPending ? 'Saving...' : 'Confirm shipment'}</Button>
                                                        </form>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                    {!orders.length && <TableRow><TableCell colSpan={5} className="py-12 text-center text-gray-500">No orders are waiting to ship.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {ordersQuery.data?.pages > 1 && <div className="flex items-center justify-between border-t px-5 py-4"><span className="text-sm text-gray-500">Page {page} of {ordersQuery.data.pages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page === ordersQuery.data.pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
                </CardContent>
            </Card>
        </div>
    );
}