interface QueryResults {
  findOneBy?: any;
  remove?: any;
}

class MockedDataSource {
  results = {};

  /**
   * Sets the mock results for the data source.
   *
   * @param results - An object containing the query results.
   * @returns The mocked results object.
   */
  setMockResults(results: { [key: string]: QueryResults }) {
    const mockedResults = {};
    for (const key in results)
      mockedResults[key] = this.mockResults(results[key]);
    this.results = mockedResults;
    return mockedResults;
  }

  /**
   * Creates a mock object with jest.Mock functions for each property of the input object.
   * The mock functions will return the corresponding values from the input object.
   *
   * @param results - The object containing the values to be mocked.
   * @returns An object with jest.Mock functions for each property of the input object.
   */
  mockResults<T>(results: T): { [K in keyof T]: jest.Mock<any, any> } {
    const mockedResults = {} as { [K in keyof T]: jest.Mock<any, any> };
    for (const key in results) mockedResults[key] = jest.fn(() => results[key]);
    return mockedResults;
  }

  /**
   * Creates a mock query runner.
   * @returns A mock query runner object.
   */
  createQueryRunner = jest.fn(() => {
    return {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      manager: {
        getRepository: jest.fn((entity: any) => {
          if (!this.results.hasOwnProperty(entity.name))
            throw new Error(`No results found for entity ${entity.name}`);
          return this.results[entity.name];
        }),
      },
      rollbackTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      release: jest.fn(),
    };
  });
}

export const mockDataSource = new MockedDataSource();
