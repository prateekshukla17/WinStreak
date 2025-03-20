import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/auth';

interface Goal {
  id: number;
  description: string;
  stake: number;
  completed: boolean;
}

interface DashboardStats {
  totalGoals: number;
  completedGoals: number;
  totalStake: number;
  potentialLoss: number;
}

export default function Dashboard() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalGoals: 0,
    completedGoals: 0,
    totalStake: 0,
    potentialLoss: 0,
  });
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data || []);
      calculateStats(data || []);
    }
  };

  const calculateStats = (goals: Goal[]) => {
    const totalGoals = goals.length;
    const completedGoals = goals.filter((goal) => goal.completed).length;
    const totalStake = goals.reduce((sum, goal) => sum + goal.stake, 0);
    const potentialLoss = goals
      .filter((goal) => !goal.completed)
      .reduce((sum, goal) => sum + goal.stake, 0);

    setStats({
      totalGoals,
      completedGoals,
      totalStake,
      potentialLoss,
    });
  };

  const handleToggleGoal = async (goalId: number, currentStatus: boolean) => {
    const { error } = await supabase
      .from('goals')
      .update({ completed: !currentStatus })
      .eq('id', goalId);

    if (error) {
      console.error('Error updating goal:', error);
    } else {
      setGoals(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, completed: !currentStatus } : goal
        )
      );
      calculateStats(
        goals.map((goal) =>
          goal.id === goalId ? { ...goal, completed: !currentStatus } : goal
        )
      );
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-semibold text-gray-900'>Dashboard</h1>
        <Link
          to='/goals'
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          Manage Goals
        </Link>
      </div>

      <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 rounded-md bg-indigo-500 flex items-center justify-center'>
                  <span className='text-white text-xl font-bold'>
                    {stats.totalGoals}
                  </span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total Goals
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 rounded-md bg-green-500 flex items-center justify-center'>
                  <span className='text-white text-xl font-bold'>
                    {stats.completedGoals}
                  </span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Completed Goals
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 rounded-md bg-blue-500 flex items-center justify-center'>
                  <span className='text-white text-xl font-bold'>
                    ${stats.totalStake}
                  </span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total Stake
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='h-12 w-12 rounded-md bg-red-500 flex items-center justify-center'>
                  <span className='text-white text-xl font-bold'>
                    ${stats.potentialLoss}
                  </span>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Potential Loss
                  </dt>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='bg-white shadow rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900'>
            Recent Goals
          </h3>
          <div className='mt-5'>
            <ul className='divide-y divide-gray-200'>
              {goals.slice(0, 5).map((goal) => (
                <li key={goal.id} className='py-4'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={goal.completed}
                        onChange={() =>
                          handleToggleGoal(goal.id, goal.completed)
                        }
                        className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                      />
                      <p
                        className={`ml-3 text-sm font-medium ${
                          goal.completed
                            ? 'text-gray-500 line-through'
                            : 'text-gray-900'
                        }`}
                      >
                        {goal.description}
                      </p>
                    </div>
                    <div className='text-sm text-gray-500'>${goal.stake}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
