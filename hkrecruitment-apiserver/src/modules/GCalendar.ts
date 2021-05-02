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
import {getAuth} from "./GAuth/GAuth"
import {calendar_v3, google} from "googleapis";
import {OAuth2Client} from "google-auth-library"
import {GCalendarPreferences, Insert} from "../config/gCalendarPreferences";

/**
 * @class GCalendar implements a calendar service using Google Calendar
 * @inheritDoc
 * @implements CalendarInterface
 */
export class GCalendar implements CalendarInterface{
    /**
     * An object containing the preferences for Google Calendar retrieved from
     * a configuration file
     * @private
     */
    private prefs : GCalendarPreferences;

    constructor(){
        const prefPath=process.cwd()+"/src/config/gcalendarPreferences.json";
        this.prefs=require(prefPath);
    }
    deleteEvent(event_id: string): Promise<number> {
        return new Promise((resolve, reject)=>{
            getAuth().then((auth: OAuth2Client)=>{
                const calendar= google.calendar({version: "v3", auth});
                const params={
                    calendarId:"primary",
                    eventId:event_id
                }
                calendar.events.delete(params).then((res)=>resolve(res.status)).catch((err)=>reject(err));
            })
        });
    }

    getEvent(event_id: string): Promise<calendar_v3.Schema$Event> {
        return new Promise((resolve, reject) => {
            getAuth().then((auth: OAuth2Client)=>{
                const calendar = google.calendar({version: 'v3', auth});
                const params={
                    calendarId:"primary",
                    eventId:event_id
                }
                calendar.events.get(params).then((res)=>resolve(res.data)).catch((err)=>reject(err));
            })
        });
    }

    insertEvent(when: TimeSlot, title: string, description: string, attendees: { email: string }[]): Promise<string> {
        return new Promise((resolve, reject) => {
            getAuth().then((auth: OAuth2Client)=>{
                const calendar = google.calendar({version: 'v3', auth});
                const pref :Insert = JSON.parse(JSON.stringify(this.prefs.gcalendarPreferences.insert));
                pref.conferenceData.createRequest.requestId=require("crypto").randomBytes(32).toString('hex');
                const event= {
                    start : {
                        dateTime: when.start,
                        timeZone: "Europe/Rome"
                    },
                    end : {
                        dateTime: when.end,
                        timeZone: "Europe/Rome"
                    },
                    attendees: attendees,
                    summary: title,
                    description: description,
                    ...pref
                }
                // @ts-ignore
                calendar.events.insert({
                    calendarId: "primary",
                    conferenceDataVersion: pref.conferenceDataVersion || 1,
                    resource: event,
                    sendUpdates: "none"
                }).then((res)=> // @ts-ignore
                    resolve(res.data.id)).catch((err)=>reject(err));
            });
        });
    }
}
