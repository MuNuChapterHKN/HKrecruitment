import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TimeSlotsService } from './timeslots.service';
import { UsersService } from '../users/users.service';
import { AvailabilityService } from '../availability/availability.service';
import { RecruitmentSessionService } from '../recruitment-session/recruitment-session.service';
import {
  Person,
  Role,
  TimeSlot,
  AvailabilityState,
  RecruitmentSessionState,
} from '@hkrecruitment/shared';
import { RecruitmentSession } from 'src/recruitment-session/recruitment-session.entity';
import { Availability } from 'src/availability/availability.entity';
import { createApp, getAccessToken } from 'test/app.e2e-spec';

describe('TimeslotsController', () => {
  let app: INestApplication;
  let newMemberToken: string;
  let timeSlotsService: TimeSlotsService;
  let usersService: UsersService;
  let availabilityService: AvailabilityService;
  let recruitmentSessionService: RecruitmentSessionService;
  let mockUsers: Person[];
  let mockTimeSlots: TimeSlot[];
  let mockRecruitmentSessions: RecruitmentSession[];
  let mockAvailability: Availability[];

  beforeAll(async () => {
    newMemberToken = await getAccessToken('newMember');

    mockRecruitmentSessions = [
      {
        id: 1,
        state: RecruitmentSessionState.Concluded,
        slotDuration: 1,
        lastModified: new Date('2024-04-10'),
        createdAt: new Date('2024-04-04'),
        days: [
          new Date('2024-04-05'),
          new Date('2024-04-06'),
          new Date('2024-04-07'),
          new Date('2024-04-08'),
          new Date('2024-04-09'),
        ],
        interviewStart: new Date('2024-04-05'),
        interviewEnd: new Date('2024-04-10'),
      },
      {
        id: 2,
        state: RecruitmentSessionState.Concluded,
        slotDuration: 1,
        lastModified: new Date('2024-05-10'),
        createdAt: new Date('2024-05-04'),
        days: [
          new Date('2024-05-05'),
          new Date('2024-05-06'),
          new Date('2024-05-07'),
          new Date('2024-05-08'),
        ],
        interviewStart: new Date('2024-05-05'),
        interviewEnd: new Date('2024-05-09'),
      },
      {
        id: 3,
        state: RecruitmentSessionState.Active,
        slotDuration: 1,
        lastModified: new Date('2024-05-14'),
        createdAt: new Date('2024-05-14'),
        days: [
          new Date('2024-05-16'),
          new Date('2024-05-17'),
          new Date('2024-05-18'),
          new Date('2024-05-19'),
          new Date('2024-05-20'),
        ],
        interviewStart: new Date('2024-05-16'),
        interviewEnd: new Date('2024-05-21'),
      },
    ];

    mockUsers = [
      {
        oauthId: '1',
        firstName: 'Pasquale',
        lastName: 'Bianco',
        sex: 'M',
        email: 'p.bianco@gmail.com',
        role: Role.Member,
        is_board: true,
        is_expert: true,
      },
      {
        oauthId: '2',
        firstName: 'John',
        lastName: 'Doe',
        sex: 'M',
        email: 'j.doe@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: true,
      },
      {
        oauthId: '3',
        firstName: 'Jane',
        lastName: 'Smith',
        sex: 'F',
        email: 'j.smith@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '4',
        firstName: 'Michael',
        lastName: 'Johnson',
        sex: 'M',
        email: 'm.johnson@gmail.com',
        role: Role.Member,
        is_board: true,
        is_expert: true,
      },
      {
        oauthId: '5',
        firstName: 'Emily',
        lastName: 'Brown',
        sex: 'F',
        email: 'e.brown@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: true,
      },
      {
        oauthId: '6',
        firstName: 'David',
        lastName: 'Wilson',
        sex: 'M',
        email: 'd.wilson@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '7',
        firstName: 'Olivia',
        lastName: 'Johnson',
        sex: 'F',
        email: 'o.johnson@gmail.com',
        role: Role.Member,
        is_board: true,
        is_expert: false,
      },
      {
        oauthId: '8',
        firstName: 'James',
        lastName: 'Smith',
        sex: 'M',
        email: 'j.smith@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '9',
        firstName: 'Sophia',
        lastName: 'Miller',
        sex: 'F',
        email: 's.miller@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: true,
      },
      {
        oauthId: '10',
        firstName: 'Benjamin',
        lastName: 'Davis',
        sex: 'M',
        email: 'b.davis@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '11',
        firstName: 'Ava',
        lastName: 'Wilson',
        sex: 'female',
        email: 'a.wilson@gmail.com',
        role: Role.Member,
        is_board: true,
        is_expert: true,
      },
      {
        oauthId: '12',
        firstName: 'William',
        lastName: 'Anderson',
        sex: 'M',
        email: 'w.anderson@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '13',
        firstName: 'Mia',
        lastName: 'Thomas',
        sex: 'F',
        email: 'm.thomas@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '14',
        firstName: 'Alexander',
        lastName: 'Taylor',
        sex: 'M',
        email: 'a.taylor@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: true,
      },
      {
        oauthId: '15',
        firstName: 'Charlotte',
        lastName: 'Clark',
        sex: 'F',
        email: 'c.clark@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '16',
        firstName: 'Daniel',
        lastName: 'Moore',
        sex: 'M',
        email: 'd.moore@gmail.com',
        role: Role.Member,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '17',
        firstName: 'Amelia',
        lastName: 'Walker',
        sex: 'F',
        email: 'a.walker@gmail.com',
        role: Role.Clerk,
        is_board: false,
        is_expert: false,
      },
      {
        oauthId: '18',
        firstName: 'Matthew',
        lastName: 'Lewis',
        sex: 'M',
        email: 'm.lewis@gmail.com',
        role: Role.Admin,
        is_board: false,
        is_expert: true,
      },
      {
        oauthId: '19',
        firstName: 'Ella',
        lastName: 'Harris',
        sex: 'F',
        email: 'e.harris@gmail.com',
        role: Role.Supervisor,
        is_board: false,
        is_expert: true,
      },
      {
        oauthId: '20',
        firstName: 'Joseph',
        lastName: 'King',
        sex: 'M',
        email: 'j.king@gmail.com',
        role: Role.Supervisor,
        is_board: true,
        is_expert: false,
      },
    ];

    mockTimeSlots = [
      {
        id: 51,
        start: new Date('2024-05-16 10:00:00'),
        end: new Date('2024-05-16 11:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 52,
        start: new Date('2024-05-16 11:00:00'),
        end: new Date('2024-05-16 12:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 53,
        start: new Date('2024-05-16 15:00:00'),
        end: new Date('2024-05-16 16:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 54,
        start: new Date('2024-05-16 16:00:00'),
        end: new Date('2024-05-16 17:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 55,
        start: new Date('2024-05-16 17:00:00'),
        end: new Date('2024-05-16 18:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 56,
        start: new Date('2024-05-16 18:00:00'),
        end: new Date('2024-05-16 19:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 57,
        start: new Date('2024-05-17 10:00:00'),
        end: new Date('2024-05-17 11:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 58,
        start: new Date('2024-05-17 11:00:00'),
        end: new Date('2024-05-17 12:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 59,
        start: new Date('2024-05-17 15:00:00'),
        end: new Date('2024-05-17 16:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 60,
        start: new Date('2024-05-17 16:00:00'),
        end: new Date('2024-05-17 17:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 61,
        start: new Date('2024-05-17 17:00:00'),
        end: new Date('2024-05-17 18:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 62,
        start: new Date('2024-05-17 18:00:00'),
        end: new Date('2024-05-17 19:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 63,
        start: new Date('2024-05-18 10:00:00'),
        end: new Date('2024-05-18 11:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 64,
        start: new Date('2024-05-18 11:00:00'),
        end: new Date('2024-05-18 12:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 65,
        start: new Date('2024-05-18 15:00:00'),
        end: new Date('2024-05-18 16:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 66,
        start: new Date('2024-05-18 16:00:00'),
        end: new Date('2024-05-18 17:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 67,
        start: new Date('2024-05-18 17:00:00'),
        end: new Date('2024-05-18 18:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 68,
        start: new Date('2024-05-18 18:00:00'),
        end: new Date('2024-05-18 19:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 69,
        start: new Date('2024-05-19 10:00:00'),
        end: new Date('2024-05-19 11:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 70,
        start: new Date('2024-05-19 11:00:00'),
        end: new Date('2024-05-19 12:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 71,
        start: new Date('2024-05-19 15:00:00'),
        end: new Date('2024-05-19 16:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 72,
        start: new Date('2024-05-19 16:00:00'),
        end: new Date('2024-05-19 17:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 73,
        start: new Date('2024-05-19 17:00:00'),
        end: new Date('2024-05-19 18:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 74,
        start: new Date('2024-05-19 18:00:00'),
        end: new Date('2024-05-19 19:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 75,
        start: new Date('2024-05-20 10:00:00'),
        end: new Date('2024-05-20 11:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 76,
        start: new Date('2024-05-20 11:00:00'),
        end: new Date('2024-05-20 12:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 77,
        start: new Date('2024-05-20 15:00:00'),
        end: new Date('2024-05-20 16:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 78,
        start: new Date('2024-05-20 16:00:00'),
        end: new Date('2024-05-20 17:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 79,
        start: new Date('2024-05-20 17:00:00'),
        end: new Date('2024-05-20 18:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
      {
        id: 80,
        start: new Date('2024-05-20 18:00:00'),
        end: new Date('2024-05-20 19:00:00'),
        recruitmentSession: mockRecruitmentSessions[2],
      },
    ];

    mockAvailability = [
      {
        id: 1,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 51,
        userOauthId: '5',
      } as unknown as Availability,
      {
        id: 2,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 53,
        userOauthId: '7',
      } as unknown as Availability,
      {
        id: 3,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 55,
        userOauthId: '12',
      } as unknown as Availability,
      {
        id: 4,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 61,
        userOauthId: '19',
      } as unknown as Availability,
      {
        id: 5,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '3',
      } as unknown as Availability,
      {
        id: 6,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 78,
        userOauthId: '15',
      } as unknown as Availability,
      {
        id: 7,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 58,
        userOauthId: '11',
      } as unknown as Availability,
      {
        id: 8,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 57,
        userOauthId: '8',
      } as unknown as Availability,
      {
        id: 9,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 64,
        userOauthId: '5',
      } as unknown as Availability,
      {
        id: 10,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 53,
        userOauthId: '17',
      } as unknown as Availability,
      {
        id: 11,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 62,
        userOauthId: '2',
      } as unknown as Availability,
      {
        id: 12,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '9',
      } as unknown as Availability,
      {
        id: 13,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 72,
        userOauthId: '14',
      } as unknown as Availability,
      {
        id: 14,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 74,
        userOauthId: '6',
      } as unknown as Availability,
      {
        id: 15,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 75,
        userOauthId: '13',
      } as unknown as Availability,
      {
        id: 16,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 74,
        userOauthId: '10',
      } as unknown as Availability,
      {
        id: 17,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '4',
      } as unknown as Availability,
      {
        id: 18,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 64,
        userOauthId: '16',
      } as unknown as Availability,
      {
        id: 19,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 59,
        userOauthId: '18',
      } as unknown as Availability,
      {
        id: 20,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 57,
        userOauthId: '1',
      } as unknown as Availability,
      {
        id: 21,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 66,
        userOauthId: '20',
      } as unknown as Availability,
      {
        id: 22,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 68,
        userOauthId: '19',
      } as unknown as Availability,
      {
        id: 23,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 69,
        userOauthId: '7',
      } as unknown as Availability,
      {
        id: 24,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 70,
        userOauthId: '16',
      } as unknown as Availability,
      {
        id: 25,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 72,
        userOauthId: '15',
      } as unknown as Availability,
      {
        id: 26,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 73,
        userOauthId: '11',
      } as unknown as Availability,
      {
        id: 27,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 75,
        userOauthId: '14',
      } as unknown as Availability,
      {
        id: 28,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 76,
        userOauthId: '9',
      } as unknown as Availability,
      {
        id: 29,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 77,
        userOauthId: '8',
      } as unknown as Availability,
      {
        id: 30,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 78,
        userOauthId: '10',
      } as unknown as Availability,
      {
        id: 31,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 79,
        userOauthId: '13',
      } as unknown as Availability,
      {
        id: 32,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 80,
        userOauthId: '12',
      } as unknown as Availability,
      {
        id: 33,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 79,
        userOauthId: '20',
      } as unknown as Availability,
      {
        id: 34,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 78,
        userOauthId: '18',
      } as unknown as Availability,
      {
        id: 35,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 77,
        userOauthId: '17',
      } as unknown as Availability,
      {
        id: 36,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 76,
        userOauthId: '19',
      } as unknown as Availability,
      {
        id: 37,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 75,
        userOauthId: '16',
      } as unknown as Availability,
      {
        id: 38,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 74,
        userOauthId: '15',
      } as unknown as Availability,
      {
        id: 39,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 73,
        userOauthId: '14',
      } as unknown as Availability,
      {
        id: 40,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 72,
        userOauthId: '13',
      } as unknown as Availability,
      {
        id: 41,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '12',
      } as unknown as Availability,
      {
        id: 42,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 70,
        userOauthId: '11',
      } as unknown as Availability,
      {
        id: 43,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 69,
        userOauthId: '10',
      } as unknown as Availability,
      {
        id: 44,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 68,
        userOauthId: '9',
      } as unknown as Availability,
      {
        id: 45,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 67,
        userOauthId: '8',
      } as unknown as Availability,
      {
        id: 46,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 66,
        userOauthId: '7',
      } as unknown as Availability,
      {
        id: 47,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 65,
        userOauthId: '6',
      } as unknown as Availability,
      {
        id: 48,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 64,
        userOauthId: '5',
      } as unknown as Availability,
      {
        id: 49,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 63,
        userOauthId: '8',
      } as unknown as Availability,
      {
        id: 50,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 62,
        userOauthId: '14',
      } as unknown as Availability,
      {
        id: 51,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 61,
        userOauthId: '4',
      } as unknown as Availability,
      {
        id: 52,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 60,
        userOauthId: '13',
      } as unknown as Availability,
    ];
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

  describe(' GET /timeslots', () => {
    beforeEach(async () => {
      for (const ts of mockTimeSlots) {
        const timeSlot = {
          ...ts,
          recruitmentSession: mockRecruitmentSessions[2],
          availabilities: [],
        };
        await timeSlotsService.createTimeSlot(timeSlot);
      }

      for (const a of mockAvailability) {
        await availabilityService.createAvailability(a);
      }
    });

    it('should return all available timeslots', async () => {
      const expected = [
        {
          end: '2024-05-19T14:00:00.000Z',
          id: 71,
          start: '2024-05-19T13:00:00.000Z',
        },
        {
          end: '2024-05-19T16:00:00.000Z',
          id: 73,
          start: '2024-05-19T15:00:00.000Z',
        },
      ];
      await request(app.getHttpServer())
        .get('/timeslots')
        .set('Authorization', `Bearer ${newMemberToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
        });

      const availableTimeSlots =
        await timeSlotsService.findAvailableTimeSlots();
      expect(availableTimeSlots).toEqual(expected);
    });
  });
});
