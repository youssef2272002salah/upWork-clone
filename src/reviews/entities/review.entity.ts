import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    Unique,
  } from 'typeorm';
  import { Contract } from '../../contracts/entities/contract.entity';
  import { User } from '../../users/entities/user.entity';
  
  @Entity('reviews')
  @Unique(['contract', 'reviewer']) // Prevent duplicate reviews per contract by the same reviewer
  export class Review {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => Contract, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'contract_id' })
    contract: Contract;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reviewer_id' })
    reviewer: User;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'reviewed_id' })
    reviewed: User;
  
    @Column({ type: 'int' })
    rating: number; // 1-5 range (DB constraint)
  
    @Column({ type: 'text', nullable: true })
    comment: string;
  
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
  }
  