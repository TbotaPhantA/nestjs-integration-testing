import appDataSource from '../migrations/config/data-source.js';
import { seedOrder } from './fixtures/_order.js';

await up();

async function up() {
  const dataSource = await appDataSource.initialize();
  try {
    for (const { entity, data } of seedOrder) {
      const repo = dataSource.getRepository(entity);
      const columns = repo.metadata.columns.map((c) => c.propertyName);
      await dataSource.transaction(async (manager) =>
        manager
          .createQueryBuilder()
          .insert()
          .into(entity, columns)
          .values(data)
          .orIgnore()
          .execute(),
      );
    }
  } finally {
    await dataSource.destroy();
  }
}