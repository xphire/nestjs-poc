import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { randomUUID as genId } from 'crypto';
import { User } from 'src/users/users.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn({
    name: 'id', //name in DB
    zerofill: true,
    type: 'int',
  })
  id!: number
  @Column({
    nullable: false,
    default: genId(),
    type: 'uuid',
    name: 'uuid',
  })
  uuid! : string
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'title',
  })
  title! : string 
  @Column({
    type: 'text',
    nullable: false,
    name: 'content',
  })
  content! : string
  @ManyToOne(() => User, (user) => user.id, {
    nullable: false,
    eager: false
  })
  user! : number
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
