import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const supportTopics = [
    {
        icon: "📦",
        title: "Orders",
        description:
            "Track an order, understand its status or get delivery help."
    },
    {
        icon: "💳",
        title: "Payments",
        description:
            "Find answers about totals, delivery fees and payment status."
    },
    {
        icon: "👤",
        title: "Account",
        description:
            "Get help with registration, login and account access."
    },
    {
        icon: "🏪",
        title: "Stores & products",
        description:
            "Learn how to browse stores and check product availability."
    }
];

const faqs = [
    {
        question: "How can I track my order?",
        answer:
            "Sign in and open Orders from the navigation bar. Select an order to see its current status and complete order details."
    },
    {
        question: "Can I cancel an order?",
        answer:
            "Contact support as soon as possible with your order reference. Cancellation depends on whether the store has already started preparing it."
    },
    {
        question: "Why is a product unavailable?",
        answer:
            "Stores can temporarily mark products unavailable. Refresh the store page later or choose another available item."
    },
    {
        question: "Where can I see my previous orders?",
        answer:
            "Your full order history is available on the Orders page after you sign in."
    },
    {
        question: "How is the delivery fee calculated?",
        answer:
            "The delivery fee is shown in your cart and checkout summary before you place the order. Eligible larger orders may receive free delivery."
    },
    {
        question: "I cannot sign in. What should I do?",
        answer:
            "Check that your email and password are correct. If the problem continues, send us a message from the Contact Us page."
    }
];

function Support() {
    const [query, setQuery] = useState("");

    const filteredFaqs = useMemo(() => {
        const normalizedQuery = query
            .trim()
            .toLowerCase();

        if (!normalizedQuery) {
            return faqs;
        }

        return faqs.filter(
            ({ question, answer }) =>
                question
                    .toLowerCase()
                    .includes(normalizedQuery) ||
                answer
                    .toLowerCase()
                    .includes(normalizedQuery)
        );
    }, [query]);

    return (
        <div className="relative min-h-screen overflow-hidden pb-20">
            <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">
                <section className="glass-strong overflow-hidden rounded-[2rem] p-7 text-center shadow-xl md:p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100/70 text-3xl">
                        🎧
                    </div>

                    <p className="mt-5 text-xs font-black uppercase tracking-[0.22em] text-orange-500">
                        Help Center
                    </p>

                    <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-900 md:text-5xl">
                        How can we help?
                    </h1>

                    <p className="mx-auto mt-4 max-w-2xl leading-7 text-gray-500">
                        Find quick answers about orders, payments,
                        accounts and stores.
                    </p>

                    <div className="glass-input mx-auto mt-7 flex max-w-2xl items-center rounded-2xl px-5">
                        <span className="mr-3 text-xl">🔎</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) =>
                                setQuery(event.target.value)
                            }
                            placeholder="Search support questions..."
                            aria-label="Search support questions"
                            className="w-full bg-transparent py-4 text-gray-800 outline-none placeholder:text-gray-400"
                        />
                    </div>
                </section>

                <section className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {supportTopics.map((topic) => (
                        <article
                            key={topic.title}
                            className="glass glass-hover rounded-2xl p-6 shadow-lg"
                        >
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100/70 text-2xl">
                                {topic.icon}
                            </div>
                            <h2 className="mt-5 font-black text-gray-900">
                                {topic.title}
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-gray-500">
                                {topic.description}
                            </p>
                        </article>
                    ))}
                </section>

                <section className="glass-strong mt-7 rounded-[2rem] p-6 shadow-xl md:p-9">
                    <div>
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-500">
                            Frequently Asked Questions
                        </p>
                        <h2 className="mt-2 text-2xl font-black text-gray-900 md:text-3xl">
                            Quick answers
                        </h2>
                    </div>

                    <div className="mt-6 space-y-3">
                        {filteredFaqs.length > 0 ? (
                            filteredFaqs.map((faq) => (
                                <details
                                    key={faq.question}
                                    className="glass group rounded-2xl p-5"
                                >
                                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black text-gray-900">
                                        {faq.question}
                                        <span className="text-xl text-orange-500 transition group-open:rotate-45">
                                            +
                                        </span>
                                    </summary>
                                    <p className="mt-4 border-t border-white/70 pt-4 text-sm leading-7 text-gray-500">
                                        {faq.answer}
                                    </p>
                                </details>
                            ))
                        ) : (
                            <div className="glass rounded-2xl p-8 text-center">
                                <p className="text-3xl">🔍</p>
                                <h3 className="mt-3 font-black text-gray-900">
                                    No matching answers
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    Try another search or contact our support team.
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                <section className="glass-strong mt-7 rounded-[2rem] p-7 text-center shadow-xl md:p-10">
                    <div className="text-4xl">💬</div>
                    <h2 className="mt-4 text-2xl font-black text-gray-900">
                        Still need help?
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-500">
                        Send the support team your question and include an
                        order reference when your issue is order-related.
                    </p>
                    <Link
                        to="/contact"
                        className="glass-orange mt-6 inline-flex items-center justify-center rounded-xl px-7 py-3.5 font-black"
                    >
                        Contact Us →
                    </Link>
                </section>
            </div>
        </div>
    );
}

export default Support;
