import React from 'react';
import { useAuthStore } from '../store/auth';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      <p className="mt-4">Welcome back, {user?.email}</p>
    </div>
  );
}