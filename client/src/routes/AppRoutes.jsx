 import { Routes, Route } from "react-router-dom";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Events from "../pages/public/Events";
import EventDetails from "../pages/public/EventDetails";
import RegisterEvent from "../pages/public/RegisterEvent"; // ✅ NEW
import Team from "../pages/public/Team";
import Gallery from "../pages/public/Gallery";
import Contact from "../pages/public/Contact";
import Results from "../pages/public/Results";
import NotFound from "../pages/public/NotFound";
import Announcements from "../pages/public/Announcements";

import Joinus from "../pages/auth/Joinus";
import AdminLogin from "../pages/auth/AdminLogin";

import DashboardHome from "../pages/dashboard/DashboardHome";
import MySubmissions from "../pages/dashboard/MySubmissions";

/* ✅ Admin layout + pages */
import AdminHome from "../pages/admin/AdminHome";
import AdminJoinApplications from "../pages/admin/AdminJoinApplications";
import AdminEvents from "../pages/admin/AdminEvents";
import AdminSubmissions from "../pages/admin/AdminSubmissions";
import AdminAnnouncements from "../pages/admin/AdminAnnouncements";
import AdminResults from "../pages/admin/AdminResults";
import AdminUsers from "../pages/admin/AdminUsers";

import ProtectedRoute from "../components/layout/ProtectedRoute";
import AdminRoute from "../components/layout/AdminRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />

      <Route path="/events" element={<Events />} />
      <Route path="/events/:slug" element={<EventDetails />} />

      {/* ✅ Event Registration */}
      <Route path="/register/:slug" element={<RegisterEvent />} />

      <Route path="/team" element={<Team />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/results" element={<Results />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/announcements" element={<Announcements />} />

      {/* Join Us (public) */}
      <Route path="/joinus" element={<Joinus />} />

      {/* Admin Login (public) */}
      <Route path="/admin-login" element={<AdminLogin />} />

      {/* Dashboard (protected) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/submissions"
        element={
          <ProtectedRoute>
            <MySubmissions />
          </ProtectedRoute>
        }
      />

      {/* ✅ Admin (protected) - NESTED under AdminHome layout */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminHome />
          </AdminRoute>
        }
      >
        <Route path="join-applications" element={<AdminJoinApplications />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="submissions" element={<AdminSubmissions />} />
        <Route path="announcements" element={<AdminAnnouncements />} />
        <Route path="results" element={<AdminResults />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
