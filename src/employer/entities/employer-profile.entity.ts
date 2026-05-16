import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('employer_profiles')
export class EmployerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ name: 'business_phone', length: 50, nullable: true })
  businessPhone: string | null;

  @Column({ name: 'business_email', length: 255 })
  businessEmail: string;

  @Column({ name: 'company_name', length: 255 })
  companyName: string;

  @Column({ name: 'job_title', length: 255, nullable: true })
  jobTitle: string | null;

  @Column({ name: 'job_title_to_hire', length: 255, nullable: true })
  jobTitleToHire: string | null;

  @Column({ name: 'zip_code', length: 20, nullable: true })
  zipCode: string | null;

  @Column({ name: 'position_type', length: 100, nullable: true })
  positionType: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ─── Relations ────────────────────────────────────────────────────────────
  @OneToOne(() => User, (user) => user.employerProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
