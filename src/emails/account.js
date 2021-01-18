const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dakota@dakotarerickson.com',
        subject: 'Welcome to Task Manager App!',
        text: `Welcome ${name}. I hope you enjoy using the task manager app.`
    })
}

const sendDeleteEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'dakota@dakotarerickson.com',
        subject: 'Sorry to see you leave!',
        text: `Goodbye, ${name}. I hope you found the task manager app useful.`
    })
}

module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}