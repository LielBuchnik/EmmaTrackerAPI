import React, { useContext, useEffect, useState } from 'react';
import { BabyContext } from '../context/BabyContext';
import { AuthContext } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Button,
  MenuItem,
  FormControl,
  Select,
  Typography,
  Box,
  Modal,
} from '@mui/material';
import { AddCircleOutline, ExitToApp } from '@mui/icons-material'; // Import the plus and exit icons
import BabyForm from './BabyForm';

const NavBar = () => {
  const { selectedBabyId, setSelectedBabyId } = useContext(BabyContext);
  const { logout } = useContext(AuthContext);
  const [babies, setBabies] = useState([]);
  const [showBabyForm, setShowBabyForm] = useState(false); // Toggle form visibility
  const [theme, setTheme] = useState({
    background: 'linear-gradient(45deg, #D9AFD9 0%, #97D9E1 100%)',
    textColor: '#000000',
  }); // Default theme
  const location = useLocation(); // Get current location to highlight active link

  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('/api/babies', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBabies(response.data);
      } catch (error) {
        console.error('Error fetching babies:', error);
      }
    };
    fetchBabies();
  }, []);

  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleBabySelection = (e) => {
    const babyId = e.target.value;
    setSelectedBabyId(babyId);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    logout();
    window.location.href = '/login';
  };

  const handleBabyAdded = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/babies', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBabies(response.data);
    setShowBabyForm(false);
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'transparent' }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>

          {/* Baby selection with fixed width */}
          <Box sx={{ flex: '0 0 20%' }}>
            <FormControl
              variant="outlined"
              fullWidth
              sx={{
                color: 'white',
                minWidth: '100%',
                borderRadius: '4px',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              <Select
                value={selectedBabyId || ''}
                onChange={handleBabySelection}
                displayEmpty
                sx={{
                  color: 'white',
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none', // Remove inner default border
                  },
                }}
              >
                <MenuItem value="">
                  <em>בחר תינוק</em>
                </MenuItem>
                {babies.map((baby) => (
                  <MenuItem key={baby.id} value={baby.id}>
                    <Box
                      sx={{
                        maxWidth: '100%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {baby.name.length > 10 ? `${baby.name.slice(0, 10)}...` : baby.name}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Centered logo with absolute positioning */}
          <Link to="/" style={{ textDecoration: 'none', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <Typography
              variant="h5"
              sx={{
                color: '#D9AFD9',
                fontWeight: 600,
                fontFamily: "'Great Vibes', cursive",
                textAlign: 'center',
              }}
            >
              EmMetrics
            </Typography>
          </Link>

          {/* Logout Button with Icon, fixed width */}
          <Box sx={{ flex: '0 0 20%', textAlign: 'right' }}>
            <Button
              onClick={handleLogout}
              sx={{
                color: 'red',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                padding: '8px 16px',
                '&:hover': {
                  backgroundColor: 'rgba(255, 0, 0, 0.1)', // Red hover effect
                },
              }}
            >
              <ExitToApp /> {/* Door and arrow icon */}
            </Button>
          </Box>
        </Toolbar>
      </AppBar>



      {/* Horizontal Scroll with Icons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          overflowX: 'scroll',  // Allows horizontal scroll
          p: 2,
          backgroundColor: 'transparent',
          '&::-webkit-scrollbar': {
            display: 'none', // Hide scrollbar in WebKit browsers (Chrome, Safari)
          },
          '-ms-overflow-style': 'none',  // Hide scrollbar in Internet Explorer 10+
          'scrollbar-width': 'none',  // Hide scrollbar in Firefox
        }}
      >
        {[
          { to: '/blood-sugar', label: 'סוכר בדם', icon: './images/blood-sugar-icon.png' },
          { to: '/food', label: 'מזון', icon: './images/food-icon.png' },
          { to: '/babies', label: 'תינוק', icon: './images/baby-icon.png' },
        ].map((item) => (
          <Box textAlign="center" sx={{ mx: 2 }} key={item.to}>
            <Link to={item.to} style={{ textDecoration: 'none' }}>
              <Box
                component="img"
                src={require(`${item.icon}`)}
                alt={item.label}
                sx={{
                  width: 75,
                  height: 75,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: location.pathname === item.to ? '2px solid #FFFFFF' : '2px solid transparent',
                  transition: 'border 0.3s ease',
                }}
              />
              <Typography
                variant="caption"
                display="block"
                sx={{
                  color: location.pathname === item.to ? '#FFFFFF' : '#9E9E9E',
                  fontWeight: 600,
                }}
              >
                {item.label}
              </Typography>
            </Link>
          </Box>
        ))}

        {/* Button to Add a Baby with Plus Icon */}
        <Box textAlign="center" sx={{ mx: 2 }}>
          <Button
            onClick={() => setShowBabyForm(true)}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              color: '#9E9E9E',
              '&:hover': {
                color: '#FFFFFF', // Change color on hover
              },
              border: 'none',
            }}
          >
            <AddCircleOutline sx={{ fontSize: 75 }} /> {/* Plus icon */}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: location.pathname === '/add-baby' ? '#FFFFFF' : '#9E9E9E',
              }}
            >
              הוסף תינוק חדש
            </Typography>
          </Button>
        </Box>
      </Box>

      {/* Modal for Adding a New Baby */}
      <Modal open={showBabyForm} onClose={() => setShowBabyForm(false)}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: theme.background, // Use theme background
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
          }}
        >
          {/* Pass theme as a prop to BabyForm */}
          <BabyForm onBabyAdded={handleBabyAdded} theme={theme} />
          <Button onClick={() => setShowBabyForm(false)} variant="contained" sx={{ mt: 2 }}>
            סגור
          </Button>
        </Box>
      </Modal>
    </>
  );
};

export default NavBar;
