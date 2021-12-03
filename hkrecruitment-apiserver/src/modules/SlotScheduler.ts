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

import {Member, Slot} from "../datatypes/entities";
import {Availability, TimeSlot} from "../datatypes/dataTypes";
import {SchedulerDAO} from "./DAO/DAOdefs";
import {ConfigManager} from "./ConfigManager";
import {CalendarInterface} from "./CalendarInterface";
import {Gender} from "../datatypes/enums";
import {asyncFilter, asyncMap, copyArrayShallow, partition, sum} from "./utils";

export type slot_computational_method= "bestFit" | "firstFit";


/**
 * Models a slot solution, with the associated loss and solution length
 */
export class SlotSolution{
    private readonly avs_loss: AvailabilityInfoLoss[];
    private _loss: number;
    private length: number;
    private readonly weights: { gender_inequality: number; slots_day: number; slots_week: number };
    private uploadLoss: boolean;

    constructor(max_sol_length: number, weights: { gender_inequality: number; slots_day: number; slots_week: number }){
        this.avs_loss=new Array<AvailabilityInfoLoss>(max_sol_length);
        this.weights=weights;
        this._loss=NaN;
        this.length=0;
        this.uploadLoss=true;
    }

    /**
     * Calculates the loss associated with a slot, by averaging the individual availability losses
     * and considering the gender distribution inside the slot
     * @return {SlotSolution} the SlotSolutions instance itself, for method chaining
     * @private
     */
    private calculateTotLoss(){
        if(this.uploadLoss){
            const genders = this.getAvailabilitiesInfoLoss().map((av) => av.info.sex);
            const [males, females] = partition(genders, (sex) => sex === "male");

            const totLoss= this.getAvailabilitiesInfoLoss().map((av) => av.loss).reduce(sum, 0) +
                Math.abs(males.length - females.length) * this.weights.gender_inequality;
            this._loss=totLoss/this.length;
            this.uploadLoss=false;
        }
        return this;
    }

    /**
     * Updates the current SlotSolution if the one given as parameter is better
     * @param {SlotSolution} other the candidate best solution
     * @return {SlotSolution} the SlotSolution instance itself, to allow method chaining
     */
    updateIfWorseThan(other: SlotSolution){
        this.calculateTotLoss();
        other.calculateTotLoss();
        if(this._loss>other._loss){
            copyArrayShallow(other.avs_loss, this.avs_loss, [0, other.length]);
            this.length=other.length;
            this._loss=other._loss;
        }
        return this;
    }

    get loss(): number {
        return this._loss;
    }

    getAvailabilitiesInfoLoss(): AvailabilityInfoLoss[]{
        return this.avs_loss.slice(0, this.length);
    }

    /**
     * Adds or replace an availability in the solution
     * @param item the availability to add to the solution
     * @param index the index of the availability
     * @return {SlotSolution} the SlotSolution instance itself, to allow method chaining
     */
    setAvailability(item: AvailabilityInfo, index: number = this.length){
        if(index>=this.avs_loss.length) throw new Error("Index out of range");
        if(!Number.isInteger(index)) throw new Error("Index must be integer");
        if(index>=this.length)
            this.length=index+1;
        this.avs_loss[index]=SlotSolution.calculateAvsLoss([item], this.weights)[0];
        this.uploadLoss=true;
        return this;
    }

    /**
     * @return {string[]} the list of the id of all the members in the availabilities of the solution
     */
    membersInvolved(): string[]{
        return this.avs_loss.slice(0, this.length).map(avs=>avs.member_id);
    }

    /**
     * Calculates the loss of a group of availabilities when used to compose a slot
     * @param {AvailabilityInfo[]} availabilities the group of availabilities (with additional info) selected for a potential slot
     * @param {{slots_day: number, slots_week: number }} weights the weights associated with the optimality parameters
     * @return {AvailabilityInfoLoss[]} the same availabilities with the associated losses
     * @static
     */
    static calculateAvsLoss(availabilities: AvailabilityInfo[], weights: { slots_day: number; slots_week: number }): AvailabilityInfoLoss[]{
        const lossMapper=(av: AvailabilityInfo)=>{
            const {slots_day, slots_week} = av.info;
            const loss=(slots_day*weights.slots_day+slots_week*weights.slots_week);
            return {...av, loss:loss};
        };
        return availabilities.map(lossMapper);
    }

}

export interface AvailabilityInfo extends Availability{
    //additional fields
    info: {
        is_expert: boolean,
        is_board: boolean,
        slots_day: number,
        slots_week: number,
        consecutive_slots: number,
        sex: Gender
    }
}

