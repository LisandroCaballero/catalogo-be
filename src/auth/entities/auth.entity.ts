import { 
    Entity, 
    Column, 
    PrimaryGeneratedColumn, 
    CreateDateColumn, 
    UpdateDateColumn,
    BeforeInsert 
  } from 'typeorm';
  
  @Entity('user')
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    password: string;
  
    @Column()
    name: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    // Opcional: Hook para asegurar que isActive se establezca
    @BeforeInsert()
    setDefaults() {
      if (this.isActive === undefined) {
        this.isActive = true;
      }
    }
  }