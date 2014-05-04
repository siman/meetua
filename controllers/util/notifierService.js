'use strict';

var nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport("SMTP",{
  service: "Gmail",
  auth: {
    user: "meetua32@gmail.com",
    pass: "meetua23"
  }
});

var mailOptions = {
  from: "Meet Ua <meetua32@gmail.com>", // sender address
  to: "gonevo32@mail.ru", // list of receivers
  subject: "Hello ", // Subject line
  text: "Hello world ", // plaintext body
  html: "<b>Hello world</b>" // html body
};


module.exports.notifyParticipant = function(user, status) {
  console.log('userrrrr', user);
  if (user.email) mailOptions.to = user.email;
  smtpTransport.sendMail(mailOptions, function(error, response){
    if(error){
      console.log(error);
    }else{
      console.log("Message sent: " + response.message);
    }

    // if you don't want to use this transport object anymore, uncomment following line
    //smtpTransport.close(); // shut down the connection pool, no more messages
  });

};