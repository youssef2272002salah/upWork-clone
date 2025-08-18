import { Permission } from 'src/permissions/entities/permission.entity';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Unique,
    JoinTable,
    ManyToMany,
  } from 'typeorm';
  
  

  @Entity('roles')
  @Unique(['name']) // Ensure each role name is unique
  export class Role {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ type: 'text' })
    name: string; // 'admin', 'freelancer', 'client', 'support'
  
    @Column({ type: 'text', nullable: true })
    description: string;
  
    @CreateDateColumn({ type: 'timestamptz' })
    created_at: Date;
/*
many-to-many mapping: roles can have many permissions, and permissions can belong to many roles.
*/
    @ManyToMany(() => Permission, { cascade: true })
    @JoinTable({
      name: 'role_permissions',
      joinColumn: { name: 'role_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
    })
    permissions: Permission[];

    
  }
  