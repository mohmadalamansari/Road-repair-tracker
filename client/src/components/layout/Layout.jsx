import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const Layout = () => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {!isHomePage && <Navbar />}
      <main className="flex-grow bg-gray-50">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
