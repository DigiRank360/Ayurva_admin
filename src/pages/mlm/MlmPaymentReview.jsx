import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeIndianRupee } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const paymentStatuses = ['verified', 'approving', 'approved', 'refund_pending', 'refunding', 'rejected', 'failed'];

export default function MlmPaymentReview() {
    const [status, setStatus] = useState('verified');
    const [reasons, setReasons] = useState({});
    const queryClient = useQueryClient();
    const paymentsQuery = useQuery({ queryKey: ['mlmPackagePayments', status], queryFn: () => adminAPI.getMlmPackagePayments(status) });
    const reviewMutation = useMutation({
        mutationFn: ({ id, payload }) => adminAPI.reviewMlmPackagePayment(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlmPackagePayments'] }),
    });
    const payments = paymentsQuery.data || [];

    return <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase text-amber-700">MLM activation</p><h1 className="mt-1 text-3xl font-bold text-gray-900">Package payment review</h1><p className="mt-1 text-sm text-gray-500">Approve captured payments to activate members; rejection requests a full Razorpay refund.</p></div>
            <select className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter package payments">
                {paymentStatuses.map((item) => <option key={item} value={item}>{item.replaceAll('_', ' ')}</option>)}
            </select>
        </div>
        {(paymentsQuery.error || reviewMutation.error) && <p role="alert" className="text-sm font-medium text-red-700">{paymentsQuery.error?.response?.data?.message || reviewMutation.error?.response?.data?.message || 'Payment review failed.'}</p>}
        {paymentsQuery.isLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading package payments...</p> : payments.length === 0 ? <Card><CardContent className="py-12 text-center text-sm text-gray-500">No package payments in this queue.</CardContent></Card> : <div className="grid gap-4">
            {payments.map((payment) => {
                const member = payment.member;
                const user = member?.user;
                const reviewable = ['verified', 'refund_pending'].includes(payment.status);
                const amount = (payment.amount / 100).toLocaleString('en-IN');
                return <Card key={payment._id} className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-white">
                        <div><CardTitle className="flex items-center gap-2 text-base"><BadgeIndianRupee className="h-5 w-5 text-amber-700" />{user?.name || 'Member'} · ₹{amount}</CardTitle><p className="mt-1 text-sm text-gray-500">{user?.email || '—'} · {member?.memberCode || '—'} · {payment.packageId}</p></div>
                        <Badge variant={payment.status === 'approved' ? 'success' : payment.status === 'rejected' ? 'destructive' : 'warning'}>{payment.status.replaceAll('_', ' ')}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="grid gap-3 text-sm sm:grid-cols-3"><div><span className="text-gray-500">Razorpay order</span><p className="break-all font-medium">{payment.razorpayOrderId}</p></div><div><span className="text-gray-500">Payment reference</span><p className="break-all font-medium">{payment.razorpayPaymentId || '—'}</p></div><div><span className="text-gray-500">Captured</span><p className="font-medium">{payment.verifiedAt ? new Date(payment.verifiedAt).toLocaleString() : '—'}</p></div></div>
                        {reviewable && <div className="grid gap-3 border-t pt-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                            <label className="grid gap-1 text-sm font-medium text-gray-700">Rejection reason<input className="h-10 rounded-md border border-gray-300 px-3 text-sm" value={reasons[payment._id] || ''} onChange={(event) => setReasons((current) => ({ ...current, [payment._id]: event.target.value }))} placeholder="Required to reject and refund" /></label>
                            <Button variant="destructive" disabled={reviewMutation.isPending || (reasons[payment._id] || '').trim().length < 5} onClick={() => reviewMutation.mutate({ id: payment._id, payload: { decision: 'rejected', rejectionReason: reasons[payment._id] } })}>Reject and refund</Button>
                            {payment.status === 'verified' && <Button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ id: payment._id, payload: { decision: 'approved' } })}>Approve and activate</Button>}
                        </div>}
                        {payment.rejectionReason && <p className="text-sm text-red-700">Review note: {payment.rejectionReason}</p>}
                        {payment.refundId && <p className="text-sm text-gray-600">Refund reference: {payment.refundId}</p>}
                    </CardContent>
                </Card>;
            })}
        </div>}
    </div>;
}