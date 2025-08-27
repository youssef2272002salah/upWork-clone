import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Contract } from '../contracts/entities/contract.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,

    @InjectRepository(Contract)
    private contractRepository: Repository<Contract>,

    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(dto: CreateReviewDto): Promise<Review> {
    const contract = await this.contractRepository.findOneBy({ id: dto.contractId });
    if (!contract) throw new NotFoundException('Contract not found');

    const reviewer = await this.userRepository.findOneBy({ id: dto.reviewerId.toString() });
    if (!reviewer) throw new NotFoundException('Reviewer not found');

    const reviewed = await this.userRepository.findOneBy({ id: dto.reviewedId.toString() });
    if (!reviewed) throw new NotFoundException('Reviewed user not found');

    const review = this.reviewRepository.create({
      contract,
      reviewer,
      reviewed,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.reviewRepository.save(review);
  }

  async findAll(): Promise<Review[]> {
    return this.reviewRepository.find({
      relations: ['contract', 'reviewer', 'reviewed'],
    });
  }

  async findOne(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['contract', 'reviewer', 'reviewed'],
    });
    if (!review) throw new NotFoundException(`Review with ID ${id} not found`);
    return review;
  }

  async update(id: number, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(id);

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    return this.reviewRepository.save(review);
  }

  async remove(id: number): Promise<void> {
    const review = await this.findOne(id);
    await this.reviewRepository.remove(review);
  }
}
