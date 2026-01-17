import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/entities';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ length: 255 })
  name: string;

  @Column({ length: 500, nullable: true })
  description: string;
}
