import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import HomeRoute from "./components/HomeRoute";
import UserRoute from "./components/UserRoute";
import AdminRoute from "./components/AdminRoute";
import ToastContainer from "./components/ToastContainer";
import StyleChatBox from "./components/StyleChatBox";
import Home from "./pages/Home";
import CategoryProducts from "./pages/CategoryProducts";
import ProductDetail from "./pages/ProductDetail";
import FavoriteProducts from "./pages/FavoriteProducts";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import MockWallet from "./pages/MockWallet";
import PaymentResult from "./pages/PaymentResult";
import Contact from "./pages/Contact";
import Account from "./pages/Account";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import OrderHistory from "./pages/OrderHistory";
import Dashboard from "./pages/admin/Dashboard";
import Overview from "./pages/admin/Overview";
import AdminSearch from "./pages/admin/AdminSearch";
import ProductManagement from "./pages/admin/ProductManagement";
import OrderManagement from "./pages/admin/OrderManagement";
import ReportManagement from "./pages/admin/ReportManagement";
import UserManagement from "./pages/admin/UserManagement";
import PaymentSettings from "./pages/admin/PaymentSettings";
import VoucherManagement from "./pages/admin/VoucherManagement";
import SettingsManagement from "./pages/admin/SettingsManagement";
import SupportCenter from "./pages/admin/SupportCenter";
import ContactManagement from "./pages/admin/ContactManagement";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <HomeRoute>
                <Home />
              </HomeRoute>
            }
          />
          <Route path="/categories/:categoryId" element={<CategoryProducts />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/favorites" element={<FavoriteProducts />} />
          <Route path="/contact" element={<Contact />} />
          <Route
            path="/cart"
            element={
              <UserRoute>
                <CartPage />
              </UserRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <UserRoute>
                <Checkout />
              </UserRoute>
            }
          />
          <Route
            path="/payment-result"
            element={
              <UserRoute>
                <PaymentResult />
              </UserRoute>
            }
          />
          <Route
            path="/mock-wallet"
            element={
              <UserRoute>
                <MockWallet />
              </UserRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/account"
            element={
              <UserRoute>
                <Account />
              </UserRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <UserRoute>
                <OrderHistory />
              </UserRoute>
            }
          />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="overview" element={<Overview />} />
          <Route path="search" element={<AdminSearch />} />
          <Route path="products" element={<ProductManagement />} />
          <Route path="orders" element={<OrderManagement />} />
          <Route path="reports" element={<ReportManagement />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="contacts" element={<ContactManagement />} />
          <Route path="vouchers" element={<VoucherManagement />} />
          <Route path="payments" element={<PaymentSettings />} />
          <Route path="settings" element={<SettingsManagement />} />
          <Route path="support" element={<SupportCenter />} />
        </Route>
      </Routes>
      <StyleChatBox />
      <ToastContainer />
    </>
  );
}

export default App;
