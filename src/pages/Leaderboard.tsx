import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface UserStats {
  user_id: string;
  email: string;
  completed_goals: number;
  total_stake: number;
  potential_loss: number;
}

export default function Leaderboard() {
  const [userStats, setUserStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const { data: goals, error: goalsError } = await supabase
        .from('goals')
        .select('*');

      if (goalsError) throw goalsError;

      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, email');

      if (usersError) throw usersError;

      const stats = users.map((user) => {
        const userGoals = goals.filter((goal) => goal.user_id === user.id);
        return {
          user_id: user.id,
          email: user.email,
          completed_goals: userGoals.filter((goal) => goal.completed).length,
          total_stake: userGoals.reduce((sum, goal) => sum + goal.stake, 0),
          potential_loss: userGoals
            .filter((goal) => !goal.completed)
            .reduce((sum, goal) => sum + goal.stake, 0),
        };
      });

      // Sort by completed goals (descending) and then by total stake (descending)
      stats.sort((a, b) => {
        if (b.completed_goals !== a.completed_goals) {
          return b.completed_goals - a.completed_goals;
        }
        return b.total_stake - a.total_stake;
      });

      setUserStats(stats);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500'></div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold text-gray-900'>Leaderboard</h1>

      <div className='bg-white shadow overflow-hidden sm:rounded-md'>
        <ul className='divide-y divide-gray-200'>
          {userStats.map((user, index) => (
            <li
              key={user.user_id}
              className={`${
                user.user_id === currentUser?.id ? 'bg-indigo-50' : ''
              }`}
            >
              <div className='px-4 py-4 sm:px-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center'>
                    <div className='flex-shrink-0'>
                      <div className='h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center'>
                        <span className='text-white font-bold'>
                          {index + 1}
                        </span>
                      </div>
                    </div>
                    <div className='ml-4'>
                      <div className='text-sm font-medium text-gray-900'>
                        {user.email}
                      </div>
                      <div className='text-sm text-gray-500'>
                        {user.completed_goals} completed goals
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center space-x-4'>
                    <div className='text-sm text-gray-500'>
                      Total Stake: ${user.total_stake}
                    </div>
                    <div className='text-sm text-red-500'>
                      Potential Loss: ${user.potential_loss}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
