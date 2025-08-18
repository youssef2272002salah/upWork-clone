import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../../users/entities/user.entity';
  
  @Entity('messages')
  export class Message {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'sender_id' })
    sender: User;
  
    @ManyToOne(() => User)
    @JoinColumn({ name: 'receiver_id' })
    receiver: User;
  
    @Column({ type: 'text' })
    content: string;
  
    @CreateDateColumn({ type: 'timestamptz' })
    sent_at: Date;
  
    @Column({ type: 'boolean', default: false })
    is_read: boolean;
  }
  