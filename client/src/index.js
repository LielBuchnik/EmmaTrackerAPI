import React from 'react';
import { createRoot } from 'react-dom/client';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import App from './App'; // Your main component
import { disableReactDevTools } from '@fvilers/disable-react-devtools'

if (process.env.NODE_ENV === 'production') disableReactDevTools()

// Create RTL cache for MUI
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Create a theme that supports RTL
const theme = createTheme({
  direction: 'rtl', // Enable RTL direction
  typography: {
    fontFamily: 'Heebo, sans-serif', // Use the Heebo font you included
  },
});

// Set the direction to RTL globally
document.body.dir = 'rtl';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <CacheProvider value={cacheRtl}>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Reset CSS for better MUI integration */}
      <App />
    </ThemeProvider>
  </CacheProvider>
);
