import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Container, Typography, Box, Grid } from '@mui/material';

// Define the theme options with gradients
const themes = [
  {
    name: 'Default Theme',
    background: 'linear-gradient(45deg, #D9AFD9 0%, #97D9E1 100%)',
    textColor: '#000000',
  },
  {
    name: 'Blue & Aqua Gardient',
    background: 'linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)',
    textColor: '#ffffff',
  },
  {
    name: 'Green & Yellow',
    background: 'linear-gradient(45deg, #85FFBD 0%, #FFFB7D 100%)',
    textColor: '#000000',
  },
  {
    name: 'Red & Pink',
    background: 'linear-gradient(90deg, #FF9A8B 0%, #FF6A88 55%, #FF99AC 100%)',
    textColor: '#ffffff',
  },
  {
    name: 'Pink & Yellow',
    background: 'linear-gradient(45deg, #FBD786 0%, #f7797d 100%)',
    textColor: '#000000',
  },
  // Gardiend colors
  {
    name: 'Purple & Blue Gardient',
    background: 'linear-gradient(160deg, #D9AFD9 20%, #97D9E1 100%)',
    textColor: '#000000',
  },
  {
    name: 'Blue & Aqua Gardient',
    background: 'linear-gradient(160deg, #0093E9 50%, #00ab98 100%)',
    textColor: '#ffffff',
  },
  {
    name: 'Green & Yellow',
    background: 'linear-gradient(45deg, #85FFBD 50%, #FFFB7D 100%)',
    textColor: '#000000',
  },
  {
    name: 'Red & Pink Gardient',
    background: 'linear-gradient(160deg, #FF9A8B 80%, #FF99AC 80%)',
    textColor: '#ffffff',
  },
  {
    name: 'Pink & Yellow Gardient',
    background: 'linear-gradient(45deg, #FBD786 50%, #f7797d 100%)',
    textColor: '#000000',
  },
  
  // Simple colors whie gray black
  {
    name: 'Gray & White',
    background: 'linear-gradient(160deg, #434343 50%, #000000 100%)',
    textColor: '#ffffff',
  },
  {
    name: 'White & Gray',
    background: 'linear-gradient(160deg, #f7f7f7 50%, #454545 100%)',
    textColor: '#000000',
  },
];

const SignUp = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTheme, setSelectedTheme] = useState(themes[0]); // Default theme
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError('הסיסמאות אינן תואמות.');
      setSuccess('');
      return;
    }

    try {
      const response = await axios.post('/api/signup', {
        username,
        email,
        password,
        theme: selectedTheme, // Save the selected theme
      });
      console.log(response);

      // Save the selected theme to localStorage
      localStorage.setItem('userTheme', JSON.stringify(selectedTheme));

      setSuccess('המשתמש נוצר בהצלחה!');
      setError('');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (error) {
      // Display error message from backend in Hebrew
      setError(error.response?.data?.error || 'שגיאת שרת בעת ההרשמה');
      setSuccess('');
    }
  };

  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme); // Update the theme preview
  };

  return (
    <Container maxWidth="sm" dir="rtl">
      <Box
        mt={5}
        p={3}
        sx={{
          background: selectedTheme.background,
          color: selectedTheme.textColor,
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', // Adding shadow
        }}
      >
        <Typography variant="h4" gutterBottom>
          הרשמה
        </Typography>
        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="שם משתמש"
            fullWidth
            variant="outlined"
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputLabelProps={{ style: { color: selectedTheme.textColor } }} // Set text color
          />
          <TextField
            label="אימייל"
            fullWidth
            variant="outlined"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            InputLabelProps={{ style: { color: selectedTheme.textColor } }} // Set text color
          />
          <TextField
            label="סיסמה"
            fullWidth
            type="password"
            variant="outlined"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            InputLabelProps={{ style: { color: selectedTheme.textColor } }} // Set text color
          />
          <TextField
            label="אשר סיסמה"
            fullWidth
            type="password"
            variant="outlined"
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            InputLabelProps={{ style: { color: selectedTheme.textColor } }} // Set text color
          />

          {/* Theme Selector with Boxes */}
          <Typography variant="h6" mt={2}>
            בחר נושא:
          </Typography>
          <Grid container spacing={2} justifyContent="center" mt={1}>
            {themes.map((theme, index) => (
              <Grid item key={index}>
                <Box
                  onClick={() => handleThemeSelection(theme)}
                  sx={{
                    width: 50,
                    height: 50,
                    background: theme.background,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: theme === selectedTheme ? '3px solid #ffffff' : '2px solid #000000',
                    transition: 'border 0.3s ease',
                  }}
                />
              </Grid>
            ))}
          </Grid>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: selectedTheme.textColor === '#ffffff' ? '#000' : '#fff',
              color: selectedTheme.textColor === '#ffffff' ? '#fff' : '#000', // Dynamic text color
              '&:hover': {
                backgroundColor: selectedTheme.textColor === '#ffffff' ? '#333' : '#f2f2f2', // Slightly darker background on hover
              },
            }}
          >
            הרשם
          </Button>
        </form>
        <Typography variant="body2" align="center" mt={3}>
          כבר יש לך חשבון?{' '}
          <a
            href="/login"
            style={{
              textDecoration: 'none',
              color: selectedTheme.textColor,
            }}
          >
            התחבר כאן
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default SignUp;
