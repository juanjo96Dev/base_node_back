import { IsNotEmpty } from 'class-validator';
import { Column, Entity, PrimaryGeneratedColumn, BaseEntity } from 'typeorm';

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
    public role: string;

    @IsNotEmpty()
    @Column()
    public password: string;

    public toString(): string {
        return `${this.name} (${this.email})`;
    }

}
