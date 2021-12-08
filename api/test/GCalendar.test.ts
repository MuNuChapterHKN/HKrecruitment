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
 * File:   GCalendar.test.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 04 maggio 2021, 12:41
 */

import {GCalendar} from "../src/modules/GCalendar";
import {TimeSlot} from "../src/datatypes/dataTypes";

describe.skip("GCalendar Test", ()=>{
    const cal =new GCalendar();
    const randomId="jnfkjwfjkwfkwwk";
    const startDate=new Date();
    const endDate=new Date();
    const title ="Test Event (You can safely delete it)";
    const descr="Test Event description";
    const attendees=[{email:"haipubmnzrwwtpfurg@upived.online"}];
    const changedAttendees=[{email:"changed@upived.online"}];
    startDate.setSeconds(0, 0);
    endDate.setHours(23, 59, 0, 0)
    const ts:TimeSlot={start: startDate.toISOString(), end:endDate.toISOString()}
    let eventId:string;
    describe("Event creation and rejections using invalid id", ()=>{
        it("insertEvent", ()=>{
            return cal.insertEvent(ts, title, descr,attendees)
                .then((id)=>{eventId=id; expect(id).toBeDefined()});
        });
        it("getEvent with random id gets rejects", ()=>{
            return expect(cal.getEvent(randomId)).rejects.toBeDefined();
        });
        it("deleteEvent with random id gets rejects", ()=>{
            return expect(cal.deleteEvent(randomId)).rejects.toBeDefined();
        });

        describe("Event manipulation from valid id", ()=>{
            it("getEvent resolves", ()=>{
                return cal.getEvent(eventId).then((event)=>{
                    expect(event.description).toEqual(descr);
                    expect(event.summary).toEqual(title);
                    expect(event.attendees[0].email).toEqual(attendees[0].email);
                    expect(new Date(event.start.dateTime)).toEqual(startDate);
                    expect(new Date(event.end.dateTime)).toEqual(endDate);
                })
            });
            describe("changeAttendees", ()=>{
                it("changeAttendees changes only attendees", ()=>{
                    return cal.changeEventAttendees(eventId, changedAttendees)
                        .then((event)=>{
                            expect(event.description).toEqual(descr);
                            expect(event.summary).toEqual(title);
                            expect(event.attendees[0].email).toEqual(changedAttendees[0].email);
                            expect(new Date(event.start.dateTime)).toEqual(startDate);
                            expect(new Date(event.end.dateTime)).toEqual(endDate);                        })
                });
                describe("Deletion", ()=>{
                    it("deleteEvent resolves", ()=>{
                        return expect(cal.deleteEvent(eventId)).resolves.toBe(204);
                    });
                });
            });
        });
    });
})
