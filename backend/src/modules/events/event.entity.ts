import { Entity, Column, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { Organization } from '../organizations/organization.entity';

@Entity('events')
@Index(['organizationId'])
@Index(['startTime', 'endTime'])
@Index(['parentEventId'])
@Check(`"end_time" > "start_time"`)
export class Event extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description: string;

  @Column({ name: 'start_time', type: 'timestamp with time zone' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'timestamp with time zone' })
  endTime: Date;

  @Column()
  capacity: number;

  @Column({ name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'uuid', name: 'parent_event_id', nullable: true })
  parentEventId: string | null;

  @ManyToOne(() => Event, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_event_id' })
  parentEvent: Event | null;
}
