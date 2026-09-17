import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
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
    CheckCircle,
    TrendingUp,
    Sun,
    Moon
} from 'lucide-react';

export default function Header({ onToggleSidebar }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const notifications = [
        { id: 1, type: 'order', title: 'New Order #1234', message: 'Order placed by Priya Sharma', time: '2m ago', read: false },
        { id: 2, type: 'product', title: 'Low Stock Alert', message: 'Banarasi Silk Saree - Only 5 left', time: '15m ago', read: false },
        { id: 3, type: 'success', title: 'Product Updated', message: 'Designer Suit Set updated successfully', time: '1h ago', read: true },
        { id: 4, type: 'info', title: 'New Customer', message: '3 new customers registered today', time: '2h ago', read: true },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    const getNotificationIcon = (type) => {
        const icons = {
            order: <ShoppingBag className="h-4 w-4 text-blue-600" />,
            product: <Package className="h-4 w-4 text-orange-600" />,
            success: <CheckCircle className="h-4 w-4 text-green-600" />,
            info: <TrendingUp className="h-4 w-4 text-purple-600" />,
        };
        return icons[type] || null;
    };

    const getInitials = (name) => {
        if (!name) return 'A';
        return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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
                <div className="flex-1 max-w-2xl">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative flex items-center">
                            <Search className="absolute left-4 h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            <Input
                                type="search"
                                placeholder="Search products, orders, customers..."
                                className="pl-11 pr-4 h-10 w-full bg-gray-50 border-gray-200 rounded-xl focus:bg-white focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-yellow-50 transition-all"
                    >
                        <Sun className="h-5 w-5 text-orange-500" />
                    </Button>

                    {/* Notifications Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
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
                        <DropdownMenuContent align="end" className="w-80 rounded-xl border-gray-200/50 shadow-xl">
                            <DropdownMenuLabel className="flex items-center justify-between py-3">
                                <span className="text-base font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                    Notifications
                                </span>
                                {unreadCount > 0 && (
                                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0">
                                        {unreadCount} new
                                    </Badge>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <DropdownMenuItem
                                        key={notification.id}
                                        className={`flex items-start gap-3 p-3 cursor-pointer rounded-lg mx-1 my-0.5 ${!notification.read ? 'bg-gradient-to-r from-blue-50 to-purple-50' : ''
                                            }`}
                                    >
                                        <div className="mt-0.5 p-2 rounded-lg bg-white shadow-sm">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-gray-500">{notification.message}</p>
                                            <p className="text-xs text-gray-400">{notification.time}</p>
                                        </div>
                                        {!notification.read && (
                                            <div className="h-2 w-2 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 mt-2 shadow-lg shadow-blue-500/50"></div>
                                        )}
                                    </DropdownMenuItem>
                                ))}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="justify-center text-blue-600 font-semibold hover:bg-blue-50 rounded-lg mx-1 my-1">
                                View all notifications
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
                            <DropdownMenuItem className="cursor-pointer rounded-lg mx-1 my-0.5 hover:bg-blue-50">
                                <User className="mr-2 h-4 w-4 text-blue-600" />
                                <span className="font-medium">Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg mx-1 my-0.5 hover:bg-purple-50">
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
