/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Search, Trash2, User, Edit2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminApi } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ErrorMessage } from "@/components/common/ErrorMessage";

interface EditingUser {
  id: string | number;
  name: string;
  email: string;
  role?: string;
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    userId: string | number;
    userName: string;
  } | null>(null);

  // Fetch users
  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-users", page],
    queryFn: () => adminApi.getUsers(page, 20),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (userId: string | number) =>
      adminApi.deleteUser(String(userId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (userData: {
      id: string | number;
      name: string;
      email: string;
      role?: string;
    }) => adminApi.updateUser(String(userData.id), userData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setEditingUser(null);
    },
  });

  // Toggle active mutation
  const toggleMutation = useMutation({
    mutationFn: ({
      userId,
      isActive,
    }: {
      userId: string | number;
      isActive: boolean;
    }) => adminApi.toggleUserActive(String(userId), isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Filter users by search query (only for current page)
  const filteredUsers =
    usersData?.data?.filter(
      (user) =>
        user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const handleEditClick = (user: any) => {
    const userId = user.id || user.userId;
    const userRole =
      typeof user.role === "string" ? user.role : user.role?.name || "USER";
    console.log("Edit user clicked:", { user, userId, userRole });
    setEditingUser({
      id: userId || "",
      name: user.name || "",
      email: user.email || "",
      role: userRole,
    });
    setEditName(user.name || "");
    setEditEmail(user.email || "");
    setEditRole(userRole);
  };

  const handleSaveEdit = () => {
    if (editingUser) {
      console.log("Saving user:", {
        editingUser,
        editName,
        editEmail,
        editRole,
      });
      updateMutation.mutate({
        id: editingUser.id,
        name: editName,
        email: editEmail,
        role: editRole,
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-2">Manage users and their permissions</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-3 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Search users by name or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 bg-black/30 border border-white/10"
        />
      </div>

      {/* Loading State */}
      {isLoading && <LoadingSpinner />}

      {/* Error State */}
      {error && (
        <ErrorMessage message="Failed to load users. Please try again." />
      )}

      {/* Users Table */}
      {!isLoading && !error && (
        <>
          <div className="bg-black/30 border border-white/10 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-black/50 border-b border-white/10">
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Name
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Email
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Role
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Status
                  </th>
                  <th className="text-left px-6 py-4 text-gray-400 font-semibold">
                    Created
                  </th>
                  <th className="text-right px-6 py-4 text-gray-400 font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => {
                    const userId = user.id || user.userId || index + 1;
                    return (
                      <tr
                        key={userId}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.name?.charAt(0) || "U"}
                              </span>
                            </div>
                            <p className="font-medium text-white">
                              {user.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {user.email}
                        </td>
                        <td className="px-6 py-4">
                          {(() => {
                            const isAdmin =
                              user.role === "ADMIN" ||
                              (typeof user.role === "object" &&
                                user.role.name === "ADMIN");
                            return (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  isAdmin
                                    ? "bg-red-500/30 text-red-300"
                                    : "bg-blue-500/30 text-blue-300"
                                }`}
                              >
                                {isAdmin ? "ADMIN" : "USER"}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              user.isActive
                                ? "bg-green-500/30 text-green-300"
                                : "bg-gray-500/30 text-gray-300"
                            }`}
                          >
                            {user.isActive ? "✓ Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {user.createdAt
                            ? new Date(user.createdAt).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 flex justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-500/20 text-blue-400 hover:text-blue-300"
                            onClick={() => handleEditClick(user)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className={`${
                              user.isActive
                                ? "hover:bg-red-500/20 text-red-400 hover:text-red-300"
                                : "hover:bg-green-500/20 text-green-400 hover:text-green-300"
                            }`}
                            onClick={() =>
                              toggleMutation.mutate({
                                userId: userId,
                                isActive: !user.isActive,
                              })
                            }
                            disabled={toggleMutation.isPending}
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-red-500/20 text-red-400 hover:text-red-300"
                            onClick={() =>
                              setDeleteConfirm({
                                userId,
                                userName: user.name || user.email || "User",
                              })
                            }
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <User className="h-12 w-12 text-gray-400 mx-auto mb-4 opacity-50" />
                      <p className="text-gray-400">No users found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {usersData && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-400">
                Total: {usersData.total || 0} users | Page {page} of{" "}
                {Math.ceil((usersData.total || 0) / 20)}
              </span>
              <div className="space-x-2 flex">
                <Button
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage(Math.max(1, page - 1))}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  disabled={page >= Math.ceil((usersData.total || 1) / 20)}
                  onClick={() => setPage(page + 1)}
                  className="border-white/10 text-white hover:bg-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}

          {/* Summary */}
          {usersData && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {usersData.total || 0}
                </p>
              </div>
              <div className="bg-black/30 border border-white/10 rounded-lg p-4">
                <p className="text-gray-400 text-sm">Active Users</p>
                <p className="text-2xl font-bold text-white mt-2">
                  {usersData.data?.filter((u) => u.isActive).length || 0}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Edit Dialog */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/80 border border-white/10 rounded-xl p-8 max-w-md w-full mx-4 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Edit User</h2>
              <button
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Name
                </label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-black/30 border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <Input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="bg-black/30 border border-white/10"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded text-white"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSaveEdit}
                disabled={updateMutation.isPending}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={() => setEditingUser(null)}
                variant="outline"
                className="flex-1 border-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-black/80 border border-white/10 rounded-xl p-8 max-w-md w-full mx-4 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Confirm Delete</h2>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-gray-300">
                Are you sure you want to delete user{" "}
                <span className="font-semibold text-white">
                  &quot;{deleteConfirm.userName}&quot;
                </span>
                ? This action cannot be undone.
              </p>

              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                <p className="text-sm text-red-300">
                  ⚠️ All associated data will be removed.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  deleteMutation.mutate(deleteConfirm.userId);
                  setDeleteConfirm(null);
                }}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </Button>
              <Button
                onClick={() => setDeleteConfirm(null)}
                variant="outline"
                className="flex-1 border-white/10"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
