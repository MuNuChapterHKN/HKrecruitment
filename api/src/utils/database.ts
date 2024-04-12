import { DataSource, QueryRunner } from 'typeorm';

/**
 * Executes a transaction using the provided data source and actions.
 * @param dataSource The connection configuration to a specific database to use for the transaction.
 * @param actions The actions to perform within the transaction.
 * @returns The result of the executed actions.
 */
export async function transaction(
  dataSource: DataSource,
  actions: (queryRunner: QueryRunner) => Promise<any>,
): Promise<any> {
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
