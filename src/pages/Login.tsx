import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Coffee, LogIn, UserPlus } from 'lucide-react';
import { authApi } from '../utils/api';
import { toast } from 'sonner@2.0.3';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupDemoUsers = async () => {
    setSettingUp(true);
    setError('');

    const demoUsers = [
      { email: 'admin@cafe.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { email: 'employee@cafe.com', password: 'employee123', name: 'Employee User', role: 'employee' }
    ];

    let created = 0;
    let alreadyExists = 0;

    for (const user of demoUsers) {
      try {
        await authApi.signup(user.email, user.password, user.name, user.role);
        created++;
      } catch (err: any) {
        if (err.message?.includes('already') || err.message?.includes('exists')) {
          alreadyExists++;
        } else {
          console.error(`Error creating ${user.email}:`, err);
        }
      }
    }

    setSettingUp(false);

    if (created > 0) {
      toast.success(`${created} demo user(s) created successfully!`);
    }
    if (alreadyExists > 0) {
      toast.info(`${alreadyExists} demo user(s) already exist`);
    }
    if (created === 0 && alreadyExists === 0) {
      toast.error('Failed to create demo users');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <Coffee className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-gray-900 mb-2">Cafe Management System</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Demo Credentials */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-900 mb-2">Demo Credentials:</p>
            <div className="space-y-1">
              <p className="text-blue-800">
                <strong>Admin:</strong> admin@cafe.com / admin123
              </p>
              <p className="text-blue-800">
                <strong>Employee:</strong> employee@cafe.com / employee123
              </p>
            </div>
          </div>

          {/* Setup Demo Users Button */}
          <button
            onClick={handleSetupDemoUsers}
            disabled={settingUp}
            className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-6"
          >
            {settingUp ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Setting up...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Demo Users
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-3 rounded-lg hover:bg-amber-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-6 text-center text-gray-600">
            <p>Contact your administrator for account access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
