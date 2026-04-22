import { ChildEntity, Column } from 'typeorm';
import { Resource } from './resource.entity';



@ChildEntity('lab-equipment')
export class LabEquipment extends Resource {

@Column()
materialtype!: string;

@Column()
requirestraining!: boolean;

}
