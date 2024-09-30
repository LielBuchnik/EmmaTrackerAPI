import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { BabyContext } from '../context/BabyContext';
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function BloodSugarLog() {
  const { babyId } = useParams(); // Get babyId from URL if provided
  const { selectedBabyId } = useContext(BabyContext); // Get selected babyId from context
  const [bloodSugars, setBloodSugars] = useState([]);
  const [level, setLevel] = useState('');
  const [measurementTime, setMeasurementTime] = useState(dayjs());
  const [notes, setNotes] = useState('');
  const [theme, setTheme] = useState({
    background: 'linear-gradient(160deg, #434343 0%, #000000 100%)',
    textColor: '#ffffff',
  });

  const finalBabyId = babyId || selectedBabyId; // Use babyId from URL or selected baby from context

  useEffect(() => {
    // Fetch theme from localStorage
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme);
    }

    if (finalBabyId) {
      fetchBloodSugars(finalBabyId);
    }
  }, [finalBabyId]);

  const fetchBloodSugars = async (babyId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/babies/${babyId}/blood-sugars`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBloodSugars(response.data);
    } catch (error) {
      console.error('Error fetching blood sugar data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!finalBabyId) {
      alert('Please select a baby to log blood sugar data for.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/babies/${finalBabyId}/blood-sugars`,
        {
          level,
          measurementTime: measurementTime.toISOString(),
          notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Clear form after submission
      setLevel('');
      setMeasurementTime(dayjs());
      setNotes('');

      // Fetch updated logs
      fetchBloodSugars(finalBabyId);
    } catch (error) {
      console.error('Error adding blood sugar data:', error);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" dir="rtl">
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
          <Typography variant="h5" align="center" gutterBottom sx={{ color: theme.textColor }}>
            רישום סוכר בדם
          </Typography>
          <Divider sx={{ mb: 2, backgroundColor: theme.textColor }} />
          {finalBabyId && (
            <Box component="form" onSubmit={handleSubmit} mb={4}>
              <Box display="flex" flexDirection="column" gap={3}>
                <TextField
                  label="רמת סוכר"
                  type="number"
                  step="0.1"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  fullWidth
                  required
                  InputLabelProps={{
                    style: { color: theme.textColor },
                  }}
                  InputProps={{
                    style: { color: theme.textColor },
                  }}
                />

                <DateTimePicker
                  label="שעת מדידה"
                  value={measurementTime}
                  onChange={(newTime) => setMeasurementTime(newTime)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                  required
                />

                <TextField
                  label="הערות"
                  multiline
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  fullWidth
                  InputLabelProps={{
                    style: { color: theme.textColor },
                  }}
                  InputProps={{
                    style: { color: theme.textColor },
                  }}
                />

                <Button type="submit" variant="contained" color="primary">
                  הוסף רישום
                </Button>
              </Box>
            </Box>
          )}

          {/* Blood Sugar Records */}
          {bloodSugars.length > 0 && (
            <Box>
              <Typography textAlign='center' variant="h5" gutterBottom sx={{ color: theme.textColor }}>
                רישומי סוכר קודמים
              </Typography>
              <Divider sx={{ mb: 2, backgroundColor: theme.textColor }} />
              <TableContainer
                component={Paper}
                sx={{
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                  borderRadius: '8px',
                  backgroundColor: theme.background,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell textAlign="right" sx={{ color: theme.textColor }}>
                        רמת סוכר
                      </TableCell>
                      <TableCell textAlign="right" sx={{ color: theme.textColor }}>
                        שעת מדידה
                      </TableCell>
                      <TableCell textAlign="right" sx={{ color: theme.textColor }}>
                        הערות
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bloodSugars.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell textAlign="right" sx={{ color: theme.textColor }}>
                          {record.level}
                        </TableCell>
                        <TableCell textAlign="right" sx={{ color: theme.textColor }}>
                          {new Date(record.measurementTime).toLocaleString('he-IL')}
                        </TableCell>
                        <TableCell textAlign="right" sx={{ color: theme.textColor }}>
                          {record.notes || 'אין הערות'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default BloodSugarLog;
