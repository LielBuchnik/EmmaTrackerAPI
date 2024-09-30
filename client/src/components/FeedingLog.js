import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BabyContext } from '../context/BabyContext';
import {
  Container,
  Typography,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
  MenuItem,

} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LocalDrinkIcon from '@mui/icons-material/LocalDrink';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { Timeline, TimelineItem, TimelineSeparator, TimelineDot, TimelineConnector, TimelineContent } from '@mui/lab';

function FeedingLog() {
  const { babyId } = useParams();
  const { selectedBabyId } = useContext(BabyContext);
  const [feedings, setFeedings] = useState([]);
  const [lastFeeding, setLastFeeding] = useState(null); // Track last feeding
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
    const fetchTheme = () => {
      const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
      if (savedTheme) {
        setTheme(savedTheme); // Apply user-selected theme
      }
    };

    fetchTheme();

    if (finalBabyId) {
      fetchFeedings(finalBabyId);
    }
  }, [finalBabyId]);

  const fetchFeedings = async (babyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/babies/${babyId}/foods?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFeedings(response.data);
      setLastFeeding(response.data[0]); // Set the most recent feeding
    } catch (error) {
      console.error('Error fetching feedings:', error);
    }
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

      await axios.post(`/api/babies/${finalBabyId}/foods-and-blood-sugar`, payload, {
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        {/* Display Last Feeding Date with Bottle Icon */}
        {lastFeeding && (
          <Box display="flex" justifyContent="center" alignItems="center" mb={4}>
            <LocalDrinkIcon fontSize="large" />
            <Typography variant="h6" sx={{ ml: 1 }}>
              האכלה אחרונה: {new Date(lastFeeding.time).toLocaleString('he-IL')}
            </Typography>
          </Box>
        )}

        {/* Feeding Form */}
        {finalBabyId && (
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
        )}

        {/* Timeline for last feedings */}
        {feedings.length > 0 && (
          <Box mt={4} sx={{ background: theme.background, color: theme.textColor, borderRadius: '8px' }}>
            <Typography variant="h5" color={theme.textColor} textAlign="center" gutterBottom>
              רישומי אוכל אחרונים
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: theme.textColor }} />

            <Timeline>
              {feedings.map((feeding) => (
                <TimelineItem key={feeding.id}>
                  <TimelineSeparator>
                    <TimelineDot color="primary">
                      <IconButton onClick={() => alert(`Details of feeding: ${feeding.notes || 'אין הערות'}`)}>
                        <LocalDrinkIcon />
                      </IconButton>
                    </TimelineDot>
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="body1">
                      {`סוג: ${feeding.type}, כמות: ${feeding.quantity} גרם`}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                      {new Date(feeding.time).toLocaleString('he-IL')}
                    </Typography>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        )}
      </Container>
    </LocalizationProvider>
  );
}

export default FeedingLog;
