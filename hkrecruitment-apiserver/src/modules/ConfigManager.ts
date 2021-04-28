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
 * File:   ConfigManager.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 25 aprile 2021, 12:16
 */

import {RecruitmentConfig} from "../config/recruitmentConfig";

export class ConfigManager{
    private config : RecruitmentConfig;
    private static _configManager : ConfigManager=new ConfigManager();


    constructor() {
        //TODO: implement
    }
    changeConfig(newConfig:RecruitmentConfig){
        //TODO: implement
    }

    static get configManager(): ConfigManager {
        return this._configManager;
    }
}
