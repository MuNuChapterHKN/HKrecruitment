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
 * File:   GCalendar.test.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 04 maggio 2021, 12:41
 */

import {GCalendar} from "../src/modules/GCalendar";
import {TimeSlot} from "../src/datatypes/dataTypes";

describe("GCalendar Test", ()=>{
    const cal =new GCalendar();
    const randomId="jnfkjwfjkwfkwwk";
    const startDate=new Date();
    const endDate=new Date();
    endDate.setHours(23, 59)
    const ts:TimeSlot={start: startDate.toISOString(), end:endDate.toISOString()}

    it("insertEvent", ()=>{
        return expect(cal.insertEvent(ts, "Test Event (You can safely delete it)", "Test Event description",
            [{email:"haipubmnzrwwtpfurg@upived.online"}])
        ).resolves.toBeDefined();
    });
    it("getEvent with random id gets rejects", ()=>{
        return expect(cal.getEvent(randomId)).rejects.toBeDefined();
    });
    it("getEvent resolves", ()=>{
        let eventId:string;
        cal.insertEvent(ts, "Test Event", "Test Event description",
            [{email:"haipubmnzrwwtpfurg@upived.online"}])
            .then((id)=>{
                eventId=id;
                expect(id).toBeDefined();
                expect(cal.getEvent(eventId)).resolves.toBeDefined();
            });
    });
    it("deleteEvent with random id gets rejects", ()=>{
        expect(cal.deleteEvent(randomId)).rejects.toBeDefined();
    });
    it("deleteEvent resolves", ()=>{
        let eventId:string;
        cal.insertEvent(ts, "Test Event", "Test Event description",
            [{email:"haipubmnzrwwtpfurg@upived.online"}])
            .then((id)=>{
                eventId=id;
                expect(id).toBeDefined();
                expect(cal.deleteEvent(eventId)).resolves.toBe(204);
            });
    });
})
