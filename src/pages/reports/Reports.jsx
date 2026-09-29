import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, CreditCard, IndianRupee, ShoppingBag } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { adminAPI } from '@/lib/adminAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const chartColors = ['#0f766e', '#d97706', '#2563eb', '#be123c', '#65a30d', '#7c3aed'];

export default function Reports() {
    const ordersQuery = useQuery({ queryKey: ['orderStats'], queryFn: adminAPI.getOrderStats });
    const paymentsQuery = useQuery({ queryKey: ['paymentStats'], queryFn: adminAPI.getPaymentStats });
    const dailyOrders = (ordersQuery.data?.dailyOrders || []).map((day) => ({ ...day, label: new Date(`${day._id}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }));
    const byStatus = (ordersQuery.data?.byStatus || []).map((item) => ({ name: item._id || 'Unknown', orders: item.count, revenue: item.total }));
    const byPayment = (ordersQuery.data?.byPaymentMethod || []).map((item) => ({ name: item._id || 'Unknown', value: item.count }));
    const paidCount = (paymentsQuery.data?.byStatus || []).find((item) => item._id === 'Paid')?.count || 0;
    const failedCount = (paymentsQuery.data?.byStatus || []).find((item) => item._id === 'Failed')?.count || 0;
    const isLoading = ordersQuery.isLoading || paymentsQuery.isLoading;
    const error = ordersQuery.error || paymentsQuery.error;

    return (
        <div className="space-y-6 pb-10">
            <div>
                <p className="text-sm font-semibold uppercase text-blue-700">Store performance</p>
                <h1 className="mt-1 text-3xl font-bold text-gray-900">Reports</h1>
                <p className="mt-1 text-sm text-gray-500">Daily orders and paid revenue for the last 30 days; status and payment totals are all time.</p>
            </div>
            {error && <p role="alert" className="text-sm font-medium text-red-700">{error.response?.data?.message || 'Unable to load report data.'}</p>}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: 'Paid revenue', value: `₹${Number(paymentsQuery.data?.totalPaid || 0).toLocaleString()}`, icon: IndianRupee, tint: 'text-emerald-700 bg-emerald-50' },
                    { label: 'Paid transactions', value: paidCount.toLocaleString(), icon: CreditCard, tint: 'text-blue-700 bg-blue-50' },
                    { label: 'Failed transactions', value: failedCount.toLocaleString(), icon: Activity, tint: 'text-rose-700 bg-rose-50' },
                    { label: 'Order statuses', value: byStatus.length.toLocaleString(), icon: ShoppingBag, tint: 'text-amber-700 bg-amber-50' },
                ].map((metric) => {
                    const Icon = metric.icon;
                    return <Card key={metric.label} className="border-gray-200 shadow-sm"><CardContent className="flex items-center gap-4 p-5"><div className={`rounded-md p-3 ${metric.tint}`}><Icon className="h-5 w-5" /></div><div><p className="text-sm text-gray-500">{metric.label}</p><p className="text-xl font-bold text-gray-900">{isLoading ? '—' : metric.value}</p></div></CardContent></Card>;
                })}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="border-b"><CardTitle className="text-base">Daily orders and paid revenue</CardTitle></CardHeader>
                    <CardContent className="p-5">
                        {isLoading ? <p className="py-24 text-center text-sm text-gray-500">Loading report...</p> : dailyOrders.length ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={dailyOrders} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                                    <YAxis yAxisId="orders" allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <YAxis yAxisId="revenue" orientation="right" tick={{ fontSize: 11 }} />
                                    <Tooltip formatter={(value, name) => [name === 'revenue' ? `₹${Number(value).toLocaleString()}` : value, name === 'revenue' ? 'Paid revenue' : 'Orders']} />
                                    <Bar yAxisId="orders" dataKey="count" name="Orders" fill="#0f766e" radius={[3, 3, 0, 0]} />
                                    <Bar yAxisId="revenue" dataKey="revenue" name="Paid revenue" fill="#d97706" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="py-24 text-center text-sm text-gray-500">No order activity in this period.</p>}
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="border-b"><CardTitle className="text-base">Orders by status</CardTitle></CardHeader>
                    <CardContent className="p-5">
                        {isLoading ? <p className="py-24 text-center text-sm text-gray-500">Loading report...</p> : byStatus.length ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={byStatus} margin={{ top: 8, right: 8, left: -16, bottom: 4 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                    <Tooltip />
                                    <Bar dataKey="orders" name="Orders" radius={[3, 3, 0, 0]}>{byStatus.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <p className="py-24 text-center text-sm text-gray-500">No order data available.</p>}
                    </CardContent>
                </Card>
                <Card className="border-gray-200 shadow-sm xl:col-span-2">
                    <CardHeader className="border-b"><CardTitle className="text-base">Payment methods</CardTitle></CardHeader>
                    <CardContent className="grid items-center gap-4 p-5 md:grid-cols-2">
                        {isLoading ? <p className="py-20 text-center text-sm text-gray-500">Loading report...</p> : byPayment.length ? (
                            <>
                                <ResponsiveContainer width="100%" height={260}>
                                    <PieChart><Pie data={byPayment} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={3}>{byPayment.map((entry, index) => <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />)}</Pie><Tooltip /></PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-3">{byPayment.map((method, index) => <div key={method.name} className="flex items-center justify-between border-b border-gray-100 pb-3"><span className="flex items-center gap-2 text-sm font-medium text-gray-700"><span className="h-3 w-3 rounded-sm" style={{ backgroundColor: chartColors[index % chartColors.length] }} />{method.name}</span><span className="text-sm font-bold text-gray-900">{method.value} orders</span></div>)}</div>
                            </>
                        ) : <p className="py-20 text-center text-sm text-gray-500 md:col-span-2">No payment data available.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}