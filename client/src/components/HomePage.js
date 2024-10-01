import React, { useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BabyContext } from '../context/BabyContext';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { useSwipeable } from 'react-swipeable';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/he'; // Import the Hebrew locale

dayjs.locale('he'); // Set the locale globally for dayjs

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const HomePage = () => {
  const { logout } = useContext(AuthContext);
  const { selectedBabyId } = useContext(BabyContext);
  const [bloodSugarData, setBloodSugarData] = useState([]);
  const [foodLogs, setFoodLogs] = useState([]);
  const [babies, setBabies] = useState([]);
  const [currentView, setCurrentView] = useState(0);
  const [startDate, setStartDate] = useState(dayjs().subtract(3, 'day').startOf('day')); // Default: 3 days ago
  const [endDate, setEndDate] = useState(dayjs().endOf('day')); // Default: today
  const [theme, setTheme] = useState({
    background: 'linear-gradient(160deg, #434343 0%, #000000 100%)', // Default theme
    textColor: '#ffffff',
  });
  const navigate = useNavigate();

  // Fetch theme from localStorage
  useEffect(() => {
    const savedTheme = JSON.parse(localStorage.getItem('userTheme'));
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);



  useEffect(() => {
    const fetchLogs = async (babyId) => {
      try {
        const token = localStorage.getItem('token');
        const bloodResponse = await axios.get(`/api/babies/${babyId}/blood-sugars`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        });
        const foodResponse = await axios.get(`/api/babies/${babyId}/foods?limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBloodSugarData(bloodResponse.data);
        setFoodLogs(foodResponse.data);
      } catch (error) {
        console.error('Error fetching logs', error);
      }
    };

    const fetchAllBabyLogs = async (token) => {
      try {
        const bloodResponse = await axios.get(`/api/babies-all/blood-sugars`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        });
        const foodResponse = await axios.get(`/api/babies-all/foods`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { startDate: startDate.toISOString(), endDate: endDate.toISOString() }
        });
        setBloodSugarData(bloodResponse.data);
        setFoodLogs(foodResponse.data);
      } catch (error) {
        console.error('Error fetching all logs', error);
      }
    };

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const babyResponse = await axios.get('/api/babies', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBabies(babyResponse.data);

        if (selectedBabyId) {
          await fetchLogs(selectedBabyId);
        } else {
          await fetchAllBabyLogs(token); // Fetch all baby data if no baby is selected
        }
      } catch (error) {
        console.error('Error fetching data', error);
      }
    };

    fetchData();
  }, [selectedBabyId, startDate, endDate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    logout();
    navigate('/login');
  };

  const handleAddBaby = () => {
    navigate('/add-baby');
  };

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentView !== 1) setCurrentView(1);
    },
    onSwipedRight: () => {
      if (currentView !== 0) setCurrentView(0);
    },
    trackMouse: true,
  });

  // Disable swipe gestures inside the table
  // const handleTableScroll = (e) => {
  //   e.stopPropagation();
  // };

  // Function to format blood sugar chart data for multiple babies
  const getChartData = () => {
    const filteredData = filterDataByDate(bloodSugarData);

    const defaultColors = ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(75, 192, 192)']; // Default colors for the first three babies

    // If no specific baby is selected, show all babies' data in the chart
    if (!selectedBabyId && babies.length > 0) {
      const groupedData = babies.reduce((acc, baby, index) => {
        const babyLogs = filteredData.filter((log) => log.babyId === baby.id);
        if (babyLogs.length > 0) {
          acc.push({
            label: `סוכר בדם - ${baby.name}`,
            data: babyLogs.map((log) => log.level),
            borderColor: index < 3 ? defaultColors[index] : `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Default color for first 3 babies, random for others
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 3,
            tension: 0.4,
          });
        }
        return acc;
      }, []);

      return {
        labels: filteredData.map((log) =>
          new Date(log.measurementTime).toLocaleString('he-IL')
        ),
        datasets: groupedData,
      };
    }

    // If a specific baby is selected, show only that baby's data
    return {
      labels: filteredData.map((log) =>
        new Date(log.measurementTime).toLocaleString('he-IL')
      ),
      datasets: [
        {
          label: 'סוכר בדם',
          data: filteredData.map((log) => log.level),
          borderColor: 'rgb(255, 0, 0)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 3,
          tension: 0.4,
        },
      ],
    };
  };

  // Filter data based on selected date range
  const filterDataByDate = (data) => {
    return data.filter((log) => {
      const logDate = dayjs(log.measurementTime);
      return logDate.isBetween(startDate, endDate, null, '[]'); // inclusive of start and end dates
    });
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="lg" dir="rtl" {...handlers}>
        <Box
          sx={{
            mt: 5,
            p: 3,
            background: theme.background,
            color: theme.textColor,
            borderRadius: '8px', // Rounded corners like in login/signup
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', // Shadow for a more elevated look
            textAlign: 'center', // Align text to center
          }}
        >
          <Typography variant="h4" gutterBottom>
            ברוך הבא לעמוד הבית
          </Typography>

          <Box display="flex" justifyContent="center" mb={3} gap={2}>
            <DatePicker
              label="מתאריך"
              value={startDate}
              onChange={(newDate) => setStartDate(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
            <DatePicker
              label="עד תאריך"
              value={endDate}
              onChange={(newDate) => setEndDate(newDate)}
              renderInput={(params) => <TextField {...params} />}
            />
          </Box>

          <Box display="flex" justifyContent="center" mb={3}>
            <Button
              variant={currentView === 0 ? 'contained' : 'outlined'}
              onClick={() => setCurrentView(0)}
              sx={{ mx: 1, color: theme.textColor }}
            >
              סוכר בדם
            </Button>
            <Button
              variant={currentView === 1 ? 'contained' : 'outlined'}
              onClick={() => setCurrentView(1)}
              sx={{ mx: 1, color: theme.textColor }}
            >
              רישום אוכל
            </Button>
          </Box>

          {currentView === 0 && bloodSugarData.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" align="center" sx={{ color: theme.textColor }}>
                נתוני סוכר בדם
              </Typography>
              <Line
                data={getChartData()}
                options={{
                  scales: {
                    x: {
                      reverse: true,
                      title: {
                        display: true,
                        text: 'זמן מדידה',
                        color: theme.textColor,
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'רמת סוכר (mg/dL)',
                        color: theme.textColor,
                      },
                    },
                  },
                  plugins: {
                    legend: {
                      display: true,
                      position: 'top',
                      labels: { color: theme.textColor },
                    },
                  },
                }}
              />
            </Box>
          )}

          {currentView === 1 && foodLogs.length > 0 && (
            <Box mb={4}>
              <Typography variant="h6" align="center" sx={{ color: theme.textColor }}>
                רישומי אוכל אחרונים
              </Typography>
              <Box>
                {foodLogs.map((log) => (
                  <Accordion key={log.id}>
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      aria-controls={`panel-content-${log.id}`}
                      id={`panel-header-${log.id}`}
                    >
                      <Typography sx={{ color: theme.textColor }}>
                        {babies.find(b => b.id === log.babyId)?.name} - {dayjs(log.time).format('dddd, DD.MM.YY')} - {log.type}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Paper
                        sx={{
                          p: 2,
                          backgroundColor: theme.background,
                          color: theme.textColor,
                          borderRadius: '8px',
                          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
                        }}
                      >
                        <Typography>סוג: {log.type}</Typography>
                        <Typography>כמות: {log.quantity} גרם</Typography>
                        <Typography>הערות: {log.notes || 'אין הערות'}</Typography>
                        <Typography>רמת סוכר בדם: {log.bloodSugar ? `${log.bloodSugar.level} mg/dL` : 'N/A'}</Typography>
                      </Paper>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            </Box>
          )}

          <Box display="flex" justifyContent="center" mt={4}>
            <Button variant="contained" color="primary" onClick={handleAddBaby}>
              הוסף תינוק חדש
            </Button>
          </Box>

          <Box display="flex" justifyContent="center" mt={4}>
            <Button variant="contained" color="error" onClick={handleLogout}>
              התנתק
            </Button>
          </Box>
        </Box>
      </Container>
    </LocalizationProvider>
  );
};

export default HomePage;
