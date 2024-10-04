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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, Scatter, Tooltip } from 'recharts';

const feedingTypes = {
  מטרנה: '#ff5722', // Orange
  'חלב אם': '#2196f3', // Blue
  סימילק: '#4caf50', // Green
  נוטרילון: '#9c27b0', // Purple
  אחר: '#f44336', // Red
};

function FeedingLog() {
  const { babyId } = useParams();
  const { selectedBabyId } = useContext(BabyContext);
  const [feedings, setFeedings] = useState([]);
  const [lastFeeding, setLastFeeding] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeeding, setSelectedFeeding] = useState(null);
  const [type, setType] = useState('מטרנה');
  const [customType, setCustomType] = useState('');
  const [isCustomType, setIsCustomType] = useState(false); // ADDED
  const [quantity, setQuantity] = useState('');
  const [time, setTime] = useState(dayjs());
  const [notes, setNotes] = useState('');
  const [bloodSugarLevel, setBloodSugarLevel] = useState('');
  const [measurementTime, setMeasurementTime] = useState(dayjs());

  const finalBabyId = babyId || selectedBabyId;

  useEffect(() => {
    if (finalBabyId) {
      fetchFeedings(finalBabyId);
    }
  }, [finalBabyId]);

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

  const handleDialogOpen = (feeding) => {
    setSelectedFeeding(feeding);
    setType(feeding.type);
    setQuantity(feeding.quantity);
    setTime(dayjs(feeding.time));
    setNotes(feeding.notes);
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
      const selectedFoodType = customType || type;

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

      if (selectedFeeding) {
        // Update feeding log
        await axios.put(`http://185.47.173.90:3001/api/babies/${finalBabyId}/foods/${selectedFeeding.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        // Add new feeding log
        await axios.post(`http://185.47.173.90:3001/api/babies/${finalBabyId}/foods-and-blood-sugar`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setType('מטרנה');
      setCustomType('');
      setQuantity('');
      setTime(dayjs());
      setNotes('');
      setBloodSugarLevel('');
      setMeasurementTime(dayjs());
      fetchFeedings(finalBabyId);
      handleDialogClose();
    } catch (error) {
      console.error('Error saving feeding data:', error);
    }
  };

  const getScatterData = () => {
    return feedings.map((feeding) => ({
      date: dayjs(feeding.time).format('YYYY-MM-DD'),
      time: dayjs(feeding.time).hour() + dayjs(feeding.time).minute() / 60, // Time in decimal hours
      feeding,
      type: feeding.type,
      quantity: feeding.quantity,
    }));
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { feeding } = payload[0].payload;
      return (
        <Box sx={{ backgroundColor: 'white', padding: 2, boxShadow: 1 }}>
          <Typography variant="body2">Type: {feeding.type}</Typography>
          <Typography variant="body2">Quantity: {feeding.quantity} גרם</Typography>
          <Typography variant="body2">Time: {dayjs(feeding.time).format('HH:mm')}</Typography>
        </Box>
      );
    }
    return null;
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
            background: '#D9AFD9',
            color: '#333',
            borderRadius: '8px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          <CardContent>
            <Typography variant="h5" textAlign="center" gutterBottom>
              הוסף רישום חדש
            </Typography>
            <Divider sx={{ mb: 2, backgroundColor: '#333' }} />
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
                  >
                    <MenuItem value="מטרנה">מטרנה</MenuItem>
                    <MenuItem value="חלב אם">חלב אם</MenuItem>
                    <MenuItem value="סימילק">סימילק</MenuItem>
                    <MenuItem value="נוטרילון">נוטרילון</MenuItem>
                    <MenuItem value="אחר">אחר</MenuItem>
                  </TextField>
                </Grid>

                {customType && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="שם אוכל מותאם"
                      value={customType}
                      onChange={(e) => setCustomType(e.target.value)}
                      fullWidth
                      required
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="שעת האכלה"
                    value={time}
                    onChange={(newTime) => setTime(newTime)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                    required
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
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <DateTimePicker
                    label="שעת מדידת סוכר (אופציונלי)"
                    value={measurementTime}
                    onChange={(newTime) => setMeasurementTime(newTime)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Button type="submit" variant="contained" color="primary" fullWidth>
                    {selectedFeeding ? 'עדכן רישום' : 'הוסף רישום'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </Card>

        {/* Graph */}
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
            <XAxis
              dataKey="date"
              type="category"
              name="Date"
              tickFormatter={(date) => dayjs(date).format('DD/MM')}
              label={{ value: 'Dates', position: 'insideBottom', offset: -10 }}
            />
            <YAxis
              dataKey="time"
              type="number"
              domain={[0, 24]}
              name="Time"
              tickFormatter={(time) => dayjs().startOf('day').add(time, 'hours').format('HH:mm')}
              label={{ value: 'Time', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {Object.keys(feedingTypes).map((type) => (
              <Scatter
                key={type}
                data={getScatterData().filter((d) => d.type === type)}
                fill={feedingTypes[type]}
                shape={<LocalDrinkIcon />}
                onClick={(data) => handleDialogOpen(data.feeding)}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>

        {/* Edit/Delete Dialogs */}
        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>{selectedFeeding ? 'ערוך רישום' : 'הוסף רישום חדש'}</DialogTitle>
          <DialogContent>
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    select
                    label="סוג אוכל"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    fullWidth
                  >
                    {Object.keys(feedingTypes).map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="כמות (גרם)"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    fullWidth
                  />
                </Grid>

                <Grid item xs={12}>
                  <DateTimePicker
                    label="שעת האכלה"
                    value={time}
                    onChange={(newTime) => setTime(newTime)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
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
                  />
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose}>Cancel</Button>
            <Button onClick={handleSubmit} color="primary">
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </LocalizationProvider>
  );
}

export default FeedingLog;
