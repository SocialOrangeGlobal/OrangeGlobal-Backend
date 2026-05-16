import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { TalentProfile } from '../../talent/entities/talent-profile.entity';
import { EmployerProfile } from '../../employer/entities/employer-profile.entity';

export enum UserRole {
  TALENT = 'TALENT',
  EMPLOYER = 'EMPLOYER',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  /** Stores a bcrypt hash of the refresh token so raw tokens are never persisted */
  @Column({ name: 'refresh_token_hash', nullable: true, type: 'text' })
  refreshTokenHash: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // ─── Relations ────────────────────────────────────────────────────────────
  @OneToOne(() => TalentProfile, (profile) => profile.user)
  talentProfile: TalentProfile;

  @OneToOne(() => EmployerProfile, (profile) => profile.user)
  employerProfile: EmployerProfile;
}
