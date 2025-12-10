import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
    Dumbbell,
    Mail,
    Lock,
    ArrowRight,
    User,
    AlertCircle,
} from "lucide-react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../ui/Card";

const LoginForm = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const result = await login(email, password);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const quickLogin = async (email, password) => {
        setEmail(email);
        setPassword(password);
        setError("");
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.error);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 bg-gradient-to-br from-fitness-orange/5 via-background to-fitness-purple/5"></div>
            <div className="absolute top-20 left-20 w-64 h-64 bg-fitness-orange/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-fitness-purple/10 rounded-full blur-3xl"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo & Title */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-8"
                >
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center space-x-2 mb-4"
                    >
                        <Dumbbell className="w-10 h-10 text-fitness-orange" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-fitness-orange to-fitness-orange-light bg-clip-text text-transparent">
                            FitSync
                        </span>
                    </Link>
                    <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-muted-foreground">
                        Sign in to continue your fitness journey
                    </p>
                </motion.div>

                {/* Login Card */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>Sign In</CardTitle>
                        <CardDescription>
                            Enter your credentials to access your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm"
                            >
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        placeholder="your@email.com"
                                        className="pl-10"
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full gradient-orange"
                                size="lg"
                                disabled={loading}
                            >
                                {loading ? "Signing in..." : "Sign In"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t"></div>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">
                                    Quick Access
                                </span>
                            </div>
                        </div>

                        {/* Quick Login Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                {
                                    role: "Admin",
                                    email: "admin@fitsync.com",
                                    password: "Admin@123",
                                    icon: User,
                                },
                                {
                                    role: "Trainer",
                                    email: "trainer@fitsync.com",
                                    password: "Trainer@123",
                                    icon: User,
                                },
                                {
                                    role: "Client",
                                    email: "client@fitsync.com",
                                    password: "Client@123",
                                    icon: User,
                                },
                                {
                                    role: "Gym Owner",
                                    email: "gym@fitsync.com",
                                    password: "GymOwner@123",
                                    icon: User,
                                },
                            ].map((user) => (
                                <motion.div
                                    key={user.role}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full"
                                        onClick={() =>
                                            quickLogin(
                                                user.email,
                                                user.password
                                            )
                                        }
                                        disabled={loading}
                                    >
                                        <user.icon className="w-4 h-4 mr-2" />
                                        {user.role}
                                    </Button>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Register Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-6"
                >
                    <p className="text-sm text-muted-foreground">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-fitness-orange hover:underline font-medium"
                        >
                            Create account
                        </Link>
                    </p>
                </motion.div>

                {/* Back to Home */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center mt-4"
                >
                    <Link
                        to="/"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
};

export default LoginForm;
