import { DataSource, MoreThan, Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import * as crypto from 'crypto';

@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findById(id: string): Promise<User> {
    const user = await this.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User| null> {
    return this.findOne({ where: { email } });
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    return this.findOne({ where: { verificationToken: token } });
  }

  async findByResetToken(token: string): Promise<User | null> {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    return this.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: MoreThan(new Date()),
      },
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    console.log("password in reposotry ", createUserDto.password)
    const user = await this.create(createUserDto);
    console.log("password in reposotry after create ", user.password)

    const saved = await this.save(user);
    console.log("after saved ",saved.password)
    return saved
  }

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);
    Object.assign(user, updateData);
    return this.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const result = await this.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }
}