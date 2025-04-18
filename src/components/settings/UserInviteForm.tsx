import React, { useState } from 'react';
    import { supabase } from '../../lib/supabase';

    export function UserInviteForm() {
      const [email, setEmail] = useState('');
      const [firstName, setFirstName] = useState('');
      const [lastName, setLastName] = useState('');
      const [password, setPassword] = useState('');
      const [role, setRole] = useState('user'); // Default to 'user'
      const [loading, setLoading] = useState(false);
      const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

      const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
          // Create auth user with regular signup
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                first_name: firstName,
                last_name: lastName,
              }
            }
          });

          if (authError) throw authError;

          if (authData.user) {
            // Create profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: authData.user.id,
                  email,
                  first_name: firstName,
                  last_name: lastName,
                  role: role, // Set the role here
                }
              ]);

            if (profileError) throw profileError;

            setMessage({ text: 'User created successfully', type: 'success' });
            setEmail('');
            setFirstName('');
            setLastName('');
            setPassword('');
            setRole('user'); // Reset role to default
          }
        } catch (error: any) {
          console.error('Error creating user:', error);
          setMessage({ 
            text: error.message || 'Failed to create user', 
            type: 'error' 
          });
        } finally {
          setLoading(false);
        }
      };

      return (
        <div>
          <h3 className="text-lg font-medium dark:text-gray-100 mb-4">Add New User</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium dark:text-gray-300">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium dark:text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium dark:text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium dark:text-gray-300">
                Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {message && (
              <p className={`text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message.text}
              </p>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      );
    }