export interface AvailabilityInfoLoss extends AvailabilityInfo{
    loss: number;
}

/**
 * Manage the assigment of a slot to an application, as well
 * as taking care of the related actions, such as setting and modifying
 * the calendar event.
 * @pat.name Strategy {@pat.role Root}
 * @pat.task Delegate the actual creation of a slot to subclasses implementation strategy
 */
export abstract class SlotScheduler{
    private readonly config: ConfigManager;
    private readonly _method_implemented: slot_computational_method;
    private readonly storage: SchedulerDAO;
    private readonly calendar: CalendarInterface;


    protected constructor(config: ConfigManager, method_implemented: slot_computational_method, storage: SchedulerDAO, calendar: CalendarInterface) {
        this.config = config;
        this._method_implemented = method_implemented;
        this.storage = storage;
        this.calendar = calendar;
    }

    get method_implemented(): slot_computational_method {
        return this._method_implemented;
    }

    /**
     * Composes a slot for an application, stores it into the database and adds the calendar event.
     * Calls an abstract method to be implemented by SlotScheduler's subclass, that defines the strategy
     * to be used to calculate the slot out of eligible availabilities.
     * @param {string} applicant_id the id of the applicant
     * @param {number} application_id the id of the applicant's application
     * @return {Promise<Slot>} the slot assigned to the application
     */
    async assignSlot(applicant_id: string, application_id: number): Promise<Slot> {
        const weights=(await this.config.get("member")).metrics_weight;

        //need to prepare data for makeSlot
        const tsAvailabilities= await this.prepareData(application_id);
        const [slot, slotAvailabilities]=await this.makeSlot(tsAvailabilities, weights);

        slot.cal_id= await this.setCalendar(slot, applicant_id);
        slot.id=await this.storage.slots.insert(slot);
        await asyncMap(slotAvailabilities, av=>this.storage.availabilities.update(av.time_slot,
            av.member_id,{state: av.state==="confirmed" ? "usedAndConfirmed": "used"}));
        return slot;
    }

    /**
     * Adds additional information to availabilities, useful for calculating the availability loss
     * @param {AvailabilityInfo[]} avs the availabilities to add the info to
     * @return {Promise<AvailabilityInfo[]>} the availabilities with the added information
     * @private
     */
    private addInfoToAvailabilities(avs: Availability[]): Promise<AvailabilityInfo[]>{
        return asyncMap(avs, (av)=>{
            return new Promise(async ()=>{
                const m= await this.storage.members.get(av.member_id);
                const result: AvailabilityInfo=  {
                    ...av,
                    info: {
                        is_board: m.is_board,
                        is_expert: m.is_expert,
                        sex: m.sex,
                        slots_day: await this.storage.slots.countInDay(av.member_id, av.time_slot.start),
                        slots_week: await this.storage.slots.countInWeek(av.member_id, av.time_slot.start),
                        consecutive_slots: await this.storage.slots.countConsecutive(av.member_id, av.time_slot)
                    }
                };
                return result;
            })
        });
    }

    /**
     * Collects all the valid availabilities associated with the time slots in the applicant's application.
     * Valid availabilities are the ones that are in time_slots of the application, that are associated
     * with members who are not friends of the applicant and that have state "submitted" or "confirmed".
     * @param application_id the application of the applicant
     * @private
     */
    private async prepareData(application_id: number){
        const application = await this.storage.applications.get(application_id);
        const applicantFriends=await this.storage.applicants.listFriends(application.applicant_id);
        const timeSlots=application.time_slots;
        if(!timeSlots) throw new Error("Logic error: an application to be assigned a slot should have time_slots")
        //collect all availabilities for all time_slots chosen + filter out the ones of friends + add info
        const allAvailabilities:AvailabilityInfo[][] =(await asyncMap(timeSlots, (ts)=>{
            return new Promise(async ()=>{
                const avs=(await this.storage.availabilities.listUsableInRange(ts))
                    .filter((av)=>!this.verifyFriendsConstraint(applicantFriends, [av]));
                const avsInfo= await this.addInfoToAvailabilities(avs);
                return asyncFilter(avsInfo, (av)=>
                    this.verifyAvConstraintsForSlot([av]));
            })
        }));
        return allAvailabilities.map((vec) => ({time_slot: vec[0].time_slot, availabilities: vec}));
    }

