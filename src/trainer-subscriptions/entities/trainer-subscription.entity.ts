import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Member } from 'src/members/entities/member.entity';
import { Trainer } from 'src/trainers/entities/trainer.entity';
export enum TrainerSubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('trainer_subscriptions')
export class TrainerSubscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Member)
  @JoinColumn({ name: 'member_id' })
  member: Member;

  @ManyToOne(() => Trainer)
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({
    type: 'enum',
    enum: TrainerSubscriptionStatus,
    default: TrainerSubscriptionStatus.ACTIVE,
  })
  status: TrainerSubscriptionStatus;

  @Column('decimal', { precision: 10, scale: 2 })
  payment_amount: number;

  @Column({ nullable: true })
  payment_screenshot_url: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
