import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';

const SimpleNavBar = () => {
  return (
    <AppBar position="static" color="default" elevation={1} sx={{ backgroundColor: 'transparent' }}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: '600',
                textAlign: 'center',
                color: '#D9AFD9', // Custom color for the text
                fontFamily: "'Dancing Script', cursive", // Handwritten font, less curvy
              }}
            >
              EmMetrics
            </Typography>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default SimpleNavBar;
