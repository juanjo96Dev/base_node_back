import { IsEmail, IsString } from 'class-validator';
import { Column } from 'typeorm';

export class Login {
    @IsEmail()
    @Column()
    public email: string;

    @IsString()
    @Column()
    public password: string;
}
