import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDetails } from 'src/interface/user.interface';
import { Users } from 'src/schema/user.schema';

@Injectable()
export class UserService {
    constructor(@InjectModel(Users.name) private readonly userModel: Model<Users>) { }
    _getUserDetails(user) {
        return {
            id: user._id,
            name: user.name,
            email: user.email,

        }
    }

    async create(name: string, email: string, hashedPassword: string) {
        const newUser = new this.userModel({ name, email, password: hashedPassword });
        return newUser.save();
    }

    
    async findByEmail(email: string) {
        try {
            return await this.userModel.findOne({ email }).select('+password').exec();
        } catch (error) {
            console.error('Error in findByEmail:', error);
            return null;
        }
    }

    async findById(id: string): Promise<UserDetails | null> {
        const user = await this.userModel.findById(id).exec()
        if (!user) return null
        return this._getUserDetails(user)
    }
}
