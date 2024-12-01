import nodemailer from 'nodemailer'

const mailtransporter = nodemailer.createTransport({
    service : 'Gmail',
    auth: {
        user : "manavpatel.uk@gmail.com",
        pass : "rlyu kcln rkkw dpgd",
    }
});

const sendVerificationLink = async (email,code) => {

    const mailOptions = {
        from: '"YourApp" <yourapp@example.com>',
        to: email,
        subject: 'Verify Your Email',
        html: `
          <h1>Verify Your Email</h1>
          <p>Click the link below to verify your email address:</p>
          <h1>${code}</h1>
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