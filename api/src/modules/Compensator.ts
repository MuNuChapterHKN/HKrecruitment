/*
 * Copyright (c) 2021 Riccardo Zaccone
 *
 * This file is part of api.
 * api is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * api is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.

 * You should have received a copy of the GNU General Public License
 * along with api.  If not, see <http://www.gnu.org/licenses/>.
 */

/*
 * File:   Compensator.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 19 aprile 2021, 14:15
 */

import {CompensatorDAO} from "./DAO/DAOdefs";
import {NotificationSubsystem} from "./NotificationSubsystem";
import {Availability, TimeSlot} from "../datatypes/dataTypes";
import {ConfigManager} from "./ConfigManager";
import {SlotScheduler} from "./SlotScheduler";
import {Member, Slot} from "../datatypes/entities";
import {Application} from "../datatypes/application";
import {AvailabilityCompensationBroadcasting, AvailabilityCompensationMethod} from "../config/recruitmentConfig";
import {AvailabilityEvent} from "./PeriodicEvent";
import {oneOf} from "./utils";

export type compensation_event= "availability_revocation" | "availability_applicant_refusal"
                | "no_interviewer_confirmation"


export class Compensator{
    private readonly storage:CompensatorDAO;
    private readonly config: ConfigManager;
    private readonly scheduler: SlotScheduler;
    private readonly invalidSlots: Slot[];


    constructor(storage: CompensatorDAO, config: ConfigManager, scheduler: SlotScheduler) {
        this.storage = storage;
        this.config = config;
        this.scheduler = scheduler;
        this.invalidSlots=[];
    }

    /**
     * Executes actions to compensate an event occurred
     * @param event the event occurred that needs compensation
     * @param {Availability|Application} data the entity that caused the event
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     */
    async compensate(event: compensation_event, data: any, ntfS: NotificationSubsystem) {
        switch (event) {
            case "availability_revocation":
                await this.availability_revocation(data as Availability, ntfS);
                break;
            case "no_interviewer_confirmation":
                await this.no_interviewer_confirmation(data as Availability, ntfS);
                break;
            case "availability_applicant_refusal":
                await this.availability_applicant_refusal(data as Application, ntfS);
        }
    }

    /**
     * Handles the case when an availability in state "used" goes in state "cancelled".
     * Tries to resolve the slot the availability was used for according to the
     * "availability_compensation_strategy" retrieved from the configuration manager
     * @param {Availability} data the availability that caused the event: it already has state "cancelled"
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private availability_revocation(data: Availability, ntfS: NotificationSubsystem) {
        return new Promise<void>(async (res, rej)=>{
            const strategies = await this.config.get("compensation");
            let compensated = false;
            const slot=await this.storage.slots.getFromAvailability(data);
            for (const compensation of strategies.availability_compensation_strategies) {
                if (compensated) break;
                try{
                    switch (compensation.strategy){
                        case "trySubstitution":
                            compensated=await this.trySubstitution(slot, ntfS);
                            break;
                        case "searchSubstitution":
                            await this.searchSubstitution(slot, data, compensation, ntfS);
                            compensated=true;
                            break;
                        case "reAskTimeSlots":
                            await this.reAskTimeSlots(slot, ntfS);
                            compensated=true;
                    }
                }
                catch (e){
                    console.error(e);
                    break;
                }
            }
            if(!compensated) //compensation.strategy === "manual_fallback" oppure nessun metodo definito
                this.manual_fallback(slot, ntfS).then(()=>res()).catch((e)=>rej(e));
        })
    }

    /**
     * Called when the availabilities related to a slot are freed. Stops the periodicNotification for the members
     * who had an availability in state "used", and notifies all the members related to the availabilities that
     * their availability is not used anymore.
     * @param {Availability[]} freed the availabilities that has been freed
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private notifyFreedAvailabilities(freed: Availability[], ntfS: NotificationSubsystem): Promise<void[]>{
        const promises:Promise<void>[]=[];
        //Cannot use flatMap for compatibility reasons
        freed.filter((a)=>a.state==="used").forEach((av)=>
            promises.push(ntfS.stopPeriodicNotify(new AvailabilityEvent("require_availability_confirmation"), av)));
        freed.forEach((av)=>
            promises.push(ntfS.notify("availability_not_required",
                {start: av.time_slot.start, end: av.time_slot.end, member_id: av.member_id})));
        return Promise.all(promises);
    }

    /**
     * Try to purge the slots still invalid.
     * For each invalid slot, call SlotScheduler.purgeSlotAvailabilities and then notify
     * the interviewers whose availabilities have been used and were not in state "confirmed"
     * with a periodic notification
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @param {TimeSlot} ts the time slot in which there could be some availability that could be used
     */
    async solveInvalidSlots(ntfS: NotificationSubsystem, ts: TimeSlot): Promise<void>{
        const slotsCanBeSolved=this.invalidSlots
            .filter((slot)=>slot.time_slot.start===ts.start && slot.time_slot.end===ts.end);
        for(const slot of slotsCanBeSolved){
            const newAvailabilities=await this.scheduler.purgeSlotAvailabilities(slot);
            if(newAvailabilities.length>0){
                this.removeInvalidSlot(slot); //slot just purged
                for(const av of newAvailabilities.filter((a)=>a.state!=="confirmed")){
                    const periodMinutes=(await this.config.get("member")).reminder_availability_confirmation_hours*60;
                    await ntfS.periodicNotify(new AvailabilityEvent("require_availability_confirmation"), av,
                        {start:av.time_slot.start, end: av.time_slot.end, member_id: av.member_id}, periodMinutes);
                }
            }
        }
    }

