import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

// OPERACIONES TYPEORM a SQL 

// // SELECT * FROM products
// this.productsRepository.find();

// // SELECT * FROM products WHERE category = 'Electronics'
// this.productsRepository.find({ where: { category: 'Electronics' } });

// // SELECT * FROM products WHERE id = 1 LIMIT 1
// this.productsRepository.findOne({ where: { id: 1 } });

// // INSERT INTO products (name, price) VALUES ('Laptop', 999)
// const product = this.productsRepository.create(dto);
// this.productsRepository.save(product);

// // UPDATE products SET price = 500 WHERE id = 1
// const product = await this.productsRepository.findOne({ where: { id: 1 } });
// Object.assign(product, { price: 500 });
// this.productsRepository.save(product);

// // DELETE FROM products WHERE id = 1
// this.productsRepository.delete(1);

// // SELECT COUNT(*) FROM products
// this.productsRepository.count();

// // SELECT * FROM products WHERE price > 100 ORDER BY price ASC LIMIT 10
// this.productsRepository.find({
//   where: { price: MoreThan(100) },  // necesita import de typeorm
//   order: { price: 'ASC' },
//   take: 10,                         // LIMIT
// });

// // SELECT * FROM products WHERE price > 100 ORDER BY price ASC LIMIT 10 OFFSET 20
// this.productsRepository.find({
//   where: { price: MoreThan(100) },
//   order: { price: 'ASC' },
//   take: 10,   // LIMIT
//   skip: 20,   // OFFSET — para paginación
// });

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async findAll(): Promise<Product[]> {
  return this.productsRepository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product #${id} not found`);
    return product;
  }

  async deleteOne(id: number): Promise<void> {
    await this.findOne(id); // lanza NotFoundException si no existe
    await this.productsRepository.delete(id);
  }

  async deleteAll(): Promise<void> {
    await this.productsRepository.clear();
  }

  async create(dto: CreateProductDto): Promise<Product> {
  const product = this.productsRepository.create(dto);
  return this.productsRepository.save(product);
  }

  async update(id: number, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return this.productsRepository.save(product);
  }
}