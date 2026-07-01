// src/App.jsx
import { useState, useEffect } from "react";

import Header from "./components/Header";
import LandingPage from "./pages/LandingPage";
import ProductsPage from "./pages/ProductsPage";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./admin/AdminDashboard";
import Footer from "./components/Footer";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import OrdersPage from "./pages/OrdersPage";
import NewArrivals from "./pages/NewArrivals";
import OffersPage from "./pages/Offers.jsx";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [darkMode, setDarkMode] = useState(true);

  // Holds the confirmed order object after payment so OrdersPage can show the
  // confirmation screen. Cleared when the user navigates away from "orders".
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Navigate to orders and pass the freshly-paid order for confirmation view
  const navigateToOrderConfirmation = (order) => {
    setConfirmedOrder(order);
    setCurrentPage("orders");
  };

  // Clear the confirmation payload as soon as they leave the orders page
  useEffect(() => {
    if (currentPage !== "orders") {
      setConfirmedOrder(null);
    }
  }, [currentPage]);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentPage]);

  const showFooter = currentPage !== "admin" && currentPage !== "login";

  return (
    <div className={darkMode ? "dark" : ""}>

      {/* HEADER */}
      <Header
        darkMode={darkMode}
        toggleDark={() => setDarkMode((d) => !d)}
        setCurrentPage={setCurrentPage}
      />

      {/* MAIN */}
      <main className="pt-0">

        {currentPage === "home" && (
          <LandingPage darkMode={darkMode} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "products" && (
          <ProductsPage currentPage={currentPage} />
        )}

        {currentPage === "new-arrivals" && (
          <NewArrivals darkMode={darkMode} />
        )}

        {currentPage === "offers" && (
          <OffersPage darkMode={darkMode} />
        )}

        {currentPage === "login" && (
          <LoginPage setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "admin" && (
          <AdminDashboard setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "cart" && (
          <CartPage
            darkMode={darkMode}
            setCurrentPage={setCurrentPage}
            // Pass this down so CartPage can hand back the paid order
            onOrderConfirmed={navigateToOrderConfirmation}
          />
        )}

        {currentPage === "wishlist" && (
          <WishlistPage darkMode={darkMode} setCurrentPage={setCurrentPage} />
        )}

        {currentPage === "orders" && (
          <OrdersPage
            darkMode={darkMode}
            setCurrentPage={setCurrentPage}
            // undefined when navigating normally; populated right after payment
            confirmedOrder={confirmedOrder}
          />
        )}

      </main>

      {showFooter && <Footer darkMode={darkMode} />}
    </div>
  );
}