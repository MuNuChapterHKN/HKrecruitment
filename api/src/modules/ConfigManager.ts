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
 * File:   ConfigManager.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 25 aprile 2021, 12:16
 */

const fs = require('fs').promises;
import {RecruitmentConfig} from "../config/recruitmentConfig";

type recruitmentConfigOption= keyof RecruitmentConfig;
function clone<T>(data: T) :T {
    return JSON.parse(JSON.stringify(data));
}

export class ConfigManager{
    private config: RecruitmentConfig;
    readonly source_file:string;
    private readonly schemaProperty:string;

    constructor(source: string =process.cwd()+"/src/config/recruitmentConfig.json") {
        this.source_file=source;
        const fileData=require(this.source_file);
        this.config=fileData.recruitmentConfig;
        this.schemaProperty=fileData["$schema"];
    }

    get(): Promise<RecruitmentConfig>;
    get<Key extends recruitmentConfigOption>(name: Key): Promise<RecruitmentConfig[Key]>
    get<Key extends recruitmentConfigOption>(name?: Key): Promise<RecruitmentConfig | RecruitmentConfig[Key]>{
        const config=clone(this.config);
        return new Promise((resolve)=>{
            name ? resolve(config[name]): resolve(config);
        });
    }

    update(newConfig: RecruitmentConfig): Promise<void>;
    update<Key extends recruitmentConfigOption, Value extends RecruitmentConfig[Key]>
                (propertyName: Key, propertyValue: Value): Promise<void>;
    update<Key extends recruitmentConfigOption, Value extends RecruitmentConfig[Key]>
                (propertyNameOrNewConf: Key | RecruitmentConfig, propertyValue?: Value): Promise<void> {
        if (!propertyValue) //new whole recruitment config available
            this.config = <RecruitmentConfig>propertyNameOrNewConf;
        else
            this.config[<Key>propertyNameOrNewConf] = propertyValue;
        return fs.writeFile(this.source_file,
            JSON.stringify({$schema: this.schemaProperty, recruitmentConfig: {...this.config}}, null, 2));
    }
}
