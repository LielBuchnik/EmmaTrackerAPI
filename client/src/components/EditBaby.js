import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  MenuItem,
  InputLabel,
  Select,
  FormControl,
  Avatar,
  Divider,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

function EditBaby() {
  const { babyId } = useParams();
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('boy');
  const [imageBase64, setImageBase64] = useState(''); // Store the base64 image
  const [imagePreview, setImagePreview] = useState(null);
  const [theme, setTheme] = useState({
    background: '#fff',
    textColor: '#000',
  });
  const navigate = useNavigate();
  
  const fetchBabyDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/babies/${babyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const baby = response.data;
      setName(baby.name);
      setBirthdate(baby.birthdate);
      setGender(baby.gender);
      setImageBase64(baby.image); // Load base64 image
      setImagePreview(`data:image/jpeg;base64,${baby.image}`); // Display image
    } catch (error) {
      console.error('Error fetching baby details:', error);
    }
  };

  useEffect(() => {
    fetchBabyDetails();
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, [babyId]);

  // Convert image file to base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result); // Store the base64 string
      };
      reader.readAsDataURL(file); // Convert to base64
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const babyData = {
      name,
      birthdate,
      gender,
      imageBase64, // Send base64 image string to the backend
    };
  
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/babies', babyData, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      navigate('/babies');
    } catch (error) {
      console.error('Error adding baby:', error);
    }
  };
  

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 5,
          p: 3,
          background: theme.background,
          color: theme.textColor,
          borderRadius: '8px',
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ color: theme.textColor }}>
            ערוך תינוק
          </Typography>

          <Box sx={{ position: 'relative', mb: 2, cursor: 'pointer' }}>
            {/* Display current or updated image */}
            <Avatar
              src={imagePreview}
              alt="baby"
              sx={{
                width: 150,
                height: 150,
                border: `4px solid ${theme.textColor}`,
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                },
              }}
            />
            {/* File input for image change */}
            <input
              type="file"
              hidden
              accept="image/*"
              id="image-upload"
              onChange={handleImageChange}
            />
            <label htmlFor="image-upload">
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0, 0, 0, 0.4)',
                  opacity: 0,
                  transition: 'opacity 0.3s ease-in-out',
                  borderRadius: '50%',
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
        </Box>

        <Divider sx={{ mb: 3, backgroundColor: theme.textColor }} />

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="שם"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
              sx={{ backgroundColor: 'white' }}
            />
            <TextField
              label="תאריך לידה"
              type="date"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              sx={{ backgroundColor: 'white' }}
            />
            <FormControl fullWidth required>
              <InputLabel>מין</InputLabel>
              <Select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                label="מין"
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="boy">בן</MenuItem>
                <MenuItem value="girl">בת</MenuItem>
              </Select>
            </FormControl>
            <Button type="submit" variant="contained" color="primary" fullWidth>
              עדכן תינוק
            </Button>
          </Box>
        </form>
      </Box>
    </Container>
  );
}

export default EditBaby;
