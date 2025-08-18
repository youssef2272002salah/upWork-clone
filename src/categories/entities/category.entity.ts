import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Job } from '../../jobs/entities/job.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number; // SERIAL PRIMARY KEY

  @Column({ type: 'text', unique: true })
  name: string; // TEXT UNIQUE NOT NULL

  @Column({ type: 'text', nullable: true })
  description: string;
/*
Says:
“Each category can have one parent category.”

In the database:
Creates a parent_id column that references categories.id.

{ nullable: true } means top-level categories don’t need a parent.

*/
  @ManyToOne(() => Category, (category) => category.children, { nullable: true })
  parent: Category; // parent_id INT REFERENCES categories(id)

/*
Says:
“Each category can have many child categories.”

It’s the inverse side of parent.

TypeORM uses it when you load related entities (it’s not a physical column — it’s mapped from the parent relation).

*/

  @OneToMany(() => Category, (category) => category.parent)
  children: Category[];

  @OneToMany(() => Job, (job) => job.category)
  jobs: Job[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt: Date;

}
