import {Post, JsonController} from 'routing-controllers';
import { sendMail } from '@shared/smtp';
import { sendEmail } from '@shared/models/email.model';

@JsonController('/mail')
export class MailController {

    @Post()
    public send() {
        const settingEmail: sendEmail = {
            from: {
                email: 'herokuTest@herokuTest.com',
                name: 'Heroku Test',
            },
            to: {
                email: 'juanjosealosnero@gmail.com',
                name: 'Juan José',
            },
            Subject: 'Greetings from Mailjet.',
            TextPart: 'My first Mailjet email',
            HTMLPart: '<h3>Dear passenger 1, welcome to <a href=\'https://www.mailjet.com/\'>Mailjet</a>!</h3><br />May the delivery force be with you!',
            CustomID: 'AppGettingStartedTest',
        };

        sendMail(settingEmail);
    }
}
