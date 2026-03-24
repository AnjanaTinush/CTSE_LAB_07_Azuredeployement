const User = require('../models/User');

class UserRepository {
    async create(userData) {
        return await User.create(userData);
    }

    async findByEmail(email) {
        return await User.findOne({ email }).select('+password');
    }

    async findById(id) {
        return await User.findById(id);
    }

    async update(id, updateData) {
        return await User.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await User.findByIdAndDelete(id);
    }

    async getAll() {
        return await User.find();
    }
}

module.exports = new UserRepository();
