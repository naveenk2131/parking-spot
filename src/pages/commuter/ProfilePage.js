import React, { useState } from 'react';
import { useAuth } from '../../state/AuthContext';
import userService from '../../services/user.service';
import { getErrorMessage, getInitials, getRoleInfo, formatDate } from '../../utilities/helpers';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const roleInfo = getRoleInfo(user?.role);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
  });
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });

  const handleProfileChange = (e) => {
    setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMsg({ type: '', text: '' });
    try {
      const result = await userService.updateProfile(formData);
      updateUser(result.data.user);
      setMsg({ type: 'success', text: 'Profile updated successfully.' });
      setIsEditing(false);
    } catch (err) {
      setMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwData.newPassword !== pwData.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    setIsChangingPw(true);
    setPwMsg({ type: '', text: '' });
    try {
      await userService.changePassword(pwData.currentPassword, pwData.newPassword);
      setPwMsg({ type: 'success', text: 'Password changed successfully.' });
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="ps-page-header">
        <h1>Profile</h1>
        <p>Manage your personal information and account settings.</p>
      </div>

      <div className="row g-4">
        {/* Profile Card */}
        <div className="col-lg-8">
          <div className="ps-card mb-4">
            <div className="ps-card-body">
              {/* Avatar + name header */}
              <div className="d-flex align-items-center gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--ps-gray-100)' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1a56db, #3b82f6)',
                  color: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontWeight: 800, fontSize: '1.5rem', flexShrink: 0,
                }}>
                  {getInitials(user?.firstName, user?.lastName)}
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, marginBottom: '0.25rem' }}>{user?.firstName} {user?.lastName}</h4>
                  <div className="d-flex align-items-center gap-2 flex-wrap">
                    <span className={`badge ${roleInfo.badgeClass}`}><i className={`bi ${roleInfo.icon}`}></i> {roleInfo.label}</span>
                    <span className="text-muted small">{user?.email}</span>
                  </div>
                </div>
              </div>

              {/* Profile Form */}
              {msg.text && (
                <div className={`alert alert-${msg.type === 'success' ? 'success' : 'danger'} mb-3`}>{msg.text}</div>
              )}
              <form onSubmit={handleProfileSave}>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label">First Name</label>
                    <input type="text" name="firstName" className="form-control" value={formData.firstName} onChange={handleProfileChange} disabled={!isEditing} />
                  </div>
                  <div className="col-6">
                    <label className="form-label">Last Name</label>
                    <input type="text" name="lastName" className="form-control" value={formData.lastName} onChange={handleProfileChange} disabled={!isEditing} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input type="email" className="form-control" value={user?.email || ''} disabled />
                  <div className="form-text">Email cannot be changed. Contact support if needed.</div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input type="tel" name="phone" className="form-control" value={formData.phone} onChange={handleProfileChange} disabled={!isEditing} placeholder="+1 (555) 000-0000" />
                </div>
                {user?.role === 'owner' && (
                  <div className="mb-3">
                    <label className="form-label">Business Name</label>
                    <input type="text" name="businessName" className="form-control" value={formData.businessName} onChange={handleProfileChange} disabled={!isEditing} />
                  </div>
                )}
                <div className="d-flex gap-2">
                  {!isEditing ? (
                    <button type="button" className="btn btn-outline-primary" id="edit-profile-btn" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </button>
                  ) : (
                    <>
                      <button type="submit" className="btn btn-primary" id="save-profile-btn" disabled={isSaving}>
                        {isSaving ? <><span className="ps-spinner me-2"></span>Saving...</> : 'Save Changes'}
                      </button>
                      <button type="button" className="btn btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="ps-card">
            <div className="ps-card-body">
              <h5 style={{ fontWeight: 700, marginBottom: '1.25rem' }}>Change Password</h5>
              {pwMsg.text && (
                <div className={`alert alert-${pwMsg.type === 'success' ? 'success' : 'danger'} mb-3`}>{pwMsg.text}</div>
              )}
              <form onSubmit={handlePasswordChange}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <input type="password" className="form-control" value={pwData.currentPassword} onChange={e => setPwData(p => ({ ...p, currentPassword: e.target.value }))} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" value={pwData.newPassword} onChange={e => setPwData(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
                </div>
                <div className="mb-4">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" className="form-control" value={pwData.confirmPassword} onChange={e => setPwData(p => ({ ...p, confirmPassword: e.target.value }))} required />
                </div>
                <button type="submit" className="btn btn-outline-primary" id="change-password-btn" disabled={isChangingPw}>
                  {isChangingPw ? <><span className="ps-spinner me-2"></span>Updating...</> : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Account Summary */}
        <div className="col-lg-4">
          <div className="ps-card">
            <div className="ps-card-body">
              <h6 style={{ fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em', color: 'var(--ps-gray-500)' }}>
                Account Details
              </h6>
              <div className="d-flex flex-column gap-3">
                {[
                  { label: 'Role', value: <><i className={`bi ${roleInfo.icon}`}></i> {roleInfo.label}</> },
                  { label: 'Member Since', value: formatDate(user?.createdAt) },
                  { label: 'Email Verified', value: user?.isEmailVerified ? <><i className="bi bi-check-circle-fill text-success"></i> Verified</> : <><i className="bi bi-x-circle-fill text-danger"></i> Not verified</> },
                  { label: 'Account Status', value: user?.isActive ? <><i className="bi bi-circle-fill text-success" style={{fontSize: '0.6rem', verticalAlign: 'middle'}}></i> Active</> : <><i className="bi bi-circle-fill text-danger" style={{fontSize: '0.6rem', verticalAlign: 'middle'}}></i> Inactive</> },
                  ...(user?.role === 'owner' ? [
                    { label: 'SaaS Plan', value: <span className={`badge bg-${user?.subscription === 'PRO' ? 'primary' : user?.subscription === 'BUSINESS' ? 'dark' : 'secondary'}`}>{user?.subscription || 'FREE'}</span> }
                  ] : []),
                  ...(user?.role === 'commuter' && user?.corporatePlan?.active ? [
                    { label: 'Corporate Capacity', value: <span className="badge bg-success">{user?.corporatePlan?.monthlyCapacity} bookings/month</span> }
                  ] : []),
                ].map((item, i) => (
                  <div key={i}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--ps-gray-500)', marginBottom: '0.15rem', fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
