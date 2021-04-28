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
 * File:   GCalendar.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 19 aprile 2021, 11:28
 */

import {CalendarInterface} from "./CalendarInterface";
import {TimeSlot} from "../datatypes/dataTypes";

class GCalendar implements CalendarInterface{
    deleteEvent(event_id: string): void {
        //TODO: implement
    }

    getEvent(event_id: string): any {
        //TODO: implement
    }

    insertEvent(when: TimeSlot, title: string, description: string, attendees: { email: string }[]): string {
        //TODO: implement
        return "";
    }
}
