const mailer = require('nodemailer');

const transporter = mailer.createTransport({
    service:'Gmail',
    auth:{
        user:'nworahfavour2004@gmail.com',
        pass:'pvea vpim pyqz ngug'
    }
})

const options = {
    from:'nworahfavour2004@gmail.com',
    to:'devbatsystudios@gmail.com',
    subject:'a test emai sender',
    text:'hello dev batsy'
}

transporter.sendMail(options, (err, info) =>{
    if(err)console.log(err)
    else{
        console.log(info, ' email sent')
    }
})

//https://myaccount.google.com/apppasswords //for creating the passwords

//https://myaccount.google.com/ for setting up 2 step verification