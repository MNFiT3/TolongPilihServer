import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm'
import { Length } from 'class-validator'
import { User } from './User';
import { Group } from './Group';

@Entity()
export class UserGroup {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 32})
    @Length(1, 32)
    role: string;

    @Column()
    @CreateDateColumn()
    joinedOn: Date;

    @Column({
        type: 'json',
        nullable: true
    })
    json: any;

    @ManyToOne(() => User, user => user.userGroup)
    user: User;

    @ManyToOne(() => Group, group => group.userGroup)
    group: Group;
}