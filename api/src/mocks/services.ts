import { TimeSlotsService } from 'src/timeslots/timeslots.service';
import { UsersService } from 'src/users/users.service';

function classToMock<T>(classToMock: any): Object {
  const mockedService = {};
  Object.getOwnPropertyNames(classToMock.prototype).forEach((methodName) => {
    mockedService[methodName] = jest.fn();
  });
  return mockedService;
}

export const mockedUsersService = classToMock(UsersService);
export const mockedTimeSlotsService = classToMock(TimeSlotsService);
