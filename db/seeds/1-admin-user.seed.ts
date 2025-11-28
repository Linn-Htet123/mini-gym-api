import { DataSource } from 'typeorm';
import { User, UserRole } from '../../src/users/entities/user.entity';
import * as bcrypt from 'bcrypt';

export class AdminUserSeed {
  public async run(dataSource: DataSource): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@gym.com' },
    });

    if (existingAdmin) {
      console.log('✓ Admin user already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    const admin = userRepository.create({
      email: 'admin@gym.com',
      password_hash: hashedPassword,
      role: UserRole.ADMIN,
    });

    await userRepository.save(admin);

    console.log('✓ Admin user created successfully');
    console.log('  Email: admin@gym.com');
    console.log('  Password: Admin@123');
    console.log('  ⚠️  Please change the password after first login!');
  }
}