    /**
     * Helper function to set the calendar event when creating a new slot
     * @param slot the newly created slot
     * @param applicant_id the applicant the slot is associated to
     * @return {Promise<string>} the result of calendar.insertEvent
     * @private
     */
    private async setCalendar(slot: Slot, applicant_id: string){
        const applicant=await this.storage.applicants.get(applicant_id);
        const title=`[${applicant.name} ${applicant.surname}] Colloquio Mu Nu Chapter - IEEE HKN`;
        const description=`Per i dettagli dell'application, vai sulla piattaforma di recruitment`;
        const members = await this.storage.members.partialList(slot.members.map((m)=>m.id));
        return this.calendar.insertEvent(slot.time_slot, title, description, members);
    }

    /**
     * Builds a slot given the availabilities in a time slot. Derived classes must implement this function.
     * @param {AvailabilityInfo[]} tsAvailabilities the availabilities from which to build a slot, all belonging to the same time slot
     * @param {{ gender_inequality: number, slots_day: number, slots_week: number }} weights the weights associated with the optimality parameters
     * @return {Promise<SlotSolution>} a solution for a slot
     * @abstract
     * @protected
     */
    protected abstract buildSlot(tsAvailabilities: { time_slot: TimeSlot; availabilities: AvailabilityInfo[] }, weights: { gender_inequality: number; slots_day: number; slots_week: number }): Promise<SlotSolution | null>;


    /**
     * Basic implementation, returns the best successfully built slot among the ones returned by buildSlot,
     * along with the used availabilities. Goodness of the final slot depends on buildSlot implementation
     * by the derived class. Derived class may override this function.
     * @param tsAvailabilities an array containing, for each eligible time_slot, that is
     * chosen by the user, the availabilities that can be used
     * @param {{ gender_inequality: number, slots_day: number, slots_week: number }} weights the weights associated with the optimality parameters
     * @protected
     */
    protected async makeSlot(tsAvailabilities: { time_slot: TimeSlot; availabilities: AvailabilityInfo[] }[], weights: { gender_inequality: number; slots_day: number; slots_week: number }): Promise<[Slot, Availability[]]> {
        const maxSolLength=tsAvailabilities.map(tsa=>
            tsa.availabilities.length).reduce((a,b)=>Math.max(a, b))
        let bestSol: SlotSolution = new SlotSolution(maxSolLength, weights);
        let time_slot: TimeSlot= {start: "", end: ""}; //just to have an initializer
        for(const ts of tsAvailabilities){
            const sol=await this.buildSlot(ts, weights);
            if(sol){
                time_slot=ts.time_slot;
                bestSol.updateIfWorseThan(sol);
            }
        }
        if(!Number.isNaN(bestSol.loss)){
            const slot=await this.makeSlotObj(bestSol.membersInvolved(), time_slot);
            return [slot, bestSol.getAvailabilitiesInfoLoss()]
        }
        throw new Error("Impossible to build a slot");
    }

    /**
     * Verifies that a new set of slots is valid, that is:
     * - the same availability is not used more than once in the same time slot, given as parameter;
     * - no new slot uses an available non existing or not usable anymore;
     * - no application that had a slot in the same time slot given ad parameter has lose the slot;
     * - each new slot is associated with a set of availabilities that do not violate the constraints.
     * If the new set of slots is valid, it registers them overwriting the existing ones.
     * @param {TimeSlot} ts the time slot which the new group of slots belongs
     * @param {Slot[]} new_slots the new group of slots
     * @throws {Error} Will throw an error if the slots change is not valid for any of the previous reasons
     */
    async verifySlotsChange(ts: TimeSlot, new_slots: Slot[]): Promise<void> {
        const slotMembers = await this.verifyAvailabilityUsedOnce(new_slots);
        await this.verifyAvailabilitiesUsed(ts, slotMembers);
        await this.verifyGlobalSlotsIntegrity(ts, new_slots);

        //list of applicants for each new slot
        const applicantsIds=(await this.storage.applications.listFromSlotIds(new_slots.map((s)=>s.id)))
            .map((a)=>a.applicant_id);
        for(let i=0; i<applicantsIds.length; i++){
            const applicantFriends=await this.storage.applicants.listFriends(applicantsIds[i]);
            const avs=await this.storage.availabilities.listFromSlot(new_slots[i].id);
            const avsInfo=await this.addInfoToAvailabilities(avs);
            if(!await this.verifySlotConstraints(applicantFriends, avsInfo))
                throw new Error("Slot constraints violated");
        }
        return this.storage.slots.batchModify(ts, new_slots);
    }

    /**
     * Verifies that no application that had a slot in the same time slot given as parameter has lose the slot.
     * @param ts the time slot which @param new_slots belong
     * @param {Slot[]} new_slots the list of new slots, all belonging to the same time slot
     * @private
     */
    private async verifyGlobalSlotsIntegrity(ts: TimeSlot, new_slots: Slot[]) {
        const appInTimeSlot = await this.storage.applications.listInTimeSlot(ts);
        const assignmentMismatch = appInTimeSlot.length !== new_slots.length;
        if (assignmentMismatch) throw new Error("Assignment mismatch: at least one application has not the slot");
    }

