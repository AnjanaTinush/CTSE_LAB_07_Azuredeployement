const express = require('express');
const router = express.Router();
const {
    registerUser,
    loginUser,
    getUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController');

// Register a new user
router.post('/register', registerUser);

// Login a user
router.post('/login', loginUser);

// Get user by ID
router.get('/:id', getUserById);

// Update user by ID
router.put('/:id', updateUser);

// Delete user by ID
router.delete('/:id', deleteUser);

module.exports = router;
