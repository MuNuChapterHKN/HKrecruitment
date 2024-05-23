import { count } from 'console';

export const mockedRepository = {
  find: jest.fn(),
  findBy: jest.fn(),
  remove: jest.fn(),
  save: jest.fn(),
  count: jest.fn(),
};
