const request = require('supertest');
const Task = require('../src/models/task.js');
const app = require('../src/app.js');
const { userOneId, userOne, setupDatabase} = require('./fixtures/db.js');

beforeEach(setupDatabase);

test('Should create task', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'test task',
        })
        .expect(201);

    // assert the task was created successfully
    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toBe(false);
});