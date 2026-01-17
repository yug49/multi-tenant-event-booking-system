import { Entity, Column, ManyToOne, JoinColumn, Index, Check } from 'typeorm';
import { BaseEntity } from '../../common/entities';
import { Organization } from '../organizations/organization.entity';
import { ResourceType } from '../../common/enums';

@Entity('resources')
@Index(['organizationId'])
@Check(`"type" IN ('EXCLUSIVE', 'SHAREABLE', 'CONSUMABLE')`)
@Check(`"is_global" = false OR "organization_id" IS NULL`)
@Check(`"type" != 'SHAREABLE' OR "max_concurrent_usage" IS NOT NULL`)
@Check(`"type" != 'CONSUMABLE' OR "available_quantity" IS NOT NULL`)
export class Resource extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
  })
  type: ResourceType;

  @Column({ type: 'uuid', name: 'organization_id', nullable: true })
  organizationId: string | null;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization | null;

  @Column({ name: 'is_global', default: false })
  isGlobal: boolean;

  @Column({ type: 'int', name: 'max_concurrent_usage', nullable: true })
  maxConcurrentUsage: number | null;

  @Column({ type: 'int', name: 'available_quantity', nullable: true })
  availableQuantity: number | null;
}
