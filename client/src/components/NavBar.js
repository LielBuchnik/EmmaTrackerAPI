import React, { useContext, useEffect, useRef, useState } from 'react';
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

  const scrollRef = useRef(null); // Reference to the scroll container

  useEffect(() => {
    const fetchBabies = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://185.47.173.90:3001/api/babies', {
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

  useEffect(() => {
    // After the component mounts, scroll to the left side
    if (scrollRef.current) {
      // For RTL, setting scrollLeft to the maximum scroll value
      // can vary between browsers. Here's a cross-browser approach:
      const scrollContainer = scrollRef.current;
      // Using a timeout to ensure rendering is complete
      setTimeout(() => {
        scrollContainer.scrollLeft = scrollContainer.scrollWidth;
      }, 0);
    }
  }, [babies]); // Depend on babies to ensure items are loaded

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
    const response = await axios.get('http://185.47.173.90:3001/api/babies', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setBabies(response.data);
    setShowBabyForm(false);
  };

  return (
    <>
      {/* AppBar Section */}
      <AppBar position="static" sx={{ backgroundColor: 'transparent', width: '100%' }}>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'relative',
            width: '100%', // Ensure Toolbar spans full width
          }}
        >
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
        ref={scrollRef} // Attach ref to the Box
        sx={{
          display: 'flex',
          flexDirection: 'row', // Set direction to row
          justifyContent: 'flex-start', // Align items to the start (right in RTL)
          alignItems: 'center', // Vertically center items
          overflowX: 'auto', // Enables horizontal scroll
          direction: 'rtl', // Sets RTL layout direction
          width: '100%', // Ensure the Box spans full width
          p: 2,
          px: 4, // Adds padding to both left and right ends
          scrollPaddingLeft: '16px', // Ensures the first item is fully visible in RTL
          gap: 4, // Equal spacing between items
          backgroundColor: 'transparent',
          '&::-webkit-scrollbar': {
            display: 'none', // Hides scrollbar in WebKit browsers
          },
          '-ms-overflow-style': 'none', // Hides scrollbar in IE 10+
          'scrollbar-width': 'none', // Hides scrollbar in Firefox
        }}
      >
        {[
          { to: '/settings', label: 'הגדרות', icon: './images/settings-icon.png' },
          { to: '/blood-sugar', label: 'סוכר בדם', icon: './images/blood-sugar-icon.png' },
          { to: '/food', label: 'מזון', icon: './images/food-icon.png' },
          { to: '/babies', label: 'תינוק', icon: './images/baby-icon.png' },
          { to: '/add-baby', label: 'הוסף תינוק', icon: 'add_circle_outline' }, // Add Baby link
        ].map((item) => (
          <Box
            textAlign="center"
            sx={{
              display: 'flex', // Use flex to align icon and text
              flexDirection: 'column', // Stack icon and text vertically
              alignItems: 'center', // Center align items horizontally
              justifyContent: 'center', // Center align items vertically
              flexShrink: 0, // Prevents items from shrinking
              width: '60px', // Increased width to accommodate text wrapping
            }}
            key={item.to}
          >
            <Link
              to={item.to}
              style={{
                textDecoration: 'none',
                color: location.pathname === item.to ? '#FFFFFF' : '#9E9E9E',
              }}
              onClick={item.to === '/add-baby' ? () => setShowBabyForm(true) : undefined} // Open form for Add Baby
            >
              <Box
                component={item.to === '/add-baby' ? AddCircleOutline : 'img'}
                src={item.icon !== 'add_circle_outline' ? require(`${item.icon}`) : undefined}
                alt={item.label}
                sx={{
                  width: 50,
                  height: 50,
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: location.pathname === item.to ? '2px solid #FFFFFF' : '2px solid transparent',
                  transition: 'border 0.3s ease',
                  fontSize: item.to === '/add-baby' ? 45 : undefined, // Font size for icon
                }}
              />
              <Typography
                variant="caption"
                display="block"
                sx={{
                  fontWeight: 600,
                  whiteSpace: 'normal', // Allows text to wrap
                  overflowWrap: 'break-word', // Wrap text without breaking words
                  wordBreak: 'break-word', // Avoid breaking words
                  mt: 1, // Add some margin-top to separate icon and text
                }}
              >
                {item.label}
              </Typography>
            </Link>
          </Box>
        ))}
      </Box>

      {/* Modal for Adding a New Baby */}
      {/* <Modal open={showBabyForm} onClose={() => setShowBabyForm(false)}>
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
          <BabyForm onBabyAdded={handleBabyAdded} theme={theme} />
          <Button onClick={() => setShowBabyForm(false)} variant="contained" sx={{ mt: 2 }}>
            סגור
          </Button>
        </Box>
      </Modal> */}
    </>
  );
};

export default NavBar;