    /**
     * Handles the case in which an availability in not confirmed in time.
     * Puts the availability in state "cancelled" and handles the case like in the case
     * of availability revocation.
     * @param {Availability} data the availability that caused the event
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private async no_interviewer_confirmation(data: Availability, ntfS: NotificationSubsystem): Promise<void> {
        await this.storage.availabilities.update(data.time_slot.start, data.time_slot.end, data.member_id, {state: "cancelled"});
        return this.availability_revocation(data, ntfS);
    }

    /**
     * Handles the case when an applicant revokes his/her application.
     * All the the availabilities related to the slot assigned to the application are freed,
     * the interviewers involved are notified that the meeting is cancelled.
     * Having freed some availabilities, tries to solve the invalid slots.
     * @param {Application} data the application that caused the event
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private async availability_applicant_refusal(data: Application, ntfS: NotificationSubsystem) {
        return new Promise<void>((res, rej)=>{
            this.storage.applications.getSlot(data.id).then((slot)=>{
                this.removeInvalidSlot(slot); //handle the case in which the revoked application had invalid slots
                this.scheduler.freeSlot(slot).then((freed)=>{
                    this.notifyFreedAvailabilities(freed, ntfS)
                        .then(()=>{ //the availabilities freed can be used to purge other invalid slots
                            this.solveInvalidSlots(ntfS, slot.time_slot).then(()=>res()).catch(e=>rej(e));
                        })
                        .catch(e=>rej(e));
                })
            })
        });
    }

    /**
     * Selects the members to whom an availability request should be sent
     * @param start the start time of the time slot for which an availability is required
     * @param strategy the availability compensation strategy chosen
     * @private
     */
    private async selectMembers(start: string, strategy: { broadcasting?: AvailabilityCompensationBroadcasting; N?: number}) {
        let res: Member[]=[];
        switch (strategy.broadcasting) {
            case "allInterviewers":
                res=await this.storage.interviewers.list();
                break;
            case "allInterviewersInDay":
                res=await this.storage.interviewers.listAvailableInDay(start);
                break;
            case "leastNBusy":
                if(!strategy.N) throw new Error("Missing paramter N in leastNBusy broadcasting method")
                res=await this.storage.interviewers.leastNBusy(strategy.N);
                break;
            default:
                throw new Error("Missing parameter broadcasting in compensation strategy");
        }
        if(res.length===0) //handle the case in which "allInterviewersInDay" returns empty array
            res=await this.storage.interviewers.list();
        return res.map((member)=>member.id);
    }

