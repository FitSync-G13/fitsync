import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    Building2,
    Calendar,
    DollarSign,
    Search,
    Plus,
    Edit,
    Trash2,
    Shield,
    UserCog,
    Award,
    User,
} from "lucide-react";
import api from "../../services/api";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalGyms: 0,
        totalBookings: 0,
        totalRevenue: 0,
    });
    const [users, setUsers] = useState([]);
    const [gyms, setGyms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("overview");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const [usersRes, gymsRes] = await Promise.all([
                api.get("/users?limit=50"),
                api.get("/users/gyms"),
            ]);

            setUsers(usersRes.data || []);
            setGyms(gymsRes.data || []);

            // Calculate stats
            setStats({
                totalUsers: usersRes.data?.length || 0,
                totalGyms: gymsRes.data?.length || 0,
                totalBookings: 0, // Would come from analytics endpoint
                totalRevenue: 0,
            });
        } catch (error) {
            console.error("Failed to load dashboard data:", error);
        } finally {
            setLoading(false);
        }
    };

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

    const getRoleBadgeVariant = (role) => {
        switch (role) {
            case "admin":
                return "destructive";
            case "trainer":
                return "default";
            case "gym_owner":
                return "warning";
            default:
                return "success";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-pulse space-y-4 text-center">
                    <div className="h-12 w-12 bg-fitness-orange rounded-full mx-auto"></div>
                    <p className="text-muted-foreground">
                        Loading admin dashboard...
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
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                    System overview and management
                </p>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers}
                    icon={Users}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
                <StatCard
                    title="Total Gyms"
                    value={stats.totalGyms}
                    icon={Building2}
                    gradient="bg-gradient-to-br from-fitness-green to-green-600"
                />
                <StatCard
                    title="Total Bookings"
                    value={stats.totalBookings}
                    icon={Calendar}
                    gradient="bg-gradient-to-br from-fitness-purple to-purple-600"
                />
                <StatCard
                    title="Revenue"
                    value={`$${stats.totalRevenue}`}
                    icon={DollarSign}
                    gradient="bg-gradient-to-br from-fitness-orange to-fitness-orange-light"
                />
            </div>

            {/* Tabs */}
            <div className="border-b">
                <div className="flex gap-2">
                    {["overview", "users", "gyms"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 font-medium capitalize transition-colors relative ${
                                activeTab === tab
                                    ? "text-fitness-orange"
                                    : "text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-fitness-orange"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Tab */}
            {activeTab === "overview" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>User Distribution</CardTitle>
                            <CardDescription>Users by role</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[
                                    "admin",
                                    "gym_owner",
                                    "trainer",
                                    "client",
                                ].map((role) => {
                                    const count = users.filter(
                                        (u) => u.role === role
                                    ).length;
                                    const percentage =
                                        stats.totalUsers > 0
                                            ? (count / stats.totalUsers) * 100
                                            : 0;

                                    return (
                                        <div key={role} className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Badge
                                                        variant={getRoleBadgeVariant(
                                                            role
                                                        )}
                                                    >
                                                        {role.replace("_", " ")}
                                                    </Badge>
                                                </div>
                                                <span className="text-sm font-medium">
                                                    {count} users
                                                </span>
                                            </div>
                                            <div className="w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-fitness-orange to-fitness-orange-light h-2 rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>
                                System activity overview
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                <p className="text-muted-foreground">
                                    Activity monitoring coming soon
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === "users" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>User Management</CardTitle>
                                    <CardDescription>
                                        Manage system users
                                    </CardDescription>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search users..."
                                            className="pl-10 w-64"
                                            value={searchTerm}
                                            onChange={(e) =>
                                                setSearchTerm(e.target.value)
                                            }
                                        />
                                    </div>
                                    <Button className="gradient-orange">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add User
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {users.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                    Role
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
                                            {users.map((user) => (
                                                <motion.tr
                                                    key={user.id}
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    className="hover:bg-muted/50 transition-colors"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fitness-orange to-fitness-orange-light flex items-center justify-center text-white font-semibold">
                                                                {
                                                                    user
                                                                        .first_name?.[0]
                                                                }
                                                                {
                                                                    user
                                                                        .last_name?.[0]
                                                                }
                                                            </div>
                                                            <div>
                                                                <div className="font-medium">
                                                                    {
                                                                        user.first_name
                                                                    }{" "}
                                                                    {
                                                                        user.last_name
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm text-muted-foreground">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge
                                                            variant={getRoleBadgeVariant(
                                                                user.role
                                                            )}
                                                        >
                                                            {user.role.replace(
                                                                "_",
                                                                " "
                                                            )}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Badge variant="success">
                                                            Active
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8"
                                                            >
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No users found
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Gyms Tab */}
            {activeTab === "gyms" && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Gym Management</CardTitle>
                                    <CardDescription>
                                        Manage registered gyms
                                    </CardDescription>
                                </div>
                                <Button className="gradient-orange">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Gym
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {gyms.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {gyms.map((gym) => (
                                        <motion.div
                                            key={gym.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ scale: 1.03 }}
                                            className="p-6 border rounded-lg hover:shadow-lg transition-all duration-200"
                                        >
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="p-3 bg-gradient-to-br from-fitness-green to-green-600 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold">
                                                        {gym.name}
                                                    </h4>
                                                    <p className="text-sm text-muted-foreground">
                                                        {gym.address?.city},{" "}
                                                        {gym.address?.state}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <Badge variant="success">
                                                    Active
                                                </Badge>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    Manage
                                                </Button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-muted-foreground">
                                        No gyms found
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            )}
        </div>
    );
};

export default AdminDashboard;
