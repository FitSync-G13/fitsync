import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Link,
    NavLink,
} from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
    Home,
    Dumbbell,
    Calendar,
    TrendingUp,
    ClipboardList,
    Sun,
    Moon,
    LogOut,
    Menu,
    X,
} from "lucide-react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import LoginForm from "./components/auth/LoginForm";
import RegisterForm from "./components/auth/RegisterForm";
import ClientDashboard from "./components/dashboard/ClientDashboard";
import TrainerDashboard from "./components/dashboard/TrainerDashboard";
import AdminDashboard from "./components/dashboard/AdminDashboard";
import GymOwnerDashboard from "./components/dashboard/GymOwnerDashboard";
import HomePage from "./components/HomePage";
import ExerciseLibrary from "./components/ExerciseLibrary";
import BookingManagement from "./components/BookingManagement";
import ProgressTracking from "./components/ProgressTracking";
import WorkoutPlans from "./components/WorkoutPlans";
import { Button } from "./components/ui/Button";
import "./index.css";

// Page transition wrapper
const PageTransition = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        >
            {children}
        </motion.div>
    );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="h-12 w-12 bg-fitness-orange rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <PageTransition>{children}</PageTransition>;
};

// Main Layout Component
const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = React.useState(false);

    if (!user) {
        return <AnimatePresence mode="wait">{children}</AnimatePresence>;
    }

    const navItems = [
        {
            path: "/dashboard",
            label: "Dashboard",
            icon: Home,
            roles: ["client", "trainer", "admin", "gym_owner"],
        },
        {
            path: "/exercises",
            label: "Exercises",
            icon: Dumbbell,
            roles: ["trainer", "admin"],
        },
        {
            path: "/workouts",
            label: "Workouts",
            icon: ClipboardList,
            roles: ["trainer", "admin"],
        },
        {
            path: "/bookings",
            label: "Bookings",
            icon: Calendar,
            roles: ["client", "trainer", "admin", "gym_owner"],
        },
        {
            path: "/progress",
            label: "Progress",
            icon: TrendingUp,
            roles: ["client"],
        },
    ].filter((item) => item.roles.includes(user.role));

    return (
        <div className="min-h-screen bg-background">
            {/* Navbar */}
            <motion.nav
                className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg"
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link
                            to="/dashboard"
                            className="flex items-center space-x-2"
                        >
                            <motion.div
                                className="text-2xl font-bold bg-gradient-to-r from-fitness-orange to-fitness-orange-light bg-clip-text text-transparent"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                FitSync
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-4">
                            {navItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            isActive
                                                ? "text-fitness-orange bg-fitness-orange/10"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        }`
                                    }
                                >
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </NavLink>
                            ))}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                className="hidden md:flex"
                            >
                                {theme === "light" ? (
                                    <Moon className="w-5 h-5" />
                                ) : (
                                    <Sun className="w-5 h-5" />
                                )}
                            </Button>

                            <div className="hidden md:flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                    {user.first_name} {user.last_name}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={logout}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Logout
                                </Button>
                            </div>

                            {/* Mobile menu button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="md:hidden"
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                            >
                                {sidebarOpen ? (
                                    <X className="w-5 h-5" />
                                ) : (
                                    <Menu className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            className="md:hidden border-t bg-card"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="px-4 py-4 space-y-2">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={() => setSidebarOpen(false)}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                                isActive
                                                    ? "text-fitness-orange bg-fitness-orange/10"
                                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                            }`
                                        }
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </NavLink>
                                ))}
                                <div className="pt-4 mt-4 border-t space-y-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-start"
                                        onClick={toggleTheme}
                                    >
                                        {theme === "light" ? (
                                            <Moon className="w-4 h-4 mr-3" />
                                        ) : (
                                            <Sun className="w-4 h-4 mr-3" />
                                        )}
                                        {theme === "light"
                                            ? "Dark Mode"
                                            : "Light Mode"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={() => {
                                            logout();
                                            setSidebarOpen(false);
                                        }}
                                    >
                                        <LogOut className="w-4 h-4 mr-3" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">{children}</AnimatePresence>
            </main>
        </div>
    );
};

// Dashboard Router Component
const DashboardRouter = () => {
    const { user } = useAuth();

    if (user.role === "client") {
        return <ClientDashboard />;
    } else if (user.role === "trainer") {
        return <TrainerDashboard />;
    } else if (user.role === "admin") {
        return <AdminDashboard />;
    } else if (user.role === "gym_owner") {
        return <GymOwnerDashboard />;
    }

    return <div>Invalid user role</div>;
};

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <Router>
                    <Layout>
                        <Routes>
                            <Route path="/login" element={<LoginForm />} />
                            <Route
                                path="/register"
                                element={<RegisterForm />}
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <DashboardRouter />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/exercises"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={["trainer", "admin"]}
                                    >
                                        <ExerciseLibrary />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/workouts"
                                element={
                                    <ProtectedRoute
                                        allowedRoles={["trainer", "admin"]}
                                    >
                                        <WorkoutPlans />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/bookings"
                                element={
                                    <ProtectedRoute>
                                        <BookingManagement />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/progress"
                                element={
                                    <ProtectedRoute allowedRoles={["client"]}>
                                        <ProgressTracking />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/" element={<HomePage />} />
                        </Routes>
                    </Layout>
                </Router>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;
