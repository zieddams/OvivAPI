const User = require("../schema/user.schema");
const Personal = require("../schema/personal.schema");
const bcrypt = require("bcryptjs");
const generator = require('generate-password');
const emailSubject = require("../mailer/emailsSubject");
const emailBody = require("../mailer/emailsBody");
const validator = require('validator');
const isJpg = require('is-jpg');
const sharp = require('sharp');
const imagemin = require('imagemin');
const mozjpeg = require('imagemin-mozjpeg');
const sendEmail = require("../mailer/gmail")
const convertToJpg = async (input) =>{
    if(isJpg(input)){
        return input
    }
    return sharp(input).jpeg().toBuffer();
}


module.exports.isValidEmail = (email) => validator.isEmail(email);

module.exports.isValidPhone = (phone) => validator.isMobilePhone(phone);

module.exports.updatePassword = (user, newPassword, timeUpdate) => {
    newPassword = bcrypt.hashSync(newPassword, 10);
    User.updateOne({
        _id: user._id
    }, {
        "$set": {
            "password.oldValue": user.password.value,
            "password.value": newPassword,
            "password.update": timeUpdate
        }
    }).exec();
}
module.exports.getNewPassword = () => {
    return generator.generate({
        length: 15,
        uppercase: false,
        numbers: true
    });
}
module.exports.createSecretCode = () => {
    return generator.generate({
        length: 25,
        uppercase: true,
        numbers: true
    });
}
module.exports.SendVerifyEmail = (id,email,username,secretCode) => {

    const {html , text} = emailBody.verifAccountEmailBody(id,username,secretCode)
    sendEmail.sendGmail(email,emailSubject.VERIFY_ACCOUNT,text,html).then(()=>{
        //console.log("email is send", result)
    }).catch(error => console.log(error.message));
}
module.exports.SendNewPasswordEmail = (email,newPassword)=>{
    const {html , text} = emailBody.resetPasswordEmailBody(newPassword)
    sendEmail.sendGmail(email,emailSubject.RESET_PASSWORD,text,html).then(()=>{
        //console.log("email is send", result)
    }).catch(error => console.log(error.message));
}
module.exports.updateInterests = (situation,result,bodyInterests,req,res) =>{
    if(situation){
        User.findOneAndUpdate({_id:req.user.id},{$push:{interests: {$each: result}}}).then(user=>{
            res.send(user)
        }).catch(err=>{
            res.send(err)
        })
    }else{

       if(result.result.nInserted !=0){
           console.log("(result.result.nInserted =>",result.result.nInserted)
        User.findOneAndUpdate({_id:req.user.id},{$push:{interests: {$each: result.insertedDocs}}}).then(user=>{
            if(result.writeErrors.length>0){
                let newInterArray = [];
                result.writeErrors.forEach(element => {
                    newInterArray.push(bodyInterests[element.index])
                });
                User.findOneAndUpdate({_id:req.user.id},{$push:{interests: {$each: newInterArray}}}).then(user=>{
            
                }).catch(err=>{
                    res.send(err)
                })
            }
        }).catch(err=>{
            res.send(err)
        })
       }
    }
}
module.exports.setGalleryList = (userImagesList) => {
    picsArray = [];
    userImagesList.forEach(element => {
        if(!element.isProfilePic){
            base64code = Buffer.from(element.data).toString('base64');
            imgObject = {
                id:element._id,
                text:element.text,
                pic:base64code,
                contentType:element.contentType
            }
            picsArray.push(imgObject)
        }
    });
    return picsArray;
}
module.exports.getPercentDataCompleted = (userPersonal) =>{
    let props = Object.keys(Personal.schema.paths); 
    let fields = props.filter(prop => (prop!= "user") && (prop!= "_id") && (prop!= "percentCompleted") && (prop!= "__v") )
    let cmp = 0;
     fields.forEach(field => {
         if(userPersonal[field]) cmp++
     });
     return ((cmp / fields.length) * 100) 
}
module.exports.isValidCommentBody = (text) =>{
   let regExp = new RegExp("([a-zA-Z0-9]+://)?([a-zA-Z0-9_]+:[a-zA-Z0-9_]+@)?([a-zA-Z0-9.-]+\\.[A-Za-z]{2,4})(:[0-9]+)?(/.*)?");
   text = text.trim();
   return !(regExp.test(text) || validator.isEmpty(text));
}
module.exports.listUsersCards = (users) => {
    let cardUsers = [];
    users.forEach(user => {
        let userCardData = {
            id: user._id,
            name: user.name,
            description: user.description,
            nbFollowers: user.followers.length
        }
        img = user.gallery.images.find(img => img.isProfilePic);
        if(img){
            base64code = Buffer.from(img.data).toString('base64');
            userCardData.profilePic = base64code
        }
        
        cardUsers.push(userCardData)
    }) 
    return cardUsers;
}
module.exports.CreatSearchQuery = async(filter) => {
    let query = {};
    let cardUsers = [];
    const keys = Object.keys(filter)
    keys.forEach(key => {
        if(key == "country") query["address.country"] = filter[key]
        else query[key] = filter[key]
    });
    const users = await User.find(query);

    users.forEach(user => {
        let userCardData = {
            id: user._id,
            name: user.name,
            description: user.description,
            nbFollowers: user.followers.length
        }
        img = user.gallery.images.find(img => img.isProfilePic);
        if(img){
            base64code = Buffer.from(img.data).toString('base64');
            userCardData.profilePic = base64code
        }
        
        cardUsers.push(userCardData)
    }) 
    return cardUsers;
}
module.exports.compressImg = async (buffer)=>{
    const miniBuffer = await imagemin.buffer(buffer,{
        plugins:[convertToJpg, mozjpeg({quality: 85})]
    })
    return miniBuffer;
}

