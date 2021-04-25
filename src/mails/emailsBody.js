module.exports.resetPasswordEmailBody=(newPassword) =>{
    let emailBody = {

    }
    emailBody.html =`<body>
            <h1> Hi </h1>
            <p>
                your Password was changed , here is your new password : ${newPassword}
            </p>
        </body>`
    emailBody.text = `your Password was changed , here is your new password : ${newPassword}`
    return emailBody;

}
module.exports.verifAccountEmailBody=(id,username,secretCode)=>{
    let emailBody = {

    }
    emailBody.html =  `<body>
                <h1>Hi ${username},</h1>
                <p> 
                    click <a href='http://localhost:3000/users/verify/${id}/${secretCode}'>here</a>
                    to verify your account
                </p>
            </body>`

    emailBody.text = `hi ${username}, please visit this link to verify your account https://localhost:3000/users/verify/${id}/${secretCode}`
    
    return emailBody;
}
