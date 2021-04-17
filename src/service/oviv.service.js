const User = require("../schema/user.schema");
const express = require("express");
const router = express.Router();
const userFunctions = require("../functions/user.functions");
const STATUES = require("../config/config.application").STATUES_CODE;
const rateLimit = require("express-rate-limit");



const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 h
    max: 1, // limit each IP to 1 reset password request/ 1h,
    message:"you can't use this for a while because your new passwred was already send to your email, go check"
})

module.exports = router;


router.get("/testrecommender",(req,res)=>{
    userFunctions.getRecommandedFollowing(null,null);
})

router.get("/", (req, res) => {
    let HTMLdisplay = `
    <div style="height: 100%;display: flex;align-items: center;justify-content: center;">
        <h1 style="color: #e68b2fcc;font-size: xxx-large;font-family: system-ui;">Welcom To Oviv-API services</h1>
      </div>`
    res.send(HTMLdisplay);
})
router.post("/resetPassword",resetPasswordLimiter, (req, res) => {
    email = req.body.email;
    User.findOne({
        "email.value": {
            "$in": [email]
        }
    }).then((user) => {
        if (!user) {
            res.json({
                code: STATUES.NOT_FOUND,
                msg: "User not found !"
            });
        } else {
            newPassword = userFunctions.getNewPassword();
            userFunctions.updatePassword(user, newPassword, req.body.action_date);
            userFunctions.SendNewPasswordEmail(email,newPassword)
            res.json({
                code:STATUES.OK,
                msg:"a new password was sended to your email"
            })
        }
    });
});

router.post("/verify/:id/:secretCode", (req, res) => {
    User.findById(req.params.id).then((user) => {
        if (user.secretCode === req.params.secretCode) {
            User.updateOne({
                _id: req.params.id
            }, {
                $set: {
                    isVerified: true
                }
            }).exec();
            res.json({
                code: STATUES.OK,
                msg: "Account Verified With Success"
            });
        } else {
            res.json({
                code: STATUES.NOT_VALID,
                msg: "Account Cannot Be Verified"
            });
        }
    }).catch(() => {
        res.json({
            code: STATUES.NOT_FOUND,
            msg: "User Not Found"
        });
    });
});