const bcrypt = require("bcryptjs");
const User = require("../schema/user.schema");
const Personal = require("../schema/personal.schema");
const Interest = require("../schema/interests.schema");
const passport = require("passport");
const express = require("express");
const router = express.Router();
const config = require("../config/config.application")
const STATUES = require("../config/config.application").STATUES_CODE;
const IMAGE_MAX_SIZE = require("../config/config.application").IMAGE_MAX_SIZE;
const smtpServ = require("../mailer/SMTP.mailer");
const msg = require("../mailer/emails.body");
const userFunctions = require("../functions/user.functions");
const emailSubjects = require("../mailer/emails.subject");
const multer = require('multer');
const fs = require('file-system');
const upload = multer({
    dest: './uploads/'
})

//const {encrypt, decrypt} = require("../functions/pako");




module.exports = router;


router.get("/", (req, res) => {
    User.findById(req.user.id).then(user => {
        res.send(user)
    })
})

router.post("/update/password", (req, res) => {
    User.findOne({
        _id: req.user.id
    }).then((user) => {
        if (bcrypt.compareSync(req.body.oldPassword, user.password.value)) {
            userFunctions.updatePassword(user, req.body.newPassword, req.body.timeUpdate);
            res.json({
                code: STATUES.OK,
                msg: "Update succefull !!"
            });
        } else {
            res.json({
                code: STATUES.NOT_VALID,
                msg: "Your password is wrong !"
            });
        }
    });
});

router.post("/validate", (req, res) => {
    User.findOne({
        _id: req.user.id
    }).then((user) => {
        userFunctions.SendVerifyEmail(email, user.name, res, {}, user._id, user.secretCode);
    }).catch(err => {
        res.json({
            code: STATUES.NOT_FOUND,
            msg: err
        });
    });
});

router.post("/updateBasicInfos", (req, res) => {

    User.updateOne({
        _id: req.user.id
    }, {
        $set: req.body.basicInfos
    }, {
        runValidators: true
    }).then(user => {
        res.json({
            code: STATUES.OK,
            msg: 'valide'
        })
    }).catch(err => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err
        });
    });
});

router.post("/updateInterests", (req, res) => {
    arrInterests = req.body.interests;
    let cmpInterests = 0;
    let msgArray = []
    arrInterests.forEach(element => {

        Interest.findOne({
            name: element.name
        }).then(resulint => {
            if (resulint) {
                User.updateOne({
                    _id: req.user.id
                }, {
                    $addToSet: {
                        interests: resulint
                    }
                }, {
                    runValidators: true,
                    context: 'query'
                }).then(resu => {
                    cmpInterests++;
                    if (resu.nModified != 0) {
                        msgArray.push({
                            intressName: element.name,
                            status: "Added"
                        });

                    } else {
                        msgArray.push({
                            intressName: element.name,
                            status: "Refused"
                        });
                    }

                    if (cmpInterests == arrInterests.length) {
                        res.json({
                            msg: msgArray
                        });
                    }

                }).catch(err => {
                    cmpInterests++;
                    msgArray.push({
                        status: STATUES.NOT_VALID,
                        msg: err
                    });
                    if (cmpInterests == arrInterests.length) {
                        res.json({
                            msg: msgArray
                        });
                    }
                });
            } else {
                inter = new Interest(element);
                inter.save();
                User.updateOne({
                    _id: req.user.id
                }, {
                    $addToSet: {
                        interests: inter
                    }
                }, {
                    runValidators: true,
                    context: 'query'
                }).then(resu => {
                    cmpInterests++;
                    if (resu.nModified != 0) {
                        msgArray.push({
                            intressName: element.name,
                            status: "Added"
                        });
                    } else {
                        msgArray.push({
                            intressName: element.name,
                            status: "Refused"
                        });
                    }

                    if (cmpInterests == arrInterests.length) {
                        res.json({
                            msg: msgArray
                        });
                    }

                }).catch(err => {
                    cmpInterests++;
                    msgArray.push({
                        status: STATUES.NOT_VALID,
                        msg: err
                    });
                    if (cmpInterests == arrInterests.length) {
                        res.json({
                            msg: msgArray
                        });
                    }
                });
            }

        }).catch(err => {
            cmpInterests++;
            msgArray.push({
                status: STATUES.NOT_VALID,
                msg: err
            });
            if (cmpInterests == arrInterests.length) {
                res.json({
                    msg: msgArray
                });
            }
        });

    });

});

