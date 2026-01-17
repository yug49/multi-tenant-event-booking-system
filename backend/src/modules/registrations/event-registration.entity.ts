import { Entity, Column, ManyToOne, JoinColumn, Index, Check, Unique } from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';

@Entity('event_registrations')
@Index(['eventId'])
@Index(['userId'])
@Unique(['eventId', 'userId'])
@Check(`("user_id" IS NOT NULL AND "external_email" IS NULL) OR ("user_id" IS NULL AND "external_email" IS NOT NULL)`)
export class EventRegistration extends BaseEntity {
  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'user_id', nullable: true })
  userId: string | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'external_email', length: 255, nullable: true })
  externalEmail: string | null;

  @Column({ name: 'checkin_time', type: 'timestamp with time zone', nullable: true })
  checkinTime: Date | null;

  @Column({ name: 'registered_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  registeredAt: Date;
}
