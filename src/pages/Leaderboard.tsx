import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface User {
  id: string;
  name: string;
  completedGoals: number;
  totalEarnings: number;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
    const subscription = supabase
      .channel('public:goals')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'goals' },
        () => {
          fetchLeaderboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, name');
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      setLoading(false);
      return;
    }

    const { data: goals, error: goalsError } = await supabase
      .from('goals')
      .select('user_id, stake');
    if (goalsError) {
      console.error('Error fetching goals:', goalsError);
      setLoading(false);
      return;
    }

    const userStats = profiles.map((profile) => {
      const userGoals = goals.filter((goal) => goal.user_id === profile.id);
      const completedGoals = userGoals.length;
      const totalEarnings = userGoals.reduce(
        (sum, goal) => sum + goal.stake,
        0
      );
      return {
        id: profile.id,
        name: profile.name,
        completedGoals,
        totalEarnings,
      };
    });

    setUsers(userStats.sort((a, b) => b.completedGoals - a.completedGoals));
    setLoading(false);
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-semibold text-gray-900'>Leaderboard</h1>
      {loading ? (
        <div className='mt-4 space-y-4'>
          {[...Array(5)].map((_, index) => (
            <div key={index} className='animate-pulse flex space-x-4'>
              <div className='rounded-full bg-gray-300 h-12 w-12'></div>
              <div className='flex-1 space-y-4 py-1'>
                <div className='h-4 bg-gray-300 rounded w-3/4'></div>
                <div className='space-y-2'>
                  <div className='h-4 bg-gray-300 rounded'></div>
                  <div className='h-4 bg-gray-300 rounded w-5/6'></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ul className='mt-4 space-y-4'>
          {users.map((user) => (
            <li
              key={user.id}
              className='flex justify-between items-center p-4 border border-gray-300 rounded-md'
            >
              <div>
                <p className='text-lg font-medium text-gray-900'>{user.name}</p>
                <p className='text-sm text-gray-500'>
                  Completed Goals: {user.completedGoals}
                </p>
                <p className='text-sm text-gray-500'>
                  Total Earnings: ${user.totalEarnings.toFixed(2)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
