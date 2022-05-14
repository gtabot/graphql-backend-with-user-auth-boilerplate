import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  PrimaryColumn,
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

@Entity("users")
export default class User extends BaseEntity {
  @BeforeInsert()
  addId() {
    this.id = uuidv4().split("-")[0];
  }

  @PrimaryColumn("varchar", { length: 8 })
  id: string;

  @Column("varchar", { length: 20 })
  username: string;

  @Column("varchar", { length: 128 })
  email: string;

  @Column("text")
  passwordHash: string;

  @Column("boolean", { default: false })
  confirmed: boolean;
}
