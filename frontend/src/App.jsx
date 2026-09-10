import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StoreDetails from "./pages/StoreDetails";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Checkout from "./pages/Checkout";
import OrderDetails from "./pages/OrderDetails";
import OwnerOrders from "./pages/OwnerOrders";
import OwnerDashboard from "./pages/OwnerDashboard";
import OwnerProducts from "./pages/OwnerProducts";
import OwnerRoute from "./components/OwnerRoute";
import OwnerStore from "./pages/OwnerStore";
import OwnerLayout from "./components/OwnerLayout";
import Support from "./pages/Support";
import ContactUs from "./pages/ContactUs";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollFade from "./components/ScrollFade";

function App() {
    return (
        <BrowserRouter>

            {/* Glass background effects */}

            <div
                className="glass-orb glass-orb-orange"
                style={{
                    top: "10%",
                    left: "-80px"
                }}
            />

            <div
                className="glass-orb glass-orb-yellow"
                style={{
                    top: "45%",
                    right: "-100px"
                }}
            />

            <div
                className="glass-orb glass-orb-orange"
                style={{
                    bottom: "-100px",
                    left: "35%"
                }}
            />


            {/* Navigation */}

            <Navbar />
            <ScrollFade />


            {/* Application Routes */}

            <main className="glass-page">

                <Routes>

                    {/* ================================
                        PUBLIC ROUTES
                    ================================= */}

                    <Route
                        path="/"
                        element={<Home />}
                    />

                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />

                    <Route
                        path="/store/:storeId"
                        element={<StoreDetails />}
                    />

                    <Route
                        path="/support"
                        element={<Support />}
                    />

                    <Route
                        path="/contact"
                        element={<ContactUs />}
                    />


                    {/* ================================
                        PROTECTED USER ROUTES
                    ================================= */}

                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders"
                        element={
                            <ProtectedRoute>
                                <Orders />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/orders/:id"
                        element={
                            <ProtectedRoute>
                                <OrderDetails />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />


                    {/* ================================
                        PROTECTED OWNER ROUTES
                    ================================= */}

                    <Route
                        path="/owner"
                        element={
                            <OwnerRoute>
                                <OwnerDashboard />
                            </OwnerRoute>
                        }
                    />

                    <Route
                        path="/owner/orders"
                        element={
                            <OwnerRoute>
                                <OwnerOrders />
                            </OwnerRoute>
                        }
                    />

                    <Route
                        path="/owner/products"
                        element={
                            <OwnerRoute>
                                <OwnerProducts />
                            </OwnerRoute>
                        }
                    />

                    <Route
                        path="/owner/store"
                        element={
                            <OwnerRoute>
                                <OwnerLayout>
                                    <OwnerStore />
                                </OwnerLayout>
                            </OwnerRoute>
                        }
                    />

                </Routes>

            </main>

            <Footer />

        </BrowserRouter>
    );
}

export default App;