router.post("/updatePersonaleInfos", (req, res) => {
    User.updateOne({
        _id: req.user.id
    }, {
        $set: req.body.personaleInfos
    }, {
        lean: true
    }).then(user => {
        res.json({
            code: STATUES.OK,
            msg: 'valide'
        })
    }).catch(err => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err
        });
    });

});

router.post("/updateEducationWork", (req, res) => {

    User.updateOne({
        _id: req.user.id
    }, {
        $set: req.body.educationWork
    }, {
        runValidators: true
    }).then(user => {
        res.json({
            code: STATUES.OK,
            msg: 'valide'
        })
    }).catch(err => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err
        });
    });

});

router.post("/updatePrivacy", (req, res) => {
    User.updateOne({
        _id: req.user.id
    }, {
        $set: req.body.privacy
    }, {
        runValidators: true
    }).then(user => {
        res.json({
            code: STATUES.OK,
            msg: 'valide'
        })
    }).catch(err => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err
        });
    });
});

router.post("/updateSetting", (req, res) => {
    User.updateOne({
        _id: req.user.id
    }, {
        $set: req.body.setting
    }, {
        runValidators: true
    }).then(user => {
        res.json({
            code: STATUES.OK,
            msg: 'valide'
        })
    }).catch(err => {
        res.json({
            code: STATUES.NOT_VALID,
            msg: err
        });
    });
});

router.post("/updateProfilePic", upload.single("profilePic"), async (req, res) => {
    imgData = fs.readFileSync(req.file.path)
    stats = fs.statSync(req.file.path)
    imgSizeInBytes = stats.size;
    imgSizeInMegabytes = imgSizeInBytes / (1024 * 1024);
    if (imgSizeInMegabytes > IMAGE_MAX_SIZE) {
        res.send("image too big")
    } else {
        User.findById(req.user.id).then(async user => {
            minibuffer = await userFunctions.compressImg(imgData)
            index = user.gallery.images.findIndex(img => img.isProfilePic)
            if (index !== -1) {
                user.gallery.images[index].data = minibuffer;
            } else {
                let pic = {
                    isProfilePic: true,
                    data: minibuffer,
                }
                user.gallery.images.push(pic);
            }

            user.save().then(() => {
                res.send("Profile Updated")
            }).catch(err => res.send(err))
        }).catch(err => res.send(err))
    }

});
router.post("/updateCoverPic", upload.single("coverPic"), async (req, res) => {
    imgData = fs.readFileSync(req.file.path)
    stats = fs.statSync(req.file.path)
    imgSizeInBytes = stats.size;
    imgSizeInMegabytes = imgSizeInBytes / (1024 * 1024);

    if (imgSizeInMegabytes > IMAGE_MAX_SIZE) {
        res.send("image too big")
    } else {
        User.findById(req.user.id).then(async user => {
            minibuffer = await userFunctions.compressImg(imgData)
            index = user.gallery.images.findIndex(img => img.isCoverPic)
            if (index !== -1) {
                user.gallery.images[index].data = minibuffer;
            } else {
                let coverPic = {
                    isCoverPic: true,
                    data: minibuffer,
                }
                user.gallery.images.push(coverPic);
            }

            user.save().then(() => {
                res.send("Cover Picture Updated")
            }).catch(err => res.send(err))
        }).catch(err => res.send(err))
    }
})

router.get("/getprofilepic", (req, res) => {
    User.findById(req.user.id).then((findUser) => {
        img = findUser.gallery.images.find(img => img.isProfilePic)
        if (img) {
            const base64data = Buffer.from(img.data).toString('base64');
            result = {
                code: STATUES.OK,
                img: base64data
            }
            res.send(result)
        } else {
            res.json({
                code: STATUES.NOT_FOUND,
                msg: "you don't have one"
            })
        }
    })
});

router.delete("/deletePic", (req, res) => {
    User.findById(req.user.id).then(user => {
        picIndex = user.gallery.images.findIndex(item => item._id == req.body.picId)
        if (picIndex != -1) {
            user.gallery.images.pop(picIndex)
            user.save().then(() => {
                res.json({
                    code: STATUES.OK,
                    msg: "image deleted",
                });
            }).catch(err => res.send(err))
        } else {
            res.json({
                code: STATUES.NOT_FOUND,
                msg: "image not found"
            });
        }
    })
})

