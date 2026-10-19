import appDataSource from '../migrations/config/data-source.js';
import { seedOrder } from './fixtures/_order.js';

await up();

async function up() {
  const dataSource = await appDataSource.initialize();
  try {
    for (const { entity, data } of seedOrder) {
      const { columns, primaryColumns } =
        dataSource.getRepository(entity).metadata;
      const insertColumns = columns.map((column) => column.propertyName);
      const overwriteColumns = columns
        .map((column) => column.databaseName)
        .filter(
          (column) => !primaryColumns.some((pk) => pk.databaseName === column),
        );
      const conflictTarget = primaryColumns.map(
        (column) => column.databaseName,
      );

      await dataSource.transaction((manager) =>
        manager
          .createQueryBuilder()
          .insert()
          .into(entity, insertColumns)
          .values(data)
          .orUpdate(overwriteColumns, conflictTarget)
          .execute(),
      );
    }
  } finally {
    await dataSource.destroy();
  }
}
