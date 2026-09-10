import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="px-4 pb-6 pt-2">
            <div className="glass-strong mx-auto flex max-w-7xl flex-col gap-5 rounded-2xl px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <Link
                        to="/"
                        className="text-lg font-black text-gray-900"
                    >
                        Foodie<span className="text-orange-600">Hub</span>
                    </Link>
                    <p className="mt-1 text-xs text-gray-500">
                        Discover, shop and enjoy nearby.
                    </p>
                </div>

                <nav
                    aria-label="Footer navigation"
                    className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold"
                >
                    <Link
                        to="/"
                        className="text-gray-600 hover:text-orange-600"
                    >
                        Home
                    </Link>
                    <Link
                        to="/support"
                        className="text-gray-600 hover:text-orange-600"
                    >
                        Customer Support
                    </Link>
                    <Link
                        to="/contact"
                        className="text-gray-600 hover:text-orange-600"
                    >
                        Contact Us
                    </Link>
                </nav>
            </div>
        </footer>
    );
}

export default Footer;
