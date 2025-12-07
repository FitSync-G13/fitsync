import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    UserCheck,
    Calendar,
    DollarSign,
    TrendingUp,
    TrendingDown,
    Search,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    Award,
    Activity,
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
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";

const GymOwnerDashboard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        totalTrainers: 0,
        totalClients: 0,
        totalBookings: 0,
        revenue: 0,
    });
    const [trainers, setTrainers] = useState([]);
    const [clients, setClients] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [usersRes, bookingsRes] = await Promise.all([
                api.get("/users?limit=100"),
                api.get("/bookings?limit=20"),
            ]);

            const allUsers = usersRes.data || [];
            const trainersData = allUsers.filter(
                (u) => u.role === "trainer" && u.gym_id === user.gym_id
            );
            const clientsData = allUsers.filter(
                (u) => u.role === "client" && u.gym_id === user.gym_id
            );

            setTrainers(trainersData);
            setClients(clientsData);
            setBookings(bookingsRes.data || []);

            setStats({
                totalTrainers: trainersData.length,
                totalClients: clientsData.length,
                totalBookings: bookingsRes.data?.length || 0,
                revenue: 0, // Calculate based on bookings
            });
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, change, icon: Icon, trend }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <Card className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">
                                {title}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-3xl font-bold">{value}</h3>
                                {change && (
                                    <span
                                        className={`flex items-center text-sm font-medium ${
                                            trend === "up"
                                                ? "text-fitness-green"
                                                : "text-red-500"
                                        }`}
                                    >
                                        {trend === "up" ? (
                                            <TrendingUp className="w-4 h-4 mr-1" />
                                        ) : (
                                            <TrendingDown className="w-4 h-4 mr-1" />
                                        )}
                                        {change}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="p-3 bg-gradient-to-br from-fitness-orange to-fitness-orange-light rounded-lg">
                            <Icon className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    const MemberRow = ({ member, type }) => (
        <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="hover:bg-muted/50 transition-colors"
        >
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitness-orange to-fitness-orange-light flex items-center justify-center text-white font-semibold">
                        {member.first_name?.[0]}
                        {member.last_name?.[0]}
                    </div>
                    <div>
                        <div className="font-medium">
                            {member.first_name} {member.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {member.email}
                        </div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-sm text-muted-foreground">
                {member.phone || "N/A"}
            </td>
            <td className="px-6 py-4">
                {type === "trainer" && (
                    <Badge variant="success">
                        <Award className="w-3 h-3 mr-1" />
                        Trainer
                    </Badge>
                )}
                {type === "client" && (
                    <Badge variant="outline">
                        <Activity className="w-3 h-3 mr-1" />
                        Active
                    </Badge>
                )}
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                        <Trash2 className="w-4 h-4" />
                    </Button>
                </div>
            </td>
        </motion.tr>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 w-12 bg-fitness-orange rounded-full"></div>
                    <p className="text-muted-foreground">
                        Loading gym owner dashboard...
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
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Welcome Back, {user?.first_name}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Here's what's happening with your gym today
                        </p>
                    </div>
                    <Button className="gradient-orange">
                        <Calendar className="w-4 h-4 mr-2" />
                        View Schedule
                    </Button>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Members"
                    value={stats.totalClients}
                    change="+12%"
                    trend="up"
                    icon={Users}
                />
                <StatCard
                    title="Active Trainers"
                    value={stats.totalTrainers}
                    change="+3%"
                    trend="up"
                    icon={UserCheck}
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    change="+8%"
                    trend="up"
                    icon={Calendar}
                />
                <StatCard
                    title="Monthly Revenue"
                    value={`$${stats.revenue}`}
                    change="+23%"
                    trend="up"
                    icon={DollarSign}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Member Activity Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="lg:col-span-2"
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Member Activity</CardTitle>
                                    <CardDescription>
                                        Daily member attendance overview
                                    </CardDescription>
                                </div>
                                <select className="px-3 py-2 border rounded-md text-sm bg-background">
                                    <option>Last 7 days</option>
                                    <option>Last 30 days</option>
                                    <option>Last 90 days</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-64 flex items-center justify-center border-2 border-dashed rounded-lg">
                                <p className="text-muted-foreground">
                                    Chart visualization placeholder
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Membership Target</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">
                                        Progress
                                    </span>
                                    <span className="text-2xl font-bold">
                                        75%
                                    </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-fitness-orange to-fitness-orange-light h-3 rounded-full"
                                        style={{ width: "75%" }}
                                    ></div>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">
                                        Current: {stats.totalClients}
                                    </span>
                                    <span className="text-muted-foreground">
                                        Target: 200
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Today's Visitors</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center space-y-2">
                                <div className="text-4xl font-bold text-fitness-orange">
                                    156
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    +18% from yesterday
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Trainers Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Trainers</CardTitle>
                                <CardDescription>
                                    Manage your gym trainers
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search trainers..."
                                        className="pl-10 w-64"
                                        value={searchTerm}
                                        onChange={(e) =>
                                            setSearchTerm(e.target.value)
                                        }
                                    />
                                </div>
                                <Button className="gradient-orange">
                                    <Users className="w-4 h-4 mr-2" />
                                    Add Trainer
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {trainers.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Trainer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {trainers.map((trainer) => (
                                            <MemberRow
                                                key={trainer.id}
                                                member={trainer}
                                                type="trainer"
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No trainers found
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* Clients Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Members</CardTitle>
                                <CardDescription>
                                    View and manage gym members
                                </CardDescription>
                            </div>
                            <Button className="gradient-orange">
                                <Users className="w-4 h-4 mr-2" />
                                Add Member
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {clients.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Member
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {clients.slice(0, 10).map((client) => (
                                            <MemberRow
                                                key={client.id}
                                                member={client}
                                                type="client"
                                            />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    No members found
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default GymOwnerDashboard;
