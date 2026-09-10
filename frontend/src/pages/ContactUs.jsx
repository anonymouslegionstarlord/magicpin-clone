import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/api";

const initialForm = {
    name: "",
    email: "",
    category: "order",
    subject: "",
    message: "",
    website: ""
};

function ContactUs() {
    const [form, setForm] = useState(initialForm);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [confirmation, setConfirmation] = useState(null);

    const updateField = (event) => {
        const { name, value } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitting(true);
        setError("");
        setConfirmation(null);

        try {
            const response = await API.post(
                "/support/contact",
                form
            );

            setConfirmation({
                message: response.data.message,
                reference: response.data.reference
            });
            setForm(initialForm);

        } catch (error) {
            console.log("Contact form error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to send your message. Please try again."
            );

        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">
            <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
                <div className="grid gap-7 lg:grid-cols-[0.85fr_1.15fr]">
                    <section className="glass-strong rounded-[2rem] p-7 shadow-xl md:p-9">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl">
                            💬
                        </div>

                        <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-orange-500">
                            Contact Us
                        </p>

                        <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-4xl">
                            Tell us how we can help
                        </h1>

                        <p className="mt-4 leading-7 text-gray-500">
                            Share the details of your question or problem.
                            Our support team will use your email address to
                            follow up.
                        </p>

                        <div className="mt-8 space-y-4">
                            <div className="glass rounded-2xl p-5">
                                <p className="font-black text-gray-900">
                                    📦 Order issue
                                </p>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Include the order reference shown on your Orders page.
                                </p>
                            </div>

                            <div className="glass rounded-2xl p-5">
                                <p className="font-black text-gray-900">
                                    ⏱ Response information
                                </p>
                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    Keep your ticket reference after submitting the form.
                                </p>
                            </div>
                        </div>

                        <Link
                            to="/support"
                            className="mt-7 inline-flex font-black text-orange-600 hover:text-orange-700"
                        >
                            ← Visit Customer Support
                        </Link>
                    </section>

                    <section className="glass-strong rounded-[2rem] p-7 shadow-xl md:p-9">
                        <h2 className="text-2xl font-black text-gray-900">
                            Send a message
                        </h2>
                        <p className="mt-2 text-sm text-gray-500">
                            All fields are required.
                        </p>

                        {error && (
                            <div className="mt-5 rounded-xl border border-red-200/70 bg-red-50/70 px-4 py-3 text-sm font-bold text-red-700">
                                {error}
                            </div>
                        )}

                        {confirmation && (
                            <div className="mt-5 rounded-xl border border-green-200/70 bg-green-50/70 px-4 py-4 text-sm text-green-700">
                                <p className="font-black">
                                    ✓ {confirmation.message}
                                </p>
                                <p className="mt-1">
                                    Ticket reference:{" "}
                                    <strong>
                                        {confirmation.reference}
                                    </strong>
                                </p>
                            </div>
                        )}

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-5"
                        >
                            <div className="grid gap-5 sm:grid-cols-2">
                                <label className="block">
                                    <span className="mb-2 block text-sm font-bold text-gray-700">
                                        Name
                                    </span>
                                    <input
                                        name="name"
                                        type="text"
                                        value={form.name}
                                        onChange={updateField}
                                        minLength={2}
                                        maxLength={80}
                                        required
                                        autoComplete="name"
                                        className="glass-input rounded-xl px-4 py-3 text-gray-800 outline-none placeholder:text-gray-400"
                                        placeholder="Your name"
                                    />
                                </label>

                                <label className="block">
                                    <span className="mb-2 block text-sm font-bold text-gray-700">
                                        Email
                                    </span>
                                    <input
                                        name="email"
                                        type="email"
                                        value={form.email}
                                        onChange={updateField}
                                        maxLength={160}
                                        required
                                        autoComplete="email"
                                        className="glass-input rounded-xl px-4 py-3 text-gray-800 outline-none placeholder:text-gray-400"
                                        placeholder="you@example.com"
                                    />
                                </label>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-gray-700">
                                    Help category
                                </span>
                                <select
                                    name="category"
                                    value={form.category}
                                    onChange={updateField}
                                    className="glass-input rounded-xl px-4 py-3 text-gray-800 outline-none"
                                >
                                    <option value="order">Order</option>
                                    <option value="payment">Payment</option>
                                    <option value="account">Account</option>
                                    <option value="store">Store or product</option>
                                    <option value="other">Other</option>
                                </select>
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-gray-700">
                                    Subject
                                </span>
                                <input
                                    name="subject"
                                    type="text"
                                    value={form.subject}
                                    onChange={updateField}
                                    minLength={3}
                                    maxLength={120}
                                    required
                                    className="glass-input rounded-xl px-4 py-3 text-gray-800 outline-none placeholder:text-gray-400"
                                    placeholder="Briefly describe the issue"
                                />
                            </label>

                            <label className="block">
                                <span className="mb-2 block text-sm font-bold text-gray-700">
                                    Message
                                </span>
                                <textarea
                                    name="message"
                                    value={form.message}
                                    onChange={updateField}
                                    minLength={10}
                                    maxLength={2000}
                                    required
                                    rows={7}
                                    className="glass-input resize-y rounded-xl px-4 py-3 text-gray-800 outline-none placeholder:text-gray-400"
                                    placeholder="Include the details needed to understand your request..."
                                />
                                <span className="mt-2 block text-right text-xs text-gray-400">
                                    {form.message.length}/2000
                                </span>
                            </label>

                            <label
                                className="hidden"
                                aria-hidden="true"
                            >
                                Website
                                <input
                                    name="website"
                                    value={form.website}
                                    onChange={updateField}
                                    tabIndex={-1}
                                    autoComplete="off"
                                />
                            </label>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="glass-orange w-full rounded-xl py-3.5 font-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting
                                    ? "Sending..."
                                    : "Send Message →"}
                            </button>
                        </form>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default ContactUs;
