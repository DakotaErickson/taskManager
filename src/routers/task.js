const express = require('express');
const Task = require('../models/task.js');
const auth = require('../middleware/auth.js');
const router = new express.Router();

// create new
router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        author: req.user._id
    })
    try {
        await task.save();
        res.status(201).send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

// GET /tasks returns all taks
// GET /tasks?completed=true returns only completed tasks
// GET /tasks?limit=10&skip=0 returns 10 tasks starting from the top
// GET /tasks?sortBy=createdAt:asc or /tasks?sortBy=createdAt:desc
router.get('/tasks', auth, async (req, res) => {
    
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }
    
    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }).execPopulate();
        res.send(req.user.tasks);
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

// get by ID
router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const task = await Task.findOne({ _id, author: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

// update task
router.patch('/tasks/:id', auth, async (req, res) => {
    // check that the requested updates are valid and return 400 if they aren't
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description', 'completed'];
    const isValidUpdate = updates.every( update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        return res.status(400).send({error: 'Invalid updates requested.'});
    }
    
    // if the requested updates are valid then try to make the change
    try {
        const task = await Task.findOne({ _id: req.params.id, author: req.user._id});

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach(update => task[update] = req.body[update]);
        await task.save()
        res.send(task);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, author: req.user._id});
        if (!task) {
            return res.status(404).send();
        }
        res.send(task);
    } catch (e) {
        res.status(500).send();
    }
})

module.exports = router;