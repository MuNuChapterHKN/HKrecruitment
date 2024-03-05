import { CreateApplicationDto } from 'src/application/create-application.dto';
import {
  ApplicationType,
  ApplicationState,
  LangLevel,
  Role,
} from '@hkrecruitment/shared';
import {
  BscApplication,
  MscApplication,
  PhdApplication,
} from 'src/application/application.entity';
import { UpdateApplicationDto } from 'src/application/update-application.dto';
import { RecruitmentSessionState } from '@hkrecruitment/shared/recruitment-session';
import { CreateRecruitmentSessionDto } from 'src/recruitment-session/create-recruitment-session.dto';
import { UpdateRecruitmentSessionDto } from 'src/recruitment-session/update-recruitment-session.dto';
import { RecruitmentSession } from 'src/recruitment-session/recruitment-session.entity';

export const testDate = new Date(2023, 0, 1);
export const testDateTimeStart = new Date(2023, 0, 1, 10, 30, 0);
export const testDateTime10Minutes = new Date(2023, 0, 1, 10, 40, 0);
export const testDateTime3Hours = new Date(2023, 0, 1, 13, 30, 0);
export const testDateTimeEnd = new Date(2023, 0, 1, 11, 30, 0);

export const mockTimeSlot = {
  start: testDateTimeStart,
  end: testDateTimeEnd,
  id: 1,
};

export const testInterviewStart = '11:55' as unknown as Date;
export const testInterviewEnd = '20:35' as unknown as Date;
export const testDay1 = '2024-10-20' as unknown as Date;
export const testDay2 = '2024-10-21' as unknown as Date;
export const testDay3 = '2024-10-22' as unknown as Date;
export const testDateCreatedAt = '2024-9-10' as unknown as Date;
export const testDateLastModified = '2024-9-12' as unknown as Date;

export const mockRecruitmentSession = {
  id: 1,
  state: RecruitmentSessionState.Active,
  slotDuration: 50,
  interviewStart: testInterviewStart,
  interviewEnd: testInterviewEnd,
  days: [testDay1, testDay2, testDay3],
  createdAt: testDateCreatedAt,
  lastModified: testDateLastModified,
} as RecruitmentSession;

export const mockCreateRecruitmentSessionDto = {
  slotDuration: 50,
  interviewStart: testInterviewStart,
  interviewEnd: testInterviewEnd,
  days: [testDay1, testDay2, testDay3],
} as CreateRecruitmentSessionDto;

export const mockUpdateRecruitmentSessionDto = {
  slotDuration: 50,
  interviewStart: testInterviewStart,
  interviewEnd: testInterviewEnd,
  days: [testDay1, testDay2, testDay3],
} as UpdateRecruitmentSessionDto;

export const baseFile = {
  encoding: '7bit',
  mimetype: 'application/pdf',
  buffer: Buffer.from(''),
  size: 0,
  stream: undefined,
  destination: undefined,
  path: '',
};

const cvFile = {
  ...baseFile,
  fieldname: 'cv',
  originalname: 'cv',
  filename: 'cv',
};

const gradesFile = {
  ...baseFile,
  fieldname: 'grades',
  originalname: 'grades',
  filename: 'grades',
};

export const mockBscApplication = {
  type: ApplicationType.BSC,
  id: 1,
  state: ApplicationState.New,
  notes: 'Notes',
  itaLevel: LangLevel.NativeSpeaker,
  bscStudyPath: 'Computer Engineering',
  bscAcademicYear: 1,
  bscGradesAvg: 25.8,
  cfu: 50,
} as BscApplication;

export const mockMscApplication = {
  type: ApplicationType.MSC,
  id: 1,
  state: ApplicationState.New,
  notes: 'Notes',
  itaLevel: LangLevel.B2,
  mscStudyPath: 'Medical Engineering',
  mscAcademicYear: 1,
  mscGradesAvg: 25.8,
} as MscApplication;

export const mockPhdApplication = {
  type: ApplicationType.PHD,
  id: 1,
  state: ApplicationState.New,
  notes: 'Notes',
  itaLevel: LangLevel.C1,
  phdDescription: 'PHD Description',
} as PhdApplication;

export const mockCreateBscApplicationDTO = {
  type: ApplicationType.BSC,
  itaLevel: mockBscApplication.itaLevel,
  cv: cvFile,
  notes: 'Nothing to add',
  bscApplication: {
    bscStudyPath: mockBscApplication.bscStudyPath,
    bscAcademicYear: mockBscApplication.bscAcademicYear,
    bscGradesAvg: mockBscApplication.bscGradesAvg,
    cfu: mockBscApplication.cfu,
    grades: gradesFile,
  },
} as CreateApplicationDto;

export const mockCreateMscApplicationDTO = {
  type: ApplicationType.MSC,
  itaLevel: mockMscApplication.itaLevel,
  cv: cvFile,
  mscApplication: {
    mscStudyPath: mockMscApplication.mscStudyPath,
    mscAcademicYear: mockMscApplication.mscAcademicYear,
    mscGradesAvg: mockMscApplication.mscGradesAvg,
    cfu: mockBscApplication.cfu,
    bscStudyPath: mockBscApplication.bscStudyPath,
    bscGradesAvg: mockBscApplication.bscGradesAvg,
    grades: gradesFile,
  },
} as CreateApplicationDto;

export const mockCreatePhdApplicationDTO = {
  type: ApplicationType.PHD,
  cv: cvFile,
  itaLevel: mockPhdApplication.itaLevel,
  phdApplication: {
    mscStudyPath: mockMscApplication.mscStudyPath,
    phdDescription: mockPhdApplication.phdDescription,
  },
} as CreateApplicationDto;

export const updateApplicationDTO = {
  notes: 'Notes',
  state: ApplicationState.Accepted,
} as UpdateApplicationDto;

export const applicant = {
  firstName: 'John',
  lastName: 'Doe',
  oauthId: '123',
  sex: 'male',
  email: 'email@example.com',
  role: Role.Applicant,
};

export const applicationFiles = {
  cv: [
    {
      ...baseFile,
      fieldname: 'cv',
      originalname: 'cv',
      filename: 'cv',
    },
  ],
  grades: [
    {
      ...baseFile,
      fieldname: 'grades',
      originalname: 'grades',
      filename: 'grades',
    },
  ],
};

export const applicantId = 'abc123';
export const folderId = 'folder_abc123';
export const fileId = 'file_abc123';
export const today = '1/1/2023, 24:00:00';
