import { Entity, Unique, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm'
import { Length } from 'class-validator'
import { UserGroup } from './UserGroup';

@Entity()
export class Group {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({length: 45})
    @Length(3, 45)
    name: string;

    @Column()
    @CreateDateColumn()
    createdAt: Date;

    @Column({
        type: 'json',
        nullable: true
    })
    list: any;

    @Column({
        type: 'json',
        nullable: true
    })
    history: any;

    @Column({
        type: 'json',
        nullable: true
    })
    json: any;

    @OneToMany(() => UserGroup, userGroup => userGroup.group)
    userGroup: UserGroup[];
}