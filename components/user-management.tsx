"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import {
  Users,
  Shield,
  ShieldCheck,
  PenTool,
  User as UserIcon,
  Ban,
  Trash2,
  Search,
  Calendar,
  Eye,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: "admin" | "writer" | "user";
  is_active: boolean;
  is_verified: boolean;
  writer_status?: "pending" | "approved" | "rejected";
  last_login?: string;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  _id: string;
  user_id: string;
  display_name?: string;
  website?: string;
  location?: string;
  social_twitter?: string;
  social_linkedin?: string;
  social_github?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [profiles, setProfiles] = useState<Record<string, UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // User creation states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createUserData, setCreateUserData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "user" | "writer" | "admin",
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Pagination states
  const [allUsersPage, setAllUsersPage] = useState(1);
  const [pendingWritersPage, setPendingWritersPage] = useState(1);
  const [activeWritersPage, setActiveWritersPage] = useState(1);
  const [rejectedWritersPage, setRejectedWritersPage] = useState(1);
  const usersPerPage = 10;

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log("🔍 Starting user fetch...");
      setLoading(true);
      const response = await fetch("/api/admin/users", {
        method: "GET",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log("📊 Users API response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Users data received:", data);
        console.log("👥 Number of users:", data.users?.length || 0);
        setUsers(data.users || []);
        setProfiles(data.profiles || {});
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Users API error:", response.status, errorData);

        if (response.status === 401) {
          toast.error("Authentication required. Please login as admin.");
        } else if (response.status === 403) {
          toast.error("Admin access required");
        } else {
          toast.error(
            `Failed to fetch users: ${errorData.message || "Unknown error"}`
          );
        }
      }
    } catch (error) {
      console.error("💥 Error fetching users:", error);
      toast.error("Error fetching users");
    } finally {
      setLoading(false);
      console.log("🏁 User fetch completed");
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      console.log("🔄 Updating user role:", { userId, newRole });
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      console.log("📊 Role update response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Role updated successfully:", data);
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, role: newRole as any } : user
          )
        );
        const userName = users.find((u) => u.id === userId)?.username || "User";
        toast.success(`${userName}'s role updated to ${newRole}!`, {
          description: `User now has ${newRole} privileges`,
          duration: 4000,
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("❌ Role update error:", response.status, errorData);
        toast.error("Failed to update user role", {
          description: errorData.message || "Please try again later",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("💥 Error updating user role:", error);
      toast.error("Error updating user role", {
        description:
          "A network error occurred. Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !currentStatus }),
      });

      if (response.ok) {
        const userName = users.find((u) => u.id === userId)?.username || "User";
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId ? { ...user, is_active: !currentStatus } : user
          )
        );
        toast.success(
          `${userName} has been ${
            !currentStatus ? "unbanned" : "banned"
          } successfully!`,
          {
            description: !currentStatus
              ? "User can now access their account again"
              : "User has been suspended from the platform",
            duration: 4000,
          }
        );
      } else {
        const response_data = await response.json();
        toast.error("Failed to update user status", {
          description: response_data.message || "Please try again later",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Error updating user status", {
        description:
          "A network error occurred. Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setActionLoading(null);
      setShowBanDialog(false);
    }
  };

  const toggleUserVerification = async (
    userId: string,
    currentVerification: boolean
  ) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_verified: !currentVerification }),
      });

      if (response.ok) {
        const userName = users.find((u) => u.id === userId)?.username || "User";
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? { ...user, is_verified: !currentVerification }
              : user
          )
        );
        toast.success(
          `${userName} has been ${
            !currentVerification ? "verified" : "unverified"
          } successfully!`,
          {
            description: !currentVerification
              ? "User now has verified status and can access all features"
              : "User verification has been removed",
            duration: 4000,
          }
        );
      } else {
        const response_data = await response.json();
        toast.error("Failed to update user verification", {
          description: response_data.message || "Please try again later",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error updating user verification:", error);
      toast.error("Error updating user verification", {
        description:
          "A network error occurred. Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setActionLoading(null);
      setShowVerifyDialog(false);
    }
  };

  const updateWriterStatus = async (userId: string, status: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}/writer-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ writer_status: status }),
      });

      if (response.ok) {
        const userName = users.find((u) => u.id === userId)?.username || "User";
        setUsers((prev) =>
          prev.map((user) =>
            user.id === userId
              ? {
                  ...user,
                  writer_status: status as any,
                  role: status === "approved" ? "writer" : user.role,
                }
              : user
          )
        );
        toast.success(
          `${userName}'s writer application ${status} successfully!`,
          {
            description:
              status === "approved"
                ? "User now has writer privileges and can create articles"
                : "User has been notified of the application status",
            duration: 4000,
          }
        );
      } else {
        const response_data = await response.json();
        const actionWord =
          status === "approved"
            ? "approve"
            : status === "rejected"
            ? "reject"
            : status;
        toast.error(`Failed to ${actionWord} writer application`, {
          description: response_data.message || "Please try again later",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error updating writer status:", error);
      toast.error("Error updating writer status", {
        description:
          "A network error occurred. Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setActionLoading(null);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const deletedUser = users.find((u) => u.id === userId);
        setUsers((prev) => prev.filter((user) => user.id !== userId));
        toast.success(
          `${deletedUser?.username || "User"} deleted successfully!`,
          {
            description:
              "User account and all associated data have been removed",
            duration: 4000,
          }
        );
      } else {
        const response_data = await response.json();
        toast.error("Failed to delete user", {
          description: response_data.message || "Please try again later",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Error deleting user", {
        description:
          "A network error occurred. Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setActionLoading(null);
      setShowDeleteDialog(false);
    }
  };

  const createUser = async () => {
    try {
      setCreateLoading(true);

      // Validation
      if (
        !createUserData.username ||
        !createUserData.email ||
        !createUserData.password
      ) {
        toast.error("Please fill in all required fields", {
          description: "Username, email, and password are required",
          duration: 4000,
        });
        return;
      }

      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(createUserData),
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh the user list
        await fetchUsers();
        toast.success(`${createUserData.username} created successfully!`, {
          description: `New ${createUserData.role} account has been set up`,
          duration: 4000,
        });
        setShowCreateDialog(false);
        setCreateUserData({
          username: "",
          email: "",
          password: "",
          role: "user",
        });
      } else {
        const errorData = await response.json();
        toast.error("Failed to create user", {
          description:
            errorData.error || "Please check the details and try again",
          duration: 4000,
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Error creating user", {
        description:
          "A network error occurred. Please check your connection and try again.",
        duration: 4000,
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFilteredUsers = () => {
    return users.filter((user) => {
      const matchesSearch =
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        `${user.first_name || ""} ${user.last_name || ""}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && user.is_active) ||
        (statusFilter === "inactive" && !user.is_active) ||
        (statusFilter === "verified" && user.is_verified) ||
        (statusFilter === "unverified" && !user.is_verified);

      return matchesSearch && matchesRole && matchesStatus;
    });
  };

  const getPendingWriters = () => {
    return users.filter((user) => user.writer_status === "pending");
  };

  const getApprovedWriters = () => {
    return users.filter((user) => user.role === "writer");
  };

  const getRejectedWriters = () => {
    return users.filter((user) => user.writer_status === "rejected");
  };

  // Pagination helper functions
  const getPaginatedUsers = (userList: User[], currentPage: number) => {
    const totalPages = Math.ceil(userList.length / usersPerPage);
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const paginatedUsers = userList.slice(startIndex, endIndex);

    return {
      users: paginatedUsers,
      totalPages,
      totalItems: userList.length,
    };
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: {
        color: "bg-purple-500/20 text-purple-300 border-purple-400/30",
        icon: Shield,
      },
      writer: {
        color: "bg-green-500/20 text-green-300 border-green-400/30",
        icon: PenTool,
      },
      user: {
        color: "bg-gray-500/20 text-gray-300 border-gray-400/30",
        icon: UserIcon,
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig];
    const Icon = config.icon;

    return (
      <Badge
        className={`${config.color} flex items-center gap-1 backdrop-blur-sm`}
      >
        <Icon className="w-3 h-3" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (user: User) => {
    if (!user.is_active) {
      return (
        <Badge className="bg-red-500/20 text-red-300 border-red-400/30 backdrop-blur-sm">
          <Ban className="w-3 h-3 mr-1" />
          Banned
        </Badge>
      );
    }

    if (user.writer_status === "pending") {
      return (
        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 backdrop-blur-sm">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
    }

    if (user.is_verified) {
      return (
        <Badge className="bg-green-500/20 text-green-300 border-green-400/30 backdrop-blur-sm">
          <CheckCircle className="w-3 h-3 mr-1" />
          Verified
        </Badge>
      );
    }

    return (
      <Badge className="bg-gray-500/20 text-gray-300 border-gray-400/30 backdrop-blur-sm">
        <UserX className="w-3 h-3 mr-1" />
        Unverified
      </Badge>
    );
  };

  const UserCard = ({ user }: { user: User }) => {
    const profile = profiles[user.id];
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();

    return (
      <div
        className={`bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg ${
          !user.is_active ? "border-red-400/30 bg-red-500/10" : ""
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {(fullName || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-white truncate text-lg">
                  {fullName || user.username}
                </h3>
                {user.is_verified && (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                )}
              </div>
              <p className="text-gray-300 truncate">{user.email}</p>
              <p className="text-sm text-gray-400">@{user.username}</p>

              <div className="flex items-center gap-2 mt-3">
                {getRoleBadge(user.role)}
                {getStatusBadge(user)}
              </div>

              <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDate(user.created_at)}
                </span>
                {user.last_login && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Last login {formatDate(user.last_login)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Role Selector */}
            <Select
              value={user.role}
              onValueChange={(value) => updateUserRole(user.id, value)}
              disabled={actionLoading === user.id}
            >
              <SelectTrigger className="w-28 h-8 text-xs bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
                <SelectItem
                  value="admin"
                  className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                >
                  Admin
                </SelectItem>
                <SelectItem
                  value="writer"
                  className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                >
                  Writer
                </SelectItem>
                <SelectItem
                  value="user"
                  className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
                >
                  User
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Verification Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedUser(user);
                setShowVerifyDialog(true);
              }}
              disabled={actionLoading === user.id}
              className={`h-8 px-3 backdrop-blur-sm transition-all duration-200 rounded-lg ${
                user.is_verified
                  ? "bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-white border border-blue-500/30 hover:border-blue-500/50"
                  : "bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 hover:text-white border border-gray-500/30 hover:border-gray-500/50"
              }`}
            >
              {user.is_verified ? (
                <UserCheck className="w-3 h-3" />
              ) : (
                <UserX className="w-3 h-3" />
              )}
            </Button>

            {/* Ban/Unban Toggle */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedUser(user);
                setShowBanDialog(true);
              }}
              disabled={actionLoading === user.id}
              className={`h-8 px-3 backdrop-blur-sm transition-all duration-200 rounded-lg ${
                user.is_active
                  ? "bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 hover:text-white border border-orange-500/30 hover:border-orange-500/50"
                  : "bg-green-600/20 hover:bg-green-600/30 text-green-300 hover:text-white border border-green-500/30 hover:border-green-500/50"
              }`}
            >
              {user.is_active ? (
                <Ban className="w-3 h-3" />
              ) : (
                <Eye className="w-3 h-3" />
              )}
            </Button>

            {/* Delete Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSelectedUser(user);
                setShowDeleteDialog(true);
              }}
              disabled={actionLoading === user.id}
              className="h-8 px-3 bg-red-600/20 hover:bg-red-600/30 text-red-300 hover:text-white border border-red-500/30 hover:border-red-500/50 backdrop-blur-sm transition-all duration-200 rounded-lg"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const PendingWriterCard = ({ user }: { user: User }) => {
    const fullName = `${user.first_name || ""} ${user.last_name || ""}`.trim();

    return (
      <div className="bg-white/10 backdrop-blur-sm border border-yellow-400/30 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
              {(fullName || user.username).charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white truncate text-lg">
                {fullName || user.username}
              </h3>
              <p className="text-gray-300 truncate">{user.email}</p>
              <p className="text-sm text-gray-400">@{user.username}</p>

              <div className="flex items-center gap-2 mt-3">
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-400/30 backdrop-blur-sm">
                  <Clock className="w-3 h-3 mr-1" />
                  Writer Application Pending
                </Badge>
              </div>

              <p className="text-sm text-gray-400 mt-2">
                Applied {formatDate(user.created_at)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateWriterStatus(user.id, "approved")}
              disabled={actionLoading === user.id}
              className="h-8 px-3 bg-green-500/20 text-green-300 border-green-400/30 hover:bg-green-500/30 backdrop-blur-sm transition-all duration-200"
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => updateWriterStatus(user.id, "rejected")}
              disabled={actionLoading === user.id}
              className="h-8 px-3 bg-red-500/20 text-red-300 border-red-400/30 hover:bg-red-500/30 backdrop-blur-sm transition-all duration-200"
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white/30"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">User Management</h2>
          <p className="text-gray-300">
            Manage users, writers, and permissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
              <div className="relative">
                <DialogHeader className="space-y-4 pb-6">
                  <DialogTitle className="text-2xl font-bold text-white">
                    Create New User
                  </DialogTitle>
                  <DialogDescription className="text-gray-200 text-base leading-relaxed">
                    Add a new user to the system. They will receive login
                    credentials via email.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="username"
                      className="text-right text-white font-medium"
                    >
                      Username
                    </Label>
                    <Input
                      id="username"
                      value={createUserData.username}
                      onChange={(e) =>
                        setCreateUserData((prev) => ({
                          ...prev,
                          username: e.target.value,
                        }))
                      }
                      className="col-span-3 bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-white/40 focus:ring-white/20"
                      placeholder="Enter username"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="email"
                      className="text-right text-white font-medium"
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={createUserData.email}
                      onChange={(e) =>
                        setCreateUserData((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="col-span-3 bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-white/40 focus:ring-white/20"
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="password"
                      className="text-right text-white font-medium"
                    >
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={createUserData.password}
                      onChange={(e) =>
                        setCreateUserData((prev) => ({
                          ...prev,
                          password: e.target.value,
                        }))
                      }
                      className="col-span-3 bg-white/10 border-white/20 text-white placeholder-gray-300 focus:border-white/40 focus:ring-white/20"
                      placeholder="Enter password"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label
                      htmlFor="role"
                      className="text-right text-white font-medium"
                    >
                      Role
                    </Label>
                    <Select
                      value={createUserData.role}
                      onValueChange={(value: "user" | "writer" | "admin") =>
                        setCreateUserData((prev) => ({ ...prev, role: value }))
                      }
                    >
                      <SelectTrigger className="col-span-3 bg-white/10 border-white/20 text-white focus:border-white/40 focus:ring-white/20">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800/90 backdrop-blur-xl border-white/20">
                        <SelectItem
                          value="user"
                          className="text-white hover:bg-white/20"
                        >
                          User
                        </SelectItem>
                        <SelectItem
                          value="writer"
                          className="text-white hover:bg-white/20"
                        >
                          Writer
                        </SelectItem>
                        <SelectItem
                          value="admin"
                          className="text-white hover:bg-white/20"
                        >
                          Admin
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter className="gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="h-12 px-6 bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-200 rounded-xl shadow-lg hover:shadow-xl"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={createUser}
                    disabled={createLoading}
                    className="h-12 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createLoading ? "Creating..." : "Create User"}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Users className="w-4 h-4" />
            {users.length} total users
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">{users.length}</p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Total Users
              </p>
              <p className="text-sm text-gray-400">All registered accounts</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl backdrop-blur-sm">
              <Users className="h-6 w-6 text-blue-300" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">
                {getPendingWriters().length}
              </p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Pending Writers
              </p>
              <p className="text-sm text-gray-400">Awaiting approval</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl backdrop-blur-sm">
              <Clock className="h-6 w-6 text-yellow-300" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">
                {getApprovedWriters().length}
              </p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Active Writers
              </p>
              <p className="text-sm text-gray-400">Approved content creators</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl backdrop-blur-sm">
              <PenTool className="h-6 w-6 text-green-300" />
            </div>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-white">
                {users.filter((u) => !u.is_active).length}
              </p>
              <p className="text-sm font-medium text-gray-300 mb-1">
                Banned Users
              </p>
              <p className="text-sm text-gray-400">Suspended accounts</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl backdrop-blur-sm">
              <Ban className="h-6 w-6 text-red-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 shadow-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-32 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
              <SelectItem
                value="all"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                All Roles
              </SelectItem>
              <SelectItem
                value="admin"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Admin
              </SelectItem>
              <SelectItem
                value="writer"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Writer
              </SelectItem>
              <SelectItem
                value="user"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                User
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32 bg-white/10 backdrop-blur-xl border-white/20 text-white hover:bg-white/20 transition-all duration-200 rounded-lg">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl">
              <SelectItem
                value="all"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                All Status
              </SelectItem>
              <SelectItem
                value="active"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Active
              </SelectItem>
              <SelectItem
                value="inactive"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Banned
              </SelectItem>
              <SelectItem
                value="verified"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Verified
              </SelectItem>
              <SelectItem
                value="unverified"
                className="text-white hover:bg-white/20 focus:bg-white/20 cursor-pointer"
              >
                Unverified
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm border border-white/20">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-blue-600/20 data-[state=active]:text-white text-gray-300"
          >
            All Users
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="data-[state=active]:bg-yellow-600/20 data-[state=active]:text-white text-gray-300"
          >
            Pending Writers
            {getPendingWriters().length > 0 && (
              <Badge className="ml-2 bg-yellow-500/20 text-yellow-300 border-yellow-400/30">
                {getPendingWriters().length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="writers"
            className="data-[state=active]:bg-green-600/20 data-[state=active]:text-white text-gray-300"
          >
            Active Writers
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="data-[state=active]:bg-red-600/20 data-[state=active]:text-white text-gray-300"
          >
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {(() => {
            const filteredUsers = getFilteredUsers();
            const {
              users: paginatedUsers,
              totalPages,
              totalItems,
            } = getPaginatedUsers(filteredUsers, allUsersPage);

            if (filteredUsers.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center shadow-lg">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">
                    No users found matching your criteria
                  </p>
                </div>
              );
            }

            return (
              <>
                <div className="space-y-4">
                  {paginatedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={allUsersPage}
                      totalPages={totalPages}
                      onPageChange={setAllUsersPage}
                      itemsPerPage={usersPerPage}
                      totalItems={totalItems}
                    />
                  </div>
                )}
              </>
            );
          })()}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {(() => {
            const pendingWriters = getPendingWriters();
            const {
              users: paginatedUsers,
              totalPages,
              totalItems,
            } = getPaginatedUsers(pendingWriters, pendingWritersPage);

            if (pendingWriters.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center shadow-lg">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">
                    No pending writer applications
                  </p>
                </div>
              );
            }

            return (
              <>
                <div className="space-y-4">
                  {paginatedUsers.map((user) => (
                    <PendingWriterCard key={user.id} user={user} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={pendingWritersPage}
                      totalPages={totalPages}
                      onPageChange={setPendingWritersPage}
                      itemsPerPage={usersPerPage}
                      totalItems={totalItems}
                    />
                  </div>
                )}
              </>
            );
          })()}
        </TabsContent>

        <TabsContent value="writers" className="space-y-4">
          {(() => {
            const approvedWriters = getApprovedWriters();
            const {
              users: paginatedUsers,
              totalPages,
              totalItems,
            } = getPaginatedUsers(approvedWriters, activeWritersPage);

            if (approvedWriters.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center shadow-lg">
                  <PenTool className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No active writers</p>
                </div>
              );
            }

            return (
              <>
                <div className="space-y-4">
                  {paginatedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={activeWritersPage}
                      totalPages={totalPages}
                      onPageChange={setActiveWritersPage}
                      itemsPerPage={usersPerPage}
                      totalItems={totalItems}
                    />
                  </div>
                )}
              </>
            );
          })()}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {(() => {
            const rejectedWriters = getRejectedWriters();
            const {
              users: paginatedUsers,
              totalPages,
              totalItems,
            } = getPaginatedUsers(rejectedWriters, rejectedWritersPage);

            if (rejectedWriters.length === 0) {
              return (
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 text-center shadow-lg">
                  <XCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300">No rejected applications</p>
                </div>
              );
            }

            return (
              <>
                <div className="space-y-4">
                  {paginatedUsers.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={rejectedWritersPage}
                      totalPages={totalPages}
                      onPageChange={setRejectedWritersPage}
                      itemsPerPage={usersPerPage}
                      totalItems={totalItems}
                    />
                  </div>
                )}
              </>
            );
          })()}
        </TabsContent>
      </Tabs>

      {/* Verification Dialog */}
      <AlertDialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative">
            <AlertDialogHeader className="space-y-4 pb-6">
              <AlertDialogTitle className="text-2xl font-bold text-white">
                {selectedUser?.is_verified
                  ? "Remove Verification"
                  : "Verify User"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-200 text-base leading-relaxed">
                {selectedUser?.is_verified
                  ? `Are you sure you want to remove verification for ${selectedUser?.username}? This will revoke their verified status.`
                  : `Are you sure you want to verify ${selectedUser?.username}? This will grant them verified status.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedUser &&
                  toggleUserVerification(
                    selectedUser.id,
                    selectedUser.is_verified
                  )
                }
                className={
                  selectedUser?.is_verified
                    ? "h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    : "h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                }
              >
                {selectedUser?.is_verified
                  ? "Remove Verification"
                  : "Verify User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Ban Dialog */}
      <AlertDialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative">
            <AlertDialogHeader className="space-y-4 pb-6">
              <AlertDialogTitle className="text-2xl font-bold text-white">
                {selectedUser?.is_active ? "Ban User" : "Unban User"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-200 text-base leading-relaxed">
                {selectedUser?.is_active
                  ? `Are you sure you want to ban ${selectedUser?.username}? They will no longer be able to access the platform.`
                  : `Are you sure you want to unban ${selectedUser?.username}? They will regain access to the platform.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  selectedUser &&
                  toggleUserStatus(selectedUser.id, selectedUser.is_active)
                }
                className={
                  selectedUser?.is_active
                    ? "h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                    : "h-12 px-8 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
                }
              >
                {selectedUser?.is_active ? "Ban User" : "Unban User"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl"></div>
          <div className="relative">
            <AlertDialogHeader className="space-y-4 pb-6">
              <AlertDialogTitle className="text-2xl font-bold text-white">
                Delete User
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-200 text-base leading-relaxed">
                Are you sure you want to delete {selectedUser?.username}? This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3">
              <AlertDialogCancel className="h-12 px-6 bg-gray-800/50 border-white/40 text-white backdrop-blur-sm transition-all duration-200 rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => selectedUser && deleteUser(selectedUser.id)}
                className="h-12 px-8 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 rounded-xl"
              >
                Delete User
              </AlertDialogAction>
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
