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

                const profileResponse = await API.get(
                    "/users/me",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                setIsOwner(
                    profileResponse.data.permissions
                        ?.ownerDashboard === true
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

    // User is logged in but is not the configured admin
    if (!isOwner) {
        return (
            <Navigate
                to="/"
                replace
            />
        );
    }

    // Configured admin is allowed to access the page
    return children;
}

export default OwnerRoute;
