import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { MapProvider } from "./context/MapContext";
import useAuthStore from "./stores/authStore";

// Import styles
import "./styles/map.css";

// Import layouts
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layout/dashboard/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Import public pages
import Home from "./components/pages/common/Home";
import Login from "./components/pages/common/Login";
import Register from "./components/pages/common/Register";
import LogoutHandler from "./components/auth/LogoutHandler";

// Import citizen pages
import ReportIssue from "./components/pages/citizen/ReportIssue";
import MyReports from "./components/pages/citizen/MyReports";
import ReportDetail from "./components/pages/citizen/ReportDetail";
import CommunityIssues from "./components/pages/citizen/CommunityIssues";
import IssueMap from "./components/pages/citizen/IssueMap";
import DashboardOverview from "./components/pages/citizen/DashboardOverview";
import Profile from "./components/pages/citizen/Profile";
import AuthTest from "./components/pages/citizen/AuthTest";

// Import officer pages
import OfficerDashboard from "./components/pages/officer/OfficerDashboard";
import AssignedReports from "./components/pages/officer/AssignedReports";
import ReportManagement from "./components/pages/officer/ReportManagement";

// Import admin pages
import AdminDashboard from "./components/pages/admin/AdminDashboard";
import UserManagement from "./components/pages/admin/UserManagement";
import OfficerManagement from "./components/pages/admin/OfficerManagement";
import DepartmentManagement from "./components/pages/admin/DepartmentManagement";
import RegionManagement from "./components/pages/admin/RegionManagement";
import ReportAnalytics from "./components/pages/admin/ReportAnalytics";

function App() {
  const { loadUser, isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Router>
      <MapProvider>
        <Routes>
          {/* Public Routes with Layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/logout" element={<LogoutHandler />} />

          {/* Citizen Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute
                isAllowed={isAuthenticated && user?.role === "citizen"}
                redirectPath="/login"
              >
                <DashboardLayout userType="citizen" />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardOverview />} />
            <Route path="/my-reports" element={<MyReports />} />
            <Route path="/report-issue" element={<ReportIssue />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/community-issues" element={<CommunityIssues />} />
            <Route path="/map" element={<IssueMap />} />
            <Route path="/auth-test" element={<AuthTest />} />
          </Route>

          {/* Officer Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute
                isAllowed={isAuthenticated && user?.role === "officer"}
                redirectPath="/login"
              >
                <DashboardLayout userType="officer" />
              </ProtectedRoute>
            }
          >
            <Route path="/officer/dashboard" element={<OfficerDashboard />} />
            <Route
              path="/officer/assigned-reports"
              element={<AssignedReports />}
            />
            <Route path="/officer/report/:id" element={<ReportManagement />} />
            <Route
              path="/officer/report-management"
              element={<ReportManagement />}
            />
            <Route
              path="/officer/community"
              element={<div>Community (Coming Soon)</div>}
            />
            <Route
              path="/officer/settings"
              element={<div>Settings (Coming Soon)</div>}
            />
          </Route>

          {/* Admin Dashboard Routes */}
          <Route
            element={
              <ProtectedRoute
                isAllowed={isAuthenticated && user?.role === "admin"}
                redirectPath="/login"
              >
                <DashboardLayout userType="admin" />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/officers" element={<OfficerManagement />} />
            <Route
              path="/admin/departments"
              element={<DepartmentManagement />}
            />
            <Route path="/admin/regions" element={<RegionManagement />} />
            <Route
              path="/admin/report-analytics"
              element={<ReportAnalytics />}
            />
          </Route>

          {/* Unified dashboard redirect based on role */}
          <Route
            path="/unified-dashboard"
            element={
              isAuthenticated ? (
                (() => {
                  console.log("Unified Dashboard - Auth State:", {
                    isAuthenticated,
                    userRole: user?.role,
                    user,
                  });

                  if (user?.role === "admin") {
                    console.log("Redirecting to admin dashboard");
                    return <Navigate to="/admin/dashboard" replace />;
                  } else if (user?.role === "officer") {
                    console.log("Redirecting to officer dashboard");
                    return <Navigate to="/officer/dashboard" replace />;
                  } else {
                    console.log("Redirecting to citizen dashboard");
                    return <Navigate to="/dashboard" replace />;
                  }
                })()
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Root redirect for authenticated users */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/unified-dashboard" replace />
              ) : (
                <Home />
              )
            }
          />

          {/* 404 - Not Found */}
          <Route
            path="*"
            element={
              <Layout>
                <div className="p-8 text-center">
                  <h1 className="text-xl font-bold">Page Not Found</h1>
                </div>
              </Layout>
            }
          />
        </Routes>
      </MapProvider>
    </Router>
  );
}

export default App;
