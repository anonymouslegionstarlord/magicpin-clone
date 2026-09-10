import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toggleTheme } from "../utils/theme";

const USER_CHANGE_EVENT = "foodiehub-user-updated";

const readStoredUser = () => {
    try {
        return JSON.parse(
            localStorage.getItem("user") || "null"
        );
    } catch {
        return null;
    }
};

function Navbar() {
    const navigate = useNavigate();
    const [ownerMenuOpen, setOwnerMenuOpen] = useState(false);
    const [user, setUser] = useState(readStoredUser);
    const ownerMenuRef = useRef(null);

    const token = localStorage.getItem("token");

    const logout = () => {
        setOwnerMenuOpen(false);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.dispatchEvent(new Event(USER_CHANGE_EVENT));

        navigate("/login");
    };

    useEffect(() => {
        const syncUser = () => setUser(readStoredUser());

        window.addEventListener(USER_CHANGE_EVENT, syncUser);
        window.addEventListener("storage", syncUser);

        return () => {
            window.removeEventListener(USER_CHANGE_EVENT, syncUser);
            window.removeEventListener("storage", syncUser);
        };
    }, []);

    useEffect(() => {
        const closeOwnerMenu = (event) => {
            if (
                ownerMenuRef.current &&
                !ownerMenuRef.current.contains(event.target)
            ) {
                setOwnerMenuOpen(false);
            }
        };

        const closeOnEscape = (event) => {
            if (event.key === "Escape") {
                setOwnerMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", closeOwnerMenu);
        document.addEventListener("keydown", closeOnEscape);

        return () => {
            document.removeEventListener("mousedown", closeOwnerMenu);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, []);

    const ownerLinks = [
        {
            to: "/owner",
            icon: "📊",
            label: "Owner Dashboard",
            description: "Overview and activity"
        },
        {
            to: "/owner/orders",
            icon: "📦",
            label: "Owner Orders",
            description: "View and manage all orders"
        },
        {
            to: "/owner/store",
            icon: "🏪",
            label: "Manage Restaurants",
            description: "Restaurant information"
        },
        {
            to: "/owner/products",
            icon: "🍽️",
            label: "Manage Restaurant Menu",
            description: "Add and update menu items"
        },
        {
            to: "/contact",
            icon: "✉️",
            label: "Contact Us",
            description: "Get in touch"
        },
        {
            to: "/support",
            icon: "❓",
            label: "Help & Support",
            description: "Answers and assistance"
        }
    ];

    return (
        <nav className="sticky top-0 z-50 px-4 py-3">

            <div className="mx-auto max-w-7xl">

                <div className="glass-strong rounded-2xl px-5 py-3">

                    <div className="flex items-center justify-between">

                        {/* ================================
                            LOGO
                        ================================= */}

                        <div className="group flex items-center gap-2">

                            <button
                                type="button"
                                onClick={() => toggleTheme()}
                                aria-label="Toggle light and dark mode"
                                title="Click the FoodieHub icon to change theme"
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/90 text-xl font-black text-white shadow-lg shadow-orange-500/20 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
                            >
                                F
                            </button>

                            <Link to="/" className="hidden sm:block">

                                <div className="text-xl font-bold tracking-tight text-gray-900">
                                    Foodie<span className="text-orange-600">Hub</span>
                                </div>

                                <div className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
                                    Discover • Shop • Enjoy
                                </div>

                            </Link>

                        </div>


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


                            {!user?.canAccessOwnerDashboard && (
                                <>
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
                                </>
                            )}


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


                                    {/* Owner Navigation */}

                                    {user?.canAccessOwnerDashboard && (
                                        <div
                                            ref={ownerMenuRef}
                                            className="relative"
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setOwnerMenuOpen(
                                                        (open) => !open
                                                    )
                                                }
                                                aria-haspopup="menu"
                                                aria-expanded={ownerMenuOpen}
                                                className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-sm font-bold text-gray-700 transition hover:bg-white/60 hover:text-orange-600 sm:px-3"
                                            >
                                                <span>🏪</span>
                                                <span className="hidden lg:inline">
                                                    Admin
                                                </span>
                                                <span
                                                    className={`text-[10px] transition-transform ${
                                                        ownerMenuOpen
                                                            ? "rotate-180"
                                                            : ""
                                                    }`}
                                                >
                                                    ▼
                                                </span>
                                            </button>

                                            {ownerMenuOpen && (
                                                <div
                                                    role="menu"
                                                    className="glass-strong absolute right-0 top-[calc(100%+0.75rem)] z-[70] w-72 overflow-hidden rounded-2xl p-2 shadow-2xl"
                                                >
                                                    <div className="border-b border-white/60 px-3 py-2.5">
                                                        <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">
                                                            Atlas Admin Menu
                                                        </p>
                                                    </div>

                                                    <div className="mt-1 space-y-1">
                                                        {ownerLinks.map(
                                                            (item, index) => (
                                                                <div
                                                                    key={item.to}
                                                                    className={
                                                                        index === 4
                                                                            ? "border-t border-white/60 pt-1"
                                                                            : ""
                                                                    }
                                                                >
                                                                    <Link
                                                                        to={item.to}
                                                                        role="menuitem"
                                                                        onClick={() =>
                                                                            setOwnerMenuOpen(
                                                                                false
                                                                            )
                                                                        }
                                                                        className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition hover:bg-white/65"
                                                                    >
                                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-100/75 text-lg">
                                                                            {
                                                                                item.icon
                                                                            }
                                                                        </span>

                                                                        <span className="min-w-0">
                                                                            <span className="block text-sm font-black text-gray-800">
                                                                                {
                                                                                    item.label
                                                                                }
                                                                            </span>
                                                                            <span className="block truncate text-xs text-gray-500">
                                                                                {
                                                                                    item.description
                                                                                }
                                                                            </span>
                                                                        </span>
                                                                    </Link>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}


                                    {/* Profile */}

                                    <Link
                                        to="/profile"
                                        className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-white/60 hover:text-orange-600"
                                    >

                                        <div className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-orange-100 text-orange-600">
                                            <span aria-hidden="true">👤</span>
                                            {user?.profileImage && (
                                                <img
                                                    src={user.profileImage}
                                                    alt=""
                                                    className="absolute inset-0 h-full w-full object-cover"
                                                    onError={(event) => {
                                                        event.currentTarget.style.display = "none";
                                                    }}
                                                />
                                            )}
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
