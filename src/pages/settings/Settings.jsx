import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ProfileForm({ profile }) {
    const { updateUser } = useAuth();
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: profile.name || '', email: profile.email || '', phone: profile.phone || '' });
    const mutation = useMutation({
        mutationFn: async (payload) => (await api.put('/users/profile', payload)).data,
        onSuccess: (updatedProfile) => {
            updateUser(updatedProfile);
            queryClient.setQueryData(['adminProfile'], updatedProfile);
        },
    });

    return (
        <form className="space-y-5" onSubmit={(event) => { event.preventDefault(); mutation.mutate(form); }}>
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="profile-name">Name</Label><Input id="profile-name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="profile-email">Email</Label><Input id="profile-email" type="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
                <div className="space-y-2"><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></div>
            </div>
            {mutation.error && <p role="alert" className="text-sm font-medium text-red-700">{mutation.error.response?.data?.message || 'Unable to save profile.'}</p>}
            {mutation.isSuccess && <p role="status" className="text-sm font-medium text-emerald-700">Profile saved.</p>}
            <Button type="submit" disabled={mutation.isPending}><Save className="mr-2 h-4 w-4" />{mutation.isPending ? 'Saving...' : 'Save profile'}</Button>
        </form>
    );
}

export default function Settings() {
    const profileQuery = useQuery({ queryKey: ['adminProfile'], queryFn: async () => (await api.get('/users/profile')).data });

    return (
        <div className="space-y-6 pb-10">
            <div>
                <p className="text-sm font-semibold uppercase text-gray-600">Account</p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">Settings</h1>
                <p className="mt-1 text-sm text-gray-500">Manage the administrator profile connected to this account.</p>
            </div>
            {profileQuery.error && <p role="alert" className="text-sm font-medium text-red-700">{profileQuery.error.response?.data?.message || 'Unable to load profile.'}</p>}
            <Card className="max-w-3xl border-gray-200 shadow-sm">
                <CardHeader className="border-b"><CardTitle className="flex items-center gap-2 text-base"><SettingsIcon className="h-5 w-5 text-gray-700" />Administrator profile</CardTitle></CardHeader>
                <CardContent className="p-5 sm:p-6">
                    {profileQuery.isLoading ? <p className="py-6 text-sm text-gray-500">Loading profile...</p> : profileQuery.data ? <ProfileForm key={profileQuery.data._id} profile={profileQuery.data} /> : <p className="py-6 text-sm text-gray-500">Profile unavailable.</p>}
                </CardContent>
            </Card>
        </div>
    );
}