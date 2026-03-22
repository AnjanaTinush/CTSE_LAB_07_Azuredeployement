const userRepository = require('../repositories/userRepository');
const jwt = require('jsonwebtoken');

class UserService {
    async register(userData) {
        const { email } = userData;
        const existingUser = await userRepository.findByEmail(email);
        
        if (existingUser) {
            throw new Error('User already exists');
        }

        const user = await userRepository.create(userData);
        const token = this.generateToken(user._id);
        
        return { user, token };
    }

    async login(email, password) {
        const user = await userRepository.findByEmail(email);
        
        if (!user || !(await user.matchPassword(password))) {
            throw new Error('Invalid credentials');
        }

        const token = this.generateToken(user._id);
        
        // Remove password before returning
        user.password = undefined;
        return { user, token };
    }

    async getUserById(id) {
        const user = await userRepository.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async update(id, updateData) {
        const user = await userRepository.update(id, updateData);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    async delete(id) {
        const user = await userRepository.delete(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }

    generateToken(id) {
        return jwt.sign({ id }, process.env.JWT_SECRET, {
            expiresIn: '30d'
        });
    }
}

module.exports = new UserService();
