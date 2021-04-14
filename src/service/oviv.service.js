const bcrypt = require("bcryptjs");
const User = require("../schema/user.schema");
const express = require("express");
const router = express.Router();
const userFunctions = require("../functions/user.functions");
const emailSubjects = require("../mailer/emails.subject");
const STATUES = require("../config/config.application").STATUES_CODE;

module.exports = router;

router.get("/", (req, res) => {
    let HTMLdisplay = `
    <div style="height: 100%;display: flex;align-items: center;justify-content: center;">
        <h1 style="color: #e68b2fcc;font-size: xxx-large;font-family: system-ui;">Welcom To Oviv-API services</h1>
      </div>`
    res.send(HTMLdisplay);
})
router.post("/resetPassword", (req, res) => {
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
            userFunctions.updatePassword(user, newPassword, req.body.timeUpdate);
            emailObject = {
                from: config.OVIV_EMAIL,
                to: email,
                subject: emailSubjects.RESET_PASSWORD,
                text: msg.resetPasswordEmailBody(newPassword)
            }
            smtpServ.sendMail(emailObject, (err, info) => {
                if (err) {
                    res.json({
                        code: STATUES.NOT_VALID,
                        msg: err
                    });
                } else res.json({
                    code: STATUES.OK,
                    msg: 'Email sended'
                });
            });
        }
    });
});

router.post("/verify/:id/:secretCode", (req, res) => {
    User.findOne({
        _id: req.params.id
    }).then((user) => {
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