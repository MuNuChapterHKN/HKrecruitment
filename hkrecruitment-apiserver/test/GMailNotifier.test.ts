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
 * File:   GMailNotifier.test.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 01 maggio 2021, 15:38
 */

import {BasicMail, GMailNotifier, MailBuilder} from "../src/modules/GMailNotifier";
import {MessageTemplates} from "../src/config/messageTemplate";
import {Applicant, Member} from "../src/datatypes/entities";
import {Application} from "../src/datatypes/application";
import {NotifierData} from "../src/modules/NotificationSubsystem";

describe("Test BasicMail", ()=>{
    it("Has predefined headers after construction", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        expect(m.getHeader("Content-Type")).toBe("text/html; charset=\"UTF-8\"");
        expect(m.getHeader("MIME-Version")).toBe("1.0");
        expect(m.getHeader("Content-Transfer-Encoding")).toBe("8bit");
        expect(m.getHeader("from")).toBe("from@email.com");
        expect(m.getHeader("to")).toBe("to@email.com");
    });
    it("Does not accept empty from or to during construction", ()=>{
        expect(()=>new BasicMail("", "to@email.com")).toThrow("Empty value for header 'from' not accepted")
        expect(()=>new BasicMail("from@email.com", "")).toThrow("Empty value for header 'to' not accepted")
    });
    it("setHeader adds header", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        m.setHeader("bcc", "bcc@mail.com");
        expect(m.getHeader("bcc")).toBe("bcc@mail.com");
    });
    it("setHeader does not duplicate same header", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        m.setHeader("from", "from2@mail.com");
        expect(m.getHeader("from")).toBe("from2@mail.com");
    })
    it("setHeader sets subject in base64", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        m.setHeader("subject", "Mail subject");
        expect(m.getHeader("subject")).toBe( "=?utf-8?B?"+"TWFpbCBzdWJqZWN0"+"?=");
    });
    it("setHeader does not accept empty field", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        expect(()=>m.setHeader("subject", "")).toThrow("Empty value for header 'subject' not accepted");
    });
    it("setHeader validates comma separated list for bbc and reply-to", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        expect(()=>m.setHeader("bcc", "email@email.com email@email.com"))
            .toThrow("Invalid field 'bcc'");
        expect(()=>m.setHeader("reply-to", "email@email.com email@email.com"))
            .toThrow("Invalid field 'reply-to'");
    });
    it("setHeader validates email addresses", ()=>{
        expect(()=>new BasicMail("from", "to@email.com")).toThrow("Invalid field 'from'")
    })
    it("getAsString correctly concatenates headers and body", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        m.setBody("body");
        const expected="Content-Type: text/html; charset=\"UTF-8\"\nMIME-Version: 1.0\nContent-Transfer-Encoding: 8bit\n" +
            "from: from@email.com\nto: to@email.com\n\nbody";
        expect(m.getAsString()).toBe(expected);
    });
    it("getAsB64String correctly converts", ()=>{
        const m=new BasicMail("from@email.com", "to@email.com");
        m.setBody("body");
        const expected='Q29udGVudC1UeXBlOiB0ZXh0L2h0bWw7IGNoYXJzZXQ9IlVURi04IgpNSU1FLVZlcnNpb246IDEuMApDb250ZW50LVRyYW5zZmVyLUVuY29kaW5nOiA4Yml0CmZyb206IGZyb21AZW1haWwuY29tCnRvOiB0b0BlbWFpbC5jb20KCmJvZHk=';
        expect(m.getAsB64String()).toBe(expected);
    });
});

describe("Test MailBuilder", ()=>{
    const templatesPath=process.cwd()+"/test/validationData/mailTemplates.json";
    const templates : MessageTemplates= require(templatesPath);
    // @ts-ignore
    templates["$schema"]=undefined;
    const from=`from@email.com`;
    const expFrom=`"RecruitmentHKN" <${from}>`;
    const mb=new MailBuilder(templatesPath, from);
    type MessageTemplatesField = keyof MessageTemplates;

    it("Has templates on construction", ()=>{
        for(const prop of Object.getOwnPropertyNames(templates) as MessageTemplatesField[])
            expect(mb.templates[prop]).toEqual(templates[prop]);
    });
    describe("Mail construction", ()=>{
        const expSubIt="[Mario Rossi] Candidatura accettata!";
        const expBodyIt="Caro Mario Rossi, la tua candidatura è stata accettata!";
        const expSubItFm="[Maria Bianchi] Candidatura accettata!";
        const expBodyItFm="Cara Maria Bianchi, la tua candidatura è stata accettata!"
        const expSubEng="[Mario Rossi] Application accepted!";
        const expBodyEng="Dear Mario Rossi, your application has been accepted!";
        const expTo="to@email.com";
        const bcc=new Set(["bcc@email.com", "bcc2@email.com"]);
        const rplto=new Set(["reply-to@email.com", "reply-to2@email.com"]);



        it("BuildMail mail for italian male", ()=>{
            const m=mb.buildMail("application_accepted", "ita", "male",
                {name:"Mario", surname: "Rossi"}, expTo, bcc, rplto);
            const tgMail=new BasicMail(expFrom, expTo)
                            .setHeader("subject", expSubIt).setHeader("bcc", Array.from(bcc).join(","))
                            .setHeader("reply-to", Array.from(rplto).join(","));
            tgMail.setBody(expBodyIt);
            expect(m).toEqual(tgMail);
        });
        it("BuildMail mail for italian female", ()=>{
            const m=mb.buildMail("application_accepted", "ita", "female",
                {name:"Maria", surname: "Bianchi"}, expTo, bcc, rplto);
            const tgMail=new BasicMail(expFrom, expTo)
                .setHeader("subject", expSubItFm).setHeader("bcc", Array.from(bcc).join(","))
                .setHeader("reply-to", Array.from(rplto).join(","));
            tgMail.setBody(expBodyItFm);
            expect(m).toEqual(tgMail);
        });
        it("BuildMail english", ()=>{
            const m=mb.buildMail("application_accepted", "eng", "male",
                {name:"Mario", surname: "Rossi"}, expTo, bcc, rplto);
            const tgMail=new BasicMail(expFrom, expTo)
                .setHeader("subject", expSubEng).setHeader("bcc", Array.from(bcc).join(","))
                .setHeader("reply-to", Array.from(rplto).join(","));
            tgMail.setBody(expBodyEng);
            expect(m).toEqual(tgMail);
        })
        it("customMail", ()=>{
            const m=mb.customMail({subject:expSubIt, body:expBodyIt},
                expTo, bcc, rplto);
            const tgMail=new BasicMail(expFrom, expTo)
                .setHeader("subject", expSubIt).setHeader("bcc", Array.from(bcc).join(","))
                .setHeader("reply-to", Array.from(rplto).join(","));
            tgMail.setBody(expBodyIt);
            expect(m).toEqual(tgMail);
        });
    });
    it("getRequiredFields", ()=>{
            expect(mb.getRequiredFields("require_availability_confirmation", "ita"))
                .toEqual(["name", "surname", "start", "end"]);
    })
});

