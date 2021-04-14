const User = require("../schema/user.schema");
const jwt = require("jsonwebtoken");
const keys = require("../config/config.application");
const bcrypt = require("bcryptjs");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const STATUES = require("../config/config.application").STATUES_CODE;
const userFunctions = require("../functions/user.functions");

module.exports = router;

router.post("/up", (req, res) => {

    let salt = bcrypt.genSaltSync(10)
    let hashPassword = bcrypt.hashSync(req.body.password, salt)
    const secretCode = userFunctions.createSecretCode()
    const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        birth: req.body.birth,
        password: {
            value: hashPassword
        },
        gender: req.body.gender,
        address: req.body.address,
        created_date: req.body.created_date,
        secretCode,
        oviv_currency: 100
    });
    newUser.save().then((user) => {
        userFunctions.SendVerifyEmail(req.body.email, req.body.name, res, {
            code: STATUES.CREATED,
            msg: "User Created",
        }, user._id, secretCode);
        res.json({ code: STATUES.CREATED, msg: 'done'})
    }).catch((err) => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err,
        });
    });
    //send emsil verification




});

router.post("/in", (req, res) => {
    const authenticator = req.body.authenticator;
    const password = req.body.password;
    User.findOne().or([{
        "email.value": {
            "$in": [authenticator]
        }
    }, {
        "name.username": authenticator
    }]).then((user) => {

        if (user) {
            bcrypt.compare(password, user.password.value).then((isMatch) => {
                if (isMatch) {
                    const payload = {
                        id: user._id
                    };
                    jwt.sign(payload, keys.SECRET_OR_KEY, {}, (err, token) => {
                        if (err) {
                            res.json({
                                code: STATUES.NOT_VALID,
                                msg: err,
                            });
                        }
                        if (user.connection.length !== keys.NBR_CONNECTION_LIMIT) {
                            user.connection.push(req.body.connection);
                            user.save();
                        } else {
                            user.connection.shift();
                            user.connection.push(req.body.connection);
                            user.save();
                        }

                        res.json({
                            code: STATUES.OK,
                            success: true,
                            token: "Bearer " + token,
                        });
                    });

                } else if (user.password.oldValue) {
                    if (bcrypt.compareSync(password, user.password.oldValue)) {
                        res.json({
                            code: STATUES.NOT_VALID,
                            msg: `This is your old password You change it in : ${user.password.update}`
                        });
                    } else {
                        res.json({
                            code: STATUES.NOT_VALID,
                            msg: "Your password is Wrong!"
                        });
                    }
                } else {
                    res.json({
                        code: STATUES.NOT_VALID,
                        msg: "Your password is Wrong!"
                    });

                }
            });
        } else {
            res.json({
                code: STATUES.NOT_FOUND,
                msg: "User not found !"
            });
        }
    });
});

router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email']
}))

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/',
    session: false
}), (req, res) => {
    const payload = {
        id: req.user.id
    };
    jwt.sign(payload, keys.SECRET_OR_KEY, {}, (err, token) => {
        if (err) {
            res.json({
                code: STATUES.NOT_VALID,
                msg: err,
            });
        }
        res.json({
            code: STATUES.OK,
            success: true,
            token: "Bearer " + token,
        });
    });
})

router.get("/facebook", passport.authenticate('facebook',{scope: 'email'}))

router.get("/auth/facebook/callback", passport.authenticate('facebook',{
    failureRedirect: '/',
    scope: 'email',
    session: false
}),(req, res)=>{
    const payload = {
        id: req.user.id
    };
    jwt.sign(payload, keys.SECRET_OR_KEY, {}, (err, token) => {
        if (err) {
            res.json({
                code: STATUES.NOT_VALID,
                msg: err,
            });
        }
        res.json({
            code: STATUES.OK,
            success: true,
            token: "Bearer " + token,
        });
    });
})


router.get("/test", (req, res) => {
    res.send("test")
})