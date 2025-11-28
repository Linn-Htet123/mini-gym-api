import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';
import { CheckIn } from 'src/check-ins/entities/check-in.entity';
import { Registration } from 'src/registrations/entities/registration.entity';
import { TrainerSubscription } from 'src/trainer-subscriptions/entities/trainer-subscription.entity';

@Entity('members')
export class Member {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  emergency_contact: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Registration, (reg) => reg.member)
  registrations: Registration[];

  @OneToMany(() => Subscription, (sub) => sub.member)
  subscriptions: Subscription[];

  @OneToMany(() => TrainerSubscription, (sub) => sub.member)
  trainerSubscriptions: TrainerSubscription[];

  @OneToMany(() => CheckIn, (ci) => ci.member)
  checkIns: CheckIn[];
}
