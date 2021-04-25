const express = require("express");
const router = express.Router();
const User = require("../schema/user.schema");
const Discussion = require("../schema/discussion.schema");
const passport = require("passport");
const STATUES = require("../config/config.application").STATUES_CODE;
const STATICS_MSGS = require("../config/config.application").STATICS_MSGS;
const PRICES = require("../config/config.application").PRICES;
module.exports = router;

router.get("/hi", passport.authenticate("jwt", {
    session: false
}), (req, res) => {
    res.send("HI")
})

router.get("/messagebox", (req, res) => {
    Discussion.find({
        partners: {
            "$in": [req.user.id]
        }
    }).then(descu => {
        res.send(descu);
    }).catch(err => {
        res.send(err)
    });
});

router.post("/sendmessage", (req, res) => {
    let messageBody = req.body.messageBody;
    Discussion.findOne({
        partners: {
            "$all": [req.user.id, messageBody.partnerId]
        }
    }).then(discu => {
        if (discu) {
            message = {
                sender: req.user.id,
                text: messageBody.text
            }
            discu.message.push(message);
            if (discu.isPaid) {
                discu.save().then(sendmsg => {
                    console.log(sendmsg)
                }).catch(err => console.log(err));
                res.send("msg send success")
            } else {
                if (STATICS_MSGS.includes(messageBody.text)) {
                    discu.save().then(sendmsg => {
                        console.log(sendmsg)
                    }).catch(err => console.log(err));
                    res.send("msg send success")
                } else res.send("You only can send static messages")
            }
        } else {
            partners = [req.user.id, messageBody.partnerId];
            const newDiscussion = new Discussion({
                partners,
                message: [{
                    sender: req.user.id,
                    text: messageBody.text
                }]
            });
            if (STATICS_MSGS.includes(messageBody.text)) {
                newDiscussion.save().then(savedDisc => {
                    console.log(savedDisc)
                }).catch(err => {
                    console.log(err)
                })
                res.send("discussion created & msg send success")
            } else res.send("You only can send static messages")
        }
    }).catch(err => {
        res.send(err)
    });

});

router.post("/buydiscussion", (req, res) => {
    User.findById(req.user.id).then(user => {
        if (user.oviv_currency >= PRICES.discussion) {
            user.oviv_currency -= PRICES.discussion;
            Discussion.findOne({
                partners: {
                    "$all": [req.user.id, req.body.partnerId]
                }
            }).then(discu => {
                if (discu) {
                    discu.isPaid = true;
                    discu.save().then(updatedDiscu => {
                        user.save();
                        console.log(updatedDiscu)
                    }).catch(err => console.log(err))
                } else {
                    partners = [req.user.id, req.body.partnerId];
                    const newDiscussion = new Discussion({
                        partners,
                        isPaid: true
                    });
                    newDiscussion.save().then(savedDisc => {
                        user.save();
                        console.log(savedDisc);
                    }).catch(err => {
                        console.log(err)
                    })
                }
            })
        } else {
            res.send("you don't have enought currency")
        }
    })

})

router.get("/discussion", (req, res) => {
    Discussion.findOne({
        partners: {
            "$all": [req.user.id, req.body.partnerId]
        }
    }).then(discussion => {
        if (discussion) res.send(discussion)
        else {
            res.json({
                code: STATUES.NOT_FOUND,
                msg: "no discussion found"
            });
        }

    }).catch(excep => {
        console.log(excep)
        res.send(excep)
    });
})