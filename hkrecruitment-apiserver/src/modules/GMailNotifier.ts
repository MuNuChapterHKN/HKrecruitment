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
 * File:   GMailNotifier.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 21 aprile 2021, 18:59
 */

import {Notifier} from "./Notifier";
import {NotificationEvent} from "../config/recruitmentConfig";
import {MessageKey, MessageTemplates} from "../config/messageTemplate";
import {NotificationDAO} from "./DAO/DAOdefs";
import {Gender} from "../datatypes/enums";
import {NotifierData} from "./NotificationSubsystem";
import {getAuth} from "./GAuth/GAuth";
import {google} from "googleapis";
import {OAuth2Client} from "google-auth-library";
import {oneOf} from "./utils";

type Language = "ita" | "eng";
type MessageFields = { [k in MessageKey]?: string };
type EditableHeaderName = "from" | "to" | "subject" | "bcc" | "reply-to" | "cc";
type HeaderName = EditableHeaderName | "Content-Type" | "MIME-Version" | "Content-Transfer-Encoding";

function toBase64(str:string): string {
    return Buffer.from(str).toString("base64")
        .replace(/\+/g, '-').
    replace(/\//g, '_');
}

export class BasicMail {
    private readonly headers: [HeaderName, string][];
    private _body: string;
    private static mailRegExp=/^[-a-z0-9~!$%^&*_=+}{'?]+(\.[-a-z0-9~!$%^&*_=+}{'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i

    constructor(from: string, to: string) {
        this.headers = [
            ["Content-Type", "text/html; charset=\"UTF-8\""],
            ["MIME-Version", "1.0"],
            ["Content-Transfer-Encoding", "8bit"]
        ];
        this.setHeader("from", from).setHeader("to", to);
        this._body = "";
    }

    /**
     * Sets an header value, according to RFC 5322
     * @param name the name of the header, must be among the ones defined by RFC 5322 (see section 3.6)
     * @param value the value to set the header to
     * @return {BasicMail} the same mail object, to allow method chaining
     */
    setHeader(name: EditableHeaderName, value: string): BasicMail {
        const newValue= BasicMail.checkHeaderValue(name, value);
        const fieldIndex=this.headers.findIndex((field)=>field[0]===name);
        if(fieldIndex===-1)
            this.headers.push([name, newValue]);
        else if(this.headers[fieldIndex][0]!==newValue)
            this.headers[fieldIndex][1]=newValue;
        return this;
    }

    /**
     * Gets the value for an header
     * @param name the name of the header whose value must be returned
     * @return {string} the header value if there is an header with the given name, an empty string otherwise
     */
    getHeader(name: HeaderName): string {
        const fieldIndex=this.headers.findIndex((field)=>field[0]===name);
        return fieldIndex>=0 ? this.headers[fieldIndex][1] : "";
    }


    get body(): string {
        return this._body;
    }

    /**
     * Sets the content of the body
     * @param body the content to set the body to
     * @return {BasicMail} the same mail object, to allow method chaining
     */
    setBody(body:string): BasicMail {
        this._body=body;
        return this;
    }

    /**
     * Gets the whole mail as a string, according RFC 5322, see appendix A.1
     * @return {string} the mail message as a string
     */
    getAsString(): string {
        const fields = this.headers.map((header)=>`${header[0]}: ${header[1]}`);
        fields.push("");
        fields.push(this._body);
        return fields.join("\n");
    }

    /**
     * Gets the whole mail as a string, as getAsString(), but encoded in base64
     * @return {string} the mail message as a base64 string
     */
    getAsB64String(): string {
        const str=this.getAsString();
        return toBase64(str);
    }

    /**
     * Checks that the value associated with an header is valid. For now, it checks that
     * email addresses are syntactically valid and that headers "to", "bcc" and "reply-to"
     * receive comma-separated list of valid email addresses.
     * Additionally, it encodes the subject in base64.
     * @param {EditableHeaderName} name the name of the header
     * @param value the value to set the header to
     * @return {string} the value, properly modified if needed
     * @private
     */
    private static checkHeaderValue(name: EditableHeaderName, value: string){
        if(value.length===0 || value.trim().length===0)
            throw new Error(`Empty value for header '${name}' not accepted`);
        let newValue=value;
        const csv=value.split( ",");
        // noinspection FallThroughInSwitchStatementJS because it is intended
        switch (name){
            case "subject":
                newValue= '=?utf-8?B?'+toBase64(value)+"?=";
                break;
            case "from": //here we accept only one email address for "from"
                const fromRegEx=/"(.*)" <(.*)>/i
                if(csv.length>1) throw new Error(`Invalid field '${name}'`);
                if(fromRegEx.test(csv[0])) { // @ts-ignore
                    csv[0]=csv[0].match(fromRegEx)[2];
                }
            case "to": case "bcc": case "reply-to": //required comma separated list of emails
                csv.forEach((email)=>{
                    if(!this.mailRegExp.test(email))
                        throw new Error(`Invalid field '${name}'`);});
        }
        return newValue;
    }
}

export class MailBuilder {
    readonly templates: MessageTemplates;
    readonly emailAddress: string;

    constructor(templates_source: string, emailAddress: string ="recruitment-noreply@hknpolito.org") {
        this.templates=require(templates_source);
        this.emailAddress=emailAddress;
    }

    /**
     * Builds a proper mail, starting from the proper template
     * @param event the NotificationEvent that triggered the notifier, used to select the correct template
     * @param lang the language of the mail to be returned
     * @param recipient_sex the gender of the recipient
     * @param entries the value to fill the template message with
     * @param to the recipient email address
     * @param bcc email addresses of the users in bcc
     * @param reply_to email addresses of the users in reply-to
     * @return {BasicMail} a mail message ready to be sent
     */
    buildMail(event: NotificationEvent, lang: Language, recipient_sex: Gender, entries: MessageFields,
              to: string, bcc: Set<string>, reply_to: Set<string>): BasicMail {
        let mailBody=this.templates[event][lang].body;
        let mailSubject=this.templates[event][lang].subject;
        const vocabulary = this.templates[event][lang].vocabulary;
        const fields = this.templates[event][lang].fields;

        //Fill with vocabulary
        vocabulary.forEach((entry)=>
            mailBody=mailBody.replace(new RegExp(`\\b(${entry.placeholder})\\b`, 'g'), entry[recipient_sex]));
        //Fill fields with actual values
        fields.forEach((key:MessageKey)=>{
            const rgExp=new RegExp(`\\b(${key})\\b`, 'g');
            mailBody=mailBody.replace(rgExp,  entries[key] || "");
            mailSubject=mailSubject.replace(rgExp, entries[key] || "");
        });
        return  new BasicMail(`"RecruitmentHKN" <${this.emailAddress}>`, to)
                .setHeader("subject", mailSubject)
                .setHeader("bcc", Array.from(bcc).join(","))
                .setHeader("reply-to", Array.from(reply_to).join(","))
                .setBody(mailBody);
    }

    /**
     * Builds a custom mail message, starting from a ready-to-go message body and subject
     * @param rawMsg an object containing the subject and the body of the message to be composed
     * @param to the recipient email address
     * @param bcc email addresses of the users in bcc
     * @param reply_to email addresses of the users in reply-to
     * @return {BasicMail} a mail message ready to be sent
     */
    customMail(rawMsg: { subject: string, body: string }, to: string, bcc: Set<string>, reply_to: Set<string>): BasicMail {
        return  new BasicMail(`"RecruitmentHKN" <${this.emailAddress}>`, to)
                    .setHeader("subject", rawMsg.subject)
                    .setHeader("bcc", Array.from(bcc).join(","))
                    .setHeader("reply-to", Array.from(reply_to).join(","))
                    .setBody(rawMsg.body);
    }

    /**
     * Gets the names of the fields to be filled in the template message
     * @param event the NotificationEvent that triggered the notifier, used to select the correct template
     * @param lang the language of the message template
     * @return {MessageKey[]} a list of required fields for the template message
     */
    getRequiredFields(event: NotificationEvent, lang: Language): MessageKey[] {
        return this.templates[event][lang].fields;
    }
}

/**
 * @class GMailNotifier represents a way to notify users of the system via a
 * mail message sent using GMail service
 * @pat.name Strategy {@pat.role Leaf}
 * @pat.task sends a message via {@link #notify()}
 * @inheritDoc
 * @extends Notifier
 */
export class GMailNotifier extends Notifier {
    private readonly builder: MailBuilder;

    constructor(storage: NotificationDAO) {
        super("email", storage);
        this.builder = new MailBuilder("../config/messageTemplate.json");
    }

    notify(event: NotificationEvent, data: NotifierData): Promise<number> {
        return new Promise(async (resolve, reject)=>{
            try{
                //reply-to and bcc?
                const [reply_to, bcc]= await this.ReplyToAndBcc(data);
                //select the standard mail or the custom one
                let mail: BasicMail = this.buildMail(event, data, bcc, reply_to);
                GMailNotifier.sendMail(mail).then((status)=>resolve(status))
                    .catch(e=>reject(e));
            }
            catch (e) {
                reject(e)
            }
        });
    }

    /**
     * Checks that the data passed in by the NotificationSubsystem (some of them in turn obtained from outside)
     * are sufficient to build the mail message from the template message
     * @param event the event that triggered the notification
     * @param data the data generated by the NotificationSubsystem for the notification.
     * @private
     * @return {MessageFields} an object containing the proper values for the MessageKeys required by the
     * mail message template
     */
    private checkRequiredFieldsAndData(event: NotificationEvent, data: NotifierData): MessageFields{
        const mailData= {name:data.mainRecipient.name, surname:data.mainRecipient.surname,
                                additionalText: data.additionalText, start:data.start, end:data.end};
        const requiredFields=this.builder.getRequiredFields(event, data.lang);
        for(const field of requiredFields) {
            const propDescriptor=Object.getOwnPropertyDescriptor(mailData, field);
            if (!propDescriptor || !propDescriptor.value)
                throw new Error(`Not enought data for event ${event}`);
        }
        return mailData;
    }

    /**
     * Select the email addresses for "reply-to" and "bcc" for the email to be generated. More specifically,
     * the "reply-to" address is taken from data.secondaryRecipient if available, or is taken by one of
     * the supervisors. In "bcc" go all the supervisors' email addresses.
     * @param data the data generated by the NotificationSubsystem for the notification.
     * @private
     * @return {Promise<[string, string[]]>} a tuple containing the address for reply-to
     * and the addresses for bcc, wrapped in a Promise
     */
    private async ReplyToAndBcc(data: NotifierData): Promise<[string, string[]]> {
        const supervisors = await this.storage.members.supervisors.list();
        const bcc = supervisors.map((member) => member.email); //supervisors always in bcc
        let reply_to: string = data.secondaryRecipient ? data.secondaryRecipient.email : oneOf(supervisors).email;
        //if no application, a supervisor's mail is used as clerk email (for reply-to)
        return [reply_to, bcc];
    }

    /**
     * Uses the GMail API to send an email message previously built
     * @param mail the mail message
     * @protected
     * @return {Promise<number>>} the HTTP status code returned by the API call,
     * wrapped in a Promise
     */
    protected static sendMail(mail:BasicMail): Promise<number>{
        return new Promise((resolve, reject)=>{
            getAuth().then((auth: OAuth2Client)=>{
                const gmail = google.gmail({version: 'v1', auth});
                const b64mex=mail.getAsB64String();
                // @ts-ignore
                gmail.users.messages.send(
                    {auth: auth,
                        userId: 'me',
                        resource:
                            {raw: b64mex}
                    }
                ).then((res)=>resolve(res.status)).catch(e=>reject(e));
            }).catch(e=>reject(e));
        });
    }

    /**
     * Uses BasicMail's methods to construct an email.
     * @param event the event that triggered the notification
     * @param data the data generated by the NotificationSubsystem for the notification.
     * It contains the data about the notification: in particular data.mainRecipient
     * is used as "to", data.secondaryRecipient (if present) is used as "cc".
     * @param bcc the list of members in "bcc" header of the email
     * @param reply_to the address for reply-to header of the mail
     * @return {BasicMail} the constructed email
     */
    buildMail(event: NotificationEvent, data: NotifierData, bcc: string[], reply_to: string): BasicMail {
        let mail: BasicMail;
        if(!data.customMessage){
            //then data must contain sufficient info for filling the template mail
            const mailData=this.checkRequiredFieldsAndData(event, data);
            mail= this.builder.buildMail(event,data.lang, data.mainRecipient.sex, {...mailData},
                data.mainRecipient.email, new Set(bcc), new Set([reply_to]));
        }
        else
            mail= this.builder.customMail(data.customMessage, data.mainRecipient.email,
                new Set(bcc), new Set([reply_to]));
        if(data.secondaryRecipient) mail.setHeader("cc", data.secondaryRecipient.email)
        return mail;
    }
}
