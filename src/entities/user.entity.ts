import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  BaseEntity,
} from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: number;

  @Column({ type: 'varchar', length: 256 })
  secretKey?: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(init?: Partial<User>) {
    super();
    Object.assign(this, init);
  }
}
