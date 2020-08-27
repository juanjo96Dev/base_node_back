import { sendEmail } from '@shared/models/email.model';

export const sendMail = (setting: sendEmail) => {

    const mailjet = require ('node-mailjet').connect('156caef0bde3a2586afd1f2b8f6905fa', '1782995768e62702eee182c86e8a37d2');

    const request = mailjet
    .post('send', {version: 'v3.1'})
    .request({
      Messages: [
        {
          From: {
            Email: setting.from.email,
            Name: setting.from.name,
          },
          To: [
            {
              Email: setting.to.email,
              Name: setting.to.name,
            },
          ],
          Subject: setting.Subject,
          TextPart: setting.TextPart,
          HTMLPart: setting.HTMLPart,
          CustomID: setting.CustomID,
        },
      ],
    });

    request
      .then((result) => {
        console.log(result.body);
      })
      .catch((err) => {
        console.log(err.statusCode);
      });
};
