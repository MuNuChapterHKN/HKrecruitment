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
 * File:   HKContext.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 22 aprile 2021, 00:12
 */

import {NotificationSubsystem} from "./NotificationSubsystem";
import {SlotScheduler} from "./SlotScheduler";
import {CalendarInterface} from "./CalendarInterface";
import {Compensator} from "./Compensator";
import {Validator} from "./ValidatorInterface";
import {FileStorageInterface} from "./FileStorageInterface";
import {DAO} from "./DAO/DAOdefs";
import {AuthZManager} from "./AuthZManager";
import {ConfigManager} from "./ConfigManager";

export class HKContext{
    private static _context:HKContext=new HKContext();
    readonly config : ConfigManager;
    readonly db: DAO;
    readonly notificator : NotificationSubsystem;
    readonly scheduler : SlotScheduler;
    readonly calendar : CalendarInterface;
    readonly compensator : Compensator;
    readonly authZ: AuthZManager;
    readonly validators: Validator<any>[];
    readonly drive: FileStorageInterface;

    constructor() {
        //TODO: implement
    }

    static get context(): HKContext {
        return this._context;
    }
}
