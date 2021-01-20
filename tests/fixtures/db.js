const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../../src/models/user.js');
const Task = require('../../src/models/task.js');

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

const userTwoId = new mongoose.Types.ObjectId();
// create a user for testing routes that need authentication
const userTwo = {
    _id: userTwoId,
    name: 'Test User 2',
    email: "test2@test.com",
    password: "secondtestpass",
    tokens: [{
        token: jwt.sign({ _id: userTwoId}, process.env.JWT_SECRET)
    }]
}

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task one',
    completed: false,
    author: userOneId
}

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task two',
    completed: true,
    author: userOneId
}

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test task three',
    completed: false,
    author: userTwo._id
}

const setupDatabase = async () => {
    // delete every thing in the database before each test runs to ensure the test database is consistent
    await User.deleteMany();
    await Task.deleteMany();

    // save the test users
    await new User(userOne).save();
    await new User(userTwo).save();

    // save the test tasks
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
}