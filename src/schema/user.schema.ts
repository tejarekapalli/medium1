import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = Users & Document
@Schema()
export class Users extends Document{
    @Prop({required:true})
    name:string

    @Prop({required:true,unique:true})
    email:string

    @Prop({required:true})
    password:string
}


export const UserSchema =SchemaFactory.createForClass(Users)