import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TimeSlotsService } from './timeslots.service';
import { UsersService } from '../users/users.service';
import { AvailabilityService } from '../availability/availability.service';
import { RecruitmentSessionService } from '../recruitment-session/recruitment-session.service';
import { Availability } from 'src/availability/availability.entity';
import { createApp, getAccessToken } from 'test/app.e2e-spec';
import {
  mockAvailability,
  mockRecruitmentSessions,
  mockTimeSlots,
  mockUsers,
} from '../mocks/db-data';

describe('TimeslotsController', () => {
  let app: INestApplication;
  let newMemberToken: string;
  let timeSlotsService: TimeSlotsService;
  let usersService: UsersService;
  let availabilityService: AvailabilityService;
  let recruitmentSessionService: RecruitmentSessionService;

  beforeAll(async () => {
    newMemberToken = await getAccessToken('newMember');
  });

  beforeEach(async () => {
    app = await createApp();
    timeSlotsService = app.get<TimeSlotsService>(TimeSlotsService);
    availabilityService = app.get<AvailabilityService>(AvailabilityService);
    recruitmentSessionService = app.get<RecruitmentSessionService>(
      RecruitmentSessionService,
    );
    usersService = app.get<UsersService>(UsersService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /timeslots', () => {
    beforeEach(async () => {
      for (const user of mockUsers) {
        await usersService.create(user);
      }

      for (const rs of mockRecruitmentSessions) {
        await recruitmentSessionService.createRecruitmentSession(rs);
      }

      for (const ts of mockTimeSlots) {
        const timeSlot = {
          ...ts,
          recruitmentSession: mockRecruitmentSessions[2],
          availabilities: [] as Availability[],
        };
        await timeSlotsService.createTimeSlot(timeSlot);
      }

      for (const a of mockAvailability) {
        const availability = {
          id: a.id,
          state: a.state,
          lastModified: a.lastModified,
          timeSlot: timeSlotsService.findById(a.timeSlot),
          user: mockUsers.find((u) => u.oauthId === a.userOauthId),
        } as unknown as Availability;
        await availabilityService.createAvailability(availability);
      }
    });

    it('there should be users in the db', async () => {
      const allUsers = await usersService.findAll();
      expect(allUsers).toHaveLength(mockUsers.length);
    });

    it('there should be recruitment sessions in the db', async () => {
      const allRecruitmentSessions =
        await recruitmentSessionService.findAllRecruitmentSessions();
      expect(allRecruitmentSessions).toHaveLength(
        mockRecruitmentSessions.length,
      );
    });

    it('there should be timeslots in the db', async () => {
      const allTimeSlots = await timeSlotsService.listTimeSlots();
      expect(allTimeSlots).toHaveLength(mockTimeSlots.length);
    });

    it('there should be availabilities in the db', async () => {
      const allAvailabilities = await availabilityService.listAvailabilities();
      expect(allAvailabilities).toHaveLength(mockAvailability.length);
    });

    // it('DEBUG: check availabilities for timeslot having id 71 & 73', async () => {
    //   const allAvailabilities = await availabilityService.listAvailabilities();
    //   const av71 = allAvailabilities.filter((a) => a.timeSlot.id === 71);
    //   const av73 = allAvailabilities.filter((a) => a.timeSlot.id === 73);
    //   expect(av71).toHaveLength(4);
    //   expect(av73).toHaveLength(2);
    // });

    // it('should return all available timeslots', async () => {
    //   const expected = [
    //     {
    //       end: '2024-05-19T14:00:00.000Z',
    //       id: 71,
    //       start: '2024-05-19T13:00:00.000Z',
    //     },
    //     {
    //       end: '2024-05-19T16:00:00.000Z',
    //       id: 73,
    //       start: '2024-05-19T15:00:00.000Z',
    //     },
    //   ];
    //   await request(app.getHttpServer())
    //     .get('/timeslots')
    //     .set('Authorization', `Bearer ${newMemberToken}`)
    //     .expect(200)
    //     .expect((res) => {
    //       expect(res.body).toBeInstanceOf(Array);
    //       expect(res.body).toHaveLength(2);
    //       expect(res.body).toEqual(expected);
    //     });
    // });
  });
});