router.get("/getGallery", (req, res) => {
    User.findById(req.user.id).then(user => {
        if (user.gallery.images.length > 0) {
            clientGalleryList = userFunctions.setGalleryList(user.gallery.images);
            res.json({
                code: STATUES.OK,
                data: clientGalleryList
            });
        } else {
            res.json({
                code: STATUES.NOT_FOUND,
                msg: "gallery is empty"
            });
        }
    })
})

router.post("/uploadPic", upload.single("newPic"), async (req, res) => {
    imgData = fs.readFileSync(req.file.path)
    imgDesc = req.body.textPic;
    stats = fs.statSync(req.file.path)
    imgSizeInBytes = stats.size;
    imgSizeInMegabytes = imgSizeInBytes / (1024 * 1024);
    if (imgSizeInMegabytes > IMAGE_MAX_SIZE) {
        res.send("image too big")
    } else {
        User.findById(req.user.id).then(async user => {
            if (user.gallery.images.length < 5) {
                minibuffer = await userFunctions.compressImg(imgData)
                newImgData = {
                    text: imgDesc,
                    data: minibuffer,
                }
                user.gallery.images.push(newImgData);
                user.save().then(() => {
                    res.json({
                        code: STATUES.OK,
                        msg: "image uploaded",
                    });
                }).catch(err => res.send(err))
            } else res.json({
                code: STATUES.NOT_VALID,
                msg: "you can not upload anymore images"
            });
        }).catch(err => res.send(err))
    }
})

router.post("/followRequest", (req, res) => {
    User.findById(req.body.userRequested).then(user => {
        newNotification = {
            notif_type: "newfollow",
            target_user_id: req.user.id
        }
        if (user.isFollowPublic) {
            user.notification_list.push(newNotification)
            user.followers.push({
                user_id: req.user.id,
            })
            user.save().then(() => {
                res.json({
                    code: STATUES.OK,
                    msg: "You are now a follower",
                })
            })
        } else {
            newNotification.notif_type = "follow_request"
            user.notification_list.push(newNotification)
            user.save().then(() => {
                res.json({
                    code: STATUES.OK,
                    msg: "You follow request has been commited",
                })
            })
        }
    })
})

router.post("/acceptFollow", (req, res) => {
    User.findById(req.user.id).then(user => {
        let indexNotification = user.notification_list.findIndex(notif => notif.notif_type === "follow_request" && notif.target_user_id == req.body.newFollower);

        if (indexNotification != -1) {
            user.notification_list.splice(indexNotification, 1)
        }
        let newFollowObj = {
            user_id: req.body.newFollower
        }
        user.followers.push(newFollowObj)
        user.save().then(() => {
            User.findById(req.body.newFollower).then(follower => {
                let newNotification = {
                    notif_type: "followAccepted",
                    target_user_id: req.user.id
                }
                follower.notification_list.push(newNotification)
                follower.save().then(() => {
                    res.json({
                        code: STATUES.OK,
                        msg: "Follow accepted",
                    })
                })
            })

        })
    })
})

router.post("/blockUser", (req, res) => {
    let blockedUserId = req.body.bloquedUser;
    User.findById(req.user.id).then(user => {
        followerIndex = user.followers.findIndex(item => item.user_id == blockedUserId)
        if (followerIndex != -1) {
            user.followers.splice(followerIndex, 1)
        }
        user.blockedUsers.push(blockedUserId)
        user.save().then(() => {
            res.json({
                code: STATUES.OK,
                msg: "User Blocked",
            })
        })
    })
})

router.post("/favoriteFollower", (req, res) => {
    User.findById(req.user.id).then(user => {
        let indexFollower = user.followers.findIndex(Item => Item.user_id == req.body.follower_id);

        user.followers[indexFollower].isFavorite = !user.followers[indexFollower].isFavorite;

        user.save().then(() => {
            res.json({
                code: STATUES.OK,
                msg: "User Updated",
            })
        })
    })
})

