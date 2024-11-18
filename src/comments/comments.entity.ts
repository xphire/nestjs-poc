import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
  } from 'typeorm';
  import { randomUUID as genId } from 'crypto';
  import { Post } from 'src/posts/posts.entity'
  import { User } from 'src/users/users.entity';


  @Entity()
  export class Comment{
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
        length : 500,
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

      @Column({
        type: 'int',
        nullable: false,
        name: 'postId',
        zerofill: true
      })
      postId!: number;

      @ManyToOne(() => Post,{
        nullable: false,
        eager: false
      })
      post!: Post;

      @ManyToOne(() => User,{
        nullable: false,
        eager: false,
      })
      user!: User;

      @CreateDateColumn()
      createdAt!: Date;
    
      @UpdateDateColumn()
      updatedAt!: Date;

  }