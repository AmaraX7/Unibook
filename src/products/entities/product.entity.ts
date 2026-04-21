import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn() // id autoincremental como serial en SQL
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  category!: string;

  @Column()
  stock!: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;
}