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

  class mockAv {
    id: number;
    state: AvailabilityState;
    lastModified: Date;
    timeSlot: number;
    userOauthId: string;
  }
  let mockAvailability: mockAv[];

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
      },
      {
        id: 2,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 53,
        userOauthId: '7',
      },
      {
        id: 3,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 55,
        userOauthId: '12',
      },
      {
        id: 4,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 61,
        userOauthId: '19',
      },
      {
        id: 5,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '3',
      },
      {
        id: 6,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 78,
        userOauthId: '15',
      },
      {
        id: 7,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 58,
        userOauthId: '11',
      },
      {
        id: 8,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 57,
        userOauthId: '8',
      },
      {
        id: 9,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 64,
        userOauthId: '5',
      },
      {
        id: 10,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 53,
        userOauthId: '17',
      },
      {
        id: 11,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 62,
        userOauthId: '2',
      },
      {
        id: 12,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '9',
      },
      {
        id: 13,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 72,
        userOauthId: '14',
      },
      {
        id: 14,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 74,
        userOauthId: '6',
      },
      {
        id: 15,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 75,
        userOauthId: '13',
      },
      {
        id: 16,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 74,
        userOauthId: '10',
      },
      {
        id: 17,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '4',
      },
      {
        id: 18,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 64,
        userOauthId: '16',
      },
      {
        id: 19,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 59,
        userOauthId: '18',
      },
      {
        id: 20,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 57,
        userOauthId: '1',
      },
      {
        id: 21,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 66,
        userOauthId: '20',
      },
      {
        id: 22,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 68,
        userOauthId: '19',
      },
      {
        id: 23,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 69,
        userOauthId: '7',
      },
      {
        id: 24,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 70,
        userOauthId: '16',
      },
      {
        id: 25,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 72,
        userOauthId: '15',
      },
      {
        id: 26,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 73,
        userOauthId: '11',
      },
      {
        id: 27,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 75,
        userOauthId: '14',
      },
      {
        id: 28,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 76,
        userOauthId: '9',
      },
      {
        id: 29,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 77,
        userOauthId: '8',
      },
      {
        id: 30,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 78,
        userOauthId: '10',
      },
      {
        id: 31,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 79,
        userOauthId: '13',
      },
      {
        id: 32,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 80,
        userOauthId: '12',
      },
      {
        id: 33,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 79,
        userOauthId: '20',
      },
      {
        id: 34,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 78,
        userOauthId: '18',
      },
      {
        id: 35,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 77,
        userOauthId: '17',
      },
      {
        id: 36,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 76,
        userOauthId: '19',
      },
      {
        id: 37,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 75,
        userOauthId: '16',
      },
      {
        id: 38,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 74,
        userOauthId: '15',
      },
      {
        id: 39,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 73,
        userOauthId: '14',
      },
      {
        id: 40,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 72,
        userOauthId: '13',
      },
      {
        id: 41,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 71,
        userOauthId: '12',
      },
      {
        id: 42,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 70,
        userOauthId: '11',
      },
      {
        id: 43,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 69,
        userOauthId: '10',
      },
      {
        id: 44,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 68,
        userOauthId: '9',
      },
      {
        id: 45,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 67,
        userOauthId: '8',
      },
      {
        id: 46,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 66,
        userOauthId: '7',
      },
      {
        id: 47,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 65,
        userOauthId: '6',
      },
      {
        id: 48,
        state: AvailabilityState.Interviewing,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 64,
        userOauthId: '5',
      },
      {
        id: 49,
        state: AvailabilityState.Recovering,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 63,
        userOauthId: '8',
      },
      {
        id: 50,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 62,
        userOauthId: '14',
      },
      {
        id: 51,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 61,
        userOauthId: '4',
      },
      {
        id: 52,
        state: AvailabilityState.Free,
        lastModified: new Date('2024-05-14 00:00:00'),
        timeSlot: 60,
        userOauthId: '13',
      },
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

    it('DEBUG: check availabilities for timeslot having id 71', async () => {
      const allAvailabilities = await availabilityService.listAvailabilities();
      const av71 = allAvailabilities.filter((a) => a.timeSlot.id === 71);
      const av73 = allAvailabilities.filter((a) => a.timeSlot.id === 73);
      expect(av71).toHaveLength(4);
      expect(av73).toHaveLength(2);
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
