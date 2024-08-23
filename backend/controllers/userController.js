const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require("dotenv").config();



exports.login_post = [
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter a username")
        .escape(),
    body("password")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter your password")
        .custom(async (value, {req}) => {
            const user = await User.findOne({ 
                'login.username' : req.body.username
            });
            const isPasswordValid = await bcrypt.compare(value, user.login.password);
            if (!isPasswordValid) {
                throw new Error
            }
        })
        .withMessage("Invalid credentials")
        .escape(),
        asyncHandler(async (req, res, next) => {

            const errors = validationResult(req);
    
            if (!errors.isEmpty()) {
                res.json({
                    username: req.body.username,
                    password: req.body.password,
                    errors: errors.array()
                })
            } else {
                const userInfo = await User.findOne({ 
                    'login.username' : req.body.username
                });

                const user = { 
                    display_name: userInfo.display_name,
                    id: userInfo._id
                };
                const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
                
                let options = {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                }
                
                try {
                    res.cookie("token", accessToken, options);
                    res.json({ status: 200, message: "Cookie has been set" })
                } catch (error) {
                    console.error("Error setting cookie:", error);
                    res.status(500).send("Error setting cookie");
                }
            }
        })
]

exports.signup_post = [
    body("display_name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter a display name")
        .custom(async displayName => {
            const user = await User.findOne({ 
                display_name : displayName
            });
            if (user) {
                console.log(user);
                throw new Error
            } 
        })
        .withMessage("Display name already taken")
        .escape(),
    body("username")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter a username")
        .custom(async username => {
            const user = await User.findOne({ 
                'login.username' : username
            });
            if (user) {
                console.log(user);
                throw new Error
            } 
        })
        .withMessage("Username already taken")
        .escape(),
    body("password")
        .trim()
        .isStrongPassword({ minLowercase: 0, minSymbols: 0, minUppercase: 0 })
        .withMessage("Password must be atleast 8 characters and include a number")
        .escape(),
    body("confirm_password")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Enter your password to confirm")
        .custom((value, {req}) => {
            return value === req.body.password
        })
        .withMessage("confirm password does not match password")
        .escape(),
    asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({
                display_name: req.body.display_name,
                username: req.body.username,
                password: req.body.password,
                confirm_password: req.body.confirm_password,
                errors: errors.array()
            })
        } else {
            const user = new User({
                display_name: req.body.display_name,
                login: {
                    username: req.body.username,
                },
            })
            const saltRounds = 10;
            bcrypt.genSalt(saltRounds, function(err, salt) {
                if (err) {
                    throw new Error("Can't generate salt to hash password")
                }
                bcrypt.hash(req.body.password, salt, async function(err, hash) {
                    if (err) {
                        throw new Error("Can't hash password")
                    }
                    user.login.password = hash;
                    await user.save();
                })
            })

            res.status(201).json({ "status": 201, message: 'Successfully signed up' })
        }
    })
];

exports.users_list = asyncHandler(async (req, res, next) => {
    const users = await User.find({ _id: {$ne: req.user.id}}).select('display_name');

    if (!users) {
        throw new Error("can't find users");
    }

    res.json(users);
  });

exports.user_profile = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} GET`);  
});

exports.user_update = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} PUT`);  
});

exports.user_delete = asyncHandler(async (req, res, next) => {
    res.send(`user ${req.params.userId} DELETE`);  
});