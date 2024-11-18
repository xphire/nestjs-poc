import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany
} from 'typeorm';
import { randomUUID as genId } from 'crypto';
import { User } from 'src/users/users.entity';
import { Comment } from 'src/comments/comments.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn({
    name: 'id', //name in DB
    zerofill: true,
    type: 'int',
  })
  id!: number;
  @Column({
    nullable: false,
    default: genId(),
    type: 'uuid',
    name: 'uuid',
  })
  uuid!: string;
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'title',
  })
  title!: string;
  @Column({
    type: 'text',
    nullable: false,
    name: 'content',
  })
  content!: string;
  @Column({
    type: 'int',
    nullable: false,
    name: 'userId',
  })
  userId!: number;
  @ManyToOne(() => User, {
    nullable: false,
    eager: false,
  })
  user!: User;

  @OneToMany(() => Comment,(comment) => comment.post,{
    eager : true
  })
  comments! : Comment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
