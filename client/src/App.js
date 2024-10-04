import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Login from './components/Login';
import SignUp from './components/SignUp';
import HomePage from './components/HomePage';
import BloodSugarLog from './components/BloodSugarLog';
import BabyList from './components/BabyList';
import FeedingLog from './components/FeedingLog';
import BabyForm from './components/BabyForm';
import EditBaby from './components/EditBaby';
import SettingsComp from './components/Settings';
import NavBar from './components/NavBar';
import SimpleNavBar from './components/SimpleNavBar'; // Import SimpleNavBar
import { AuthProvider } from './context/AuthContext';
import { BabyProvider } from './context/BabyContext'; // Import BabyProvider

// A wrapper component that renders NavBar or SimpleNavBar based on the route
const NavBarWrapper = () => {
  const location = useLocation();

  const pathsWithoutNavBar = ['/', '/login', '/signup'];

  if (pathsWithoutNavBar.includes(location.pathname)) {
    return <SimpleNavBar />;
  }

  return <NavBar />;
};

function App() {
  // State to hold the current theme
  const [theme, setTheme] = useState({
    background: 'linear-gradient(160deg, #434343 0%, #000000 100%)', // Default theme
    textColor: '#ffffff',
  });

  // Fetch the saved theme from localStorage on component mount
  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme); // Apply the saved theme if it exists
    }
  }, []);

  return (
    <AuthProvider>
      <BabyProvider>
        {/* Apply the theme dynamically using the current theme's background and text color */}
        <div
          style={{
            background: 'linear-gradient(160deg, #434343 0%, #000000 100%)',
            color: theme.textColor,
            minHeight: '100vh',
          }}
        >
          <Router>
            <NavBarWrapper />
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/homepage" element={<HomePage />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/babies" element={<BabyList />} />
              <Route path="/add-baby" element={<BabyForm />} />
              <Route path="/food" element={<FeedingLog />} />
              <Route path="/blood-sugar" element={<BloodSugarLog />} />
              <Route path="/baby/:babyId/feeding-log" element={<FeedingLog />} />
              <Route path="/baby/:babyId/blood-sugar-log" element={<BloodSugarLog />} />
              <Route path="/edit-baby/:babyId" element={<EditBaby />} />
              <Route path="/settings" element={<SettingsComp />} />
              <Route path="*" element={<h1 style={{ color: theme.textColor }}>404 Not Found</h1>} />
            </Routes>
          </Router>
        </div>
      </BabyProvider>
    </AuthProvider>
  );
}

export default App;
