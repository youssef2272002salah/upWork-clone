import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Unique,
  } from 'typeorm';
  
  @Entity('permissions')
  @Unique(['name']) // Ensure no duplicate permission names
  export class Permission {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'text' })
    name: string; // e.g. 'create_job', 'submit_proposal'
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
  }
  