import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';

export enum NotificationType {
  REGISTRATION_SUBMITTED = 'registration_submitted',
  REGISTRATION_APPROVED = 'registration_approved',
  REGISTRATION_REJECTED = 'registration_rejected',
  SUBSCRIPTION_EXPIRING = 'subscription_expiring',
  SUBSCRIPTION_EXPIRED = 'subscription_expired',
  MEMBERSHIP_REGISTERED = 'membership_registered',
  CHECK_IN_DENIED = 'check_in_denied',
  CHECK_IN_SUCCESS = 'check_in_success',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column()
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data: any;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
