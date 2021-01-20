const request = require('supertest');
const Task = require('../src/models/task.js');
const app = require('../src/app.js');
const { 
    userOneId,
    userOne,
    userTwoId,
    userTwo,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
} = require('./fixtures/db.js');

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

test('Should not create task', async () => {
    const response = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: '',
        })
        .expect(400);

    // assert the task was not created
    const task = await Task.findById(response.body._id);
    expect(task).toBeNull();
});

test('Should update task', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: 'test task updated',
        })
        .expect(200);

    // assert the task was updated successfully
    const task = await Task.findById(response.body._id);
    expect(task.description).toBe('test task updated');
});

test('Should not allow invalid update', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: '',
        })
        .expect(400);

    // assert the task was  not updated
    const task = await Task.findById(taskOne._id);
    expect(task.description).toBe('Test task one');
});

test('Should not update others task', async () => {
    const response = await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send({
            description: '',
        })
        .expect(404);

    // assert the task was updated successfully
    const task = await Task.findById(taskOne._id);
    expect(task.description).toBe('Test task one');
});

test('Should get tasks', async () => {
    const response = await request(app)
        .get('/tasks')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

        // assert we got tasks from test db
        expect(response.body.length).toBe(2);
})

test('Should delete task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    // assert the task was deleted successfully
    const task = await Task.findById(taskOne._id);
    expect(task).toBeNull();
});

test('Should not delete task', async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    // assert the task was not deleted
    const task = await Task.findById(taskOne._id);
    expect(task.description).toBe('Test task one');
});

test('Should get task', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    // assert the task was retrieved successfully
    const task = await Task.findById(taskOne._id);
    expect(response.body).not.toBeNull();
    expect(response.body.description).toBe('Test task one');
});

test('Should not get task if unauthenticated', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .send()
        .expect(401);

    // assert the task was not retrieved
    expect(response.body.description).toBe(undefined);
});

test('Should not get other users task', async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set('Authorization', `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    // assert the task was not retrieved
    expect(response.body).toEqual({});
});

test('Should get completed tasks only', async () => {
    const response = await request(app)
        .get('/tasks/?completed=true')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

        // assert the only task we got was completed
        expect(response.body.length).toBe(1);
        expect(response.body[0].completed).toBe(true);
})

test('Should get incomplete tasks only', async () => {
    const response = await request(app)
        .get('/tasks/?completed=false')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

        // assert the only task we got was completed
        expect(response.body.length).toBe(1);
        expect(response.body[0].completed).toBe(false);
})

test('Should get tasks sorted by newest', async () => {
    const response = await request(app)
        .get('/tasks/?sortBy=createdAt:desc')
        .set('Authorization', `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

        // assert the only task we got was completed
        expect(response.body.length).toBe(2);
        expect(response.body[0].completed).toBe(true);
})