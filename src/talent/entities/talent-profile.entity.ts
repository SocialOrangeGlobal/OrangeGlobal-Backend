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

export interface EducationEntry {
  school: string;
  degree: string;
  year: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  responsibilities: string;
}

@Entity('talent_profiles')
export class TalentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'work_email', length: 255 })
  workEmail: string;

  @Column({ type: 'jsonb', nullable: true })
  location: { city: string; country: string } | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string | null;

  /** Stored as JSONB in Postgres */
  @Column({ type: 'jsonb', default: '[]' })
  educations: EducationEntry[];

  /** Stored as a simple text array */
  @Column({ type: 'text', array: true, default: '{}' })
  skills: string[];

  /** Stored as JSONB in Postgres */
  @Column({ type: 'jsonb', default: '[]' })
  experiences: ExperienceEntry[];

  @Column({ name: 'resume_url', type: 'text', nullable: true })
  resumeUrl: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ─── Relations ────────────────────────────────────────────────────────────
  @OneToOne(() => User, (user) => user.talentProfile)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
