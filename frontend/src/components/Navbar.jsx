import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

function Navbar() {
    const navigate = useNavigate();

    const token = localStorage.getItem("token");

    const user = JSON.parse(
        localStorage.getItem("user") || "null"
    );

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-50 px-4 py-3">

            <div className="mx-auto max-w-7xl">

                <div className="glass-strong rounded-2xl px-5 py-3">

                    <div className="flex items-center justify-between">

                        {/* ================================
                            LOGO
                        ================================= */}

                        <Link
                            to="/"
                            className="group flex items-center gap-2"
                        >

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/90 text-xl text-white shadow-lg shadow-orange-500/20 transition group-hover:scale-105">
                                M
                            </div>

                            <div className="hidden sm:block">

                                <div className="text-xl font-bold tracking-tight text-gray-900">
                                    Magic<span className="text-orange-600">pin</span>
                                </div>

                                <div className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                                    Discover • Shop • Enjoy
                                </div>

                            </div>

                        </Link>


                        {/* ================================
                            NAVIGATION
                        ================================= */}

                        <div className="flex items-center gap-1 sm:gap-2">

                            {/* Home */}

                            <Link
                                to="/"
                                className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600 sm:block"
                            >
                                Home
                            </Link>


                            <Link
                                to="/support"
                                className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600 lg:block"
                            >
                                Support
                            </Link>


                            <Link
                                to="/contact"
                                className="hidden rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600 xl:block"
                            >
                                Contact
                            </Link>


                            <ThemeToggle />


                            {token ? (
                                <>

                                    {/* Orders */}

                                    <Link
                                        to="/orders"
                                        className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600"
                                    >
                                        <span className="hidden sm:inline">
                                            Orders
                                        </span>

                                        <span className="sm:hidden">
                                            📦
                                        </span>
                                    </Link>


                                    {/* Cart */}

                                    <Link
                                        to="/cart"
                                        className="rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600"
                                    >
                                        🛒

                                        <span className="hidden sm:inline ml-1">
                                            Cart
                                        </span>
                                    </Link>


                                    {/* Owner Dashboard */}

                                    {user?.canAccessOwnerDashboard && (
                                        <Link
                                            to="/owner"
                                            className="hidden lg:block rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600"
                                        >
                                            🏪 Owner
                                        </Link>
                                    )}


                                    {/* Profile */}

                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600"
                                    >

                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                                            👤
                                        </div>

                                        <span className="hidden md:inline max-w-24 truncate">
                                            {user?.name || "Profile"}
                                        </span>

                                    </Link>


                                    {/* Logout */}

                                    <button
                                        onClick={logout}
                                        className="glass-orange rounded-xl px-4 py-2 text-sm font-semibold"
                                    >
                                        <span className="hidden sm:inline">
                                            Logout
                                        </span>

                                        <span className="sm:hidden">
                                            ↪
                                        </span>
                                    </button>

                                </>
                            ) : (
                                <>

                                    {/* Login */}

                                    <Link
                                        to="/login"
                                        className="glass-button rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:text-orange-600"
                                    >
                                        Login
                                    </Link>


                                    {/* Register */}

                                    <Link
                                        to="/register"
                                        className="glass-orange rounded-xl px-4 py-2 text-sm font-semibold"
                                    >
                                        Register
                                    </Link>

                                </>
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </nav>
    );
}

export default Navbar;
