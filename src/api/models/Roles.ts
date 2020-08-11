import { IsNotEmpty, IsOptional } from 'class-validator';
import { Column, Entity, PrimaryColumn, BaseEntity } from 'typeorm';

@Entity({name: 'roles'})
export class Role extends BaseEntity {
    @PrimaryColumn()
    public id: number;

    @IsNotEmpty()
    @Column()
    public name: string;

    @IsOptional()
    @Column({default: 0})
    public defaultRole: string;
}
