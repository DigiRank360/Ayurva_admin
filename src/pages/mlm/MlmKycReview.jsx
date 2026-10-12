import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, ShieldCheck } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

const documentNames = { aadhaar: 'Aadhaar', passport: 'Passport', voter_id: 'Voter ID', driving_license: 'Driving licence' };

function savePrivateDocument(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}

export default function MlmKycReview() {
    const [status, setStatus] = useState('submitted');
    const [rejectionReasons, setRejectionReasons] = useState({});
    const queryClient = useQueryClient();
    const queueQuery = useQuery({ queryKey: ['mlmKycQueue', status], queryFn: () => adminAPI.getMlmKycQueue(status) });
    const configQuery = useQuery({ queryKey: ['mlmKycConfig'], queryFn: adminAPI.getMlmKycConfig });
    const reviewMutation = useMutation({
        mutationFn: ({ id, payload }) => adminAPI.reviewMlmKyc(id, payload),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['mlmKycQueue'] }),
    });
    const documentMutation = useMutation({
        mutationFn: ({ id, type }) => adminAPI.downloadMlmKycDocument(id, type),
        onSuccess: (blob, variables) => savePrivateDocument(blob, `kyc-${variables.id}-${variables.type}`),
    });
    const applications = queueQuery.data || [];

    return <div className="space-y-6 pb-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm font-semibold uppercase text-emerald-700">MLM compliance</p><h1 className="mt-1 text-3xl font-bold text-gray-900">KYC review</h1><p className="mt-1 text-sm text-gray-500">{applications.length} applications · identity documents remain private</p></div>
            <select className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm" value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter KYC applications">
                <option value="submitted">Submitted</option><option value="under_review">Under review</option><option value="approved">Approved</option><option value="rejected">Rejected</option>
            </select>
        </div>

        {configQuery.data?.enabled === false && <div role="alert" className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900"><strong>KYC document storage is disabled.</strong> Configure the backend `KYC_ENCRYPTION_KEY` before members can submit identity documents.</div>}
        {(queueQuery.error || reviewMutation.error || documentMutation.error) && <p role="alert" className="text-sm font-medium text-red-700">{queueQuery.error?.response?.data?.message || reviewMutation.error?.response?.data?.message || documentMutation.error?.response?.data?.message || 'KYC operation failed.'}</p>}
        {queueQuery.isLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading applications...</p> : applications.length === 0 ? <Card><CardContent className="py-12 text-center text-sm text-gray-500">No KYC applications in this queue.</CardContent></Card> : <div className="grid gap-4">
            {applications.map((application) => {
                const member = application.member;
                const user = member?.user;
                const reviewable = ['submitted', 'under_review'].includes(application.status);
                return <Card key={application._id} className="border-gray-200 shadow-sm">
                    <CardHeader className="flex flex-row items-start justify-between gap-4 border-b bg-white">
                        <div><CardTitle className="flex items-center gap-2 text-base"><ShieldCheck className="h-5 w-5 text-emerald-700" />{application.legalName}</CardTitle><p className="mt-1 text-sm text-gray-500">{user?.email || '—'} · Member {member?.memberCode || '—'}</p></div>
                        <Badge variant={application.status === 'approved' ? 'success' : application.status === 'rejected' ? 'destructive' : 'warning'}>{application.status.replace('_', ' ')}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                            <div><span className="text-gray-500">Date of birth</span><p className="font-medium">{new Date(application.dateOfBirth).toLocaleDateString()}</p></div>
                            <div><span className="text-gray-500">PAN</span><p className="font-medium">••••••{application.panLastFour}</p></div>
                            <div><span className="text-gray-500">Government ID</span><p className="font-medium">{documentNames[application.identityDocumentType] || application.identityDocumentType}</p></div>
                            <div><span className="text-gray-500">Submitted</span><p className="font-medium">{new Date(application.submittedAt).toLocaleString()}</p></div>
                        </div>
                        <p className="text-sm text-gray-700">{application.address.line1}{application.address.line2 ? `, ${application.address.line2}` : ''}, {application.address.city}, {application.address.state} {application.address.pincode}</p>
                        <div className="flex flex-wrap gap-2">
                            {['pan', 'identity'].map((type) => <Button key={type} type="button" variant="outline" size="sm" disabled={documentMutation.isPending} onClick={() => documentMutation.mutate({ id: application._id, type })}><Download className="mr-2 h-4 w-4" />Download {type === 'pan' ? 'PAN' : 'ID'} document</Button>)}
                        </div>
                        {reviewable && <div className="grid gap-3 border-t pt-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
                            <label className="grid gap-1 text-sm font-medium text-gray-700">Rejection reason<textarea className="min-h-20 rounded-md border border-gray-300 p-2 text-sm" value={rejectionReasons[application._id] || ''} onChange={(event) => setRejectionReasons((current) => ({ ...current, [application._id]: event.target.value }))} placeholder="Required when rejecting" /></label>
                            <Button variant="destructive" disabled={reviewMutation.isPending || (rejectionReasons[application._id] || '').trim().length < 5} onClick={() => reviewMutation.mutate({ id: application._id, payload: { decision: 'rejected', rejectionReason: rejectionReasons[application._id] } })}>Reject</Button>
                            <Button disabled={reviewMutation.isPending} onClick={() => reviewMutation.mutate({ id: application._id, payload: { decision: 'approved' } })}>Approve KYC</Button>
                        </div>}
                        {application.rejectionReason && <p className="text-sm text-red-700">Previous review: {application.rejectionReason}</p>}
                    </CardContent>
                </Card>;
            })}
        </div>}
    </div>;
}