import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { MembershipPackage } from 'src/membership-packages/entities/membership-package.entity';

export enum RegistrationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('member_registrations')
export class Registration {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => MembershipPackage)
  @JoinColumn({ name: 'package_id' })
  package: MembershipPackage;

  @Column()
  payment_screenshot_url: string;

  @Column({
    type: 'enum',
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  registration_status: RegistrationStatus;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
