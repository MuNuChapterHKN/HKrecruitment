/*
 * Copyright (c) 2021 Riccardo Zaccone
 *
 * This file is part of hkrecruitment-apiserver.
 * hkrecruitment-apiserver is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * hkrecruitment-apiserver is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with hkrecruitment-apiserver.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * File:   DAOdefs.d.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 22 aprile 2021, 01:04
 */

import {Applicant, Interview, Member, Slot} from "../../datatypes/entities";
import {Application} from "../../datatypes/application";
import {Availability} from "../../datatypes/dataTypes";
import {AvailabilityState} from "../../datatypes/enums";

export interface NotificationDAO{
    members: {
        get: (id:string)=> Promise<Member>;
        supervisors: {
            list: ()=>Promise<Member[]>;
        },
        clerks: {
            list: ()=>Promise<Member[]>;
        }
    },
    applicants: {
        get: (id:string)=> Promise<Applicant>;
    },
    applications: {
        get: (id:number)=> Promise<Application>;
        getApplicant: (id:number)=> Promise<Applicant>;
    },
    notifications: {
        insert: (uri:string, text:string, member_id:string, application_id:string)=> Promise<void>;
        read:  (notification_id:number, user_id:string, user_type: "applicant"|"member")=>Promise<void>;
    },
    interviews: {
        get: (id:number)=> Promise<Interview>;
    }
    [p:string]:unknown;
}
export interface SchedulerDAO{}

export type CompensatorDAO = {
    members: {
        supervisors: {
            list: ()=>Promise<Member[]>;
        }
    };
    slots:{
        getFromAvailability: (availability: Availability)=>Promise<Slot>;
    },
    availabilities: {
        update: (start:string, end:string, member_id:string, {state:AvailabilityState})=>Promise<void>;
    },
    interviewers: {
        list: ()=>Promise<Member[]>;
        listAvailableInDay: (timeInDay: string)=>Promise<Member[]>;
        leastNBusy: (N: number)=>Promise<Member[]>;
    },
    applications: {
        deleteSlot: (slot_id: number)=>Promise<void>;
        getBySlotId: (slot_id: number)=>Promise<Application>;
        getSlot: (id: number)=>Promise<Slot>;
    }
}

export type DAO={}
