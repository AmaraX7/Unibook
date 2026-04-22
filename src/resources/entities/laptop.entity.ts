import { ChildEntity, Column } from 'typeorm';
import { Resource } from './resource.entity';



@ChildEntity('laptop')
export class Laptop extends Resource {

@Column()
brand!: string;

@Column()
ram!: number;

@Column()
storage!: number;

@Column()
os!: string;

}