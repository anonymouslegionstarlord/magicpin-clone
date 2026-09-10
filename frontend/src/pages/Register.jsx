import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/api";

function Register() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRegister = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await API.post("/auth/register", {
                name,
                email,
                password
            });

            console.log(response.data);

            setSuccess(
                "Account created successfully!"
            );

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            console.log(error);

            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-[calc(100vh-80px)] items-center justify-center overflow-hidden px-4 py-12">

            {/* Background decoration */}

            <div className="pointer-events-none absolute -left-32 top-10 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl" />

            <div className="pointer-events-none absolute -right-32 bottom-10 h-80 w-80 rounded-full bg-orange-300/20 blur-3xl" />


            {/* Register Card */}

            <div className="glass-strong relative w-full max-w-md rounded-[2rem] p-7 sm:p-10">

                {/* Header */}

                <div className="mb-8 text-center">

                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500 text-2xl font-black text-white shadow-xl shadow-orange-500/25">
                        F
                    </div>

                    <h1 className="mt-5 text-3xl font-black tracking-tight text-gray-900">
                        Create Account
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        Join FoodieHub and discover more
                    </p>

                </div>


                {/* Error */}

                {error && (
                    <div className="mb-5 rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm font-medium text-red-600 backdrop-blur-md">
                        {error}
                    </div>
                )}


                {/* Success */}

                {success && (
                    <div className="mb-5 rounded-xl border border-green-200/70 bg-green-50/70 px-4 py-3 text-sm font-medium text-green-700 backdrop-blur-md">
                        ✓ {success}
                    </div>
                )}


                {/* Form */}

                <form
                    onSubmit={handleRegister}
                    className="space-y-5"
                >

                    {/* Name */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Name
                        </label>

                        <div className="glass-input flex items-center rounded-xl px-4">

                            <span className="mr-3 text-lg">
                                👤
                            </span>

                            <input
                                type="text"
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) =>
                                    setName(e.target.value)
                                }
                                required
                                className="w-full bg-transparent py-3.5 text-gray-800 outline-none placeholder:text-gray-400"
                            />

                        </div>

                    </div>


                    {/* Email */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Email
                        </label>

                        <div className="glass-input flex items-center rounded-xl px-4">

                            <span className="mr-3 text-lg">
                                ✉️
                            </span>

                            <input
                                type="email"
                                placeholder="Enter your email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                                className="w-full bg-transparent py-3.5 text-gray-800 outline-none placeholder:text-gray-400"
                            />

                        </div>

                    </div>


                    {/* Password */}

                    <div>

                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Password
                        </label>

                        <div className="glass-input flex items-center rounded-xl px-4">

                            <span className="mr-3 text-lg">
                                🔒
                            </span>

                            <input
                                type="password"
                                placeholder="Create a password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                                className="w-full bg-transparent py-3.5 text-gray-800 outline-none placeholder:text-gray-400"
                            />

                        </div>

                    </div>


                    {/* Register */}

                    <button
                        type="submit"
                        disabled={loading}
                        className="glass-orange w-full rounded-xl py-3.5 font-bold disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {loading
                            ? "Creating Account..."
                            : "Create Account →"}
                    </button>

                </form>


                {/* Login */}

                <div className="mt-7 border-t border-white/60 pt-6 text-center">

                    <p className="text-sm text-gray-500">
                        Already have an account?
                    </p>

                    <Link
                        to="/login"
                        className="mt-2 inline-block font-bold text-orange-600 transition hover:text-orange-700"
                    >
                        Login instead →
                    </Link>

                </div>

            </div>

        </div>
    );
}

export default Register;
