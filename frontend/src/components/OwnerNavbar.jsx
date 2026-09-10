import { NavLink } from "react-router-dom";

function OwnerNavbar() {
    const linkClass = ({ isActive }) =>
        `rounded-lg px-4 py-2 text-sm font-semibold transition ${
            isActive
                ? "bg-orange-600 text-white"
                : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
        }`;

    return (
        <div className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">

                {/* Title */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900">
                        Owner Panel
                    </h2>

                    <p className="text-xs text-gray-500">
                        Manage your business
                    </p>
                </div>

                {/* Navigation */}
                <nav className="flex gap-2">

                    <NavLink
                        to="/owner"
                        end
                        className={linkClass}
                    >
                        🏠 Dashboard
                    </NavLink>

                    <NavLink
                        to="/owner/orders"
                        className={linkClass}
                    >
                        📦 Orders
                    </NavLink>

                    <NavLink
                        to="/owner/products"
                        className={linkClass}
                    >
                        🍔 Products
                    </NavLink>
                    <NavLink
    to="/owner/store"
    className={linkClass}
>
    🏪 Store
</NavLink>

                </nav>

            </div>
        </div>
    );
}

export default OwnerNavbar;