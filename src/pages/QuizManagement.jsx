// src/pages/dashboard/QuizManagement.js
import { Add, ArrowBack, Delete, Edit } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Snackbar,
    TextField,
    Typography
} from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
  
  const QuizManagement = ({ lessonId, onBack }) => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [currentQuiz, setCurrentQuiz] = useState({
      question: '',
      options: [{ text: '', is_correct: false }]
    });
  
    const fetchQuizzes = async () => {
      try {
        const res = await axios.get(`https://driving-backend-stmb.onrender.com/api/quizzes/${lessonId}`);
        setQuizzes(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch quizzes');
        setLoading(false);
      }
    };
  
    useEffect(() => {
      fetchQuizzes();
    }, [lessonId]);
  
    const handleAddOption = () => {
      setCurrentQuiz({
        ...currentQuiz,
        options: [...currentQuiz.options, { text: '', is_correct: false }]
      });
    };
  
    const handleOptionChange = (index, field, value) => {
      const newOptions = [...currentQuiz.options];
      newOptions[index][field] = value;
      setCurrentQuiz({ ...currentQuiz, options: newOptions });
    };
  
    const handleDeleteOption = (index) => {
      const newOptions = currentQuiz.options.filter((_, i) => i !== index);
      setCurrentQuiz({ ...currentQuiz, options: newOptions });
    };
  
    const handleSubmitQuiz = async () => {
      try {
        const endpoint = currentQuiz.id 
          ? `https://driving-backend-stmb.onrender.com/api/quizzes/${currentQuiz.id}`
          : `https://driving-backend-stmb.onrender.com/api/quizzes/${lessonId}`;
  
        const method = currentQuiz.id ? 'put' : 'post';
        
        await axios[method](endpoint, {
          question: currentQuiz.question,
          options: currentQuiz.options
        });
  
        setSuccess(`Quiz ${currentQuiz.id ? 'updated' : 'added'} successfully`);
        fetchQuizzes();
        setAddDialogOpen(false);
        setEditDialogOpen(false);
      } catch (err) {
        setError(`Failed to ${currentQuiz.id ? 'update' : 'add'} quiz`);
      }
    };
  
    const handleDeleteConfirm = async () => {
      try {
        await axios.delete(`https://driving-backend-stmb.onrender.com/api/quizzes/${quizToDelete}`);
        setSuccess('Quiz deleted successfully');
        fetchQuizzes();
      } catch (err) {
        setError('Failed to delete quiz');
      } finally {
        setDeleteDialogOpen(false);
        setQuizToDelete(null);
      }
    };
  
    if (loading) return <CircularProgress sx={{ display: 'block', margin: '2rem auto' }} />;
  
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={onBack} sx={{ mr: 2 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5">Manage Quizzes</Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setCurrentQuiz({ question: '', options: [{ text: '', is_correct: false }] });
              setAddDialogOpen(true);
            }}
            sx={{ ml: 'auto' }}
          >
            Add Quiz
          </Button>
        </Box>
  
        <List>
          {quizzes.map((quiz) => (
            <React.Fragment key={quiz.id}>
              <ListItem
                secondaryAction={
                  <Box>
                    <IconButton 
                      edge="end" 
                      onClick={() => {
                        setCurrentQuiz({
                          id: quiz.id,
                          question: quiz.question,
                          options: quiz.options
                        });
                        setEditDialogOpen(true);
                      }}
                      sx={{ mr: 1 }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton edge="end" onClick={() => {
                      setQuizToDelete(quiz.id);
                      setDeleteDialogOpen(true);
                    }}>
                      <Delete />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText
                  primary={quiz.question}
                  secondary={
                    <Box component="div">
                      {quiz.options.map((option, idx) => (
                        <Typography 
                          key={idx} 
                          variant="body2"
                          color={option.is_correct ? 'success.main' : 'text.secondary'}
                          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                        >
                          {option.option_text}
                          {option.is_correct && '✓'}
                        </Typography>
                      ))}
                    </Box>
                  }
                />
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </List>
  
        {/* Add/Edit Quiz Dialog */}
        <Dialog 
          open={addDialogOpen || editDialogOpen} 
          onClose={() => {
            setAddDialogOpen(false);
            setEditDialogOpen(false);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>{currentQuiz.id ? 'Edit Quiz' : 'Add New Quiz'}</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              label="Question"
              fullWidth
              value={currentQuiz.question}
              onChange={(e) => setCurrentQuiz({ ...currentQuiz, question: e.target.value })}
              sx={{ mb: 3 }}
            />
  
            <Typography variant="subtitle1" gutterBottom>
              Options (check correct answer)
            </Typography>
  
            {currentQuiz.options.map((option, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  label={`Option ${index + 1}`}
                />
                <Button
                  variant="outlined"
                  onClick={() => handleDeleteOption(index)}
                  disabled={currentQuiz.options.length <= 1}
                >
                  Delete
                </Button>
                <Button
                  variant={option.is_correct ? 'contained' : 'outlined'}
                  color="success"
                  onClick={() => handleOptionChange(index, 'is_correct', !option.is_correct)}
                >
                  ✓
                </Button>
              </Box>
            ))}
  
            <Button 
              variant="outlined" 
              onClick={handleAddOption}
              sx={{ mt: 2 }}
            >
              Add Option
            </Button>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSubmitQuiz} variant="contained">
              {currentQuiz.id ? 'Update' : 'Add'} Quiz
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this quiz? This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* Notifications */}
        <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')}>
          <Alert severity="error">{error}</Alert>
        </Snackbar>
        <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')}>
          <Alert severity="success">{success}</Alert>
        </Snackbar>
      </Box>
    );
  };
  
  export default QuizManagement;