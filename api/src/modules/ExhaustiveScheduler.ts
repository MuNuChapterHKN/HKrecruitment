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
 * File:   ExhaustiveScheduler.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 20 maggio 2021, 22:41
 */

import {AvailabilityInfo, SlotScheduler, SlotSolution} from "./SlotScheduler";
import {ConfigManager} from "./ConfigManager";
import {SchedulerDAO} from "./DAO/DAOdefs";
import {CalendarInterface} from "./CalendarInterface";
import {TimeSlot} from "../datatypes/dataTypes";

/**
 * SlotScheduler using an exhaustive approach to calculate the best possible
 * slot to assign to an application
 * @pat.name Strategy {@pat.role Leaf}
 * @pat.task Delegate the actual creation of a slot to subclasses implementation strategy
 * @inheritDoc
 */
export class ExhaustiveScheduler extends SlotScheduler{

    constructor(config: ConfigManager, storage: SchedulerDAO, calendar: CalendarInterface) {
        super(config, "bestFit", storage, calendar);
    }

    /**
     * Builds the best slot possible among the valid ones that is possible to form
     * starting from the availabilities for the time slot
     * @protected
     */
    protected async buildSlot(tsAvailabilities: { time_slot: TimeSlot; availabilities: AvailabilityInfo[] }, weights: { gender_inequality: number; slots_day: number; slots_week: number }): Promise<SlotSolution | null> {
        const avs = tsAvailabilities.availabilities;
        if(!SlotScheduler.verifyBasicSlotConstraints(avs)) //impossible to make a slot out of these availabilites
            return null;
        const sol = new SlotSolution(3, weights);
        const bestSol = new SlotSolution(3, weights);
        //slots are composed by 2 or 3 people
        await this.buildSlot_r(avs, sol, bestSol, 2);
        if(avs.length>=3)
            await this.buildSlot_r(avs, sol, bestSol, 3);
        return bestSol;
    }

    /**
     * Recursive algorithm for generating all the k-combinations of availabilities and
     * selecting the best one. The length of input must be guaranteed to be greater than
     * or equal to k.
     * @param {AvailabilityInfo[]} input the complete set of availabilities for the time slot
     * @param {SlotSolution} sol the current solution that is being built
     * @param {SlotSolution} bestSol the best solution found so far
     * @param {number} k the dimension of the solution to be generated
     * @param {number} pos length of the current solution
     * @param {number} start index of the next element to be picked up from input
     * @private
     */
    private async buildSlot_r(input: AvailabilityInfo[], sol: SlotSolution, bestSol: SlotSolution, k: number, pos: number = 0, start: number = 0) {
        if (pos === k) {
            const avs=sol.getAvailabilitiesInfoLoss();
            if (SlotScheduler.verifyBasicSlotConstraints(avs) && await this.verifyAvConstraintsForSlot(avs))
                bestSol.updateIfWorseThan(sol);
        }
        else {
            for (let i = start; i < input.length; i++) {
                sol.setAvailability(input[i], i);
                await this.buildSlot_r(input, sol, bestSol, k, pos + 1, i + 1);
            }
        }
    }
}
