import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Container, TextField, Button, Checkbox, FormControlLabel, Alert, Typography, Box } from '@mui/material';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch user theme from localStorage
  const [theme, setTheme] = useState({
    background: 'linear-gradient(45deg, #D9AFD9 0%, #97D9E1 100%)', // Default theme
    textColor: '#000000',
  });

  // Check if token exists and redirect if valid
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/homepage');
    }
  }, [navigate]);

  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme); // Apply saved theme if it exists
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Trying to get response");

      const response = await axios.post('http://185.47.173.90:3001/api/login', {
        username,
        password,
        rememberMe,
      });

      const token = response.data.token;
      const responseUsername = response.data.username || 'User'; // Rename variable to avoid conflict
      console.log(responseUsername);
      if (rememberMe) {
        localStorage.setItem('token', token);
      } else {
        sessionStorage.setItem('token', token);
      }

      setSuccess(`ברוך הבא, ${responseUsername}!`);
      setError('');
      login(token);

      setTimeout(() => {
        navigate('/homepage');
      }, 1000);
    } catch (error) {
      // Display error message from backend
      setError(error.response?.data?.error || 'שגיאת שרת');
      setSuccess('');
    }
  };

  return (
    <Container maxWidth="sm" dir="rtl">
      <Box
        mt={5}
        p={3}
        sx={{
          background: theme.background,
          color: theme.textColor,
          borderRadius: '8px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          התחברות
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
            InputLabelProps={{ style: { color: theme.textColor } }} // Set text color
            InputProps={{ style: { color: theme.textColor } }} // Set input text color
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
            InputLabelProps={{ style: { color: theme.textColor } }} // Set text color
            InputProps={{ style: { color: theme.textColor } }} // Set input text color
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                sx={{ color: theme.textColor }} // Color checkbox
              />
            }
            label="זכרו אותי"
            sx={{ color: theme.textColor }} // Set label color
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 3,
              backgroundColor: theme.textColor === '#ffffff' ? '#000' : '#fff',
              color: theme.textColor === '#ffffff' ? '#fff' : '#000',
              '&:hover': {
                backgroundColor: theme.textColor === '#ffffff' ? '#333' : '#f2f2f2',
              },
            }}
          >
            התחבר
          </Button>
        </form>
        <Typography variant="body2" align="center" mt={3}>
          אין לכם חשבון?{' '}
          <a
            href="/signup"
            style={{
              textDecoration: 'none',
              color: theme.textColor === '#ffffff' ? '#FFD700' : '#0093E9', // Link color based on text color
            }}
          >
            הרשמו כאן
          </a>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
