import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BabyContext } from '../context/BabyContext';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  IconButton,
} from '@mui/material';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';

function FeedingLog() {
  const { babyId } = useParams();
  const { selectedBabyId } = useContext(BabyContext);
  const [feedings, setFeedings] = useState([]);
  const [lastFeeding, setLastFeeding] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeeding, setSelectedFeeding] = useState(null);
  const [type, setType] = useState('מטרנה');
  const [customType, setCustomType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [time, setTime] = useState(dayjs());
  const [notes, setNotes] = useState('');
  const [isCustomType, setIsCustomType] = useState(false);
  const [bloodSugarLevel, setBloodSugarLevel] = useState('');
  const [measurementTime, setMeasurementTime] = useState(dayjs());
  const [zoomLevel, setZoomLevel] = useState(1); // Control the zoom level

  const [theme, setTheme] = useState({
    backgroundColor: '#D9AFD9',
    backgroundImage: 'linear-gradient(0deg, #D9AFD9 0%, #97D9E1 100%)',
    textColor: '#333',
  });

  const finalBabyId = babyId || selectedBabyId;

  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  const fetchFeedings = async (babyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://185.47.173.90:3001/api/babies/${babyId}/foods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedings(response.data);
      setLastFeeding(response.data[0]);
    } catch (error) {
      console.error('Error fetching feedings:', error);
    }
  };

  useEffect(() => {
    if (finalBabyId) {
      fetchFeedings(finalBabyId);
    }
  }, [finalBabyId]);

  const handleDialogOpen = (feeding) => {
    setSelectedFeeding(feeding);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedFeeding(null);
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setType(selectedType);
    setIsCustomType(selectedType === 'אחר');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!finalBabyId) {
      alert('Please select a baby to log feeding data for.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const selectedFoodType = isCustomType ? customType : type;

      const payload = {
        type: selectedFoodType,
        quantity,
        time: time.toISOString(),
        notes,
        bloodSugar: {
          level: bloodSugarLevel,
          measurementTime: measurementTime.toISOString() || time.toISOString(),
        },
      };

      await axios.post(`http://185.47.173.90:3001/api/babies/${finalBabyId}/foods-and-blood-sugar`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setType('מטרנה');
      setCustomType('');
      setQuantity('');
      setTime(dayjs());
      setNotes('');
      setBloodSugarLevel('');
      setMeasurementTime(dayjs());
      fetchFeedings(finalBabyId);
    } catch (error) {
      console.error('Error adding feeding and blood sugar data:', error);
    }
  };

  // Handle pinch-to-zoom gesture
  const handleZoom = (e) => {
    if (e.touches && e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].pageX - e.touches[1].pageX,
        e.touches[0].pageY - e.touches[1].pageY
      );

      setZoomLevel((prevZoom) => {
        let newZoom = prevZoom + (distance > 100 ? 0.1 : -0.1);
        if (newZoom < 0.5) newZoom = 0.5;
        if (newZoom > 2) newZoom = 2;
        return newZoom;
      });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        {/* Display Last Feeding */}
        {lastFeeding && (
          <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
            <LocalDrinkIcon fontSize="large" />
            <Typography variant="h6" sx={{ ml: 1 }}>
              האכלה אחרונה: {new Date(lastFeeding.time).toLocaleString('he-IL')}
            </Typography>
          </Box>
        )}

        {/* Feeding Form */}
        <Card
          elevation={3}
          sx={{
            mb: 4,
            background: theme.background,
            color: theme.textColor,
            borderRadius: '8px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <CardContent>
            <Typography variant="h5" textAlign="center" gutterBottom sx={{ color: theme.textColor }}>
              הוסף רישום חדש
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.textColor }} />
            <Box component="form" onSubmit={handleSubmit} mb={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    label="סוג אוכל"
                    value={type}
                    onChange={handleTypeChange}
                    fullWidth
                    required
                    sx={{ color: theme.textColor }}
                  >
                    <MenuItem value="מטרנה">מטרנה</MenuItem>
                    <MenuItem value="חלב אם">חלב אם</MenuItem>
                    <MenuItem value="סימילק">סימילק</MenuItem>
                    <MenuItem value="נוטרילון">נוטרילון</MenuItem>
                    <MenuItem value="אחר">אחר</MenuItem>
                  </TextField>
                </Grid>

                {isCustomType && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שם אוכל מותאם"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      fullWidth
                      required
                      sx={{ color: theme.textColor }}
                    />
                  </Grid>
                )}

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="כמות (גרם)"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth
                    required
                    sx={{ color: theme.textColor }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="שעת האכלה"
                    value={time}
                    onChange={(newTime) => setTime(newTime)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    required
                    sx={{ color: theme.textColor }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="הערות"
                    multiline
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    fullWidth
                    sx={{ color: theme.textColor }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="רמת סוכר"
                    type="number"
                    step="0.1"
                    value={bloodSugarLevel}
                    onChange={(e) => setBloodSugarLevel(e.target.value)}
                    fullWidth
                    sx={{ color: theme.textColor }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="שעת מדידת סוכר (אופציונלי)"
                    value={measurementTime}
                    onChange={(newTime) => setMeasurementTime(newTime)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    sx={{ color: theme.textColor }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    הוסף רישום
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Feeding Timeline */}
        <Box mt={4} onTouchMove={handleZoom} sx={{ overflowX: 'scroll', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Timeline
            position="alternate"
            sx={{
              flexDirection: 'row',
              flexWrap: 'nowrap',
              transform: `scale(${zoomLevel})`, // Scale icons based on zoom level
              transformOrigin: 'center',
              transition: 'transform 0.3s ease-in-out',
            }}
          >
            {feedings.map((feeding) => (
              <TimelineItem key={feeding.id} sx={{ minWidth: '120px' }}>
                <TimelineSeparator>
                  <TimelineDot color="primary" sx={{ height: `${25 * zoomLevel}px`, width: `${25 * zoomLevel}px` }} />
                  <TimelineConnector />
                </TimelineSeparator>
                <TimelineContent sx={{ textAlign: 'center' }}>
                  <IconButton onClick={() => handleDialogOpen(feeding)} sx={{ transform: `scale(${zoomLevel})` }}>
                    <LocalDrinkIcon sx={{ fontSize: `${30 * zoomLevel}px` }} />
                  </IconButton>
                  <Typography variant="body2" color="textSecondary">
                    {new Date(feeding.time).toLocaleDateString('he-IL')} - {dayjs(feeding.time).format('HH:mm')}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </Box>

        {/* Feeding Details Dialog */}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>פרטי רישום האכלה</DialogTitle>
          <DialogContent>
            {selectedFeeding && (
              <>
                <Typography>סוג: {selectedFeeding.type}</Typography>
                <Typography>כמות: {selectedFeeding.quantity} גרם</Typography>
                <Typography>הערות: {selectedFeeding.notes || 'אין הערות'}</Typography>
                {selectedFeeding.bloodSugar && (
                  <Typography>רמת סוכר בדם: {selectedFeeding.bloodSugar.level} mg/dL</Typography>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              סגור
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

export default FeedingLog;
