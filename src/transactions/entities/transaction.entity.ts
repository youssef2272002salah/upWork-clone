import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  
  export enum TransactionType {
    DEPOSIT = 'deposit',
    WITHDRAWAL = 'withdrawal',
    TRANSFER = 'transfer',
    FEE = 'fee',
  }
  
  @Entity('transactions')
  export class Transaction {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
  
    @Column({ type: 'numeric', precision: 10, scale: 2 })
    amount: number;
  
    @Column({
      type: 'enum',
      enum: TransactionType,
    })
    type: TransactionType;
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
  }
  