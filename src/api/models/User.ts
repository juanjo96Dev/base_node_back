import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity, OneToOne, JoinColumn } from 'typeorm';
import { Role } from './Roles';

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    public id: number;

    @IsNotEmpty()
    @Column()
    public name: string;

    @IsNotEmpty()
    @Column()
    public surname: string;

    @IsNotEmpty()
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
