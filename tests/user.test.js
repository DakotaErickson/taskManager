
const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app.js');
const User = require('../src/models/user.js');
const { findById } = require('../src/models/user.js');


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

beforeEach(async () => {
    // delete every user in the database before each test runs to ensure the test database is consistent
    await User.deleteMany();
    
    // save the test user
    await new User(userOne).save();
})

test('Should sign up new user', async () => {
    const response = await request(app)
        .post('/users')
        .send({
            name: 'Dakota',
            email: 'dakota@example.com',
            password: 'workingexample'
        })
        .expect(201);

        // assert that the database was changed correctly
        const user = await User.findById(response.body.user._id);
        expect(user).not.toBeNull();

        // assertions about the response
        expect(response.body).toMatchObject({
            user: {
                name: 'Dakota',
                email: 'dakota@example.com'
            },
            token: user.tokens[0].token
        });
        // assert password was hashed
        expect(user.password).not.toBe('workingexample');
})

test('Should not allow password = password', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Dakota',
            email: 'dakota@exmaple.com',
            password: 'password'
        })
        .expect(400);
})

test('Should require email', async () => {
    await request(app)
        .post('/users')
        .send({
            name: 'Dakota',
            email: '',
            password: 'workingexample'
        })
        .expect(400);
})

test('Should login', async () => {
    const response = await request(app)
        .post('/users/login')
        .send({
            email: userOne.email,
            password: userOne.password
        })
        .expect(200);

        // assertions about the response
        const user = await User.findById(userOneId);
        expect(response.body.token).toBe(user.tokens[1].token);
})

test('Should not login', async () => {
    await request(app)
        .post('/users/login')
        .send({
            email: 'badEmail@test.com',
            password: 'badPassword'
        })
        .expect(400);
})

test('Should get profile', async () => {
    await request(app)
        .get('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not get profile', async () => {
    await request(app)
        .get('/users/me')
        .send()
        .expect(401);
})

test('Should delete account', async () => {
    await request(app)
        .delete('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

        // assert the database was changed correctly
        const user = await User.findById(userOneId);
        expect(user).toBeNull();
})

test('Should not delete account', async () => {
    await request(app)
        .delete('/users/me')
        .send()
        .expect(401);

        // assert the database was not changed
        const user = await User.findById(userOneId);
        expect(user).not.toBeNull();
})

test('Should logout', async () => {
    await request(app)
        .post('/users/logout')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not logout', async () => {
    await request(app)
        .post('/users/logout')
        .send()
        .expect(401);
})

test('Should logout all', async () => {
    await request(app)
        .post('/users/logoutAll')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);
})

test('Should not logout all', async () => {
    await request(app)
        .post('/users/logoutAll')
        .send()
        .expect(401);
})

test('Should allow update', async () => {
    await request(app)
        .patch('/users/me')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            name: 'Test User Updated'
        })
        .expect(200);
})

test('Should not allow update', async () => {
    await request(app)
        .patch('/users/me')
        .send({
            name: 'Test User Updated'
        })
        .expect(401);
})