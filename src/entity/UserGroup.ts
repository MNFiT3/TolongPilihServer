import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm'
import { } from 'class-validator'
import { User } from './User';
import { Group } from './Group';

@Entity()
export class UserGroup {
    @PrimaryGeneratedColumn()
    id: number;

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