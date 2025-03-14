import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/schema/user.schema';
import { Model } from 'mongoose';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from 'src/config/roles';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  // Create
  async create(createUserDto: CreateUserDto, role?: UserRole) {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const createdUser = new this.userModel({
      ...createUserDto,
      password: hashedPassword,
      role: role || UserRole.TRAVELER,
    });

    return createdUser.save();
  }

  // Read
  async findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').select('-__v').exec();
  }
  async findById(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .select('-__v')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).select('-__v').exec();
  }

  async findByAccessToken(accessToken: string) {
    const token = accessToken.replace('Bearer ', '');

    const payload = this.jwtService.decode(token);

    return payload;
  }
  // Delete
  async remove(accessToken: string): Promise<void> {
    const { id } = await this.findByAccessToken(accessToken);

    this.removeById(id);
  }
  // Delete by id
  async removeById(id: string): Promise<void> {
    const result = await this.userModel.deleteOne({ _id: id }).exec();

    if (result.deletedCount === 0) {
      throw new NotFoundException('User not found');
    }
  }
}