    /**
     * Handles the availability revocation by trying to use an unused availability to substitute the revoked one
     * @param slot the slot that used the revoked availability
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private trySubstitution(slot: Slot, ntfS: NotificationSubsystem): Promise<boolean>{
        return new Promise((res, rej)=>{
            this.scheduler.purgeSlotAvailabilities(slot)
                .then(async (newAvailabilities)=>{
                    if(newAvailabilities.length===0){
                        res(false); return;
                    }
                    //sostituzione ok, adesso cambia il calendario?
                    this.config.get("member").then(({reminder_availability_confirmation_hours})=>{
                        const periodMin=reminder_availability_confirmation_hours*60;
                        const promises:Promise<void>[]=[];
                        newAvailabilities.forEach((av)=>
                            promises.push(ntfS.periodicNotify(new AvailabilityEvent("require_availability_confirmation"), av,
                                {start:av.time_slot.start, end: av.time_slot.end, member_id: av.member_id}, periodMin)));
                        Promise.all(promises).catch(e=>rej(e)).then(()=>res(true));
                    }).catch(e=>rej(e));
                })
        });
    }

    /**
     * Handles the availability revocation by asking interviewers to submit an availability for the same time slot
     * of the revoked availability.
     * Marks the slot as rejected and notifies the proper interviewers, according the proper availability compensation strategy
     * @param slot the slot that used the revoked availability
     * @param {Availability} data the availability that caused the event: it already has state "cancelled"
     * @param compensation the availability compensation strategy chosen
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private searchSubstitution(slot: Slot, data: Availability, compensation: { strategy?: AvailabilityCompensationMethod; broadcasting?: AvailabilityCompensationBroadcasting; N?: number; [p: string]: unknown }, ntfS: NotificationSubsystem): Promise<void> {
        return new Promise((res, rej)=>{
            const promises: Promise<void>[]=[];
            promises.push(this.scheduler.rejectSlot(slot));
            this.selectMembers(slot.time_slot.start, compensation)
                .then((members)=>{
                    members.forEach((m_id)=>
                        promises.push(ntfS.notify("request_availability",
                            {start: data.time_slot.start, end: data.time_slot.end, member_id: m_id}))
                    )
                    Promise.all(promises).then(()=>{
                        this.addInvalidSlot(slot);
                        res()
                    }).catch(e=>rej(e));
                }).catch(()=>rej());
        });
    }

    /**
     * Handles the availability revocation by asking the applicant to choose again the time slots.
     * Marks the slot as rejected, frees all the related availabilities and notifies the applicant.
     * @param slot the slot that used the revoked availability
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private reAskTimeSlots(slot: Slot, ntfS: NotificationSubsystem): Promise<void> {
        return new Promise(async (res, rej)=>{
            const promises: Promise<void[] | void>[]=[];
            try {
                await this.scheduler.rejectSlot(slot);
                const availabilitiesFreed= await this.scheduler.freeSlot(slot);
                promises.push(this.notifyFreedAvailabilities(availabilitiesFreed, ntfS));
                const app=await this.storage.applications.getBySlotId(slot.id);
                await this.storage.applications.deleteSlot(slot.id);
                promises.push(ntfS.notify("reAskTimeSlot", {application_id: app.id}));
                Promise.all(promises).then(()=>res()).catch(()=>rej());
            }
            catch (e){
                rej(e);
            }
        })
    }

    /**
     * Handles the availability revocation by asking one supervisor to manually modify the slot
     * @param slot the slot that used the revoked availability
     * @param {NotificationSubsystem} ntfS the notification subsystem instance
     * @private
     */
    private manual_fallback(slot: Slot, ntfS: NotificationSubsystem): Promise<void> {
        return new Promise(async (res, rej)=>{
            try {
                await this.scheduler.rejectSlot(slot);
                this.storage.members.supervisors.list().then((supervisors)=>{
                    const supervisor=oneOf(supervisors);
                    ntfS.notify("require_manual_slot_compensation",
                        {member_id: supervisor.id, start: slot.time_slot.start, end: slot.time_slot.end})
                            .then(()=>res()).catch(e=>rej(e));
                });
            }
            catch (e) {
                rej(e);
            }
        });
    }

    private addInvalidSlot(invalidSlot: Slot){
        if(!this.invalidSlots.find((slot)=>slot.id===invalidSlot.id))
            this.invalidSlots.push(invalidSlot);
    }

    private removeInvalidSlot(slot: Slot) {
        const index=this.invalidSlots.findIndex((invSlot)=>invSlot.id===slot.id);
        if(index>=0)
            this.invalidSlots.splice(index,1);
    }
}
