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
 * File:   SlotScheduler.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 19 aprile 2021, 11:37
 */

import {Slot} from "../datatypes/entities";
import {TimeSlot} from "../datatypes/dataTypes";
import {SchedulerDAO} from "./DAO/DAOdefs";
import {ConfigManager} from "./ConfigManager";

export type slot_computational_method= "bestFit" | "firstFit";


export abstract class SlotScheduler{
    protected config: ConfigManager;
    private readonly _method_implemented: slot_computational_method;
    protected storage: SchedulerDAO;


    constructor(config:ConfigManager, method_implemented: slot_computational_method, storage: SchedulerDAO) {
        this.config = config;
        this._method_implemented = method_implemented;
        this.storage = storage;
    }

    get method_implemented(): slot_computational_method {
        return this._method_implemented;
    }

    abstract makeSlot(applicant_id:string, application_id:number):Slot;
    verifySlotsChange(ts:TimeSlot, new_slots:Slot[]):void{
        //TODO: implement
    }

    eligibleTimeSlots(start:string, end:string, applicant_id:string, application_id:number): TimeSlot[]{
        //TODO: implement
        return {} as TimeSlot[];
    }
}
