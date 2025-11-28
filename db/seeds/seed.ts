import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../datasource';
import { AdminUserSeed } from './1-admin-user.seed';

async function runSeeds() {
  const dataSource = new DataSource(dataSourceOptions);

  try {
    await dataSource.initialize();
    console.log('📦 Database connected from seed.ts');
    console.log('\n🌱 Running seeds...\n');

    const adminSeed = new AdminUserSeed();
    await adminSeed.run(dataSource);

    console.log('\n✅ All seeds completed successfully!\n');
  } catch (error) {
    console.error('❌ Error running seeds:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

runSeeds();
