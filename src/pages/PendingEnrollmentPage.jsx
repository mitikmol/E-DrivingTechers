// Full updated code with teacher dropdown in main UI per row

import {
  CheckCircle as ApproveIcon,
  Class as CourseIcon,
  CalendarToday as DateIcon,
  Info as DetailsIcon,
  AttachMoney as PaymentIcon,
  HourglassEmpty as PendingIcon,
  Cancel as RejectIcon,
  Person as StudentIcon,
  CheckCircle as VerifiedIcon
} from '@mui/icons-material';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  Link,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';

import React, { useEffect, useState } from 'react';

const PendingEnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [payments, setPayments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [teacherSelections, setTeacherSelections] = useState({});

  useEffect(() => {
    fetchPendingEnrollments();
    fetchTeachers();
  }, []);

  const fetchPendingEnrollments = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://driving-backend-stmb.onrender.com/api/enrollments/admin/pending', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setEnrollments(data);
    } catch (error) {
      console.error('Error fetching pending enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch('https://driving-backend-stmb.onrender.com/api/teachers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchPaymentsForEnrollment = async (enrollmentId) => {
    try {
      const response = await fetch(`https://driving-backend-stmb.onrender.com/api/payments/enrollment/${enrollmentId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const handleApprove = async (enrollmentId) => {
    const teacherId = teacherSelections[enrollmentId];
    if (!teacherId) {
      alert('Please select a teacher before approving.');
      return;
    }
  
    try {
      setLoading(true);
      const response = await fetch(
        `https://driving-backend-stmb.onrender.com/api/enrollments/${enrollmentId}/approve`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            teacher_id: Number(teacherId) // Ensure it's sent as number
          })
        }
      );
  
      if (response.ok) {
        fetchPendingEnrollments();
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error approving enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (enrollmentId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://driving-backend-stmb.onrender.com/api/enrollments/${enrollmentId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.ok) {
        fetchPendingEnrollments();
        setOpenDialog(false);
      }
    } catch (error) {
      console.error('Error rejecting enrollment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://driving-backend-stmb.onrender.com/api/payments/${paymentId}/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        }
      );

      if (response.ok) {
        if (selectedEnrollment) {
          fetchPaymentsForEnrollment(selectedEnrollment.id);
        }
        fetchPendingEnrollments();
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    await fetchPaymentsForEnrollment(enrollment.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEnrollment(null);
    setPayments([]);
  };

  const hasVerifiedPayment = (enrollment) => {
    return enrollment.has_verified_payment;
  };

  return (
    <Container maxWidth="lg">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pending Enrollments</Typography>
      </Box>

      {loading && enrollments.length === 0 ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : enrollments.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          No pending enrollments found.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Enrolled At</TableCell>
                <TableCell>Instructor</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>
                    <Chip
                      avatar={<Avatar><StudentIcon fontSize="small" /></Avatar>}
                      label={`Student ID: ${enrollment.student_id || 'N/A'}`}
                      color={enrollment.student_id ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={<CourseIcon fontSize="small" />}
                      label={`Course ID: ${enrollment.course_id ? enrollment.course_id.substring(0, 8) + '...' : 'N/A'}`}
                      variant="outlined"
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {hasVerifiedPayment(enrollment) ? (
                      <Chip icon={<VerifiedIcon fontSize="small" />} label="Verified" color="success" size="small" />
                    ) : (
                      <Chip icon={<PaymentIcon fontSize="small" />} label="Pending" color="warning" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <DateIcon fontSize="small" sx={{ mr: 1 }} />
                      {new Date(enrollment.enrolled_at).toLocaleString()}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={teacherSelections[enrollment.id] || ''}
                        onChange={(e) => setTeacherSelections(prev => ({ ...prev, [enrollment.id]: e.target.value }))}
                        displayEmpty
                        disabled={!hasVerifiedPayment(enrollment)}
                      >
                        <MenuItem value="" disabled>Select instructor</MenuItem>
                        {teachers.map(teacher => (
                          <MenuItem key={teacher.id} value={teacher.id}>{`${teacher.firstName} ${teacher.lastName}`}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleViewDetails(enrollment)} sx={{ mr: 1 }}>
                      <DetailsIcon />
                    </IconButton>
                    <Tooltip title={!hasVerifiedPayment(enrollment) ? "Payment must be verified first" : ""} arrow>
                      <span>
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={<ApproveIcon />}
                          onClick={() => handleApprove(enrollment.id)}
                          disabled={loading || !hasVerifiedPayment(enrollment)}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                      </span>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleReject(enrollment.id)}
                      disabled={loading}
                    >
                      Reject
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Enrollment Details</DialogTitle>
        <DialogContent>
          {selectedEnrollment && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Basic Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Enrollment ID</Typography>
                        <Typography variant="body1">{selectedEnrollment.id}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Status</Typography>
                        <Chip icon={<PendingIcon fontSize="small" />} label="Pending" color="info" size="small" />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Payment Information</Typography>
                    {payments.length === 0 ? (
                      <Typography color="textSecondary">No payments found</Typography>
                    ) : (
                      payments.map(payment => (
                        <Box key={payment.id} sx={{ mb: 2 }}>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="textSecondary">Amount</Typography>
                              <Typography variant="body1">${payment.amount}</Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <Typography variant="body2" color="textSecondary">Status</Typography>
                              <Typography variant="body1">
                                {payment.verified ? (
                                  <Chip label="Verified" color="success" size="small" />
                                ) : (
                                  <Chip label="Pending" color="warning" size="small" />
                                )}
                              </Typography>
                            </Grid>
                            {payment.payment_proof_url && (
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="textSecondary">Payment Proof</Typography>
                                <Link href={payment.payment_proof_url} target="_blank" rel="noopener" underline="hover">
                                  View Proof
                                </Link>
                              </Grid>
                            )}
                          </Grid>
                          {!payment.verified && (
                            <Button
                              onClick={() => handleVerifyPayment(payment.id)}
                              startIcon={<VerifiedIcon />}
                              variant="contained"
                              color="success"
                              sx={{ mt: 2 }}
                              disabled={loading}
                            >
                              Verify Payment
                            </Button>
                          )}
                          <Divider sx={{ my: 2 }} />
                        </Box>
                      ))
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedEnrollment && (
            <>
              <Button onClick={() => handleReject(selectedEnrollment.id)} color="error" variant="outlined" disabled={loading}>
                Reject
              </Button>
              <Tooltip title={!hasVerifiedPayment(selectedEnrollment) ? "Payment must be verified first" : ""} arrow>
                <span>
                  <Button
                    onClick={() => handleApprove(selectedEnrollment.id)}
                    color="success"
                    variant="contained"
                    disabled={loading || !hasVerifiedPayment(selectedEnrollment)}
                  >
                    Approve
                  </Button>
                </span>
              </Tooltip>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PendingEnrollmentsPage;