import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Users,
    RefreshCw,
    Truck,
    Image,
    Tag,
    BarChart3,
    Settings,
    Store,
    X,
    Sparkles
} from 'lucide-react';

export default function Sidebar({ onClose }) {
    const location = useLocation();

    const menuItems = [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-cyan-500' },
        { name: 'Products', path: '/products', icon: Package, color: 'from-purple-500 to-pink-500' },
        { name: 'Categories', path: '/categories', icon: FolderTree, color: 'from-orange-500 to-red-500' },
        { name: 'Orders', path: '/orders', icon: ShoppingCart, color: 'from-green-500 to-emerald-500' },
        { name: 'Users', path: '/users', icon: Users, color: 'from-indigo-500 to-purple-500' },
        { name: 'Returns', path: '/returns', icon: RefreshCw, color: 'from-yellow-500 to-orange-500' },
        { name: 'Shipping', path: '/shipping', icon: Truck, color: 'from-teal-500 to-cyan-500' },
        { name: 'Banners', path: '/banners', icon: Image, color: 'from-pink-500 to-rose-500' },
        { name: 'Offers', path: '/offers', icon: Tag, color: 'from-red-500 to-pink-500' },
        { name: 'Reports', path: '/reports', icon: BarChart3, color: 'from-violet-500 to-purple-500' },
        { name: 'Settings', path: '/settings', icon: Settings, color: 'from-gray-500 to-slate-500' },
    ];

    const isActive = (path) => {
        if (path === '/dashboard') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <aside className="fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 shadow-2xl">
            {/* Logo Section with Gradient */}
            <div className="relative flex items-center justify-between px-6 py-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-pink-500 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-all"></div>
                        <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-xl">
                            <Store className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                            Ayurva PRO
                        </h1>
                        <p className="text-xs text-purple-200 flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Wellness Admin
                        </p>
                    </div>
                </div>

                {/* Mobile Close Button */}
                {onClose && (
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="lg:hidden text-white/70 hover:text-white hover:bg-white/10 rounded-lg"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            {/* Navigation Menu with Premium Effects */}
            <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-1.5 h-[calc(100vh-200px)] scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={cn(
                                'group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300',
                                active
                                    ? 'bg-gradient-to-r from-white/10 to-white/5 shadow-lg shadow-purple-500/20'
                                    : 'hover:bg-white/5 hover:translate-x-1'
                            )}
                        >
                            {/* Gradient Border on Active */}
                            {active && (
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r p-[1px] from-blue-500 via-purple-500 to-pink-500">
                                    <div className="h-full w-full rounded-xl bg-gradient-to-r from-slate-900/90 to-purple-900/90"></div>
                                </div>
                            )}

                            {/* Icon with Gradient Background */}
                            <div className={cn(
                                'relative z-10 p-2 rounded-lg transition-all duration-300',
                                active
                                    ? `bg-gradient-to-br ${item.color} shadow-lg`
                                    : 'bg-white/5 group-hover:bg-white/10'
                            )}>
                                <Icon
                                    className={cn(
                                        'h-5 w-5 transition-all duration-300',
                                        active ? 'text-white' : 'text-purple-200 group-hover:text-white'
                                    )}
                                />
                            </div>

                            {/* Label */}
                            <span className={cn(
                                'relative z-10 font-medium text-sm transition-all duration-300',
                                active
                                    ? 'text-white font-semibold'
                                    : 'text-purple-100/80 group-hover:text-white'
                            )}>
                                {item.name}
                            </span>

                            {/* Active Indicator Line */}
                            {active && (
                                <div className={`absolute right-4 w-1.5 h-8 rounded-full bg-gradient-to-b ${item.color} shadow-lg`}></div>
                            )}

                            {/* Hover Glow Effect */}
                            {!active && (
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300"></div>
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Premium Bottom Card */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20 backdrop-blur-sm">
                <div className="relative overflow-hidden p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-purple-500/20">
                    {/* Animated background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>

                    <div className="relative z-10 space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400 animate-pulse shadow-lg shadow-green-500/50"></div>
                            <p className="text-xs font-semibold text-white">System Status</p>
                        </div>
                        <p className="text-xs text-purple-200">All systems operational</p>
                        <div className="flex gap-1 mt-2">
                            <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500"></div>
                            <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                            <div className="h-1 flex-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
