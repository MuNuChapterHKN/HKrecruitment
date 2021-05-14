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
 * File:   PeriodicEvent.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 14 maggio 2021, 11:23
 */

import {NotificationEvent} from "../config/recruitmentConfig";
import {compensation_event} from "./Compensator";
import {Availability} from "../datatypes/dataTypes";

/**
 * @class PeriodicEvent<T> models an event that supports periodic notification
 * @template T
 */
export abstract class PeriodicEvent<T> {
    private readonly _name: NotificationEvent;

    protected constructor(event: NotificationEvent) {
        this._name = event;
    }

    /**
     * Indicates whether the notification is supported for the event depending on entity data
     * @param {T} entity the entity the event is related to
     * @return {boolean} true if the event on the entity still requires notification, false otherwise
     */
    stillValid(entity: T): boolean{
        return false;
    }

    /**
     * Indicates whether the occurrence of the event requires a compensation action
     * @param entity the entity the event is related to
     * @return {(compensation_event | boolean)} the compensation_event to be raised or false
     */
    needsCompensation(entity: T): compensation_event | false{
        return false;
    }

    /**
     * Get a unique identifier for the entity
     * @abstract
     * @param entity the entity the event is related to
     * @protected
     */
    protected abstract getInstanceId(entity: T):string;

    /**
     * Get a unique identifier for the pair event-entity
     * @param entity the entity the event is related to
     */
    getId(entity: T): string{
        return this._name.toString()+this.getInstanceId(entity).toString();
    }

    get name(): NotificationEvent {
        return this._name;
    }
}

/**
 * @class AvailabilityEvent deals with periodic events related to availabilities
 * Main cases are:
 * - the availability is revoked: from the API endpoint the function stopPeriodicNotify() is
 * called and then the function compensate();
 * - the availability is not confirmed and the slot is in a time slot too near. This case must be
 * handled inside the callback registered when setting the periodic notification
 */
export class AvailabilityEvent extends PeriodicEvent<Availability>{
    /**
     * Defines when the time slot the availability is associated to is too near
     * @private
     */
    private readonly min_hours_before_interviewer_confirm: number;

    constructor(event: NotificationEvent, min_hours_before_interviewer_confirm: number) {
        if(event!=="require_availability_confirmation")
            throw new Error(`Invalid event for AvailabilityEvent`);
        super(event);
        this.min_hours_before_interviewer_confirm = min_hours_before_interviewer_confirm;
    }

    protected getInstanceId(entity: Availability): string {
        return entity.time_slot.start+entity.time_slot.end+entity.member_id;
    }

    needsCompensation(entity: Availability): compensation_event | false {
        if(this.name==="require_availability_confirmation"){
            if(this.tooNear(entity))
                return "no_interviewer_confirmation";
            return "availability_revocation";
        }
        return false;
    }

    stillValid(entity: Availability): boolean {
        return !this.tooNear(entity);
    }

    private tooNear(entity: Availability){
        const now=new Date();
        const av_start=new Date(entity.time_slot.start);
        //av_start-min_hours...
        const offsetMs=this.min_hours_before_interviewer_confirm*60*60*1000;
        const av_offset=new Date(av_start.getTime()-offsetMs);
        return now.getTime() >= av_offset.getTime();
    }
}
