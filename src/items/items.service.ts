import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';


//hace falta consistencia entre el dto y la interfaz
export interface Item {
  id: number;
  name: string;
  description?: string;  // opcional, igual que en el DTO
  category: string;
  totalStock: number;
  availableStock: number;
  price: number;
}

@Injectable()
export class ItemsService {
private items: Item[] = [
  { id: 1, name: 'Laptop',     description: 'Gaming laptop',       category: 'Electronics', totalStock: 10, availableStock: 8,  price: 999 },
  { id: 2, name: 'Mouse',      description: 'Wireless mouse',      category: 'Electronics', totalStock: 50, availableStock: 45, price: 29  },
  { id: 3, name: 'Keyboard',   description: 'Mechanical keyboard', category: 'Electronics', totalStock: 30, availableStock: 28, price: 79  },
  { id: 4, name: 'Monitor',    description: '4K display',          category: 'Electronics', totalStock: 15, availableStock: 10, price: 399 },
  { id: 5, name: 'Headphones', description: 'Noise cancelling',    category: 'Audio',       totalStock: 20, availableStock: 18, price: 199 },
];
  
      findAll(): Item[] {
    return this.items;
  }

    create(dto: CreateItemDto): Item {
    const newItem: Item = {
      id: this.items.length + 1, //  id basado en longitud del array
      ...dto,                     // los 3 puntos copia todos los campos del DTO al objeto
    };

    this.items.push(newItem);
    return newItem;
  }

  update(id: number, dto: UpdateItemDto): Item {
    const itemIndex = this.items.findIndex(item => item.id === id);
    if (itemIndex === -1) {
      throw new NotFoundException('Item not found'); // para error 404 si no se encuentra el item
    }   
    else {
        const updatedItem = { ...this.items[itemIndex], ...dto }; // con los 3 puntos se mergea del item existente con los nuevos datos
        this.items[itemIndex] = updatedItem;
        return updatedItem;
    }

  }
}