    /**
     * Verifies that the same availability is not used more than once in the same time slot
     * @param {Slot[]} new_slots the list of new slots, all belonging to the same time slot
     * @throws {Error} if the same members is involved in more that one slot
     * @private
     */
    private async verifyAvailabilityUsedOnce(new_slots: Slot[]) {
        const slotMembers = (await asyncMap(new_slots, (slot) => this.storage.slots.listMembers(slot.id)))
            .reduce((flatten, thisVec) => flatten.concat(thisVec));
        const duplicatesPresent = (new Set(slotMembers.map((m) => m.id)).size !== slotMembers.length);
        if (duplicatesPresent) throw new Error("The same member is involved in more than one slot at the same time");
        return slotMembers;
    }

    /**
     * Verifies that no new slot involves a member associated not free in the time slot of the slot.
     * @param ts the time slot of the slot to be checked
     * @param slotMembers the members involved in the slot be checked
     * @throws {Error} if al least one slot involves a non available member
     * @private
     */
    private async verifyAvailabilitiesUsed(ts: TimeSlot, slotMembers: Member[]) {
        const membersAvailable = (await this.storage.availabilities.listUsableInRange(ts));
        //from the members involved in new_slots, take in only the one not present in the list of available members for ts
        const invalidMembers = slotMembers.filter((m) => !membersAvailable.some((av) =>
            av.member_id === m.id)).length;
        if (invalidMembers > 0) throw new Error("At least one slot contains a non available member");
    }

    /**
     * Verifies that a group of availabilities can be used to compose a valid slot
     * @param {Member[]} applicantFriends the list of friends of the applicant the slot is to be composed for
     * @param {AvailabilityInfo[]} candidates the list of availabilities, augmented with additional information
     * @protected
     */
    protected async verifySlotConstraints(applicantFriends: Member[], candidates: AvailabilityInfo[]){
        return (this.verifyFriendsConstraint(applicantFriends, candidates)) ||
            (SlotScheduler.verifyBasicSlotConstraints(candidates)) ||
            (await this.verifyAvConstraintsForSlot(candidates));
    }

    /**
     * Verifies that a group of availabilities does not contain any availability associated with one
     * of the applicant's friends
     * @param {Member[]} applicantFriends the list of friends of the applicant the slot is to be composed for
     * @param {AvailabilityInfo[]} candidates the list of availabilities, augmented with additional information
     * @protected
     */
    protected verifyFriendsConstraint(applicantFriends: Member[], candidates: Availability[]){
        const invalidAv=candidates.findIndex((av)=>applicantFriends.some(f=>f.id===av.member_id));
        return invalidAv===-1;
    }

    /**
     * Verifies that a slot contains at least two experts member and at least one board member
     * @param {AvailabilityInfo[]} candidates the availabilities of the slot
     * @return {boolean} true if the group of availabilities satisfy the conditions
     * @protected
     */
    protected static verifyBasicSlotConstraints(candidates: AvailabilityInfo[]): boolean {
        const experts=candidates.map((av)=>av.info.is_expert ? 1:0).reduce(sum, 0);
        const boards=candidates.map((av)=>av.info.is_board ? 1:0).reduce(sum, 0);
        return experts>=2 && boards>=1;
    }

    /**
     * Verifies the following constraints on a group of availabilities to be used to compose a slot:
     * - No member is already involved in more than a certain number of slots in the same day;
     * - No member is already involved in more than a certain number of slots in the same week;
     * - No member is already involved in more than a certain number of consecutive slots;
     * @param {AvailabilityInfo[]} candidates the availabilities for composing the slot
     * @protected
     */
    protected async verifyAvConstraintsForSlot(candidates: AvailabilityInfo[]): Promise<boolean> {
        const {max_slots_day, max_slots_week, max_consecutive_slots} = await this.config.get("member");
        return !candidates.some((av)=>{
            const {slots_day, slots_week, consecutive_slots}=av.info;
            return slots_day >= max_slots_day || slots_week >= max_slots_week || consecutive_slots >= max_consecutive_slots
        });
    }

