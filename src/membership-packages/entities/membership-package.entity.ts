import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Registration } from 'src/registrations/entities/registration.entity';
import { Subscription } from 'src/subscriptions/entities/subscription.entity';

@Entity('membership_packages')
export class MembershipPackage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  duration_days: number;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Registration, (reg) => reg.package)
  registrations: Registration[];

  @OneToMany(() => Subscription, (sub) => sub.package)
  subscriptions: Subscription[];
}
