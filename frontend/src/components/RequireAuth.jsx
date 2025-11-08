// src/components/RequireAuth.jsx
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchSession } from "../features/authSlice";
import { Navigate } from "react-router-dom";

export default function RequireAuth({ children }) {
    const dispatch = useDispatch();
    const { user, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        // ✅ Only dispatch ONCE when loading is true and user is null
        if (loading && !user) {
            dispatch(fetchSession());
        }
    }, [loading, user, dispatch]);

    if (loading) {
        return <p style={{ textAlign: "center" }}>Checking session...</p>;
    }

    if (!user) {
        return <Navigate to="/home" replace />;
    }

    return children;
}