    /**
     * Tries to find alternate availabilities for slot for which some availabilities have been rejected.
     * Updates the list of the member in the database and updates the attendees for the calendar event.
     * @param slot the slot to be purged
     * @return {Promise<Availability[]>} the list of the new availabilities used to purge the slot
     */
    async purgeSlotAvailabilities(slot: Slot): Promise<Availability[]>{
        const eligibleAvs=(await this.storage.availabilities.listUsableInRange(slot.time_slot));
        //map members into their availabilities for the time slot
        let used=await asyncMap(slot.members, (m)=>this.storage.availabilities.get(slot.time_slot, m.id));
        const [valid, invalid]=partition(used, (av)=>av.state!=="cancelled");
        if(invalid.length>eligibleAvs.length) return []; //no solution

        const selected=eligibleAvs.slice(0, invalid.length);
        const newAvs=[...valid, ...selected];
        await this.storage.slots.updateMembers(slot.id, newAvs);

        const slotMembers: Member[]= await asyncMap(newAvs, (av)=>this.storage.members.get(av.member_id));
        if(!slot.cal_id) throw new Error("Logic Error: an existing slot must have a cal_id");
        await this.calendar.changeEventAttendees(slot.cal_id, slotMembers);
        return selected;
    }

    /**
     * Marks a slot as "rejected". Does not affect the related availabilities
     * @param slot the slot to mark as rejected
     */
    rejectSlot(slot: Slot): Promise<void>{
        slot.state="rejected";
        return this.storage.slots.patch(slot.id, {state: "rejected"});
    }

    /**
     * Changes the state of the availabilities associated to the slot so that they can be used
     * for other slots
     * @param {Slot} slot the slot whose availabilities need to be freed
     * @return {Promise<Availability[]>} the availabilities associated with the slot before they got modified
     */
    async freeSlot(slot: Slot): Promise<Availability[]>{
        if(!slot.cal_id) throw new Error("Logic Error: an existing slot must have a cal_id");
        const availabilities= await this.storage.availabilities.listFromSlot(slot.id);
        await asyncMap(availabilities, (av)=>this.storage.availabilities.update(av.time_slot,
            av.member_id,{state: av.state==="usedAndConfirmed" ? "confirmed": "subscribed"}));
        await Promise.all([ //these two calls can be done in parallel
            this.calendar.deleteEvent(slot.cal_id),
            this.storage.slots.patch(slot.id, {cal_id: undefined})]);
        return availabilities;
    }

    /**
     * Retrieves the list of time slots compatible with the applicant, in a time range.
     * @param start the start time of the time window
     * @param end the end time of the time window
     * @param applicant_id the id of the applicant for whom the eligible time slots are to be returned
     * @return {Promise<TimeSlot[]>} a list of time slots
     */
    async eligibleTimeSlots(start: string, end: string, applicant_id: string): Promise<TimeSlot[]>{
        [start, end]=await this.correctTimeWindow(start, end);
        const eligibleTs=await this.storage.time_slots.listEligible({start, end}, applicant_id);
        const possibleSlots=await asyncFilter(eligibleTs, async (elem)=>{
            return new Promise<boolean>(async ()=>{
                const avsInfo=await this.addInfoToAvailabilities(elem.availabilities);
                return this.verifyAvConstraintsForSlot(avsInfo);
            })
        });
        return possibleSlots.map((elem)=>elem.time_slot);
    }

    /**
     * Helper function to construct a slot object out of the memberIds and the time slot
     * @param {string[]} memberIds the list of the members involved in the slot
     * @param time_slot the time slot the slot is associated to
     * @protected
     */
    protected async makeSlotObj(memberIds: string[], time_slot: TimeSlot): Promise<Slot> {
        const members = (await this.storage.members.partialList(memberIds))
            .map(m=>({id: m.id, name: m.name, surname: m.surname, sex: m.sex, image: m.image, is_expert: m.is_expert, is_board: m.is_board}));
        return {
            id: 0,
            interview_id: 0,
            members: [members[0], members[1], ...members.slice(2)],
            state: "assigned",
            time_slot: time_slot
        }
    }

    /**
     * Corrects the time window extremes when not compatible with the min_hours_before_first_timeslot
     * configuration parameter
     * @param start the start time of the time window
     * @param end the end time of the time window
     * @private
     */
    private async correctTimeWindow(start: string, end: string) {
        const nowDate= new Date();
        const startDate=new Date(start);
        const endDate=new Date(end);
        const min_delay_ms=(await this.config.get("applicant")).min_hours_before_first_timeslot*60*60*1000;
        if(nowDate.getTime()+min_delay_ms<startDate.getTime())
            startDate.setTime(nowDate.getTime()+min_delay_ms)
        if(endDate.getTime()<startDate.getTime())
            endDate.setTime(endDate.getTime()+min_delay_ms);
        return [startDate.toISOString(), endDate.toISOString()];
    }
}
