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
 * File:   CalendarInterface.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 19 aprile 2021, 11:23
 */

import {TimeSlot} from "../datatypes/dataTypes";

/**
 * Represents a calendar service
 * @interface
 */
export interface CalendarInterface{
    /**
     * Inserts an event on the calendar
     * @param {TimeSlot} when indicates the temporal extremes of the event
     * @param title the event's title
     * @param description the event's description
     * @param attendees list of email address of the attendees
     * @return {Promise<string>} the id of the created event
     */
    insertEvent(when:TimeSlot, title:string, description:string, attendees: {email:string}[]):Promise<string>;

    /**
     * Retrieves an event
     * @param event_id the id of the event
     * @return {Promise<any>} the data returned by the service in the response
     */
    getEvent(event_id:string):Promise<any>;

    /**
     * Deletes an event
     * @param event_id the id of the event
     * @return {Promise<number>} the HTTP status code of the response
     */
    deleteEvent(event_id:string):Promise<number>;

    /**
     * Overwrites the list of attendees for an event
     * @param event_id the id of the event
     * @param attendees list of email address of the new attendees
     * @return {Promise<any>} the data returned by the service in the response
     */
    changeEventAttendees(event_id:string, attendees: {email:string}[]): Promise<any>;
}
