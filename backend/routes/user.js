const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

const router = express.Router();

router.post('/signup', (req,res,next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(result => {
                    res.status(201).json({
                        message: 'User created!',
                        result: result
                    });
                })
                .catch(err => {
                    res.status(500).json({
                        message: 'Invalid authentication credentials!'
                    })
                })
        });
});

router.post('/login', (req,res,next) => {
    let fetchedUser;
    User.findOne({ email: req.body.email})
        .then(user => {
            if (!user) {
                return res.status(401).json({
                    message: 'Invalid user credentials!'
                });
            }
            fetchedUser = user;
            return bcrypt.compare(req.body.password, user.password);
        })
        .then(result => {
            if (!fetchedUser) {
                return;
            }
            const token = jwt.sign(
                {email: fetchedUser.email, userId: fetchedUser._id},
                'this_should_be_a_long_secret         ',
                {expiresIn: '1h'}
            );
            res.status(200).json({
                token,
                expiresIn: 3600,
                userId: fetchedUser._id,
                email: fetchedUser.email
            });
        })
});

module.exports = router;
