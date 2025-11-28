import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { MembershipPackage } from 'src/membership-packages/entities/membership-package.entity';
import { Registration } from 'src/registrations/entities/registration.entity';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => MembershipPackage)
  @JoinColumn({ name: 'package_id' })
  package: MembershipPackage;

  @OneToOne(() => Registration)
  @JoinColumn({ name: 'registration_id' })
  registration: Registration;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  payment_amount: number;

  @Column({ nullable: true })
  payment_screenshot_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
