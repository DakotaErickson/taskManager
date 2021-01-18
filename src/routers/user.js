const express = require('express');
const User = require('../models/user.js');
const router = new express.Router();
const auth = require('../middleware/auth.js');
const multer = require('multer');
const sharp = require('sharp');
const { sendWelcomeEmail, sendDeleteEmail } = require('../emails/account.js');

// create new
router.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        await user.save();
        sendWelcomeEmail(user.email, user.name);
        const token = await user.generateAuthToken();
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e)
    }
})

// login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({user: user.getPublicProfile, token});
    } catch (e) {
        console.log(e);
        res.status(400).send();
    }
})

// logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token); // clear out only matching token
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

// logout of all devices
router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []; // clear out all tokens
        await req.user.save();

        res.send();
    } catch (e) {
        res.status(500).send();
    }
})

// get profile
router.get('/users/me', auth, async (req, res) => {
    res.send(req.user);
})

// update user
router.patch('/users/me', auth, async (req, res) => {
    // check that the requested updates are valid and return 400 if they aren't
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidUpdate = updates.every( update => allowedUpdates.includes(update));

    if (!isValidUpdate) {
        return res.status(400).send({error: 'Invalid updates requested.'});
    }
    
    // if the requested updates are valid then try to make the change
    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})

// remove user
router.delete('/users/me', auth, async (req, res) => {
    try {
        sendDeleteEmail(req.user.email, req.user.name);
        await req.user.remove();
        res.send(req.user);
    } catch (e) {
        res.status(500).send();
    }
})

// set the destination for uploads
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image.'));
        }

        cb(undefined, true);
    }
});

// upload profile picture
router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
    req.user.avatar = buffer;

    //req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message });
})

// delete profile picture
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.send();
})

// fetch profile picture
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user || !user.avatar) {
            throw new Error();
        }
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);

    } catch (e) {
        res.status(404).send();
    }
})

module.exports = router;