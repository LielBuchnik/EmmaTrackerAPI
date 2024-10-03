import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Grid,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Container,
  Modal,
  Box,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTheme } from '@mui/material/styles';

function BabyList() {
  const [babies, setBabies] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For dropdown menu
  const [selectedBabyId, setSelectedBabyId] = useState(null); // Store the selected baby ID
  const [showModal, setShowModal] = useState(false); // To show or hide the delete confirmation modal
  const theme = useTheme(); // Use theme for consistent design

  useEffect(() => {
    fetchBabies();
  }, []);

  const fetchBabies = async () => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No token found');
      }

      const response = await axios.get('http://185.47.173.90:3001/api/babies', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBabies(response.data);
    } catch (error) {
      console.error('Error fetching babies:', error);
    }
  };

  const handleDeleteBaby = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://185.47.173.90:3001/api/babies/${selectedBabyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setBabies(babies.filter(baby => baby.id !== selectedBabyId)); // Remove the baby from the list
      setShowModal(false); // Close the modal
    } catch (error) {
      console.error('Error deleting baby:', error);
    }
  };

  const calculateAge = (birthdate) => {
    const birth = new Date(birthdate);
    const now = new Date();
    const diffTime = Math.abs(now - birth);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.ceil(diffDays / 7);
    return `${diffDays} ימים (${weeks} שבועות)`;
  };

  const openDeleteModal = (babyId) => {
    setSelectedBabyId(babyId);
    setShowModal(true);
  };

  const handleMenuOpen = (event, babyId) => {
    setAnchorEl(event.currentTarget);
    setSelectedBabyId(babyId); // Set the selected baby ID for edit/delete
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBabyId(null); // Reset the selected baby ID after closing
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center" sx={{ mt: 4, mb: 4 }}>
        רשימת תינוקות
      </Typography>

      <Button
        component={Link}
        to="/add-baby"
        variant="contained"
        color="primary"
        sx={{ mb: 3 }}
      >
        הוסף תינוק
      </Button>

      <Grid container spacing={3}>
        {babies.map((baby) => (
          <Grid item xs={12} sm={6} md={4} key={baby.id}>
            <Card
              sx={{
                borderRadius: '10px',
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                background: theme.background, // Use theme background
                position: 'relative', // Make the card relative to position the IconButton
              }}
            >
              <CardContent sx={{ textAlign: 'center', color: theme.textColor }}>
                {/* 3-dots menu */}
                <IconButton
                  aria-label="settings"
                  sx={{ position: 'absolute', top: 8, right: 8, color: theme.textColor }}
                  onClick={(e) => handleMenuOpen(e, baby.id)} // Pass baby ID
                >
                  <MoreVertIcon />
                </IconButton>

                {/* Dropdown menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl) && selectedBabyId === baby.id} // Check if it's for the right baby
                  onClose={handleMenuClose}
                  PaperProps={{
                    style: {
                      borderRadius: 8,
                    },
                  }}
                >
                  <MenuItem component={Link} to={`/edit-baby/${baby.id}`}>
                    ערוך תינוק
                  </MenuItem>
                  <MenuItem onClick={() => openDeleteModal(baby.id)}>מחק תינוק</MenuItem>
                </Menu>

                {/* Baby image */}
                <Avatar
                  src={`data:image/jpeg;base64,${baby.image}` || '/images/default-baby.png'} // Display base64 image or default
                  alt={baby.name}
                  sx={{
                    width: 100,
                    height: 100,
                    mx: 'auto',
                    mb: 2,
                    border: `4px solid ${baby.gender === 'girl' ? theme.palette.secondary.main : theme.palette.primary.main
                      }`,
                  }}
                />


                <Typography variant="h5" gutterBottom>
                  {baby.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  תאריך לידה: {new Date(baby.birthdate).toLocaleDateString('he-IL')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  גיל: {calculateAge(baby.birthdate)}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', color: theme.textColor }}>
                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  component={Link}
                  to={`/baby/${baby.id}/feeding-log`}
                >
                  רישום אוכל
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  component={Link}
                  to={`/baby/${baby.id}/blood-sugar-log`}
                >
                  רישום סוכר בדם
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Delete confirmation modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        aria-labelledby="delete-confirmation-title"
        aria-describedby="delete-confirmation-description"
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 400,
            bgcolor: theme.background, // Use theme background
            color: theme.textColor,
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.3)', // Add shadow to modal
            p: 4,
            borderRadius: '8px',
          }}
        >
          <Typography id="delete-confirmation-title" variant="h6" component="h2" gutterBottom>
            מחק תינוק
          </Typography>
          <Typography id="delete-confirmation-description" sx={{ mb: 2 }}>
            האם אתה בטוח שברצונך למחוק את התינוק {babies.find(baby => baby.id === selectedBabyId)?.name}?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="outlined" onClick={() => setShowModal(false)}>
              בטל
            </Button>
            <Button variant="contained" color="error" onClick={handleDeleteBaby}>
              מחק
            </Button>
          </Box>
        </Box>
      </Modal>
    </Container>
  );
}

export default BabyList;
