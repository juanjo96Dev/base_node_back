import { IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Role } from './Roles';

@Entity({name: 'user'})
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @IsNotEmpty()
    @Column()
    public name: string;

    @IsOptional()
    @Column()
    public surname: string;

    @IsEmail()
    @Column()
    public email: string;

    @IsNotEmpty()
    @Column()
    public password: string;

    @IsOptional()
    @Column({name: 'role'})
    public role: number;

    @OneToOne(type => Role, role => role.id)
    @JoinColumn({name: 'role'})
    public userRole: string;
}
