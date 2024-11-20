import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/auth.entity';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createAuthDto: CreateAuthDto, res: Response) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: createAuthDto.email }
      });

      if (existingUser) {
        throw new UnauthorizedException('El email ya está registrado');
      }

      const { password, ...userData } = createAuthDto;
      
      const user = this.userRepository.create({
        ...userData,
        password: await bcrypt.hash(password, 10)
      });

      await this.userRepository.save(user);

      const { password: _, ...result } = user;
      const token = this.getJwtToken({ id: user.id });

      // Establecer cookie
      this.setAuthCookie(res, token);

      return {
        user: result,
        token
      };
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async login(loginDto: LoginDto, res: Response) {
    try {
      const { email, password } = loginDto;

      const user = await this.userRepository.findOne({
        where: { email }
      });

      if (!user) {
        throw new UnauthorizedException('Credenciales no válidas');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        throw new UnauthorizedException('Credenciales no válidas');
      }

      const { password: _, ...result } = user;
      const token = this.getJwtToken({ id: user.id });

      // Establecer cookie
      this.setAuthCookie(res, token);

      return {
        user: result,
        token
      };
    } catch (error) {
      this.logger.error('Error in login:', error);
      throw error;
    }
  }

  async checkAuth(id: number, res: Response) {
    try {
      const user = await this.userRepository.findOne({
        where: { id }
      });

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const { password: _, ...result } = user;
      const token = this.getJwtToken({ id: user.id });

      // Establecer cookie
      this.setAuthCookie(res, token);

      return {
        user: result,
        token
      };
    } catch (error) {
      this.logger.error('Error checking auth:', error);
      throw error;
    }
  }

  private getJwtToken(payload: { id: number }) {
    return this.jwtService.sign(payload);
  }

  private setAuthCookie(res: Response, token: string) {
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      path: '/',
    });
  }

  async logout(res: Response) {
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return { message: 'Logout successful' };
  }
}