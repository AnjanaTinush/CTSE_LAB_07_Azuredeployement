const userService = require('../services/userService');

const registerUser = async (req, res) => {
    try {
        const { user, token } = await userService.register(req.body);
        res.status(201).json({
            success: true,
            user,
            token
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await userService.login(email, password);
        res.json({
            success: true,
            user,
            token
        });
    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const getUserById = async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        const users = await userService.getAllUsers();
        res.json({
            success: true,
            users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const updateUser = async (req, res) => {
    try {
        const user = await userService.update(req.params.id, req.body);
        res.json({
            success: true,
            user
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const deleteUser = async (req, res) => {
    try {
        await userService.delete(req.params.id);
        res.json({
            success: true,
            message: 'User deleted'
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerUser,
    loginUser,
    getUserById,
    getAllUsers,
    updateUser,
    deleteUser
};
