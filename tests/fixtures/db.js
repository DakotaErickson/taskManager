const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user.js');

const userOneId = new mongoose.Types.ObjectId();
// create a user for testing routes that need authentication
const userOne = {
    _id: userOneId,
    name: 'Test User',
    email: "test@test.com",
    password: "testtesttest",
    tokens: [{
        token: jwt.sign({ _id: userOneId}, process.env.JWT_SECRET)
    }]
}

const setupDatabase = async () => {
    // delete every user in the database before each test runs to ensure the test database is consistent
    await User.deleteMany();

    // save the test user
    await new User(userOne).save();
}

module.exports = {
    userOneId,
    userOne,
    setupDatabase
}