/**
 * These tests are very basic
 */
describe("Test GMailNotifier", ()=>{
    const getMockedDao= ()=>{
        return {
            members: {
                get: jest.fn(() => {
                    return new Promise<Member>((res) => res({} as Member))
                }),
                supervisors: {
                    list: jest.fn(() => {
                        return new Promise<Member[]>((res) => res([] as Member[]))
                    })
                }
            },
            applicants: {
                get: jest.fn(() => {
                    return new Promise<Applicant>((res) => res({} as Applicant))
                }),
            },
            applications: {
                get: jest.fn(() => {
                    return new Promise<Application>((res) => res({} as Application))
                })
            },
            notifications: {
                insert: ()=>{return new Promise<void>(()=>{})} //not interested here in this
            }
        };
    }
    const mockedDao=getMockedDao();
    // @ts-ignore
    const notifier=new GMailNotifier(mockedDao);
    let gMailNotifierSendMail: (mail:BasicMail)=>Promise<number>;
    beforeAll(()=>{
        //to avoid to call GMail API: this assumes that GMailNotifier.sendMail works
        // @ts-ignore
        gMailNotifierSendMail=notifier.constructor.sendMail;
        // @ts-ignore
        notifier.constructor.sendMail= ()=>{
            return new Promise<number>((resolve)=>resolve(200));
        }
    });
    afterAll(()=>{
        //restore the original method
        // @ts-ignore
        notifier.constructor.sendMail= gMailNotifierSendMail;
    });
    it("buildMail sets cc header", ()=>{
        const data:NotifierData={         // @ts-ignore
            secondaryRecipient: {email: "hknMember@email.com"}, // @ts-ignore
            lang: "ita", notification: {uri: "https://uri.com"}, // @ts-ignore
            mainRecipient: {name: "Mario", surname:"Rossi", sex:"male", email: "mariorossi@email.com"}
        }
        const mail=notifier.buildMail("application_accepted", data,
            [data.mainRecipient.email, data.mainRecipient.email], "bcc@email.com");
        expect(mail.getHeader("cc")).toBe(data.secondaryRecipient?.email);

    })
    it("Notify resolves", ()=>{
        // @ts-ignore
        mockedDao.members.supervisors.list.mockReturnValueOnce(new Promise((res)=>res([{email: "email@email.com"}, {email: "emai@email.com"}])));
        const data:NotifierData={         // @ts-ignore
            secondaryRecipient: {email: "email@email.com"}, // @ts-ignore
            lang: "ita", notification: {uri: "https://uri.com"}, // @ts-ignore
            mainRecipient: {name: "Mario", surname:"Rossi", sex:"male", email: "mariorossi@email.com"}
        }
        return notifier.notify("new_application", data)
            .then(()=>{
                expect(mockedDao.members.supervisors.list.mock.calls.length).toBe(1);
            });
    });

    it("Notify with insufficient data rejects", ()=>{
        const mockedDao=getMockedDao();
        // @ts-ignore
        const notifier=new GMailNotifier(mockedDao);
        //missing {start, end} of the time slot of the availability that requires confirmation
        const data:NotifierData={ // @ts-ignore
            secondaryRecipient: {email: "email@email.com"}, // @ts-ignore
            lang: "ita", notification: {uri: "https://uri.com"}, // @ts-ignore
            mainRecipient: {name: "HKnuer", surname:"HKnuer", sex:"male", email: "hknuer@hkn.com"}
        }
        return expect(notifier.notify("require_availability_confirmation", data))
            .rejects.toThrow(`Not enought data for event require_availability_confirmation`);
    });
})
describe("Test to real GMail API", ()=>{
    it("gmail send returns success", ()=>{
        const tg: BasicMail = new BasicMail("recruitment-noreply@hknpolito.org", "email@email.com");
        tg.setHeader("subject", "Mail di prova").setBody("Questa è una mail di prova");
        // @ts-ignore because sendMail is private
        return expect(GMailNotifier.sendMail(tg)).resolves.toBe(200);
    })
})
