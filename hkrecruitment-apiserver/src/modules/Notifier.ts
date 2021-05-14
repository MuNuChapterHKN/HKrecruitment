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
 * File:   Notifier.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 21 aprile 2021, 18:19
 */

import {NotificationEvent, NotificationMethod} from "../config/recruitmentConfig";
import {NotificationDAO} from "./DAO/DAOdefs";
import {NotifierData} from "./NotificationSubsystem";

export abstract class Notifier{
    private readonly _method_implemented : NotificationMethod;
    protected readonly storage : NotificationDAO;

    protected constructor(method_implemented: NotificationMethod, storage: NotificationDAO) {
        this._method_implemented = method_implemented;
        this.storage = storage;
    }

    get method_implemented(): NotificationMethod {
        return this._method_implemented;
    }

    abstract notify(event: NotificationEvent, data: NotifierData):Promise<number>;
}
