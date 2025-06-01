import PersonIcon from '@mui/icons-material/Person';
import {
    Alert,
    Avatar,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Grid,
    Snackbar,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const getAuthHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('authToken')}`
    }
  });

  const fetchUsers = async () => {
    try {
      const res = await axios.get('https://driving-backend-stmb.onrender.com/api/auth/users/', getAuthHeader());
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ open: true, message: 'Failed to fetch users.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        All Users
      </Typography>

      {loading ? (
        <Grid container justifyContent="center">
          <CircularProgress />
        </Grid>
      ) : users.length === 0 ? (
        <Typography>No users found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {users.map((user) => (
            <Grid item xs={12} sm={6} md={4} key={user.id}>
              <Card variant="outlined">
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <Avatar>
                        <PersonIcon />
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <Typography variant="subtitle1">
                        {user.firstName} {user.lastName}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Email: {user.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Phone: {user.phoneNumber}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default UsersPage;
