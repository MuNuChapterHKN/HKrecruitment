/* tslint:disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

import {Person} from "./person";
import {Application} from "./application";

/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "createMemberRequest".
 */
export type CreateMemberRequest = Person;
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "modifyMemberRequest".
 */
export type ModifyMemberRequest = {
  [k: string]: unknown;
};
export type CreateApplicantRequest = Person & {
  role: "admin" | "supervisor" | "clerk" | "none";
  is_expert: boolean;
  is_board: boolean;
  [k: string]: unknown;
};
export type CreateApplicantRequest1 =
  | {
      bsc_application: Application & {
        study_path: string;
        academic_year: number;
        cfu: number;
        grades: string;
        grades_avg: number;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }
  | {
      msc_application: Application & {
        [k: string]: unknown;
      };
      [k: string]: unknown;
    }
  | {
      phd_application: Application & {
        msc_study_path: string;
        phd_description: string;
        [k: string]: unknown;
      };
      [k: string]: unknown;
    };
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "modifyApplicantRequest".
 */
export type ModifyApplicantRequest = {
  [k: string]: unknown;
};
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getTimeSlotsResponse".
 */
export type GetTimeSlotsResponse = {
  time_slot: {
    start: string;
    end: string;
    [k: string]: unknown;
  };
  slots: {
    state: "free" | "assigned" | "reserved" | "rejected";
    cal_id?: string;
    time_slot: {
      start: string;
      end: string;
      [k: string]: unknown;
    };
    members: [
      {
        id: string;
        name: string;
        surname: string;
        sex: "male" | "female";
        image: string;
        [k: string]: unknown;
      },
      {
        id: string;
        name: string;
        surname: string;
        sex: "male" | "female";
        image: string;
        [k: string]: unknown;
      },
      ...{
        id: string;
        name: string;
        surname: string;
        sex: "male" | "female";
        image: string;
        [k: string]: unknown;
      }[]
    ];
    [k: string]: unknown;
  }[];
  availabilities: {
    state: "subscribed" | "used" | "confirmed" | "usedAndConfirmed" | "cancelled";
    assigned_at?: string;
    confirmed_at?: string;
    time_slot: {
      start: string;
      end: string;
      [k: string]: unknown;
    };
    member_id: string;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}[];
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "readNotificationRequest".
 */
export type ReadNotificationRequest = {
  [k: string]: unknown;
};

/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getMemberByFullNameResponse".
 */
export interface GetMemberByFullNameResponse {
  id: string;
  image: string;
  name: string;
  surname: string;
  sex: "male" | "female";
  [k: string]: unknown;
}

/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "putApplicantFriendListRequest".
 */
export interface PutApplicantFriendListRequest {
  friends: [number, ...number[]];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "checkApplicantExistanceResponse".
 */
export interface CheckApplicantExistanceResponse {
  found: boolean;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getApplicantFriendsResponse".
 */
export interface GetApplicantFriendsResponse {
  friends: [number, ...number[]];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "subscribeToTimeSlotRequest".
 */
export interface SubscribeToTimeSlotRequest {
  start: string;
  end: string;
  member_id: string;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getTimeSlotsOfSlotsResponse".
 */
export interface GetTimeSlotsOfSlotsResponse {
  time_slots: {
    start: string;
    end: string;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "modifySlotsRequest".
 */
export interface ModifySlotsRequest {
  time_slot: {
    start: string;
    end: string;
    [k: string]: unknown;
  };
  slots: [
    {
      state: "free" | "assigned" | "reserved" | "rejected";
      cal_id?: string;
      time_slot: {
        start: string;
        end: string;
        [k: string]: unknown;
      };
      members: [
        {
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        },
        {
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        },
        ...{
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        }[]
      ];
      [k: string]: unknown;
    },
    ...{
      state: "free" | "assigned" | "reserved" | "rejected";
      cal_id?: string;
      time_slot: {
        start: string;
        end: string;
        [k: string]: unknown;
      };
      members: [
        {
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        },
        {
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        },
        ...{
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        }[]
      ];
      [k: string]: unknown;
    }[]
  ];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getSlotsForApplicationResponse".
 */
export interface GetSlotsForApplicationResponse {
  chosen_ts: [
    {
      time_slot: {
        start: string;
        end: string;
        [k: string]: unknown;
      };
      slots: [
        {
          state: "free" | "assigned" | "reserved" | "rejected";
          cal_id?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          members: [
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            ...{
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            }[]
          ];
          [k: string]: unknown;
        },
        ...{
          state: "free" | "assigned" | "reserved" | "rejected";
          cal_id?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          members: [
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            ...{
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            }[]
          ];
          [k: string]: unknown;
        }[]
      ];
      availabilities: [
        {
          state: "subscribed" | "used" | "confirmed" | "usedAndConfirmed" | "cancelled";
          assigned_at?: string;
          confirmed_at?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          member_id: string;
          [k: string]: unknown;
        },
        ...{
          state: "subscribed" | "used" | "confirmed" | "usedAndConfirmed" | "cancelled";
          assigned_at?: string;
          confirmed_at?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          member_id: string;
          [k: string]: unknown;
        }[]
      ];
      [k: string]: unknown;
    },
    ...{
      time_slot: {
        start: string;
        end: string;
        [k: string]: unknown;
      };
      slots: [
        {
          state: "free" | "assigned" | "reserved" | "rejected";
          cal_id?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          members: [
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            ...{
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            }[]
          ];
          [k: string]: unknown;
        },
        ...{
          state: "free" | "assigned" | "reserved" | "rejected";
          cal_id?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          members: [
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            {
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            },
            ...{
              id: string;
              name: string;
              surname: string;
              sex: "male" | "female";
              image: string;
              [k: string]: unknown;
            }[]
          ];
          [k: string]: unknown;
        }[]
      ];
      availabilities: [
        {
          state: "subscribed" | "used" | "confirmed" | "usedAndConfirmed" | "cancelled";
          assigned_at?: string;
          confirmed_at?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          member_id: string;
          [k: string]: unknown;
        },
        ...{
          state: "subscribed" | "used" | "confirmed" | "usedAndConfirmed" | "cancelled";
          assigned_at?: string;
          confirmed_at?: string;
          time_slot: {
            start: string;
            end: string;
            [k: string]: unknown;
          };
          member_id: string;
          [k: string]: unknown;
        }[]
      ];
      [k: string]: unknown;
    }[]
  ];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "chooseTimeSlotsRequest".
 */
export interface ChooseTimeSlotsRequest {
  time_slots: [
    {
      start: string;
      end: string;
      [k: string]: unknown;
    },
    ...{
      start: string;
      end: string;
      [k: string]: unknown;
    }[]
  ];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "listApplicationsResponse".
 */
export interface ListApplicationsResponse {
  applications: {
    id: number;
    submission_date: string;
    state: "new" | "accepted" | "rejected" | "confirmed" | "finalized" | "refused_by_applicant";
    applicant: {
      id: string;
      name: string;
      surname: string;
      sex: "male" | "female";
      [k: string]: unknown;
    };
    slot?: {
      state: "free" | "assigned" | "reserved" | "rejected";
      cal_id?: string;
      time_slot: {
        start: string;
        end: string;
        [k: string]: unknown;
      };
      members: [
        {
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        },
        {
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        },
        ...{
          id: string;
          name: string;
          surname: string;
          sex: "male" | "female";
          image: string;
          [k: string]: unknown;
        }[]
      ];
      interview_id: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "listApplicationsOfApplicantResponse".
 */
export interface ListApplicationsOfApplicantResponse {
  applications: {
    id: number;
    submission_date: string;
    state: "new" | "accepted" | "rejected" | "confirmed" | "finalized" | "refused_by_applicant";
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getNotificationsResponse".
 */
export interface GetNotificationsResponse {
  read: (
    | {
        [k: string]: unknown;
      }
    | {
        [k: string]: unknown;
      }
  )[];
  unread: (
    | {
        [k: string]: unknown;
      }
    | {
        [k: string]: unknown;
      }
  )[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "createStudyPathRequest".
 */
export interface CreateStudyPathRequest {
  degree_level: "BSc" | "MSc" | "PhD";
  study_path: string;
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getStudyPathsResponse".
 */
export interface GetStudyPathsResponse {
  BSc: string[];
  MSc: string[];
  PhD: string[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getDailyInterviewSumsResponse".
 */
export interface GetDailyInterviewSumsResponse {
  start: string;
  end: string;
  stats: {
    day: string;
    daily_stats?: {
      member: {
        id: string;
        name: string;
        surname: string;
        sex: "male" | "female";
        email: string;
        role: "admin" | "supervisor" | "clerk" | "none";
        is_expert: boolean;
        is_board: boolean;
        [k: string]: unknown;
      };
      interviews_n: number;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getTsInterviewSumsResponse".
 */
export interface GetTsInterviewSumsResponse {
  start: string;
  end: string;
  stats: {
    time_slot?: string;
    ts_stats?: {
      member: {
        id: string;
        name: string;
        surname: string;
        sex: "male" | "female";
        email: string;
        role: "admin" | "supervisor" | "clerk" | "none";
        is_expert: boolean;
        is_board: boolean;
        [k: string]: unknown;
      };
      interviews_n: number;
      [k: string]: unknown;
    }[];
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getDailyMemberSlotDistrResponse".
 */
export interface GetDailyMemberSlotDistrResponse {
  start: string;
  end: string;
  stats: {
    day?: string;
    male?: number;
    female?: number;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getTsMemberSlotDistrResponse".
 */
export interface GetTsMemberSlotDistrResponse {
  start: string;
  end: string;
  stats: {
    time_slot?: string;
    ts_stat?: {
      male?: number;
      female?: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getApplicantGenderDistrResponse".
 */
export interface GetApplicantGenderDistrResponse {
  start: string;
  end: string;
  stat: {
    male: number;
    female: number;
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getMemberAvgResponseTimeResponse".
 */
export interface GetMemberAvgResponseTimeResponse {
  start: string;
  end: string;
  stats: {
    member_id: string;
    response_time: number;
    [k: string]: unknown;
  }[];
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getApplicationStateCountResponse".
 */
export interface GetApplicationStateCountResponse {
  start: string;
  end: string;
  stat: {
    male: {
      accepted: number;
      rejected: number;
      refused_by_applicant: number;
      [k: string]: unknown;
    };
    female: {
      accepted: number;
      rejected: number;
      refused_by_applicant: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
/**
 * This interface was referenced by `Payloads`'s JSON-Schema
 * via the `definition` "getInterviewOutcomeCountResponse".
 */
export interface GetInterviewOutcomeCountResponse {
  start: string;
  end: string;
  stat: {
    male: {
      member_accepted: number;
      mentee_accepted: number;
      rejected: number;
      [k: string]: unknown;
    };
    female: {
      member_accepted: number;
      mentee_accepted: number;
      rejected: number;
      [k: string]: unknown;
    };
    [k: string]: unknown;
  };
  [k: string]: unknown;
}
