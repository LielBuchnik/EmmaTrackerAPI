import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Grid, Button } from '@mui/material';

// Define the theme options with gradients
const themes = [
  {
    name: 'Default Theme',
    background: 'linear-gradient(45deg, #D9AFD9 0%, #97D9E1 100%)',
    textColor: '#000000',
  },
  {
    name: 'Blue & Aqua Gradient',
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

const Settings = () => {
  const [selectedTheme, setSelectedTheme] = useState(themes[0]); // Default theme
  const [successMessage, setSuccessMessage] = useState('');

  // Load the saved theme from localStorage when the component mounts
  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setSelectedTheme(savedTheme); // Apply the saved theme
    }
  }, []);

  // Handle theme selection
  const handleThemeSelection = (theme) => {
    setSelectedTheme(theme); // Update the theme preview
  };

  // Save the theme to localStorage
  const saveTheme = () => {
    localStorage.setItem('userTheme', JSON.stringify(selectedTheme));
    setSuccessMessage('הנושא נשמר בהצלחה!');
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000); // Clear success message after 2 seconds
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
          הגדרות
        </Typography>

        {/* Theme Preview and Selection */}
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

        {/* Success Message */}
        {successMessage && (
          <Typography variant="body1" mt={2} color="success.main">
            {successMessage}
          </Typography>
        )}

        {/* Save Theme Button */}
        <Button
          variant="contained"
          onClick={saveTheme}
          sx={{
            mt: 3,
            backgroundColor: selectedTheme.textColor === '#ffffff' ? '#000' : '#fff',
            color: selectedTheme.textColor === '#ffffff' ? '#fff' : '#000', // Dynamic text color
            '&:hover': {
              backgroundColor: selectedTheme.textColor === '#ffffff' ? '#333' : '#f2f2f2', // Slightly darker background on hover
            },
          }}
        >
          שמור נושא
        </Button>
      </Box>
    </Container>
  );
};

export default Settings;
