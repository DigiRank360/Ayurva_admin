import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, RotateCcw } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const statuses = ['Requested', 'Approved', 'PickupScheduled', 'Picked', 'Completed', 'Rejected'];

export default function Returns() {
    const [status, setStatus] = useState('');
    const [page, setPage] = useState(1);
    const queryClient = useQueryClient();
    const returnsQuery = useQuery({ queryKey: ['adminReturns', status, page], queryFn: () => adminAPI.getReturns({ status, page, limit: 20 }) });
    const refreshReturns = () => queryClient.invalidateQueries({ queryKey: ['adminReturns'] });
    const statusMutation = useMutation({ mutationFn: ({ id, payload }) => adminAPI.updateReturnStatus(id, payload), onSuccess: refreshReturns });
    const refundMutation = useMutation({ mutationFn: adminAPI.processRefund, onSuccess: refreshReturns });
    const returns = returnsQuery.data?.returns || [];

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase text-amber-700">After-sales</p>
                    <h1 className="mt-1 text-3xl font-bold text-gray-900">Returns & exchanges</h1>
                    <p className="mt-1 text-sm text-gray-500">Review requests, update fulfillment and close refunds.</p>
                </div>
                <Select className="w-full sm:w-56" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}>
                    <option value="">All statuses</option>
                    {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                </Select>
            </div>

            {(returnsQuery.error || statusMutation.error || refundMutation.error) && <p role="alert" className="text-sm font-medium text-red-700">{statusMutation.error?.response?.data?.message || refundMutation.error?.response?.data?.message || returnsQuery.error?.response?.data?.message || 'Unable to load return requests.'}</p>}

            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-white"><CardTitle className="flex items-center gap-2 text-base"><RotateCcw className="h-5 w-5 text-amber-700" />{returnsQuery.data?.total ?? 0} requests</CardTitle></CardHeader>
                <CardContent className="p-0">
                    {returnsQuery.isLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading return requests...</p> : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Request</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Refund</TableHead><TableHead>Status</TableHead><TableHead className="min-w-52">Update</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {returns.map((request) => (
                                        <TableRow key={request._id}>
                                            <TableCell><p className="font-semibold text-gray-900">#{request._id.slice(-7).toUpperCase()}</p><p className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()} · {request.returnType}</p></TableCell>
                                            <TableCell><p className="font-medium">{request.user?.name || 'Unknown'}</p><p className="text-xs text-gray-500">{request.user?.email || ''}</p></TableCell>
                                            <TableCell><p>{request.returnItems?.map((item) => `${item.name || item.product?.name || 'Item'} × ${item.quantity}`).join(', ') || '—'}</p><p className="max-w-xs truncate text-xs text-gray-500" title={request.reason}>{request.reason}</p></TableCell>
                                            <TableCell><p className="font-semibold">₹{Number(request.refundAmount || 0).toLocaleString()}</p><Badge variant="outline" className="mt-1">{request.refundStatus || 'Pending'}</Badge></TableCell>
                                            <TableCell><Badge variant="outline">{request.returnStatus}</Badge></TableCell>
                                            <TableCell>
                                                <div className="flex min-w-48 flex-col gap-2">
                                                    <Select aria-label="Return status" value={request.returnStatus} disabled={statusMutation.isPending} onChange={(event) => statusMutation.mutate({ id: request._id, payload: { status: event.target.value } })}>
                                                        {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
                                                    </Select>
                                                    {request.returnType === 'Return' && request.returnStatus === 'Completed' && request.refundStatus !== 'Completed' && (
                                                        <Button size="sm" variant="outline" disabled={refundMutation.isPending} onClick={() => refundMutation.mutate(request._id)}><Check className="mr-2 h-4 w-4" />Mark refund complete</Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {!returns.length && <TableRow><TableCell colSpan={6} className="py-12 text-center text-gray-500">No return requests found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    {returnsQuery.data?.pages > 1 && <div className="flex items-center justify-between border-t px-5 py-4"><span className="text-sm text-gray-500">Page {page} of {returnsQuery.data.pages}</span><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button variant="outline" size="sm" disabled={page === returnsQuery.data.pages} onClick={() => setPage(page + 1)}>Next</Button></div></div>}
                </CardContent>
            </Card>
        </div>
    );
}