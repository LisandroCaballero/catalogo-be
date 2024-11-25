import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const latestProduct = await this.productRepository.find({
      order: { id: 'DESC' },
      take: 1,
    });

    let newCode = 'Art0000';

    if (latestProduct.length > 0) {
      const lastCode = latestProduct[0].code || 'Art0000'; // Manejar el caso donde el último código es nulo
      const lastNumber = parseInt(lastCode.replace('Art', ''), 10) || 0;
      newCode = `Art${(lastNumber + 1).toString().padStart(4, '0')}`;
    }

    const product = this.productRepository.create({
      ...createProductDto,
      code: newCode,
    });

    try {
      return await this.productRepository.save(product);
    } catch (error) {
      console.error('Error creating product:', error.message);
      throw error;
    }
  }

  findAll() {
    return this.productRepository.find();
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);
    this.productRepository.merge(product, updateProductDto);
    return this.productRepository.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    return this.productRepository.remove(product);
  }
}
