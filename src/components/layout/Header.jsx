import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Bell,
    Search,
    User,
    Settings,
    LogOut,
    Menu,
    ShoppingBag,
    Package,
    X
} from 'lucide-react';
import { adminAPI } from '@/lib/adminAPI';
import { productAPI } from '@/lib/productAPI';

export default function Header({ onToggleSidebar }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const searchContainerRef = useRef(null);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [activeResult, setActiveResult] = useState(0);
    const [readNotificationIds, setReadNotificationIds] = useState(() => {
        try {
            return new Set(JSON.parse(localStorage.getItem('adminReadNotifications') || '[]'));
        } catch {
            return new Set();
        }
    });

    const dashboardQuery = useQuery({
        queryKey: ['dashboardStats'],
        queryFn: adminAPI.getDashboardStats,
        refetchInterval: 30000,
    });
    const lowStockQuery = useQuery({
        queryKey: ['headerLowStock'],
        queryFn: adminAPI.getLowStockProducts,
        refetchInterval: 60000,
    });

    useEffect(() => {
        const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 250);
        return () => window.clearTimeout(timer);
    }, [search]);

    const searchEnabled = searchOpen && debouncedSearch.length >= 2;
    const productSearchQuery = useQuery({
        queryKey: ['headerProductSearch', debouncedSearch],
        queryFn: () => productAPI.getAll({ page: 1, limit: 8, search: debouncedSearch }),
        enabled: searchEnabled,
        staleTime: 30000,
    });
    const orderSearchQuery = useQuery({
        queryKey: ['headerOrderSearch', debouncedSearch],
        queryFn: () => adminAPI.getAllOrders({ page: 1, limit: 8, search: debouncedSearch.replace(/^#/, '') }),
        enabled: searchEnabled,
        staleTime: 60000,
    });
    const userSearchQuery = useQuery({
        queryKey: ['adminUsers'],
        queryFn: adminAPI.getUsers,
        enabled: searchEnabled,
        staleTime: 60000,
    });

    const searchResults = useMemo(() => {
        if (debouncedSearch.length < 2) return [];
        const term = debouncedSearch.toLowerCase();
        const orderTerm = term.replace(/^#/, '');
        const products = (productSearchQuery.data?.products || []).map((product) => ({
            id: `product-${product._id}`,
            type: 'Product',
            title: product.name,
            detail: `₹${Number(product.price || 0).toLocaleString()} · Stock ${product.stock ?? 0}`,
            icon: Package,
            path: `/products/edit/${product._id}`,
        }));
        const orders = (orderSearchQuery.data?.orders || [])
            .filter((order) => [order._id, order.user?.name, order.user?.email, order.shippingAddress?.name]
                .some((value) => String(value || '').toLowerCase().includes(orderTerm)))
            .slice(0, 5)
            .map((order) => ({
                id: `order-${order._id}`,
                type: 'Order',
                title: `Order #${order._id.slice(-8).toUpperCase()}`,
                detail: `${order.user?.name || order.shippingAddress?.name || 'Customer'} · ${order.orderStatus}`,
                icon: ShoppingBag,
                path: `/orders/${order._id}`,
            }));
        const users = (userSearchQuery.data || [])
            .filter((account) => [account.name, account.email, account.phone]
                .some((value) => String(value || '').toLowerCase().includes(term)))
            .slice(0, 5)
            .map((account) => ({
                id: `user-${account._id}`,
                type: 'Customer',
                title: account.name || account.email || 'Customer',
                detail: account.email || account.phone || 'Customer account',
                icon: User,
                path: '/users',
            }));
        return [...products, ...orders, ...users].slice(0, 12);
    }, [debouncedSearch, orderSearchQuery.data, productSearchQuery.data, userSearchQuery.data]);

    const notifications = useMemo(() => {
        const orders = (dashboardQuery.data?.recentOrders || []).slice(0, 5).map((order) => ({
            id: `order-${order._id}`,
            type: 'order',
            title: `Order #${order._id.slice(-8).toUpperCase()}`,
            message: `${order.user?.name || 'Customer'} · ₹${Number(order.totalPrice || 0).toLocaleString()} · ${order.orderStatus}`,
            createdAt: order.createdAt,
            path: `/orders/${order._id}`,
        }));
        const stockAlerts = (lowStockQuery.data?.products || []).slice(0, 5).map((product) => ({
            id: `stock-${product._id}`,
            type: 'stock',
            title: product.stock <= 0 ? 'Out of stock' : 'Low stock',
            message: `${product.name} · ${product.stock} left`,
            createdAt: product.updatedAt || product.createdAt,
            path: `/products/edit/${product._id}`,
        }));
        return [...orders, ...stockAlerts].sort((first, second) => new Date(second.createdAt || 0) - new Date(first.createdAt || 0));
    }, [dashboardQuery.data?.recentOrders, lowStockQuery.data?.products]);

    const unreadCount = notifications.filter((notification) => !readNotificationIds.has(notification.id)).length;

    const markNotificationsRead = (ids) => {
        const nextReadIds = new Set([...readNotificationIds, ...ids]);
        setReadNotificationIds(nextReadIds);
        localStorage.setItem('adminReadNotifications', JSON.stringify([...nextReadIds]));
    };

    const selectResult = (result) => {
        if (!result) return;
        setSearchOpen(false);
        setSearch('');
        setDebouncedSearch('');
        navigate(result.path);
    };

    const isSearchLoading = searchEnabled && (productSearchQuery.isLoading || orderSearchQuery.isLoading || userSearchQuery.isLoading);
    const searchError = productSearchQuery.error || orderSearchQuery.error || userSearchQuery.error;

    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/login', { replace: true });
    };

    return (
        <header className="sticky top-0 z-30 w-full border-b border-gray-200/50 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60">
            {/* Gradient accent line */}
            <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

            <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                {/* Mobile Menu Toggle */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden hover:bg-gray-100 rounded-xl transition-all"
                    onClick={onToggleSidebar}
                >
                    <Menu className="h-5 w-5 text-gray-700" />
                </Button>

                {/* Search Bar - Premium Design */}
                <div className="relative flex-1 max-w-2xl" ref={searchContainerRef}>
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            <Input
                                type="search"
                                value={search}
                                onChange={(event) => { setSearch(event.target.value); setActiveResult(0); setSearchOpen(true); }}
                                onFocus={() => setSearchOpen(true)}
                                onBlur={(event) => {
                                    if (!searchContainerRef.current?.contains(event.relatedTarget)) setSearchOpen(false);
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Escape') setSearchOpen(false);
                                    if (event.key === 'ArrowDown' && searchResults.length) {
                                        event.preventDefault();
                                        setActiveResult((index) => (index + 1) % searchResults.length);
                                    }
                                    if (event.key === 'ArrowUp' && searchResults.length) {
                                        event.preventDefault();
                                        setActiveResult((index) => (index - 1 + searchResults.length) % searchResults.length);
                                    }
                                    if (event.key === 'Enter') {
                                        event.preventDefault();
                                        selectResult(searchResults[activeResult]);
                                    }
                                }}
                                placeholder="Search products, orders, customers..."
                                aria-label="Search products, orders, and customers"
                                aria-expanded={searchOpen && search.length >= 2}
                                aria-controls="admin-search-results"
                                className="pl-11 pr-4 h-10 w-full bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                            {search && <Button type="button" variant="ghost" size="icon" aria-label="Clear search" onClick={() => { setSearch(''); setDebouncedSearch(''); setActiveResult(0); }} className="absolute right-1 h-8 w-8"><X className="h-4 w-4" /></Button>}
                        </div>
                    </div>
                    {searchOpen && search.length >= 2 && (
                        <div id="admin-search-results" role="listbox" className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[min(70vh,28rem)] overflow-y-auto rounded-lg border border-gray-200 bg-white p-2 shadow-xl">
                            {isSearchLoading ? <p className="px-3 py-6 text-center text-sm text-gray-500">Searching...</p> : searchError ? <p role="alert" className="px-3 py-6 text-center text-sm text-red-700">Search could not be completed. Try again.</p> : searchResults.length ? searchResults.map((result, index) => {
                                const ResultIcon = result.icon;
                                return (
                                    <button
                                        key={result.id}
                                        type="button"
                                        role="option"
                                        aria-selected={index === activeResult}
                                        onMouseEnter={() => setActiveResult(index)}
                                        onClick={() => selectResult(result)}
                                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left ${index === activeResult ? 'bg-emerald-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <span className="rounded-md bg-gray-100 p-2"><ResultIcon className="h-4 w-4 text-gray-600" /></span>
                                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-gray-900">{result.title}</span><span className="block truncate text-xs text-gray-500">{result.detail}</span></span>
                                        <span className="text-[11px] uppercase text-gray-400">{result.type}</span>
                                    </button>
                                );
                            }) : <p className="px-3 py-6 text-center text-sm text-gray-500">No matches for “{debouncedSearch}”.</p>}
                        </div>
                    )}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Notifications Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
                                className="relative rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all"
                            >
                                <Bell className="h-5 w-5 text-gray-700" />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/50 animate-pulse">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[min(22rem,calc(100vw-1rem))] rounded-xl border-gray-200/50 shadow-xl">
                            <DropdownMenuLabel className="flex items-center justify-between py-3">
                                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Notifications
                                </span>
                                {unreadCount > 0 && <Badge className="border-0 bg-emerald-700 text-white">{unreadCount} new</Badge>}
                            </DropdownMenuLabel>
                            {unreadCount > 0 && <DropdownMenuItem onSelect={() => markNotificationsRead(notifications.map((notification) => notification.id))} className="justify-end text-xs font-semibold text-emerald-700">Mark all as read</DropdownMenuItem>}
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                {(dashboardQuery.isLoading || lowStockQuery.isLoading) && !notifications.length ? <p className="px-4 py-6 text-center text-sm text-gray-500">Loading notifications...</p> : notifications.map((notification) => {
                                    const isUnread = !readNotificationIds.has(notification.id);
                                    const NotificationIcon = notification.type === 'order' ? ShoppingBag : Package;
                                    return (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        onSelect={() => { markNotificationsRead([notification.id]); navigate(notification.path); }}
                                        className={`mx-1 my-0.5 flex cursor-pointer items-start gap-3 rounded-lg p-3 ${isUnread ? 'bg-emerald-50' : ''}`}
                                    >
                                        <div className="mt-0.5 rounded-md bg-white p-2 shadow-sm">
                                            <NotificationIcon className={`h-4 w-4 ${notification.type === 'order' ? 'text-blue-700' : 'text-amber-700'}`} />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{notification.message}</p>
                                            <p className="text-xs text-gray-400">{notification.createdAt ? formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true }) : 'Recently updated'}</p>
                                        </div>
                                        {isUnread && <div className="mt-2 h-2 w-2 rounded-full bg-emerald-600" />}
                                    </DropdownMenuItem>
                                    );
                                })}
                                {!notifications.length && !dashboardQuery.isLoading && !lowStockQuery.isLoading && <p className="px-4 py-6 text-center text-sm text-gray-500">No recent order or stock alerts.</p>}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => navigate('/orders')} className="mx-1 my-1 justify-center rounded-lg font-semibold text-emerald-700 hover:bg-emerald-50">
                                View all orders
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex items-center gap-3 px-3 h-10 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all group"
                            >
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-bold text-gray-900 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                                        {user?.name || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-gray-500">Administrator</p>
                                </div>
                                <div className="relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full blur-md opacity-0 group-hover:opacity-50 transition-opacity"></div>
                                    <Avatar className="h-9 w-9 relative border-2 border-white shadow-lg">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-sm">
                                            {getInitials(user?.name || 'Admin')}
                                        </AvatarFallback>
                                    </Avatar>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 rounded-xl border-gray-200/50 shadow-xl">
                            <DropdownMenuLabel className="py-3">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                        {user?.name || 'Admin User'}
                                    </p>
                                    <p className="text-xs text-gray-500 font-normal">{user?.email || 'admin@example.com'}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onSelect={() => navigate('/settings')} className="mx-1 my-0.5 cursor-pointer rounded-lg hover:bg-blue-50">
                                <User className="mr-2 h-4 w-4 text-blue-600" />
                                <span className="font-medium">Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => navigate('/settings')} className="mx-1 my-0.5 cursor-pointer rounded-lg hover:bg-purple-50">
                                <Settings className="mr-2 h-4 w-4 text-purple-600" />
                                <span className="font-medium">Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="cursor-pointer rounded-lg mx-1 my-1 text-red-600 hover:bg-red-50 font-semibold"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
