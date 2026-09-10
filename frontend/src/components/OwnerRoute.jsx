import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import API from "../api/api";

function OwnerRoute({ children }) {
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        const checkOwner = async () => {
            try {
                const token = localStorage.getItem("token");

                // No login token
                if (!token) {
                    setLoading(false);
                    return;
                }

                const headers = {
                    Authorization: `Bearer ${token}`
                };

                const [profileResponse, storesResponse] =
                    await Promise.all([
                        API.get("/users/me", { headers }),
                        API.get("/stores/my", { headers })
                    ]);

                const stores =
                    storesResponse.data.stores || [];

                const isAdmin =
                    profileResponse.data.user?.role ===
                    "admin";

                setIsOwner(
                    isAdmin || stores.length > 0
                );

            } catch (error) {
                console.log("Owner verification error:", error);

                setIsOwner(false);
            } finally {
                setLoading(false);
            }
        };

        checkOwner();
    }, []);

    // Checking owner status
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="mb-3 text-3xl">
                        🏪
                    </div>

                    <p className="text-gray-600">
                        Checking access...
                    </p>
                </div>
            </div>
        );
    }

    // User is not logged in
    if (!localStorage.getItem("token")) {
        return (
            <Navigate
                to="/login"
                replace
            />
        );
    }

    // User is logged in but doesn't own a store
    if (!isOwner) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    // Owner is allowed to access the page
    return children;
}

export default OwnerRoute;
