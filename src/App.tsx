import React, { useEffect } from 'react';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
    import { AuthProvider } from './contexts/AuthContext';
    import PrivateRoute from './components/PrivateRoute';
    import Navbar from './components/Navbar';
    import Login from './pages/Login';
    import Register from './pages/Register';
    import Dashboard from './pages/Dashboard';
    import Profile from './pages/Profile';
    import Settings from './pages/Settings';
    import Workouts from './pages/Workouts';
    import Leaderboard from './pages/Leaderboard';
    import Welcome from './pages/Welcome';

    function App() {
      useEffect(() => {
        // Apply initial theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }

        // Listen for changes in system theme preference
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
          if (mediaQuery.matches) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => {
          mediaQuery.removeEventListener('change', handleChange);
        };
      }, []);

      return (
        <Router>
          <AuthProvider>
            <div className="min-h-screen dark:bg-gray-700 dark:text-gray-100 dark:bg-gray-800 dark:text-white">
              <Navbar />
              <div className="container mx-auto px-4 py-8 bg-gray-200">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Welcome />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/wod"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <PrivateRoute>
                        <Settings />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/workouts"
                    element={
                      <PrivateRoute>
                        <Workouts />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <PrivateRoute>
                        <Leaderboard />
                      </PrivateRoute>
                    }
                  />
                </Routes>
              </div>
            </div>
          </AuthProvider>
        </Router>
      );
    }

    export default App;
