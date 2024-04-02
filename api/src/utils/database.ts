import { DataSource, QueryRunner } from 'typeorm';

export async function transaction(
  dataSource: DataSource,
  actions: (queryRunner: QueryRunner) => Promise<any>,
) {
  // BEGIN TRANSACTION
  const queryRunner = dataSource.createQueryRunner();

  await queryRunner.connect();
  await queryRunner.startTransaction();
  let result: any;

  try {
    result = await actions(queryRunner);
    // COMMIT TRANSACTION
    await queryRunner.commitTransaction();
  } catch (err) {
    // ROLLBACK TRANSACTION
    await queryRunner.rollbackTransaction();
    throw err;
  } finally {
    await queryRunner.release();
  }

  return result;
}
