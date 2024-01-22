import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema, Users } from 'src/schema/user.schema';

@Module({
  imports:[MongooseModule.forFeature([{name:Users.name, schema:UserSchema}])],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
