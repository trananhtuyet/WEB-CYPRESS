import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

function Layout() {
  const { pathname } = useLocation();
  const isAuthPage =
    pathname === "/login" || pathname === "/register" || pathname === "/forgot-password";
  const isStandalonePage = isAuthPage || pathname === "/";

  return (
    <div className="app-shell">
      {!isStandalonePage && <Header />}
      <main className="main-content">
        <Outlet />
      </main>
      {!isStandalonePage && <Footer />}
    </div>
  );
}

export default Layout;
