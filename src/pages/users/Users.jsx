import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search, ShieldCheck, ShieldOff, Trash2, Users as UsersIcon } from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function Users() {
    const [search, setSearch] = useState('');
    const queryClient = useQueryClient();
    const { user: currentUser } = useAuth();
    const usersQuery = useQuery({ queryKey: ['adminUsers'], queryFn: adminAPI.getUsers });
    const refreshUsers = () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    const toggleMutation = useMutation({ mutationFn: adminAPI.toggleUserAdmin, onSuccess: refreshUsers });
    const deleteMutation = useMutation({ mutationFn: adminAPI.deleteUser, onSuccess: refreshUsers });
    const users = usersQuery.data || [];
    const filteredUsers = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return users;
        return users.filter((user) => `${user.name} ${user.email} ${user.phone || ''}`.toLowerCase().includes(term));
    }, [search, users]);

    const handleDelete = (target) => {
        if (target._id === currentUser?._id) return;
        if (window.confirm(`Delete ${target.name || target.email}? This cannot be undone.`)) {
            deleteMutation.mutate(target._id);
        }
    };

    return (
        <div className="space-y-6 pb-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold uppercase text-emerald-700">Customers & access</p>
                    <h1 className="mt-1 text-3xl font-bold text-gray-900">Users</h1>
                    <p className="mt-1 text-sm text-gray-500">{users.length} registered accounts</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone" className="pl-9" />
                </div>
            </div>

            {(toggleMutation.error || deleteMutation.error || usersQuery.error) && (
                <p role="alert" className="text-sm font-medium text-red-700">{toggleMutation.error?.response?.data?.message || deleteMutation.error?.response?.data?.message || usersQuery.error?.response?.data?.message || 'Unable to load users.'}</p>
            )}

            <Card className="overflow-hidden border-gray-200 shadow-sm">
                <CardHeader className="border-b bg-white">
                    <CardTitle className="flex items-center gap-2 text-base"><UsersIcon className="h-5 w-5 text-emerald-700" />Account directory</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {usersQuery.isLoading ? <p className="py-12 text-center text-sm text-gray-500">Loading users...</p> : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Joined</TableHead><TableHead>Access</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {filteredUsers.map((account) => {
                                        const isSelf = account._id === currentUser?._id;
                                        return (
                                            <TableRow key={account._id}>
                                                <TableCell className="font-semibold text-gray-900">{account.name || 'Unnamed'}{isSelf && <span className="ml-2 text-xs font-normal text-gray-500">You</span>}</TableCell>
                                                <TableCell>{account.email || '—'}</TableCell>
                                                <TableCell>{account.phone || '—'}</TableCell>
                                                <TableCell>{account.createdAt ? new Date(account.createdAt).toLocaleDateString() : '—'}</TableCell>
                                                <TableCell><Badge variant="outline" className={account.isAdmin ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-gray-200 bg-gray-50 text-gray-700'}>{account.isAdmin ? 'Administrator' : 'Customer'}</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <div className="inline-flex gap-1">
                                                        <Button variant="ghost" size="icon" title={account.isAdmin ? 'Remove administrator access' : 'Grant administrator access'} disabled={isSelf || toggleMutation.isPending} onClick={() => toggleMutation.mutate(account._id)}>
                                                            {account.isAdmin ? <ShieldOff className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" title="Delete user" className="text-red-600 hover:bg-red-50 hover:text-red-700" disabled={isSelf || deleteMutation.isPending} onClick={() => handleDelete(account)}><Trash2 className="h-4 w-4" /></Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                    {!filteredUsers.length && <TableRow><TableCell colSpan={6} className="py-12 text-center text-gray-500">{search ? 'No matching users.' : 'No users found.'}</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}