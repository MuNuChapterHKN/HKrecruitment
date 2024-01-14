import { CreateApplicationDto } from 'src/application/create-application.dto';
import {
  ApplicationType,
  ApplicationState,
  LangLevel,
  Role,
  AvailabilityState,
} from '@hkrecruitment/shared';
import {
  BscApplication,
  MscApplication,
  PhdApplication,
} from 'src/application/application.entity';
import { UpdateApplicationDto } from 'src/application/update-application.dto';

export const testDate = new Date(2023, 0, 1, 10, 0, 0);
export const testDateTimeStart = new Date(2023, 0, 1, 10, 30, 0);
export const testDateTime10Minutes = new Date(2023, 0, 1, 10, 40, 0);
export const testDateTime3Hours = new Date(2023, 0, 1, 13, 30, 0);
export const testDateTimeEnd = new Date(2023, 0, 1, 11, 30, 0);

export const mockTimeSlot = {
  start: testDateTimeStart,
  end: testDateTimeEnd,
  id: 1,
};

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
export const today = '1/1/2023, 10:00:00';

export const mockAvailability = {
  id: 1,
  state: AvailabilityState.Confirmed,
  lastModified: new Date(),
  timeSlot: mockTimeSlot,
  user: applicant,
};
