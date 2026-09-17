import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';
import Dashboard from './pages/dashboard/Dashboard';
import ProductList from './pages/products/ProductList';
import CreateProduct from './pages/products/CreateProduct';
import EditProduct from './pages/products/EditProduct';
import CategoryList from './pages/categories/CategoryList';
import CreateCategory from './pages/categories/CreateCategory';
import EditCategory from './pages/categories/EditCategory';
import BannerList from './pages/banners/BannerList';
import CreateBanner from './pages/banners/CreateBanner';
import EditBanner from './pages/banners/EditBanner';
import OfferList from './pages/offers/OfferList';
import CreateOffer from './pages/offers/CreateOffer';
import EditOffer from './pages/offers/EditOffer';

// Order Routes
import Orders from './pages/orders/Orders';
import OrderDetails from './pages/orders/OrderDetails';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <Layout>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />

                      {/* Product Routes */}
                      <Route path="/products" element={<ProductList />} />
                      <Route path="/products/create" element={<CreateProduct />} />
                      <Route path="/products/edit/:id" element={<EditProduct />} />

                      {/* Category Routes */}
                      <Route path="/categories" element={<CategoryList />} />
                      <Route path="/categories/create" element={<CreateCategory />} />
                      <Route path="/categories/edit/:id" element={<EditCategory />} />

                      {/* Banner Routes */}
                      <Route path="/banners" element={<BannerList />} />
                      <Route path="/banners/create" element={<CreateBanner />} />
                      <Route path="/banners/edit/:id" element={<EditBanner />} />

                      {/* Offer Routes */}
                      <Route path="/offers" element={<OfferList />} />
                      <Route path="/offers/create" element={<CreateOffer />} />
                      <Route path="/offers/edit/:id" element={<EditOffer />} />

                      {/* Order Routes */}
                      <Route path="/orders" element={<Orders />} />
                      <Route path="/orders/:id" element={<OrderDetails />} />
                      <Route path="/users" element={<div className="text-2xl">Users (Coming Soon)</div>} />
                      <Route path="/returns" element={<div className="text-2xl">Returns (Coming Soon)</div>} />
                      <Route path="/shipping" element={<div className="text-2xl">Shipping (Coming Soon)</div>} />
                      <Route path="/reports" element={<div className="text-2xl">Reports (Coming Soon)</div>} />
                      <Route path="/settings" element={<div className="text-2xl">Settings (Coming Soon)</div>} />
                    </Routes>
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
