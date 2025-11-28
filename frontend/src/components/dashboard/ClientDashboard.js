import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import {
    Dumbbell,
    Clock,
    Award,
    Weight,
    Calendar,
    TrendingUp,
    Activity,
    Target,
    PlayCircle,
    CheckCircle2,
    Clock3,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import { notificationService } from "../../services";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

// Animated counter component
const AnimatedCounter = ({ value, duration = 1 }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, value, { duration });
        return controls.stop;
    }, [value]);

    return <motion.span>{rounded}</motion.span>;
};

const ClientDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [metrics, setMetrics] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [unreadNotifications, setUnreadNotifications] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
        loadNotifications();
    }, [user]);

    const loadNotifications = async () => {
        try {
            const unreadCount = await notificationService.getUnreadCount(
                user.id
            );
            setUnreadNotifications(unreadCount.data.count);
        } catch (error) {
            console.error("Error loading notifications:", error);
        }
    };

    const loadDashboardData = async () => {
        try {
            const [bookingsRes, programsRes, analyticsRes] = await Promise.all([
                api.get("/bookings?limit=5"),
                api.get("/programs?limit=3"),
                api.get(`/analytics/client/${user.id}`),
            ]);

            setBookings(bookingsRes.data || []);
            setPrograms(programsRes.data || []);
            setAnalytics(analyticsRes.data || {});

            // Try to get latest metrics
            try {
                const metricsRes = await api.get(
                    `/metrics/client/${user.id}/latest`
                );
                setMetrics(metricsRes.data);
            } catch (err) {
                console.log("No metrics found");
            }
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, suffix, icon: Icon, gradient }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-200 overflow-hidden relative">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-lg ${gradient}`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                            {title}
                        </p>
                        <h3 className="text-3xl font-bold">
                            <AnimatedCounter value={value || 0} /> {suffix}
                        </h3>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const SessionCard = ({ booking }) => {
        const statusConfig = {
            scheduled: {
                variant: "default",
                icon: Clock3,
                color: "text-blue-500",
            },
            completed: {
                variant: "success",
                icon: CheckCircle2,
                color: "text-fitness-green",
            },
            cancelled: {
                variant: "destructive",
                icon: PlayCircle,
                color: "text-red-500",
            },
        };

        const config = statusConfig[booking.status] || statusConfig.scheduled;
        const StatusIcon = config.icon;

        return (
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.02 }}
                className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-fitness-orange to-fitness-orange-light rounded-lg">
                            <Dumbbell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h4 className="font-semibold capitalize">
                                {booking.type?.replace("_", " ") ||
                                    "Training Session"}
                            </h4>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(
                                        booking.booking_date
                                    ).toLocaleDateString()}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {booking.start_time}
                                </span>
                            </div>
                        </div>
                    </div>
                    <Badge
                        variant={config.variant}
                        className="flex items-center gap-1"
                    >
                        <StatusIcon className="w-3 h-3" />
                        {booking.status}
                    </Badge>
                </div>
            </motion.div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="h-12 w-12 bg-fitness-orange rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
            >
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome back, {user.first_name}! 💪
                </h1>
                <p className="text-muted-foreground">
                    Here's your fitness overview for today
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Workouts"
                    value={analytics?.total_workouts || 0}
                    icon={Dumbbell}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Total Minutes"
                    value={analytics?.total_workout_minutes || 0}
                    suffix="min"
                    icon={Clock}
                    gradient="bg-gradient-to-br from-fitness-green to-green-600"
                />
                <StatCard
                    title="Achievements"
                    value={analytics?.total_achievements || 0}
                    icon={Award}
                    gradient="bg-gradient-to-br from-fitness-purple to-purple-600"
                />
                {metrics && (
                    <StatCard
                        title="Current Weight"
                        value={metrics.weight_kg}
                        suffix="kg"
                        icon={Weight}
                        gradient="bg-gradient-to-br from-fitness-orange to-fitness-orange-light"
                    />
                )}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Upcoming Sessions */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Upcoming Sessions</CardTitle>
                                    <CardDescription>
                                        Your scheduled training sessions
                                    </CardDescription>
                                </div>
                                <Button className="gradient-orange">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Book Session
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {bookings.length > 0 ? (
                                <div className="space-y-3">
                                    {bookings.map((booking) => (
                                        <SessionCard
                                            key={booking.id}
                                            booking={booking}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground mb-4">
                                        No upcoming sessions
                                    </p>
                                    <Button className="gradient-orange">
                                        Book Your First Session
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Stats Sidebar */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    {/* Weekly Goal */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Target className="w-5 h-5 text-fitness-orange" />
                                Weekly Goal
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        Progress
                                    </span>
                                    <span className="text-2xl font-bold text-fitness-orange">
                                        65%
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-fitness-orange to-fitness-orange-light h-3 rounded-full transition-all duration-500"
                                        style={{ width: "65%" }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                    <span>3 of 5 workouts</span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp className="w-3 h-3" />
                                        On track
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Activity Streak */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-fitness-green" />
                                Activity Streak
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center space-y-2">
                                <div className="text-5xl font-bold text-fitness-green">
                                    7
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Days in a row! 🔥
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Active Programs */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Active Programs</CardTitle>
                                <CardDescription>
                                    Your current training programs
                                </CardDescription>
                            </div>
                            <Button variant="outline">View All</Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {programs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {programs.map((program) => (
                                    <motion.div
                                        key={program.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.03 }}
                                        className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <Badge
                                                variant={
                                                    program.status === "active"
                                                        ? "success"
                                                        : "outline"
                                                }
                                            >
                                                {program.status}
                                            </Badge>
                                        </div>
                                        <h4 className="font-semibold mb-2">
                                            Program #{program.id.slice(0, 8)}
                                        </h4>
                                        <div className="space-y-1 text-sm text-muted-foreground">
                                            <p className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Start:{" "}
                                                {new Date(
                                                    program.start_date
                                                ).toLocaleDateString()}
                                            </p>
                                            {program.end_date && (
                                                <p className="flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    End:{" "}
                                                    {new Date(
                                                        program.end_date
                                                    ).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="w-full mt-4"
                                        >
                                            View Details
                                        </Button>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground mb-4">
                                    No active programs
                                </p>
                                <Button className="gradient-orange">
                                    Start a Program
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default ClientDashboard;
