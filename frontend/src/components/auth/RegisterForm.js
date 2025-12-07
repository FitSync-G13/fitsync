import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../contexts/AuthContext";
import {
    Dumbbell,
    Mail,
    Lock,
    User,
    ArrowRight,
    AlertCircle,
    Briefcase,
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

const RegisterForm = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "client",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        const { confirmPassword, ...registerData } = formData;
        const result = await register(registerData);

        if (result.success) {
            navigate("/dashboard");
        } else {
            setError(result.error);
        }

        setLoading(false);
    };

    const roles = [
        {
            value: "client",
            label: "Client",
            icon: User,
            description: "I want to track my fitness journey",
        },
        {
            value: "trainer",
            label: "Trainer",
            icon: Briefcase,
            description: "I want to train clients",
        },
        {
            value: "gym_owner",
            label: "Gym Owner",
            icon: Dumbbell,
            description: "I want to manage my gym",
        },
    ];

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
                className="w-full max-w-2xl relative z-10"
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
                    <h1 className="text-2xl font-bold mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-muted-foreground">
                        Join FitSync and start your fitness journey today
                    </p>
                </motion.div>

                {/* Register Card */}
                <Card className="border-2">
                    <CardHeader>
                        <CardTitle>Sign Up</CardTitle>
                        <CardDescription>
                            Choose your role and create your account
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

                        {/* Role Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium">
                                I am a...
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {roles.map((role) => (
                                    <motion.label
                                        key={role.value}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={`relative cursor-pointer ${
                                            formData.role === role.value
                                                ? "ring-2 ring-fitness-orange"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="role"
                                            value={role.value}
                                            checked={
                                                formData.role === role.value
                                            }
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <Card
                                            className={`h-full transition-all ${
                                                formData.role === role.value
                                                    ? "border-fitness-orange bg-fitness-orange/5"
                                                    : "hover:border-muted-foreground"
                                            }`}
                                        >
                                            <CardContent className="p-4 text-center">
                                                <role.icon
                                                    className={`w-8 h-8 mx-auto mb-2 ${
                                                        formData.role ===
                                                        role.value
                                                            ? "text-fitness-orange"
                                                            : "text-muted-foreground"
                                                    }`}
                                                />
                                                <div className="font-semibold mb-1">
                                                    {role.label}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {role.description}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.label>
                                ))}
                            </div>
                        </div>

                        {/* Register Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        className="pl-10"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Email
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="your@email.com"
                                        className="pl-10"
                                        value={formData.email}
                                        onChange={handleChange}
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
                                        name="password"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        className="pl-10"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
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
                                {loading
                                    ? "Creating Account..."
                                    : "Create Account"}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </form>

                        <div className="text-center text-sm text-muted-foreground">
                            By signing up, you agree to our{" "}
                            <a
                                href="#"
                                className="text-fitness-orange hover:underline"
                            >
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a
                                href="#"
                                className="text-fitness-orange hover:underline"
                            >
                                Privacy Policy
                            </a>
                        </div>
                    </CardContent>
                </Card>

                {/* Login Link */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-6"
                >
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-fitness-orange hover:underline font-medium"
                        >
                            Sign in
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

export default RegisterForm;
