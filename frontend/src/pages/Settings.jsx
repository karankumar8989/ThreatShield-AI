import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FiUser, FiLock, FiBell, FiMoon, FiSun, FiShield, FiInfo,
} from 'react-icons/fi';
import Header from '../components/Header';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { THEME_KEY, NOTIFICATIONS_KEY } from '../utils/constants';

export default function Settings() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    threatAlerts: true,
    weeklyReport: false,
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '', newPassword: '', confirm: '',
  });

  useEffect(() => {
    setTheme(localStorage.getItem(THEME_KEY) || 'dark');
    try {
      const saved = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
      if (Object.keys(saved).length) setNotifications(prev => ({ ...prev, ...saved }));
    } catch { /* ignore */ }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem(THEME_KEY, next);
    document.documentElement.classList.toggle('light-theme', next === 'light');
    toast.success(`Switched to ${next} theme`);
  };

  const saveNotifications = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] };
    setNotifications(updated);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    toast.success('Notification settings updated');
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    toast.success('Password change request submitted (backend endpoint pending)');
    setPasswordForm({ current: '', newPassword: '', confirm: '' });
  };

  const Toggle = ({ checked, onChange, label }) => (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-300">{label}</span>
      <button
        onClick={onChange}
        className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${checked ? 'bg-primary' : 'bg-white/10'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <Header title="Settings" subtitle="Manage your account and preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/20"><FiUser className="w-5 h-5 text-primary" /></div>
            <h3 className="font-semibold text-white">User Profile</h3>
          </div>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold text-white">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-white">{user?.email}</p>
              <p className="text-sm text-slate-500">Security Analyst</p>
            </div>
          </div>
          <Input label="Email" value={user?.email || ''} disabled />
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-secondary/20">
              {theme === 'dark' ? <FiMoon className="w-5 h-5 text-secondary" /> : <FiSun className="w-5 h-5 text-secondary" />}
            </div>
            <h3 className="font-semibold text-white">Theme</h3>
          </div>
          <p className="text-sm text-slate-400 mb-4">Toggle between dark and light appearance.</p>
          <Button variant="outline" onClick={toggleTheme} icon={theme === 'dark' ? FiSun : FiMoon}>
            Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent/20"><FiLock className="w-5 h-5 text-accent" /></div>
            <h3 className="font-semibold text-white">Change Password</h3>
          </div>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <Input label="Current Password" type="password" value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
            <Input label="New Password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
            <Input label="Confirm Password" type="password" value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
            <Button type="submit" variant="secondary">Update Password</Button>
          </form>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-success/20"><FiBell className="w-5 h-5 text-success" /></div>
            <h3 className="font-semibold text-white">Notifications</h3>
          </div>
          <div className="divide-y divide-white/5">
            <Toggle label="Email Alerts" checked={notifications.emailAlerts} onChange={() => saveNotifications('emailAlerts')} />
            <Toggle label="Threat Detection Alerts" checked={notifications.threatAlerts} onChange={() => saveNotifications('threatAlerts')} />
            <Toggle label="Weekly Report Summary" checked={notifications.weeklyReport} onChange={() => saveNotifications('weeklyReport')} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-primary/20"><FiInfo className="w-5 h-5 text-primary" /></div>
            <h3 className="font-semibold text-white">About ThreatShield AI</h3>
          </div>
          <div className="flex items-start gap-4">
            <FiShield className="w-8 h-8 text-primary shrink-0 mt-1" />
            <div>
              <p className="text-sm text-slate-300 leading-relaxed">
                ThreatShield AI is an enterprise-grade cyber threat intelligence platform powered by machine learning.
                It detects phishing URLs, scam SMS messages, and spam emails with real-time analytics and reporting.
              </p>
              <p className="text-xs text-slate-500 mt-3">Version 1.0.0 &middot; Built with React + FastAPI</p>
            </div>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
