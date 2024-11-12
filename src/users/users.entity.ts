import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from "typeorm"
import { randomUUID as genId } from "crypto"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id!: number

    @Column('uuid', {
        nullable: false,
        default: genId()
    })
    uuid!: string

    @Column({
        nullable: false,
        unique: true
    })
    email!: string

    @Column({
        nullable: false
    })
    password!: string

    @Column('boolean', {
        default: false
    })
    isAdmin!: boolean

    @Column({
        nullable: false
    })
    firstName!: string

    @Column({
        nullable: false
    })
    lastName!: string

    @CreateDateColumn()
    createdAt!: Date

    @UpdateDateColumn()
    updatedAt!: Date

    // @Column('datetime',{
    //     default :  new Date().toISOString().slice(0, 19).replace('T', ' '),
    //     onUpdate : new Date().toISOString().slice(0, 19).replace('T', ' '),
    // })
    // lastUpdated : Date
}