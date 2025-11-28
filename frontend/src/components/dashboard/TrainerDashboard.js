import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Calendar,
    Users,
    Dumbbell,
    Clock,
    CheckCircle2,
    Plus,
    User,
    FileText,
    Target,
} from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";

const TrainerDashboard = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [programs, setPrograms] = useState([]);
    const [workouts, setWorkouts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [bookingsRes, programsRes, workoutsRes] = await Promise.all([
                api.get("/bookings?limit=10"),
                api.get("/programs?limit=5"),
                api.get("/workouts?limit=5"),
            ]);

            setBookings(bookingsRes.data || []);
            setPrograms(programsRes.data || []);
            setWorkouts(workoutsRes.data || []);
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const todaysBookings = bookings.filter((b) => {
        const today = new Date().toISOString().split("T")[0];
        return b.booking_date === today && b.status === "scheduled";
    });

    const StatCard = ({ title, value, icon: Icon, gradient }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                                {title}
                            </p>
                            <h3 className="text-3xl font-bold">{value}</h3>
                        </div>
                        <div className={`p-3 rounded-lg ${gradient}`}>
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

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
                    Trainer Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Manage your clients and training sessions
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Today's Sessions"
                    value={todaysBookings.length}
                    icon={Calendar}
                    gradient="bg-gradient-to-br from-fitness-orange to-fitness-orange-light"
                />
                <StatCard
                    title="Total Bookings"
                    value={bookings.length}
                    icon={Clock}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Active Programs"
                    value={programs.filter((p) => p.status === "active").length}
                    icon={Target}
                    gradient="bg-gradient-to-br from-fitness-green to-green-600"
                />
                <StatCard
                    title="Workout Plans"
                    value={workouts.length}
                    icon={Dumbbell}
                    gradient="bg-gradient-to-br from-fitness-purple to-purple-600"
                />
            </div>

            {/* Today's Schedule */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Today's Schedule</CardTitle>
                                <CardDescription>
                                    Your upcoming sessions for today
                                </CardDescription>
                            </div>
                            <Button className="gradient-orange">
                                <Plus className="w-4 h-4 mr-2" />
                                Add Session
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {todaysBookings.length > 0 ? (
                            <div className="space-y-3">
                                {todaysBookings.map((booking) => (
                                    <motion.div
                                        key={booking.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-gradient-to-br from-fitness-orange to-fitness-orange-light rounded-lg">
                                                    <User className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">
                                                        Client #
                                                        {booking.client_id.slice(
                                                            0,
                                                            8
                                                        )}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-4 h-4" />
                                                            {booking.start_time}{" "}
                                                            - {booking.end_time}
                                                        </span>
                                                        <span className="capitalize">
                                                            {booking.type.replace(
                                                                "_",
                                                                " "
                                                            )}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                                Complete
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No sessions scheduled for today
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Programs and Workouts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Programs */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Recent Programs</CardTitle>
                                    <CardDescription>
                                        Client training programs
                                    </CardDescription>
                                </div>
                                <Button className="gradient-orange">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {programs.length > 0 ? (
                                <div className="space-y-3">
                                    {programs.slice(0, 3).map((program) => (
                                        <motion.div
                                            key={program.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold">
                                                    Program for Client #
                                                    {program.client_id.slice(
                                                        0,
                                                        8
                                                    )}
                                                </h4>
                                                <Badge
                                                    variant={
                                                        program.status ===
                                                        "active"
                                                            ? "success"
                                                            : "outline"
                                                    }
                                                >
                                                    {program.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    Started{" "}
                                                    {new Date(
                                                        program.start_date
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No programs yet
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Workout Plans */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Workout Plans</CardTitle>
                                    <CardDescription>
                                        Your custom workout templates
                                    </CardDescription>
                                </div>
                                <Button className="gradient-orange">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {workouts.length > 0 ? (
                                <div className="space-y-3">
                                    {workouts.slice(0, 3).map((workout) => (
                                        <motion.div
                                            key={workout.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="p-4 border rounded-lg hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-gradient-to-br from-fitness-purple to-purple-600 rounded-lg">
                                                    <Dumbbell className="w-4 h-4 text-white" />
                                                </div>
                                                <h4 className="font-semibold">
                                                    {workout.name}
                                                </h4>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Badge variant="outline">
                                                    {workout.goal}
                                                </Badge>
                                                <span>•</span>
                                                <Badge variant="outline">
                                                    {workout.difficulty_level}
                                                </Badge>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Dumbbell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No workout plans yet
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};

export default TrainerDashboard;
