import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Unique,
  CreateDateColumn,
  OneToMany
} from "typeorm";
import { Length, IsNotEmpty } from "class-validator";
import * as bcrypt from "bcryptjs";
import { UserGroup } from "./UserGroup";

@Entity()
@Unique(["email"])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({length: 45})
  @Length(4, 45)
  username: string;

  @Column({length: 45})
  @Length(4, 45)
  email: string;

  @Column({length: 45})
  @Length(8, 45)
  password: string;

  @Column()
  @CreateDateColumn()
  createdAt: Date;

  @Column({length: 32})
  @Length(1, 32)
  role: string;

  @Column({
    type: 'json',
    nullable: true
  })
  json: any;

  @OneToMany(() => UserGroup, userGroup => userGroup.user)
  userGroup: UserGroup[];

  hashPassword() {
    this.password = bcrypt.hashSync(this.password, 8);
  }

  checkIfUnencryptedPasswordIsValid(unencryptedPassword: string) {
    return bcrypt.compareSync(unencryptedPassword, this.password);
  }
}
