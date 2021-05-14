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
 * File:   NotificationSubsystem.test.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 08 maggio 2021, 12:06
 */

import {buildNotification, NotificationSubsystem, RecipientsSelector} from "../src/modules/NotificationSubsystem";
import {Application} from "../src/datatypes/application";
import {Compensator} from "../src/modules/Compensator";
import {ConfigManager} from "../src/modules/ConfigManager";
import {Applicant, Interview, Member} from "../src/datatypes/entities";
import {NotificationMethod} from "../src/config/recruitmentConfig";


describe("Test RecipientsSelector", ()=>{
    let nDao:any;
    let rs:RecipientsSelector;
    beforeEach(()=>{
        nDao=getnDao();
        rs=new RecipientsSelector(nDao)
    });
    function getnDao(){
        return {
            applications: {
                getApplicant: jest.fn(),
                get: jest.fn()
            },
            members: {
                get: jest.fn(),
                supervisors:{
                    list: jest.fn(),
                },
                clerks:{
                    list: jest.fn(),
                }
            },
            interviews: {
                get: jest.fn()
            }
        }
    }
    const nowStr=new Date().toISOString();
    const clerk: Member ={
        email: "email@email.com",
        id: "1",
        is_board: false,
        is_expert: false,
        name: "name",
        phone_no: "1234",
        role: "clerk",
        sex: "male",
        surname: "surname"
    }
    const boardClerk: Member ={
        email: "email@email.com",
        id: "1",
        is_board: true,
        is_expert: false,
        name: "name",
        phone_no: "1234",
        role: "clerk",
        sex: "male",
        surname: "surname"
    }
    const bscAppAccepted: Application = {
        id: 1, ita_level: "C2", state: "accepted", submission_date: nowStr, type: "BSc",
        last_modified: {attributes: [], member_id: "10", time: nowStr}
    };
    const phdAppNew: Application = {
        id: 2, ita_level: "C2", state: "new", submission_date: nowStr, type: "PhD"
    };
    const interview: Interview = {
            application_id: 1, last_modified: {attributes: [], member_id: "10", time: nowStr}, notes: ""
    };
    const bscAppNew: Application = {
        id: 1, ita_level: "C2", state: "new", submission_date: nowStr, type: "BSc"
    };
    describe("selectMember", ()=>{
        it("check on parameters", ()=>{
            //member_id missing
            expect(()=>rs.selectMember({start: nowStr, end:nowStr}))
                .toThrow("Missing parameters");
            //end missing
            expect(()=>rs.selectMember({start: nowStr, member_id: "1" }))
                .toThrow("Missing parameters");
            //start missing
            expect(()=>rs.selectMember({end:nowStr, member_id: "1" }))
                .toThrow("Missing parameters");
        });
        it("calls NotificationDAO.members.get", ()=>{
            nDao.members.get.mockReturnValueOnce(new Promise((res)=>res(clerk)));
            return rs.selectMember({start: nowStr, end: nowStr, member_id: "1" })
                .then(()=>{
                    expect(nDao.members.get.mock.calls[0][0]).toBe("1");
                })
        });
    });
    describe("selectApplicantFromApplication", ()=>{
        it("check on parameters", ()=>{
            //application_id missing
            return expect(()=>rs.selectApplicantFromApplication({})).
            rejects.toThrow("Missing application_id");
        });
        it("calls dao.applications.get, dao.applications.getApplicant", ()=>{
            const app_id=1;
            return rs.selectApplicantFromApplication({application_id: app_id})
                .then(()=>{
                    expect(nDao.applications.getApplicant.mock.calls[0][0]).toBe(app_id);
                    expect(nDao.applications.get.mock.calls[0][0]).toBe(app_id);
                });
        });

    });
    describe("selectApplicantFromInterview", ()=>{
        it("check on parameters", ()=>{
            //interview_id missing
            return expect(()=>rs.selectApplicantFromInterview({}))
                .rejects.toThrow("Missing interview_id");
        });
        it("calls dao.interviews.get, dao.applications.get, dao.applications.getApplicant", ()=>{
            const int_id=2;
            nDao.interviews.get.mockReturnValueOnce(new Promise((res)=>res(interview)));

            return rs.selectApplicantFromInterview({interview_id: int_id})
                .then(()=>{
                    expect(nDao.interviews.get.mock.calls[0][0]).toBe(int_id);
                    expect(nDao.applications.getApplicant.mock.calls[0][0]).toBe(interview.application_id);
                    expect(nDao.applications.get.mock.calls[0][0]).toBe(interview.application_id);
                })
        });
    });
    describe("secondaryRecipient", ()=>{
        it("calls dao.member.supervisor.list if application revocated", ()=>{
            nDao.members.supervisors.list.mockReturnValueOnce(new Promise((res)=>res([clerk, clerk])))
            // @ts-ignore
            return rs.secondaryRecipient("application_revocated", {}).then(()=>{
                expect(nDao.members.supervisors.list).toBeCalled();
            })
        });
        it("calls dao.members.get with member_id in app.last_modified", ()=>{
            return rs.secondaryRecipient("interview_mentee_accepted", bscAppAccepted)
                .then(()=>{
                expect(nDao.members.get.mock.calls[0][0]).toBe(bscAppAccepted.last_modified?.member_id);
            })
        });
        it("call to dao.member.clerks.list, bsc application", ()=>{
            nDao.members.clerks.list.mockReturnValueOnce(new Promise<Member[]>((res)=>res([clerk, boardClerk])));
            return rs.secondaryRecipient("new_application", bscAppNew)
                .then((clerkR)=>{
                    expect(nDao.members.clerks.list).toBeCalled();
                    expect(clerkR).toEqual(clerk);
                })
        });
        it("call to dao.member.clerks.list, phd application", ()=>{
            nDao.members.clerks.list.mockReturnValueOnce(new Promise<Member[]>((res)=>res([clerk, boardClerk])));
            return rs.secondaryRecipient("new_application", phdAppNew)
                .then((clerk)=>{
                    expect(nDao.members.clerks.list).toBeCalled();
                    expect(clerk).toEqual(boardClerk);
                })
        })
    });
})
/**
 * These tests are very basic
 */
