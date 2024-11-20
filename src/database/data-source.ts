import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../auth/entities/auth.entity';
import { config } from 'dotenv';

config(); 

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
  logging: true,
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;