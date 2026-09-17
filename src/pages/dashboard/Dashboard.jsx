import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminAPI } from '@/lib/adminAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    TrendingUp,
    ShoppingCart,
    Users,
    Package,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Clock,
    Sparkles,
    Star,
    Award,
    Activity,
    AlertTriangle,
    UserPlus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Dashboard() {
    const navigate = useNavigate();
    const { data: dashboardData, isLoading } = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: adminAPI.getDashboardStats,
        refetchInterval: 30000 // Refresh every 30s
    });

    const stats = [
        {
            title: 'Total Revenue',
            value: `₹${(dashboardData?.totalRevenue || 0).toLocaleString()}`,
            change: '',
            changeType: 'positive',
            icon: DollarSign,
            lightBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
            borderColor: 'border-blue-100',
            subtitle: 'Lifetime Revenue',
            gradientFrom: 'from-blue-500',
            gradientTo: 'to-cyan-400'
        },
        {
            title: 'Total Orders',
            value: dashboardData?.totalOrders?.toLocaleString() || '0',
            change: '',
            changeType: 'positive',
            icon: ShoppingCart,
            lightBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
            borderColor: 'border-emerald-100',
            subtitle: `Pending: ${dashboardData?.ordersByStatus?.find(o => o._id === 'Pending')?.count || 0}`,
            gradientFrom: 'from-emerald-500',
            gradientTo: 'to-teal-400'
        },
        {
            title: 'Low Stock Alerts',
            value: (dashboardData?.outOfStockProducts || 0 + dashboardData?.lowStockProducts || 0).toLocaleString() || '0',
            change: `${dashboardData?.outOfStockProducts || 0} Out `,
            changeType: dashboardData?.outOfStockProducts > 0 ? 'negative' : 'positive',
            icon: AlertTriangle,
            lightBg: 'bg-red-50',
            iconColor: 'text-red-600',
            borderColor: 'border-red-100',
            subtitle: `${dashboardData?.lowStockProducts || 0} Low Stock`,
            gradientFrom: 'from-red-500',
            gradientTo: 'to-rose-400'
        },
        {
            title: 'New Customers',
            value: dashboardData?.newUsers?.toLocaleString() || '0',
            change: `Total: ${dashboardData?.totalUsers?.toLocaleString() || '0'}`,
            changeType: 'positive',
            icon: UserPlus,
            lightBg: 'bg-indigo-50',
            iconColor: 'text-indigo-600',
            borderColor: 'border-indigo-100',
            subtitle: 'Last 30 days',
            gradientFrom: 'from-indigo-500',
            gradientTo: 'to-blue-400'
        },
    ];

    const recentOrders = dashboardData?.recentOrders?.map(order => ({
        id: order._id.substring(order._id.length - 6).toUpperCase(),
        originalId: order._id,
        customer: order.user?.name || 'Unknown',
        amount: order.totalPrice,
        status: order.orderStatus,
        time: new Date(order.createdAt).toLocaleDateString()
    })) || [];

    const topProducts = dashboardData?.topProducts?.map(product => ({
        name: product.name,
        sales: product.sales,
        revenue: `₹${product.revenue.toLocaleString()}`,
        trend: product.trend,
        rating: product.rating || 4.5
    })) || [];

    const getStatusBadge = (status) => {
        const badges = {
            'Delivered': { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
            'Processing': { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
            'Shipped': { bg: 'bg-blue-100', text: 'text-blue-700', dot: 'bg-blue-500' },
            'Pending': { bg: 'bg-gray-100', text: 'text-gray-700', dot: 'bg-gray-500' },
        };
        return badges[status] || badges['Pending'];
    };

    return (
        <div className="space-y-8 pb-10">
            {/* Beautiful Header with Gradient Text */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-black bg-gradient-to-r from-slate-800 via-purple-600 to-slate-800 bg-clip-text text-transparent">
                            Dashboard Overview
                        </h1>
                        <Sparkles className="h-7 w-7 text-amber-400 animate-pulse" />
                    </div>
                    <p className="text-gray-500 flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4" />
                        Last updated: Just now
                    </p>
                </div>
                <div>
                    <select className="px-5 py-3 border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent bg-white hover:bg-gray-50 transition-all shadow-sm">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                        <option>Last 3 months</option>
                        <option>Last year</option>
                    </select>
                </div>
            </div>

            {/* Premium Stats Cards - Light Theme */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => {
                    const Icon = stat.icon;
                    const isPositive = stat.changeType === 'positive';

                    return (
                        <div key={stat.title} className="group">
                            <Card className={`relative overflow-hidden border-2 ${stat.borderColor} hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-white`}>
                                {/* Subtle gradient overlay */}
                                <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${stat.gradientFrom} ${stat.gradientTo} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity`}></div>

                                <CardContent className="p-6 relative">
                                    <div className="flex items-start justify-between mb-4">
                                        {/* Icon in light background */}
                                        <div className={`p-3.5 rounded-2xl ${stat.lightBg} group-hover:scale-110 transition-transform shadow-sm`}>
                                            <Icon className={`h-7 w-7 ${stat.iconColor}`} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                                            {stat.title}
                                        </p>
                                        <h3 className="text-3xl font-black text-gray-900">
                                            {stat.value}
                                        </h3>

                                        <div className="flex items-center justify-between pt-2">
                                            <p className="text-xs text-gray-500 font-medium">{stat.subtitle}</p>
                                            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold text-xs ${isPositive
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                                }`}>
                                                {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                                {stat.change}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    );
                })}
            </div>

            {/* Charts Section - Beautiful Placeholders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-2 border-blue-100 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-blue-50/30">
                    <CardHeader className="border-b border-blue-100 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity className="h-5 w-5 text-blue-600" />
                                <CardTitle className="text-gray-800">Revenue Analytics</CardTitle>
                            </div>
                            <Badge className="bg-blue-100 text-blue-700 border-0 font-semibold">Last 30 days</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-64 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-50 border-2 border-dashed border-blue-200">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-3">
                                    <TrendingUp className="h-8 w-8 text-blue-600" />
                                </div>
                                <p className="text-sm font-semibold text-blue-900">Chart coming soon</p>
                                <p className="text-xs text-blue-600 mt-1">Visualize your revenue trends</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-2 border-emerald-100 shadow-lg hover:shadow-xl transition-all bg-gradient-to-br from-white to-emerald-50/30">
                    <CardHeader className="border-b border-emerald-100 pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-emerald-600" />
                                <CardTitle className="text-gray-800">Sales Overview</CardTitle>
                            </div>
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 font-semibold">This month</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="h-64 flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-50 border-2 border-dashed border-emerald-200">
                            <div className="text-center">
                                <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                                    <Package className="h-8 w-8 text-emerald-600" />
                                </div>
                                <p className="text-sm font-semibold text-emerald-900">Chart coming soon</p>
                                <p className="text-xs text-emerald-600 mt-1">Track your sales performance</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Tables - Premium Light Design */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Orders */}
                <Card className="border-2 border-purple-100 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                <ShoppingCart className="h-5 w-5 text-purple-600" />
                                Recent Orders
                            </CardTitle>
                            <Badge className="bg-purple-600 text-white font-semibold shadow-md">
                                {recentOrders.length} orders
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            {recentOrders.map((order) => {
                                const badge = getStatusBadge(order.status);
                                return (
                                    <div
                                        key={order.originalId || order.id}
                                        onClick={() => navigate(`/orders/${order.originalId}`)}
                                        className="group p-4 rounded-xl border-2 border-gray-100 hover:border-purple-200 cursor-pointer hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all hover:shadow-md"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <p className="font-bold text-gray-900">{order.id}</p>
                                                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${badge.bg}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${badge.dot} animate-pulse`}></div>
                                                        <span className={`text-xs font-semibold ${badge.text}`}>{order.status}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-700 font-medium">{order.customer}</p>
                                                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {order.time}
                                                </p>
                                            </div>
                                            <div className="text-right ml-4">
                                                <p className="text-xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                    ₹{order.amount.toLocaleString()}
                                                </p>
                                                <button className="text-xs text-purple-600 hover:text-purple-700 font-bold flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye className="h-3 w-3" />
                                                    Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="border-2 border-amber-100 shadow-lg hover:shadow-xl transition-all">
                    <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-gray-800">
                                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                                Top Products
                            </CardTitle>
                            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold shadow-md">
                                {topProducts.length} items
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <div className="space-y-3">
                            {topProducts.map((product, index) => (
                                <div
                                    key={product.name}
                                    className="group p-4 rounded-xl border-2 border-gray-100 hover:border-amber-200 hover:bg-gradient-to-r hover:from-amber-50/50 hover:to-orange-50/50 transition-all hover:shadow-md"
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank Badge */}
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white font-black text-lg shadow-lg">
                                                #{index + 1}
                                            </div>
                                        </div>

                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900 mb-1">{product.name}</p>
                                            <div className="flex items-center gap-3">
                                                <p className="text-sm text-gray-600 font-medium">{product.sales} sales</p>
                                                <span className="text-gray-300">•</span>
                                                <p className="text-sm font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                                                    {product.revenue}
                                                </p>
                                            </div>
                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mt-1">
                                                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                                                <span className="text-xs font-semibold text-gray-600">{product.rating}</span>
                                            </div>
                                        </div>

                                        {/* Trend */}
                                        <div className={`p-2 rounded-lg ${product.trend === 'up' ? 'bg-emerald-100' : 'bg-red-100'
                                            }`}>
                                            {product.trend === 'up' ? (
                                                <TrendingUp className="h-5 w-5 text-emerald-600" />
                                            ) : (
                                                <ArrowDownRight className="h-5 w-5 text-red-600" />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions - Colorful Cards */}
            <Card className="border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 via-pink-500 to-orange-500"></div>
                <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
                    <CardTitle className="flex items-center gap-2 text-gray-800">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        Quick Actions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: Package, label: 'Add Product', gradient: 'from-purple-500 to-pink-500', bg: 'from-purple-50 to-pink-50' },
                            { icon: ShoppingCart, label: 'View Orders', gradient: 'from-blue-500 to-cyan-500', bg: 'from-blue-50 to-cyan-50' },
                            { icon: Users, label: 'Manage Users', gradient: 'from-emerald-500 to-teal-500', bg: 'from-emerald-50 to-teal-50' },
                            { icon: TrendingUp, label: 'View Reports', gradient: 'from-orange-500 to-amber-500', bg: 'from-orange-50 to-amber-50' },
                        ].map((action) => {
                            const ActionIcon = action.icon;
                            return (
                                <button
                                    key={action.label}
                                    onClick={() => {
                                        if (action.label === 'View Orders') navigate('/orders');
                                        if (action.label === 'Manage Users') navigate('/users');
                                        if (action.label === 'Add Product') navigate('/products/create');
                                    }}
                                    className={`group p-6 rounded-2xl border-2 border-gray-200 hover:border-transparent bg-gradient-to-br ${action.bg} hover:shadow-xl transition-all hover:-translate-y-1 relative overflow-hidden`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                                    <div className="relative">
                                        <div className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                                            <ActionIcon className="h-6 w-6 text-white" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-800">{action.label}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