describe("Test NotificationSubsystem", ()=>{
    const nDao={
        notifications: {
            insert: jest.fn((uri:string, text:string, mid:string, aid:string) => {
                return new Promise<Application>((res) => res({} as Application))})
        },
        applications: {
            getApplicant: jest.fn((id:number)=>{return new Promise((res)=>res({} as Applicant))}),
            get: jest.fn((id:number)=>{return new Promise((res)=>res({} as Application))})
        },
        members: {
            get: jest.fn((id:string)=>{return new Promise((res)=>res({} as Member))})
        }
    }
    const testFilePath=process.cwd()+"/test/validationData/recruitmentConfig.json";
    const cfM=new ConfigManager(testFilePath);
    // @ts-ignore
    const ns=new NotificationSubsystem(nDao, {} as Compensator, cfM);

    const containsStrategy= (vec: {event:string, methods: NotificationMethod[]}[], elem: {event:string, methods: NotificationMethod[]})=>{
        const index=vec.findIndex((item)=>{
            let found=true;
            elem.methods.forEach((item2)=>found&&=item.methods.includes(item2))
            return item.event===elem.event && found;
        });
        return index>=0;
    }
    describe("selectNotifiers", ()=>{
        it("Throws on missing method", ()=>{
            return cfM.get("notification_strategies")
                .then((res)=>{
                    expect(containsStrategy(res, {event: "application_accepted", methods: ["email", "push"]})).toBe(true);
                    return expect(()=>ns.selectNotifiers("application_accepted"))
                        .rejects.toThrow("Method not available push")
                })
        });
        it("Throws on missing event", ()=>{
            return cfM.get("notification_strategies")
                .then((res)=>{
                    expect(containsStrategy(res, {event: "new_application", methods: ["email", "push"]})).toBe(false);
                    return expect(()=>ns.selectNotifiers("new_application"))
                        .rejects.toThrow("Notification methods missing for event new_application");
                })
        });
        it("Return correct notifiers", ()=>{
            return cfM.get("notification_strategies")
                .then((res)=>{
                    expect(containsStrategy(res, {event: "application_revocated", methods: ["email"]})).toBe(true);
                    return ns.selectNotifiers("application_revocated")
                        .then((notifiers)=>{
                            expect(notifiers.length).toBe(1);
                            expect(notifiers[0].method_implemented).toBe("email");
                        })
                })
        });
    })

    describe("buildNotification", ()=>{
        // @ts-ignore only the minumum required
        const applicant: Applicant ={id: "1"};
        // @ts-ignore only the minumum required
        const clerk: Member ={id: "2"}
        it("applicant and secondaryRecipient", ()=>{
            const n=buildNotification("application_accepted", applicant, clerk, "applicant","ita");
            expect(n.member_id).toBe(clerk.id);
            expect(n.applicant_id).toBe(applicant.id);
        });
        it("applicant without secondary recipient throws", ()=>{
            expect(()=>buildNotification("application_accepted", applicant, null, "applicant","ita"))
                .toThrow();
        });
        it("member without secondary recipient is accepted", ()=>{
            const n=buildNotification("availability_not_required", clerk, null, "member","ita");
            expect(n.member_id).toBe(clerk.id);
            expect(n.applicant_id).toBe("0");
        });
    });
});
