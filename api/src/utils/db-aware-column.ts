import { Column, ColumnOptions } from 'typeorm';

/**
 * Decorator function that uses 'varchar' as the column type in the testing environment.
 * This is necessary as sqlite does not support custom classes as column types.
 * If not in a test environment, it returns a column with its original type.
 * 
 * @param type - The type of the column.
 * @param columnOptions - The options for the column.
 * @returns The column definition.
 */
export function DbAwareColumn(type: (t?: any) => Function, columnOptions: ColumnOptions) {
    if (process.env.NODE_ENV === 'test')
        return Column('varchar', columnOptions);
    return Column(type, columnOptions);
}