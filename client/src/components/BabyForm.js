import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Grid,
  Box,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function BabyForm({ onBabyAdded }) {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState(dayjs());
  const [gender, setGender] = useState('boy');
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);

  const [theme, setTheme] = useState({
    background: 'linear-gradient(45deg, #D9AFD9 0%, #97D9E1 100%)',
    textColor: '#000000',
  });

  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // Set preview
        setImage(file); // Save the file for uploading
      };
      reader.readAsDataURL(file); // Convert image to base64
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('birthdate', birthdate.toISOString());
    formData.append('gender', gender);
    formData.append('image', image);

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/babies', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      onBabyAdded();
      setName('');
      setBirthdate(dayjs());
      setGender('boy');
      setImage(null);
    } catch (error) {
      console.error('Error adding baby:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="sm">
        <Card
          elevation={3}
          sx={{
            mt: 4,
            background: theme.background,
            color: theme.textColor,
          }}
        >
          <CardContent>
            <Typography
              variant="h5"
              align="center"
              gutterBottom
              sx={{ color: theme.textColor }}
            >
              הוסף תינוק חדש
            </Typography>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                {/* Name Field */}
                <Grid item xs={12}>
                  <TextField
                    label="שם"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    InputLabelProps={{ style: { color: theme.textColor } }}
                    InputProps={{ style: { color: theme.textColor } }}
                  />
                </Grid>

                {/* Birthdate Picker */}
                <Grid item xs={12}>
                  <DatePicker
                    label="תאריך לידה"
                    value={birthdate}
                    onChange={(newDate) => setBirthdate(newDate)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        InputLabelProps={{ style: { color: theme.textColor } }}
                        InputProps={{ style: { color: theme.textColor } }}
                      />
                    )}
                  />
                </Grid>

                {/* Gender Select */}
                <Grid item xs={12}>
                  <FormControl fullWidth required>
                    <InputLabel sx={{ color: theme.textColor }}>מין</InputLabel>
                    <Select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      label="מין"
                      sx={{
                        color: theme.textColor,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.textColor,
                        },
                      }}
                    >
                      <MenuItem value="boy">בן</MenuItem>
                      <MenuItem value="girl">בת</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Image Upload */}
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative', mb: 2, cursor: 'pointer', textAlign: 'center' }}>
                    <Avatar
                      src={imagePreview}
                      alt="baby"
                      sx={{
                        width: 150,
                        height: 150,
                        border: `4px solid ${theme.textColor}`,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        },
                      }}
                    />
                    {/* Hidden file input */}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageChange}
                      id="image-upload"
                    />
                    <label htmlFor="image-upload">
                      <Box
                        sx={{
                          position: 'absolute',
                          width: 150,
                          height: 150,
                          top: 0,
                          left: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: 'rgba(0, 0, 0, 0.4)',
                          borderRadius: '50%',
                          opacity: 0,
                          transition: 'opacity 0.3s ease-in-out',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 1,
                          },
                        }}
                      >
                        <CameraAltIcon sx={{ color: '#fff', fontSize: 30 }} />
                      </Box>
                    </label>
                  </Box>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    fullWidth
                    sx={{
                      backgroundColor: theme.textColor === '#ffffff' ? '#000' : '#fff',
                      color: theme.textColor === '#ffffff' ? '#fff' : '#000',
                    }}
                  >
                    הוסף
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </LocalizationProvider>
  );
}

export default BabyForm;
