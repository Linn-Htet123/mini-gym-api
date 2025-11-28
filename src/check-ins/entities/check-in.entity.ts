import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

export enum CheckInStatus {
  ALLOWED = 'allowed',
  DENIED = 'denied',
}

@Entity('check_ins')
export class CheckIn {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Subscription, { nullable: true })
  @JoinColumn({ name: 'subscription_id' })
  subscription: Subscription | null;

  @CreateDateColumn()
  check_in_time: Date;

  @Column({
    type: 'enum',
    enum: CheckInStatus,
  })
  check_in_status: CheckInStatus;

  @Column({ type: 'text', nullable: true })
  denial_reason: string | null;
}
