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
} from '@mui/material';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

ChartJS.register(...registerables, zoomPlugin);

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

  const [theme, setTheme] = useState({
    backgroundColor: '#D9AFD9',
    backgroundImage: 'linear-gradient(0deg, #D9AFD9 0%, #97D9E1 100%)',
    textColor: '#333',
  });

  const finalBabyId = babyId || selectedBabyId;

  useEffect(() => {
    const fetchFeedings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://185.47.173.90:3001/api/babies/${finalBabyId}/foods?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFeedings(response.data);
        setLastFeeding(response.data[0]); // Most recent feeding
      } catch (error) {
        console.error('Error fetching feedings:', error);
      }
    };

    if (finalBabyId) {
      fetchFeedings();
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

      // Clear form
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

  // Prepare data for the chart
  const chartData = {
    labels: feedings.map((feeding) => new Date(feeding.time).toLocaleString('he-IL')),
    datasets: [
      {
        label: 'Feedings',
        data: feedings.map(() => 1), // Fixed Y-axis value for the icon position
        pointRadius: 10, // Size of the icons
        pointHoverRadius: 12,
        pointBackgroundColor: 'rgba(54, 162, 235, 1)',
        pointStyle: 'image',
        showLine: false, // Hide the connecting lines
        pointHoverBackgroundColor: 'rgba(255, 99, 132, 1)',
        pointHitRadius: 20,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'hour',
          tooltipFormat: 'MMM D, h:mm a',
        },
        title: {
          display: true,
          text: 'Date & Time',
        },
      },
      y: {
        display: false, // Hide Y-axis as it's irrelevant
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          mode: 'x',
          speed: 0.1,
        },
      },
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        handleDialogOpen(feedings[index]);
      }
    },
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

        {/* Feeding Chart */}
        <Box mt={4} sx={{ background: '#f0f0f0', p: 4, borderRadius: '8px' }}>
          <Line data={chartData} options={chartOptions} />
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
            <Button onClick={handleDialogClose} color="primary">סגור</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

export default FeedingLog;
