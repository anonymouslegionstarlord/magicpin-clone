import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Profile() {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await API.get(
                    "/users/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setUser(response.data.user);

            } catch (error) {
                console.log(error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load profile"
                );

            } finally {
                setLoading(false);
            }
        };

        fetchProfile();

    }, [navigate, token]);


    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };


    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-orange-300/15 blur-3xl" />

                <div className="mx-auto max-w-3xl">

                    <div className="glass-strong rounded-[2rem] p-16 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-orange-100/70 text-4xl">
                            👤
                        </div>

                        <div className="mx-auto mt-6 h-10 w-10 animate-spin rounded-full border-4 border-orange-200 border-t-orange-600" />

                        <p className="mt-5 font-medium text-gray-500">
                            Loading profile...
                        </p>

                    </div>

                </div>

            </div>
        );
    }


    // ==========================================
    // ERROR
    // ==========================================

    if (error) {
        return (
            <div className="relative min-h-screen overflow-hidden px-4 py-16">

                <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />

                <div className="mx-auto max-w-3xl">

                    <div className="glass-strong rounded-[2rem] p-10 text-center">

                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50/70 text-4xl">
                            ⚠️
                        </div>

                        <h1 className="mt-6 text-2xl font-black text-gray-900">
                            Unable to load profile
                        </h1>

                        <p className="mt-3 text-gray-500">
                            {error}
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            className="glass-orange mt-7 rounded-xl px-7 py-3 font-bold"
                        >
                            Try Again
                        </button>

                    </div>

                </div>

            </div>
        );
    }


    return (
        <div className="relative min-h-screen overflow-hidden pb-20">

            {/* ==========================================
                BACKGROUND
            ========================================== */}

            <div className="pointer-events-none fixed -left-40 top-20 -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-400/10 blur-3xl" />

            <div className="pointer-events-none fixed -right-40 bottom-10 -z-10 h-[30rem] w-[30rem] rounded-full bg-orange-300/10 blur-3xl" />


            <main className="mx-auto max-w-4xl px-4 py-8 md:py-12">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="glass rounded-[1.5rem] p-6 md:p-8">

                    <div className="flex items-center gap-4">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100/70 text-2xl">
                            👤
                        </div>

                        <div>

                            <p className="text-sm font-bold text-orange-600">
                                Account
                            </p>

                            <h1 className="text-3xl font-black tracking-tight text-gray-900">
                                My Profile
                            </h1>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your account information
                            </p>

                        </div>

                    </div>

                </div>


                {/* ==========================================
                    PROFILE CARD
                ========================================== */}

                <div className="glass-strong mt-7 overflow-hidden rounded-[2rem]">

                    {/* PROFILE TOP */}

                    <div className="bg-gradient-to-br from-orange-500/90 via-orange-400/80 to-orange-300/70 p-8 md:p-10">

                        <div className="flex flex-col items-center text-center">

                            {/* AVATAR */}

                            <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/70 bg-white/30 text-5xl shadow-xl backdrop-blur-xl">
                                👤
                            </div>

                            <h2 className="mt-5 text-3xl font-black text-white">
                                {user?.name || "User"}
                            </h2>

                            <p className="mt-1 text-sm font-medium text-white/80">
                                {user?.email}
                            </p>

                        </div>

                    </div>


                    {/* PROFILE INFORMATION */}

                    <div className="p-6 md:p-8">

                        <h3 className="text-xl font-black text-gray-900">
                            Personal Information
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                            Your account details
                        </p>


                        <div className="mt-6 grid gap-4 md:grid-cols-2">

                            {/* NAME */}

                            <div className="glass rounded-2xl p-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100/70 text-xl">
                                        👤
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Full Name
                                        </p>

                                        <p className="mt-1 truncate font-bold text-gray-800">
                                            {user?.name || "Not available"}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* EMAIL */}

                            <div className="glass rounded-2xl p-5">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100/70 text-xl">
                                        ✉️
                                    </div>

                                    <div className="min-w-0">

                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Email Address
                                        </p>

                                        <p className="mt-1 truncate font-bold text-gray-800">
                                            {user?.email || "Not available"}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>


                        {/* ACCOUNT STATUS */}

                        <div className="mt-5 glass rounded-2xl p-5">

                            <div className="flex items-center justify-between gap-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100/70 text-xl">
                                        ✓
                                    </div>

                                    <div>

                                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
                                            Account Status
                                        </p>

                                        <p className="mt-1 font-bold text-gray-800">
                                            Active Account
                                        </p>

                                    </div>

                                </div>

                                <span className="rounded-full border border-green-200/70 bg-green-50/80 px-4 py-2 text-xs font-black text-green-700">
                                    Active
                                </span>

                            </div>

                        </div>


                        {/* ==================================
                            ACTIONS
                        ================================== */}

                        <div className="mt-8 border-t border-white/70 pt-7">

                            <h3 className="text-lg font-black text-gray-900">
                                Account Actions
                            </h3>

                            <p className="mt-1 text-sm text-gray-500">
                                Manage your account session
                            </p>


                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">

                                <button
                                    onClick={() =>
                                        navigate("/orders")
                                    }
                                    className="glass-button flex-1 rounded-xl px-5 py-3.5 font-bold text-gray-700"
                                >
                                    📦 My Orders
                                </button>

                                <button
                                    onClick={() =>
                                        navigate("/cart")
                                    }
                                    className="glass-orange flex-1 rounded-xl px-5 py-3.5 font-bold"
                                >
                                    🛒 View Cart
                                </button>

                            </div>


                            <button
                                onClick={logout}
                                className="mt-3 w-full rounded-xl border border-red-200/70 bg-red-50/60 px-5 py-3.5 font-bold text-red-600 backdrop-blur-xl transition hover:bg-red-100/70"
                            >
                                🚪 Logout
                            </button>

                        </div>

                    </div>

                </div>

            </main>

        </div>
    );
}

export default Profile;