import { db } from './db';

async function testDatabase() {
  try {
    const users = await db.orm.public.User
      .where({})
      .all();

    console.log('Database connection successful.');
    console.log('Users:', users);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testDatabase();
