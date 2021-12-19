/* tslint:disable */
import {ApplicationState, DegreeLevel, LangLevel} from "./enums";
import {TimeSlot} from "./dataTypes";
import {Slot} from "./entities";

/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export interface Application {
  id: number;
  type: DegreeLevel;
  submission_date: string;
  state: ApplicationState;
  last_modified?: {
    member_id: string;
    time: string;
    attributes?: string[];
    [k: string]: unknown;
  };
  notes?: string;
  ita_level: LangLevel;
  cv?: string;
  time_slots?: TimeSlot[];
  slot?: Slot;
  interview_id?: number;
  applicant_id: string;
  [k: string]: unknown;
}