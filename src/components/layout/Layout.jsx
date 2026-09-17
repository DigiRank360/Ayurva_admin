import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block">
                <Sidebar />
            </div>

            {/* Sidebar - Mobile (Overlay) */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <div className="lg:hidden">
                        <Sidebar onClose={() => setSidebarOpen(false)} />
                    </div>
                </>
            )}

            {/* Main Content */}
            <div className="lg:pl-64">
                <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

                <main className="p-0">
                    <div className="px-4 sm:px-6 lg:px-8 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
