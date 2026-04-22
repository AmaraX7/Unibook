import { ChildEntity, Column } from 'typeorm';
import { Resource } from './resource.entity';



@ChildEntity('Room')
export class Room extends Resource {

@Column()
capacity!: number;

@Column()
floor!: number;

@Column()
building!: string;

@Column()
hasCampusView!: boolean;

@Column()
hasTV!: boolean;

}


 