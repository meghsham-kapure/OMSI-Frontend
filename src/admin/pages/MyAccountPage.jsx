import { useState } from 'react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { FormField } from '../components/ui/FormField';
import { FormErrorBanner } from '../components/ui/FormErrorBanner';
import { LoadingOverlay } from '../components/ui/LoadingOverlay';

export function MyAccountPage() {
  const toast = useToast();

  // Email change form
  const [email, setEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change form
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState({});

  async function handleEmailSubmit(e) {
    e.preventDefault();
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'New email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) newErrors.email = 'Invalid email address. Please enter a valid email (e.g. user@example.com).';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    setErrors({});
    setEmailLoading(true);
    try {
      await api.patch('/user/changeEmailIdByUser', { email });
      toast.success('Email updated successfully.');
      setEmail('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setEmailLoading(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    const newErrors = {};

    if (!password) newErrors.password = 'New password is required.';
    else if (password.length < 8) newErrors.password = `Password is too short — minimum 8 characters (currently ${password.length}).`;
    else if (password.length > 32) newErrors.password = 'Password is too long — maximum 32 characters.';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])/.test(password))
      newErrors.password = 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.';

    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your new password.';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setPasswordLoading(true);
    try {
      await api.patch('/user/changePasswordByUser', { password });
      toast.success('Password updated successfully.');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__header">
        <h2 className="admin-page__title">My Account</h2>
        <p className="admin-page__sub">Update your own email address or password.</p>
      </div>

      <div className="admin-cards-row">
        {/* Change Email */}
        <div className="admin-card" style={{ position: 'relative' }}>
          <LoadingOverlay visible={emailLoading} message="Updating email…" />
          <h3 className="admin-card__title">Change Email</h3>
          <form id="my-account-email-form" onSubmit={handleEmailSubmit} noValidate>
            <FormErrorBanner errors={errors.email ? { email: errors.email } : {}} />
            <FormField
              id="my-email"
              label="New email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="newemail@example.com"
              required
            />
            <button
              id="my-account-email-submit"
              type="submit"
              className="admin-btn admin-btn--primary admin-btn--full"
              disabled={emailLoading}
            >
              {emailLoading ? 'Saving…' : 'Update Email'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="admin-card" style={{ position: 'relative' }}>
          <LoadingOverlay visible={passwordLoading} message="Updating password…" />
          <h3 className="admin-card__title">Change Password</h3>
          <form id="my-account-password-form" onSubmit={handlePasswordSubmit} noValidate>
            <FormErrorBanner errors={{ ...(errors.password ? { password: errors.password } : {}), ...(errors.confirmPassword ? { confirmPassword: errors.confirmPassword } : {}) }} />
            <FormField
              id="my-password"
              label="New password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password@123"
              error={errors.password}
              hint="8–32 chars, upper, lower, number, special character."
              required
            />
            <FormField
              id="my-confirm-password"
              label="Confirm new password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat password"
              error={errors.confirmPassword}
              required
            />
            <button
              id="my-account-password-submit"
              type="submit"
              className="admin-btn admin-btn--primary admin-btn--full"
              disabled={passwordLoading}
            >
              {passwordLoading ? 'Saving…' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
