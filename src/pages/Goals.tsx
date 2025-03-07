import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://renxiycpyairqycuaxxa.supabase.co';
const supabaseKey =
  'your-eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJlbnhpeWNweWFpcnF5Y3VheHhhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMjU3NTYsImV4cCI6MjA1NjkwMTc1Nn0.sJXNqeR5s_lCRY0L8mDidOa1SF82cvSaec1LxmAFfYk-key';
const supabase = createClient(supabaseUrl, supabaseKey);

interface Goal {
  id: number;
  description: string;
  stake: number;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [description, setDescription] = useState('');
  const [stake, setStake] = useState<number | ''>('');

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    const { data, error } = await supabase.from('goals').select('*');
    if (error) {
      console.error('Error fetching goals:', error);
    } else {
      setGoals(data);
    }
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim() === '' || stake === '') {
      alert('Please enter a valid goal description and a positive stake.');
      return;
    }
    const { data, error } = await supabase
      .from('goals')
      .insert([{ description, stake: Number(stake) }])
      .single();
    if (error) {
      console.error('Error adding goal:', error);
    } else {
      setGoals([...goals, data]);
      setDescription('');
      setStake('');
    }
  };

  const handleDeleteGoal = async (id: number) => {
    const { error } = await supabase.from('goals').delete().eq('id', id);
    if (error) {
      console.error('Error deleting goal:', error);
    } else {
      setGoals(goals.filter((goal) => goal.id !== id));
    }
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl font-semibold text-gray-900'>Goals</h1>
      <form onSubmit={handleAddGoal} className='mt-4 space-y-4'>
        <div>
          <label
            htmlFor='description'
            className='block text-sm font-medium text-gray-700'
          >
            Goal Description
          </label>
          <input
            type='text'
            id='description'
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <div>
          <label
            htmlFor='stake'
            className='block text-sm font-medium text-gray-700'
          >
            Money Stake ($)
          </label>
          <input
            type='number'
            id='stake'
            value={stake}
            onChange={(e) => setStake(e.target.valueAsNumber || '')}
            className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
          />
        </div>
        <button
          type='submit'
          className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
        >
          Add Goal
        </button>
      </form>
      <ul className='mt-6 space-y-4'>
        {goals.map((goal) => (
          <li
            key={goal.id}
            className='flex justify-between items-center p-4 border border-gray-300 rounded-md'
          >
            <div>
              <p className='text-lg font-medium text-gray-900'>
                {goal.description}
              </p>
              <p className='text-sm text-gray-500'>${goal.stake.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleDeleteGoal(goal.id)}
              className='inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
