import React from 'react';
import { Navigate, Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { LayoutDashboard, Target, Trophy, LogOut, Shield } from 'lucide-react';

export default function DashboardLayout() {
  const { user, signOut } = useAuthStore((state) => ({
    user: state.user,
    signOut: state.signOut,
  }));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Shield className="h-8 w-8 text-primary-600" />
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) =>
                        `inline-flex items-center px-1 pt-1 text-sm font-medium ${
                          isActive
                            ? 'border-b-2 border-primary-500 text-gray-900'
                            : 'text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`
                      }
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => signOut()}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}