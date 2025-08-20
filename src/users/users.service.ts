import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from './user.repository';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
// import { PaginationDto } from '../../common/dto/pagination.dto';
// import { PaginatedResult } from '../../common/interfaces/paginated-result.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(paginationDto){
    const { page = 1, limit = 10 } = paginationDto;
    const [results, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data: results,
      total,
      page,
      limit,
    };
  }

  async getUserById(id: string): Promise<User> {
    return this.userRepository.findById(id);
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userRepository.createUser(createUserDto);
  }

  async updateUser(id: string, updateUserDto: any): Promise<User> {
    return this.userRepository.updateUser(id, updateUserDto);
  }

  async deleteUser(id: string): Promise<void> {
    return this.userRepository.deleteUser(id);
  }

  async findByVerificationToken(token: string): Promise<User> {
    const user = await this.userRepository.findByVerificationToken(token);
    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }
    return user;
  }

  async findByResetToken(token: string): Promise<User> {
    const user = await this.userRepository.findByResetToken(token);
    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }
    return user;
  }

  async updatePassword(id: string, password: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    user.password = password;
    user.passwordChangedAt = new Date(Date.now() - 1000);
    return this.userRepository.save(user);
  }

  async markEmailAsVerified(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    user.isVerified = true;
    user.verificationToken = "";
    return this.userRepository.save(user);
  }
}