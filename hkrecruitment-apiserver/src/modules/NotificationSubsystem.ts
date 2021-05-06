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
 * File:   NotificationSubsystem.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 21 aprile 2021, 18:16
 */

import {NotificationEvent, NotificationMethod, RecruitmentConfig} from "../config/recruitmentConfig";
import {Notifier} from "./Notifier";
import Timeout = NodeJS.Timeout;
import {Compensator} from "./Compensator";
import {NotificationDAO} from "./DAO/DAOdefs";
import {ConfigManager} from "./ConfigManager";
import {TimeSlot} from "../datatypes/dataTypes";

export interface NotificationData {
    application_id?: number;
    start?: string;
    end?: string;
    customMessage?: {subject:string, body:string};
    additionalText?:string;
}

export class NotificationSubsystem{
    private notifiers : Map<NotificationMethod, Notifier>;
    private config:ConfigManager;
    private storage : NotificationDAO;
    private compensator : Compensator;
    private periodic_ntf : Map<string, Timeout>;


    constructor(storage: NotificationDAO, compensator: Compensator, config:ConfigManager) {
        this.storage = storage;
        this.compensator = compensator;
        this.config = config;
        //TODO: implement
    }

    notify(event:NotificationEvent, user_id:string, user_type:string, data : NotificationData) : Promise<void>{
        //TODO: implement
        return {} as Promise<void>;
    }
    readNotification(n_id:number, user_id:string, user_type:string){
        //TODO: implement

    }
    periodicNotify(event:NotificationEvent, user_id:string, user_type:string, data : NotificationData, period:number){
        //TODO: implement

    }
    stopPeriodicNotify(event:NotificationEvent, data: NotificationData){
        //TODO: implement

    }
    private setPeriodicNotification(period:number, callback: ()=>Promise<number>){
        //TODO: implement
    }
}
