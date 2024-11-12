//import { CreateUserResponseType } from "../users.dto";
import { User } from "../users.entity";
import { Exclude, Expose, Type } from "class-transformer";


export class UserSerializer implements User{
    
    @Expose()
    id!: number;
    @Expose()
    uuid! : string
    @Expose()
    firstName! : string;
    @Expose()
    lastName! : string;
    @Expose()
    email! : string;
    


    @Exclude()
    password!: string;
    @Exclude()
    createdAt!: Date;
    @Exclude()
    updatedAt!: Date;
    @Exclude()
    isAdmin!: boolean;

}

export interface Meta {

    page : number;
    perPage : number;
    total : number
}


export class UsersSerializer{


    @Type(() => UserSerializer)
    users! : UserSerializer[];
    meta! : Meta

    
}

