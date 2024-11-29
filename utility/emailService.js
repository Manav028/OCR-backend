import nodemailer from 'nodemailer'

const mailtransporter = nodemailer.createTransport({
    service : 'Gmail',
    auth: {
        user : "manavpatel.uk@gmail.com",
        pass : "rlyu kcln rkkw dpgd",
    }
});

const sendVerificationLink = async (email,token) => {

  console.log(process.env.FRONTEND_URL)

    const verificationlink = `${process.env.FRONTEND_URL}/api/auth/verify-email?veritoken=${token}`
    const mailOptions = {
        from: '"YourApp" <yourapp@example.com>',
        to: email,
        subject: 'Verify Your Email',
        html: `
          <h1>Verify Your Email</h1>
          <p>Click the link below to verify your email address:</p>
          <a href="${verificationlink}">Verify Email</a>
        `,
      };

      try {
        const info = await mailtransporter.sendMail(mailOptions);
        // console.log('Email sent: ', info.response);
      } catch (error) {
        // console.error('Error sending email: ', error.message);
        throw new Error('Email sending failed');
      }
}

export {sendVerificationLink};