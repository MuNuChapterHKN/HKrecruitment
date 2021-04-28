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
import {NotificationEvent, NotificationMethod} from "../config/recruitmentConfig";
import {MessageEntry, MessageKey, MessageTemplates} from "../config/messageTemplate";
import {Notification} from "../datatypes/dataTypes";
import {NotificationDAO} from "./DAO/DAOdefs";
import {Gender} from "../datatypes/enums";

type Language = "ita" | "eng";

class MailBuilder{
    // @ts-ignore TODO: to be removed
    private readonly templates : MessageTemplates;

    constructor(templates_source:string) {
        //TODO: implement
    }

    buildMail(event:NotificationEvent, lang: Language, recipient_sex: Gender, entries: Set<MessageEntry>,
              to: string, bcc: Set<string>, reply_to: Set<string>) : string{
        //TODO: implement
        return "";
    }

    static fillMail(rawMsg: string, lang: Language, recipient_sex: Gender, entries: Set<MessageEntry>,
             to: string, bcc: Set<string>, reply_to: Set<string>) : string{
        //TODO: implement
        return "";
    }

    getRequiredFields(event:NotificationEvent):Set<MessageKey>{
        //TODO: implement
        return new Set<MessageKey>();
    }
}

export class GMailNotifier extends Notifier{
    private readonly builder : MailBuilder;

    constructor(method_implemented: NotificationMethod, storage: NotificationDAO) {
        super(method_implemented, storage);
        this.builder=new MailBuilder("../config/messageTemplate.json");
        //TODO: implement
    }

    notify(event: NotificationEvent, notification: Notification): Promise<void> {
        //TODO: implement
        return new Promise<void>(()=>{});
    }
}