router.post("/personalData", (req, res) => {

    Personal.findOne({
        user: req.user.id
    }).then(personal => {
        if (!personal) {
            newPrsonalObj = {
                user: req.user.id
            };
            req.body.personalData.forEach(element => {
                newPrsonalObj[Object.keys(element)[0]] = element[Object.keys(element)[0]]
            });

            const newPrsonal = new Personal(newPrsonalObj);
            newPrsonal.save().then(newObj => {
                percent = userFunctions.getPercentDataCompleted(newObj)
                newObj.percentCompleted = percent;
                newObj.save().then(() => {
                    res.send("Personal Data saved")
                })
            }).catch(err => {
                res.send(err)
            })
        } else {
            req.body.personalData.forEach(element => {
                personal[Object.keys(element)[0]] = element[Object.keys(element)[0]];
            });
            personal.save().then((newObj) => {
                percent = userFunctions.getPercentDataCompleted(newObj)
                newObj.percentCompleted = percent;
                newObj.save().then(() => {
                    res.send("Personal Data saved")
                })

            }).catch(err => {
                res.send(err)
            })
        }

    })
})

router.post("/likePic", (req, res) => {
    const userId = req.body.userId;
    const picId = req.body.picId;
    User.findById(userId).then(user => {
        let imageObj = user.gallery.images.find(image => image._id.equals(picId));
        let imageIndex = user.gallery.images.findIndex(image => image._id.equals(picId));
        let likeIndex = imageObj.likes.findIndex(like => like.equals(req.user.id));

        if (likeIndex != -1) {
            user.gallery.images[imageIndex].likes.splice(likeIndex, 1)
            user.save().then(() => {
                res.send("Your Unlike has been commited");
            }).catch(err => res.send(err))
        } else {
            user.gallery.images[imageIndex].likes.push(req.user.id)
            if (!req.user.id.equals(userId)) {
                let newNotification = {
                    notif_type: "picReaction",
                    target_user_id: req.user.id
                }
                user.notification_list.push(newNotification)
            }
            user.save().then(() => {
                res.send("Your like has been commited");
            }).catch(err => res.send(err))
        }
    })
})

router.post("/commentPic", (req, res) => {
    const userId = req.body.userId;
    const picId = req.body.picId;
    const commentBody = req.body.commentBody;
    if (!userFunctions.isValidCommentBody(commentBody)) {
        res.send("invalid comment body detected")
    } else {
        User.findById(userId).then(user => {
            let newComment = {
                commentor_id: req.user.id,
                comment_body: commentBody.trim()
            }
            if (!req.user.id.equals(userId)) {
                let newNotification = {
                    notif_type: "picComment",
                    target_user_id: req.user.id
                }
                user.notification_list.push(newNotification)
            }
            imgIndex = user.gallery.images.findIndex(img => img._id.equals(picId));
            user.gallery.images[imgIndex].comments.push(newComment)
            user.save().then(() => {
                res.send("your comment has been commited")
            }).catch(err => {
                res.send(err)
            })
        })
    }
})

router.post("/likeComment", (req, res) => {
    const userId = req.body.userId;
    const commentId = req.body.commentId;
    const picId = req.body.picId;
    User.findById(userId).then(user => {
        let picIndex = user.gallery.images.findIndex(img => img._id.equals(picId));
        let commentIndex = user.gallery.images[picIndex].comments.findIndex(comment => comment._id.equals(commentId));
        let likeIndex = user.gallery.images[picIndex].comments[commentIndex].comment_likes.findIndex(like => like.equals(req.user.id))
        if (likeIndex != -1) {
            user.gallery.images[picIndex].comments[commentIndex].comment_likes.splice(likeIndex, 1)
            user.save().then(() => {
                res.send("your Unlike has been commited")
            }).catch(err => res.send(err))
        } else {
            user.gallery.images[picIndex].comments[commentIndex].comment_likes.push(req.user.id)
            let commentorId = user.gallery.images[picIndex].comments[commentIndex].commentor_id;
            user.save().then(() => {
                if (!req.user.id.equals(commentorId)) {
                    User.findById(commentorId).then(commentor => {
                        let newNotification = {
                            notif_type: "reactComment",
                            target_user_id: req.user.id
                        }
                        commentor.notification_list.push(newNotification)
                        commentor.save().then(() => {
                            res.send("Your Like has been commited and notification sended")
                        }).catch(err => {
                            res.send(err.message)
                        })
                    })
                } else {
                    res.send("Your Like has been commited")
                }
            }).catch(err => res.send(err))
        }

    })
})


router.get("/hello", (req, res) => {


    /* r = decrypt(req.body.hash)
     res.send(r)*/




});