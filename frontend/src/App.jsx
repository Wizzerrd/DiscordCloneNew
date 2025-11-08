import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchSession } from "./features/authSlice";

import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Servers from "./pages/Servers";
import ServerMembers from "./pages/ServerMembers";
import Relationships from "./pages/Relationships";
import RequireAuth from "./components/RequireAuth";

export default function App() {
  const dispatch = useDispatch();
  const { loading } = useSelector((s) => s.auth);

  useEffect(() => {
    dispatch(fetchSession());
  }, [dispatch]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "3rem" }}>
        <h2>Checking session...</h2>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Root redirect: no conditional render */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public route */}
        <Route path="/home" element={<Home />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/servers"
          element={
            <RequireAuth>
              <Servers />
            </RequireAuth>
          }
        />
        <Route
          path="/servers/:id/members"
          element={
            <RequireAuth>
              <ServerMembers />
            </RequireAuth>
          }
        />
        <Route
          path="/relationships"
          element={
            <RequireAuth>
              <Relationships />
            </RequireAuth>
          }
        />
      </Routes>
    </Router>
  );
}
