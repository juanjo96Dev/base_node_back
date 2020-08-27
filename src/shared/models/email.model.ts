// tslint:disable-next-line: class-name
export interface sendEmail {
    from: {
        email: string,
        name: string,
    };
    to: {
        email: string,
        name: string,
    };
    Subject: string;
    TextPart: string;
    HTMLPart: string;
    CustomID: string;
}
