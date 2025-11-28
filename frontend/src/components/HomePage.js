import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    ArrowRight,
    Dumbbell,
    Calendar,
    TrendingUp,
    Users,
    Bell,
    BarChart3,
    CheckCircle2,
    Zap,
    Target,
    Award,
    Sun,
    Moon,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Card, CardContent } from "./ui/Card";
import { useTheme } from "../contexts/ThemeContext";
import heroImage from "../assets/images/hero/hero.png";

const HomePage = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="min-h-screen bg-background">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-lg border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-2">
                            <Dumbbell className="w-8 h-8 text-fitness-orange" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-fitness-orange to-fitness-orange-light bg-clip-text text-transparent">
                                FitSync
                            </span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a
                                href="#features"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#services"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Services
                            </a>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleTheme}
                                className="rounded-full"
                            >
                                {theme === "dark" ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </Button>
                            <Link to="/login">
                                <Button variant="outline" size="sm">
                                    Login
                                </Button>
                            </Link>
                            <Link to="/login">
                                <Button className="gradient-orange" size="sm">
                                    Join Now
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-fitness-orange/5 via-background to-fitness-purple/5"></div>
                <div className="max-w-7xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8"
                        >
                            <div className="inline-block">
                                <span className="px-4 py-2 rounded-full bg-fitness-orange/10 text-fitness-orange text-sm font-medium">
                                    Professional Fitness Platform
                                </span>
                            </div>
                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
                                TRANSFORM
                                <br />
                                <span className="text-muted-foreground">
                                    YOUR LIFE
                                </span>
                                <br />
                                <span className="bg-gradient-to-r from-fitness-orange to-fitness-orange-light bg-clip-text text-transparent">
                                    WITH FITSYNC
                                </span>
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-xl">
                                A certified running coach and personal trainer
                                for over a decade. I've helped thousands of
                                runners through 1-1 personalized coaching and
                                fitness club.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link to="/login">
                                    <Button
                                        size="lg"
                                        className="gradient-orange text-lg px-8"
                                    >
                                        Get Started
                                        <ArrowRight className="w-5 h-5 ml-2" />
                                    </Button>
                                </Link>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="text-lg px-8"
                                >
                                    Learn More
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6 pt-8">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <div className="text-3xl font-bold text-fitness-orange">
                                        1000+
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Active Users
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <div className="text-3xl font-bold text-fitness-orange">
                                        5000+
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Workouts
                                    </div>
                                </motion.div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    <div className="text-3xl font-bold text-fitness-orange">
                                        4.9/5
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        Rating
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Right Content - Hero Image */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="relative h-[600px] rounded-2xl overflow-hidden">
                                <img
                                    src={heroImage}
                                    alt="FitSync - Transform Your Fitness Journey"
                                    className="w-full h-full object-cover"
                                />

                                {/* Floating Cards */}
                                <motion.div
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                    }}
                                    className="absolute top-20 right-10"
                                >
                                    <Card className="glass-card">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="p-3 bg-fitness-green rounded-lg">
                                                <CheckCircle2 className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    Achievement
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    Goal Completed!
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>

                                <motion.div
                                    animate={{ y: [0, 20, 0] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        delay: 1,
                                    }}
                                    className="absolute bottom-20 left-10"
                                >
                                    <Card className="glass-card">
                                        <CardContent className="p-4 flex items-center gap-3">
                                            <div className="p-3 bg-fitness-purple rounded-lg">
                                                <TrendingUp className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-bold">
                                                    Progress
                                                </div>
                                                <div className="text-sm text-muted-foreground">
                                                    +15% This Week
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Features
                        </h2>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            Everything you need to manage your fitness journey
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Calendar,
                                title: "Smart Scheduling",
                                desc: "Book sessions and manage availability with intelligent scheduling",
                            },
                            {
                                icon: TrendingUp,
                                title: "Progress Tracking",
                                desc: "Monitor metrics, workouts, and achievements with analytics",
                            },
                            {
                                icon: Dumbbell,
                                title: "Workout Library",
                                desc: "Access hundreds of exercises with detailed instructions",
                            },
                            {
                                icon: Users,
                                title: "Client Management",
                                desc: "Manage clients and create personalized programs",
                            },
                            {
                                icon: Bell,
                                title: "Real-time Notifications",
                                desc: "Stay informed with bookings and achievement alerts",
                            },
                            {
                                icon: BarChart3,
                                title: "Analytics Dashboard",
                                desc: "Gain insights with performance metrics and data",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className="h-full hover:shadow-lg transition-all duration-300 group">
                                    <CardContent className="p-8">
                                        <div className="p-4 bg-gradient-to-br from-fitness-orange to-fitness-orange-light rounded-xl w-fit mb-6 group-hover:scale-110 transition-transform">
                                            <feature.icon className="w-8 h-8 text-white" />
                                        </div>
                                        <h3 className="text-xl font-bold mb-3">
                                            {feature.title}
                                        </h3>
                                        <p className="text-muted-foreground">
                                            {feature.desc}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services/Roles Section */}
            <section
                id="services"
                className="py-24 px-4 sm:px-6 lg:px-8 bg-muted/30"
            >
                <div className="max-w-7xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Built for Everyone
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Different tools for different roles
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Award,
                                title: "For Trainers",
                                features: [
                                    "Manage client schedules",
                                    "Create custom workout plans",
                                    "Track client progress",
                                    "Exercise library management",
                                    "Session notes and feedback",
                                ],
                            },
                            {
                                icon: Target,
                                title: "For Clients",
                                features: [
                                    "Book training sessions",
                                    "Track workouts and metrics",
                                    "View personalized programs",
                                    "Monitor achievements",
                                    "Communicate with trainers",
                                ],
                            },
                            {
                                icon: Zap,
                                title: "For Gym Owners",
                                features: [
                                    "Manage gym operations",
                                    "Oversee trainer performance",
                                    "Track revenue and analytics",
                                    "Client retention insights",
                                    "Facility management",
                                ],
                            },
                        ].map((role, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                            >
                                <Card className="h-full border-2 hover:border-fitness-orange transition-all duration-300">
                                    <CardContent className="p-8">
                                        <div className="p-4 bg-gradient-to-br from-fitness-orange to-fitness-orange-light rounded-xl w-fit mb-6">
                                            <role.icon className="w-10 h-10 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-6">
                                            {role.title}
                                        </h3>
                                        <ul className="space-y-3">
                                            {role.features.map((feature, i) => (
                                                <li
                                                    key={i}
                                                    className="flex items-start gap-3"
                                                >
                                                    <CheckCircle2 className="w-5 h-5 text-fitness-orange flex-shrink-0 mt-0.5" />
                                                    <span className="text-muted-foreground">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-fitness-orange to-fitness-orange-light">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <h2 className="text-4xl md:text-5xl font-bold text-white">
                            Ready to Transform Your Fitness Journey?
                        </h2>
                        <p className="text-xl text-white/90">
                            Join thousands of fitness professionals using
                            FitSync
                        </p>
                        <Link to="/login">
                            <Button
                                size="lg"
                                variant="secondary"
                                className="text-lg px-8 bg-white text-fitness-orange hover:bg-white/90"
                            >
                                Start Your Free Trial
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-card border-t py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-4 gap-8 mb-8">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-2">
                                <Dumbbell className="w-6 h-6 text-fitness-orange" />
                                <span className="text-xl font-bold">
                                    FitSync
                                </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Your complete fitness management solution
                            </p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a
                                        href="#features"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Features
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#services"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Services
                                    </a>
                                </li>
                                <li>
                                    <Link
                                        to="/login"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Login
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a
                                        href="#about"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#contact"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#careers"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Careers
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Support</h4>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                                <li>
                                    <a
                                        href="#help"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Help Center
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#docs"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        Documentation
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="#api"
                                        className="hover:text-foreground transition-colors"
                                    >
                                        API
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t pt-8 text-center text-sm text-muted-foreground">
                        <p>&copy; 2025 FitSync. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
