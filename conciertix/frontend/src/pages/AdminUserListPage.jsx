import React, { useState, useEffect, useContext, useCallback } from 'react';
// API service for backend communication.
import api from '../services/api';
// AuthContext to get the current user's ID (to prevent self-role modification).
import { AuthContext } from '../context/AuthContext';
// Styles for this page.
import './AdminUserListPage.css';

/**
 * @function AdminUserListPage
 * @description Page component for listing and managing users in the admin panel.
 * It allows admins to view all users and change their roles (e.g., from User to Admin).
 * Includes basic loading/error states and a safeguard against an admin demoting themselves.
 *
 * @returns {JSX.Element} The rendered admin user list page.
 */
const AdminUserListPage = () => {
  // State for storing the list of users.
  const [users, setUsers] = useState([]);
  // State to indicate if user data is currently being loaded.
  const [loading, setLoading] = useState(true);
  // State to store any error messages from API calls.
  const [error, setError] = useState(null);
  // State for pagination details (currently basic, assumes backend might support it).
  // For a full implementation, `limit` and `totalPages` would be more actively used.
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1 });
  // Get the current authenticated user from AuthContext.
  // `user` from AuthContext is used here, renamed to `currentUser` to avoid conflict with mapped `user` in list.
  const { user: currentUser } = useContext(AuthContext);

  /**
   * Fetches users from the API.
   * This version assumes the API might support pagination but defaults to fetching all users if not.
   * @async
   * @param {number} [page=1] - The page number to fetch (if backend supports pagination).
   */
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true); // Indicate loading has started.
    setError(null);   // Clear previous errors.
    try {
      // API endpoint for fetching users. Adjust if pagination parameters are needed (e.g., `/api/users?page=${page}&limit=${pagination.limit}`).
      const response = await api.get(`/api/users`);
      // Assuming response.data is an array of users.
      // If backend returns paginated data, e.g., { items: [], totalPages: X }, adjust accordingly.
      setUsers(response.data || []);
      
      // Example: If backend sends pagination info in response.data.meta or response.data.pagination
      // if (response.data.meta && response.data.meta.totalPages) {
      //   setPagination(prev => ({ ...prev, totalPages: response.data.meta.totalPages }));
      // }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users. Please try again.');
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false); // Indicate loading has finished.
    }
  }, []); // `pagination.limit` could be a dependency if used in API call.

  // Effect to fetch users when the component mounts or pagination.page changes.
  useEffect(() => {
    fetchUsers(pagination.page);
  }, [fetchUsers, pagination.page]); // `fetchUsers` is memoized.

  /**
   * Handles changing a user's role.
   * Makes an API call to update the role and then updates the local state.
   * @async
   * @param {string|number} userId - The ID of the user whose role is to be changed.
   * @param {string} newRole - The new role to assign to the user (e.g., 'Admin', 'User').
   */
  const handleRoleChange = async (userId, newRole) => {
    // Prevent an admin from demoting themselves to 'User'.
    if (currentUser && userId === currentUser.id && newRole === 'User' && currentUser.role === 'Admin') {
      alert("You cannot demote yourself from 'Admin' to 'User'. This action is restricted.");
      return;
    }

    // Confirm the action with the admin.
    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return; // Do nothing if user cancels.
    }

    try {
      // API call to update the user's role.
      // The endpoint `/api/users/${userId}/role` and payload `{ newRole }` are examples.
      await api.put(`/api/users/${userId}/role`, { role: newRole }); // Backend might expect { role: newRole }
      alert('User role updated successfully!');
      // Update the user's role in the local state for immediate UI feedback.
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      // Alternatively, re-fetch all users: fetchUsers(pagination.page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user role. Please try again.');
      console.error("Update role error:", err);
    }
  };

  // Display loading message.
  if (loading) return <p className="admin-page-container">Loading users...</p>;
  // Display error message.
  if (error) return <p style={{ color: 'red' }} className="admin-page-container">Error: {error}</p>;

  return (
    <div className="admin-user-list-page admin-page-container">
      <h2>User Management</h2>
      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <table className="user-table"> {/* Added specific class for styling */}
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Actions (Change Role)</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  {/* Display "(Current Admin)" if the user is the currently logged-in admin. */}
                  {currentUser && user.id === currentUser.id ? (
                    <span>(Current Admin - Cannot change own role here)</span>
                  ) : (
                    // Dropdown to change user role.
                    <select
                      value={user.role} // Current role of the user.
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      // Disable if it's the current admin trying to change their own role via this UI
                      // (though self-demotion to 'User' is blocked in handler).
                      // This UI primarily prevents accidental changes to self.
                      disabled={currentUser && user.id === currentUser.id}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                      {/* Add other roles if applicable, e.g., 'Moderator'. */}
                    </select>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Placeholder for pagination controls. Implement if API supports pagination. */}
      {/*
      {pagination.totalPages > 1 && (
        <div className="pagination-controls">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1)}))}
            disabled={pagination.page === 1 || loading}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.totalPages}</span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(pagination.totalPages, prev.page + 1)}))}
            disabled={pagination.page === pagination.totalPages || loading}
          >
            Next
          </button>
        </div>
      )}
      */}
    </div>
  );
};

export default AdminUserListPage;