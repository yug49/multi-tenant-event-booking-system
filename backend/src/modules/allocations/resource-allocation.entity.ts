import { Entity, Column, ManyToOne, JoinColumn, Index, Unique, Check } from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { Event } from '../events/event.entity';
import { Resource } from '../resources/resource.entity';

@Entity('resource_allocations')
@Index(['eventId'])
@Index(['resourceId'])
@Unique(['eventId', 'resourceId'])
@Check(`"quantity_used" IS NULL OR "quantity_used" > 0`)
export class ResourceAllocation extends BaseEntity {
  @Column({ name: 'event_id' })
  eventId: string;

  @ManyToOne(() => Event, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ name: 'resource_id' })
  resourceId: string;

  @ManyToOne(() => Resource, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'resource_id' })
  resource: Resource;

  @Column({ name: 'quantity_used', nullable: true })
  quantityUsed: number | null;

  @Column({ name: 'allocated_at', type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  allocatedAt: Date;
}
