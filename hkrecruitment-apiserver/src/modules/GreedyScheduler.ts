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
 * File:   GreedyScheduler.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 19 aprile 2021, 12:40
 */

import {AvailabilityInfo, AvailabilityInfoLoss, SlotScheduler, SlotSolution} from "./SlotScheduler";
import {TimeSlot} from "../datatypes/dataTypes";
import {ConfigManager} from "./ConfigManager";
import {SchedulerDAO} from "./DAO/DAOdefs";
import {CalendarInterface} from "./CalendarInterface";

/**
 * SlotScheduler using a greedy algorithm to find the suboptimal
 * slot to assign to an application
 * @pat.name Strategy {@pat.role Leaf}
 * @pat.task Delegate the actual creation of a slot to subclasses implementation strategy
 * @inheritDoc
 */
export class GreedyScheduler extends SlotScheduler{

    constructor(config: ConfigManager, storage: SchedulerDAO, calendar: CalendarInterface) {
        super(config, "firstFit", storage, calendar);
    }

    /**
     * Greedy algorithm for finding a slot from a set of availabilities. The algorithm takes into account
     * the number of slots per day and per week of the selected members. It doesn't take into account
     * the genderDistribution for choosing an availabilities group, since it returns the first build slot,
     * but anyway counts it for slot score calculation, since makeSlot can use this info to choose among
     * slots in different time slots.
     * @protected
     */
    protected async buildSlot(tsAvailabilities: { time_slot: TimeSlot; availabilities: AvailabilityInfo[] }, weights: { gender_inequality: number; slots_day: number; slots_week: number }): Promise<SlotSolution | null> {
        if(!SlotScheduler.verifyBasicSlotConstraints(tsAvailabilities.availabilities))
            return null;
        const avScores=SlotSolution.calculateAvsLoss(tsAvailabilities.availabilities, weights)
            .sort((a1, a2)=>a1.loss-a2.loss);
        const [boards, experts]=GreedyScheduler.getMembersAndExperts(avScores);
        //here boards.length is at least 2, experts.length is at least 1, because of verifySlotConstraints
        const sol=new SlotSolution(3, weights);
        sol.setAvailability(boards[0]).setAvailability(boards[1]);
        if(!boards[0].info.is_expert && !boards[1].info.is_expert)
            sol.setAvailability(experts[0]);
        return sol;
    }

    /**
     * Helper function to select the availabilities related to board and expert members
     * @param {AvailabilityInfoLoss[]} avLosses the availabilities with their losses
     * @protected
     */
    protected static getMembersAndExperts(avLosses: AvailabilityInfoLoss[]){
        const boards=avLosses.filter((av)=>av.info.is_board);
        const experts=avLosses.filter((av)=>av.info.is_expert);
        return [boards, experts];
    }
}
