const User = require("../schema/user.schema");
const Discussion = require("../schema/discussion.schema");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const express = require("express");
const passport = require("passport");
const router = express.Router();
const STATUES = require("../config/config.application").STATUES_CODE;
const userFunctions = require("../functions/user.functions");
const rateLimit = require("express-rate-limit");
const getLocation = require("../middleware/routingmiddleware").setLocation;

const get_ip = require('ipware')().get_ip;
const geoip = require('geoip-country');
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

router.post("/google", async (req, res) => {

    google_profile = req.body.google_profile;

    let user = await User.findOne({
        "email.value": google_profile.email
    });
    if (user) {
        const payload = {
            id: user._id
        };
        jwt.sign(payload, process.env.SECRET_OR_KEY, {}, async (err, token) => {
            if (err) {
                res.json({
                    code: STATUES.NOT_VALID,
                    msg: err,
                });
            } else {
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
            }
        });
    } else {
        let salt = bcrypt.genSaltSync(10)
        let hashPassword = bcrypt.hashSync(google_profile.id, salt)
        const secretCode = userFunctions.createSecretCode()
        const newUser = new User({
            googleId: google_profile.id,
            name: {
                firstName: google_profile.firstName,
                lastName: google_profile.lastName,
                username: google_profile.name

            },
            email: {
                value: google_profile.email
            },
            password: {
                value: hashPassword
            },
            address:{country:"TN"},
            isVerified: true,
            secretCode,
            oviv_currency: 100
        });
        ip = get_ip(req);
        geo = geoip.lookup(ip.clientIp);
        /*if (geo) {
            req.ip = ip.clientIp,
            req.country = geo.country
        }*/
        console.log(req.get(IpCountry))
        console.log(ip)
        console.log(geo)
        /*if (req.get(IpCountry)) {
            addss = req.get(IpCountry);
            newUser.address = {
                country: addss.countryName,
                country_code: addss.countryCode
            }
        } else {
            newUser.address = {
                country: req.country
            }
        }*/

        newUser.save().then((user) => {
            //userFunctions.SendVerifyEmail(user._id,req.body.email.value,req.body.name.username,secretCode);
            const payload = {
                id: user._id
            };
            jwt.sign(payload, process.env.SECRET_OR_KEY, {}, async (err, token) => {
                if (err) {
                    res.json({
                        code: STATUES.NOT_VALID,
                        msg: err,
                    });
                } else {
                    let user_payload = {
                        id: user._id,
                        name: user.name,
                        nbFollowers: user.followers.length,
                        oviv_currency: user.oviv_currency,
                        description: user.description,
                        isVerified: user.isVerified,
                    }
                    /*
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
                    user_payload.nb_new_mseesages = msgnotSeenCount*/
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
    }


})

/*router.get("/google", passport.authenticate('google', {
    scope: ['profile', 'email']
}),(req,res)=>{
   // response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    //add_header  'http://localhost:4200' always;
})

router.get('/auth/google/callback', passport.authenticate('google', {
    failureRedirect: '/',
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
        else{
            res.send({
                success: true,
                token: "Bearer " + token,
            });
            }
    });
})*/

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


router.get("/test", (req, res) => {
    res.send("test")
})