import React, { useState, useEffect, useCallback } from 'react';
import userService from '../../services/user.service';
import { getErrorMessage, formatDate, getRoleInfo } from '../../utilities/helpers';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ role: '', search: '' });
  const [searchInput, setSearchInput] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const loadUsers = useCallback(async (page = 1) => {
    setIsLoading(true);
    setError('');
    try {
      const params = { page, limit: 20, ...filters };
      if (!params.role) delete params.role;
      if (!params.search) delete params.search;
      const result = await userService.getAllUsers(params);
      setUsers(result.data.users);
      setPagination(result.data.pagination);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => { loadUsers(1); }, [loadUsers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters(p => ({ ...p, search: searchInput }));
  };

  const toggleStatus = async (userId, currentStatus) => {
    setUpdatingId(userId);
    try {
      await userService.updateUserStatus(userId, !currentStatus);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="ps-page-header">
        <h1>Users</h1>
        <p>Manage all registered users on the platform.</p>
      </div>

      {/* Filters */}
      <div className="ps-card mb-4">
        <div className="ps-card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-5">
              <form onSubmit={handleSearch}>
                <label className="form-label">Search</label>
                <div className="input-group">
                  <input type="text" className="form-control" placeholder="Name or email..." value={searchInput} onChange={e => setSearchInput(e.target.value)} />
                  <button className="btn btn-primary" type="submit" id="users-search-btn">Search</button>
                </div>
              </form>
            </div>
            <div className="col-md-3">
              <label className="form-label">Role</label>
              <select className="form-select" value={filters.role} onChange={e => setFilters(p => ({ ...p, role: e.target.value }))}>
                <option value="">All Roles</option>
                <option value="commuter">Commuter</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="col-md-2">
              <button className="btn btn-ghost" onClick={() => { setFilters({ role: '', search: '' }); setSearchInput(''); }}>Clear</button>
            </div>
            <div className="col-md-2 text-end">
              <span className="text-muted small">{pagination.total} users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="ps-card">
        <div className="ps-card-body p-0">
          {isLoading ? (
            <div className="p-4"><LoadingSpinner message="Loading users..." /></div>
          ) : error ? (
            <div className="p-4"><div className="alert alert-danger">{error}</div></div>
          ) : users.length === 0 ? (
            <div className="p-4"><EmptyState icon="👥" title="No users found" description="Try adjusting your search filters." /></div>
          ) : (
            <div className="table-responsive">
              <table className="ps-table w-100">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => {
                    const ri = getRoleInfo(u.role);
                    return (
                      <tr key={u._id}>
                        <td>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</div>
                          {u.businessName && <div className="text-muted" style={{ fontSize: '0.78rem' }}>{u.businessName}</div>}
                        </td>
                        <td style={{ fontSize: '0.875rem' }}>{u.email}</td>
                        <td><span className={`badge ${ri.badgeClass}`}>{ri.icon} {ri.label}</span></td>
                        <td>
                          <span className={`badge ${u.isActive ? 'badge-status-active' : 'badge-status-inactive'}`}>
                            {u.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td style={{ fontSize: '0.875rem', color: 'var(--ps-gray-500)' }}>{formatDate(u.createdAt)}</td>
                        <td>
                          <button
                            className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            onClick={() => toggleStatus(u._id, u.isActive)}
                            disabled={updatingId === u._id}
                            id={`toggle-user-${u._id}`}
                          >
                            {updatingId === u._id ? <span className="ps-spinner"></span> : (u.isActive ? 'Deactivate' : 'Activate')}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
