const User = require("../schema/user.schema");
const Discussion = require("../schema/discussion.schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const STATUES = require("../config/config.application").STATUES_CODE;
const userFunctions = require("../functions/user.functions");
const rateLimit = require("express-rate-limit");
const getLocation = require("../middleware/routingmiddleware").setLocation;
const cache = require("../cache/nodeCache");

module.exports = router;

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 6 // limit each IP to 6 login requests/ 15 min 
})

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
        /**
         * email
         * username
         * secretCode
         */
        //userFunctions.SendVerifyEmail(user._id,req.body.email.value,req.body.name.username,secretCode);

        res.json({
            code: STATUES.CREATED,
            msg: 'user created and email veryfication sended'
        })

    }).catch((err) => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err,
        });
    });
    //send emsil verification




});

router.post("/in", loginLimiter, (req, res) => {
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
                    /**
                     * user_payload : 
                     * id,
                     * name,
                     * photo de profile
                     * nb followers
                     * oviv_currency
                     * description
                     * isVerified
                     * nb notification_list [is_seen == false]
                     * nb mseesages [ is_seen == false]
                     */
                    const payload = {
                        id: user._id
                    };
                    jwt.sign(payload, process.env.SECRET_OR_KEY, {}, async (err, token) => {
                        if (err) {
                            res.json({
                                code: STATUES.NOT_VALID,
                                msg: err,
                            });
                        }
                        /*if (user.connection.length !== keys.NBR_CONNECTION_LIMIT) {
                            user.connection.push(req.body.connection);
                            user.save();
                        } else {
                            user.connection.shift();
                            user.connection.push(req.body.connection);
                            user.save();
                        }*/


                        let user_payload = {
                            id: user._id,
                            name: user.name,
                            nbFollowers: user.followers.length,
                            oviv_currency: user.oviv_currency,
                            description: user.description,
                            isVerified: user.isVerified,
                        }
                        img = user.gallery.images.find(img => img.isProfilePic)

                        notficationsNotSeen = user.notification_list.filter(notification => !notification.is_seen)
                        if (img) {

                            const base64data = Buffer.from(img.data).toString('base64');
                            user_payload.profilePic = base64data
                        }
                        if (notficationsNotSeen) {

                            user_payload.nb_new_notifications = notficationsNotSeen.length
                        }
                        let discss = await Discussion.find({
                            partners: user._id
                        }).exec();
                        let msgnotSeenCount = 0
                        discss.forEach(dis => {
                            msgs = dis.message.filter(msg => {
                                (msg.sender != user._id) && (!msg.is_seen)
                            })
                            msgnotSeenCount += msgs.length;
                        });
                        user_payload.nb_new_mseesages = msgnotSeenCount
                        res.json({
                            code: STATUES.OK,
                            success: true,
                            token: "Bearer " + token,
                            user_payload
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

router.post("/isValidField", (req, res) => {
    switch (req.body.label) {
        case "username": {
            User.findOne({
                "name.username": req.body.value
            }).then(user => {
                if (user) res.json({
                    username: false
                });
                else res.json({
                    username: true
                });
            })
        }
        break;
    case "email": {
        User.findOne({
            "email.value": req.body.value
        }).then(user => {
            if (user) res.json({
                email: false
            });
            else res.json({
                email: true
            });
        })
    }
    break;
    }
})

router.post("/isNew", (req, res) => {
    const profile = req.body.profile
    User.findOne({
        "email.value": profile.email
    }).then(async (user) => {
        if (user) {
            const payload = {
                id: user._id
            };
            console.log("user._id : ",user._id)
            jwt.sign(payload, process.env.SECRET_OR_KEY, {}, async (err, token) => {
                if (err) {
                    res.json({
                        code: STATUES.NOT_VALID,
                        msg: err,
                    });
                }
                let user_payload = {
                    id: user._id,
                    name: user.name,
                    nbFollowers: user.followers.length,
                    oviv_currency: user.oviv_currency,
                    description: user.description,
                    isVerified: user.isVerified,
                }
                img = user.gallery.images.find(img => img.isProfilePic)

                notficationsNotSeen = user.notification_list.filter(notification => !notification.is_seen)
                if (img) {

                    const base64data = Buffer.from(img.data).toString('base64');
                    user_payload.profilePic = base64data
                }
                if (notficationsNotSeen) {

                    user_payload.nb_new_notifications = notficationsNotSeen.length
                }
                let discss = await Discussion.find({
                    partners: user._id
                }).exec();
                let msgnotSeenCount = 0
                discss.forEach(dis => {
                    msgs = dis.message.filter(msg => {
                        (msg.sender != user._id) && (!msg.is_seen)
                    })
                    msgnotSeenCount += msgs.length;
                });
                user_payload.nb_new_mseesages = msgnotSeenCount
                res.json({
                    isNew: false,
                    code: STATUES.OK,
                    success: true,
                    token: "Bearer " + token,
                    user_payload
                });
            })
        } else {
            console.log("else ")
            suggestUsername = await userFunctions.getSuggestUsername(profile);
            console.log("suggestUsername ",suggestUsername)
            res.json({
                isNew:true,
                suggestUsername
            })
        }
    }).catch(err=>{

        console.log("catch ")
        console.log(err)
        res.json({
            code: STATUES.NOT_VALID,
            msg: err,
        });
    });

})

router.post("/google", getLocation, async (req, res) => {
    // + google_profile.suggedUsername
    google_profile = req.body.google_profile;
    const miniBuffer = await userFunctions.downloadBuffer(google_profile.photoUrl)
    const base64data = Buffer.from(miniBuffer).toString('base64');
    let profile_pic = {
        isProfilePic: true,
        data: miniBuffer,
        update: google_profile.continue.created_date
    }
    let salt = bcrypt.genSaltSync(10)
    let hashPassword = bcrypt.hashSync(google_profile.id, salt)
    const secretCode = userFunctions.createSecretCode()
    const newUser = new User({
        googleId: google_profile.id,
        name: {
            firstName: google_profile.firstName,
            lastName: google_profile.lastName,
            username: google_profile.continue.name.username

        },
        email: {
            value: google_profile.email
        },
        gender: google_profile.continue.gender,
        birth: google_profile.continue.birth,
        password: {
            value: hashPassword
        },
        address: {
            country_code: req.country_code,
            country: req.country
        },
        created_date: google_profile.continue.created_date,
        isVerified: true,
        secretCode,
        oviv_currency: 100,
        gallery: {
            images: [profile_pic]
        }
    });
    newUser.save().then((user) => {
        cache.ovivCache.doneUsername(google_profile.suggedUsername)
        const payload = {
            id: user._id
        };
        jwt.sign(payload, process.env.SECRET_OR_KEY, {}, (err, token) => {
            if (err) {
                res.json({
                    code: STATUES.NOT_VALID,
                    msg: err,
                });
            } else {
                let user_payload = {
                    id: user._id,
                    name: user.name,
                    oviv_currency: user.oviv_currency,
                    isVerified: user.isVerified,
                    profilePic: base64data
                }
                res.json({
                    code: STATUES.OK,
                    success: true,
                    token: "Bearer " + token,
                    user_payload
                });
            }
        });
    }).catch((err) => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err,
        });
    });
})






/*
router.get("/facebook", passport.authenticate('facebook', {
    scope: 'email'
}))

router.get("/auth/facebook/callback", passport.authenticate('facebook', {
    failureRedirect: '/',
    scope: 'email',
    session: false
}), (req, res) => {
    const payload = {
        id: req.user.id
    };
    jwt.sign(payload, process.env.SECRET_OR_KEY, {}, (err, token) => {
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
*/

