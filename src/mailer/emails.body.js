message=module.exports=  {}

message.resetPasswordEmailBody=(newPassword) =>{
return `<body>
            <h1> Hi </h1>
            <p>
                your Password was changed , here is your new password : ${newPassword}
            </p>
        </body>`
}
message.verifAccountEmailBody=(name,id,secretCode)=>{
    return `<body>
                <h1>Hi ${name.firstName} ${name.lastName},</h1>
                <p> 
                    click <a href='https://localhost:3000/users/verify/${id}/${secretCode}'>here</a>
                    to verify your account
                </p>
            </body>`
}
