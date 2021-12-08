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
 * File:   ConfigManager.test.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 07 maggio 2021, 22:52
 */

import {ConfigManager} from "../src/modules/ConfigManager";
import {RecruitmentConfig} from "../src/config/recruitmentConfig";
const fs = require('fs');


describe("Test ConfigManager", ()=>{
    const testFilePath=process.cwd()+"/test/validationData/recruitmentConfig.json";
    const testConfig:RecruitmentConfig=require(testFilePath).recruitmentConfig;
    const cm=new ConfigManager(testFilePath);

    it("Test get", ()=>{
        expect(cm.get()).resolves.toEqual(testConfig);
        expect(cm.get("interview_template")).resolves.toBe(testConfig.interview_template);
    });
    it("get returns a copy, not a reference", ()=>{
        return cm.get().then((config)=>{
            const changedProp=JSON.parse(JSON.stringify(config.interview_template+"_"));
            config.interview_template=changedProp
            return expect(cm.get("interview_template")).resolves.not.toBe(changedProp);
        });
    })
    it.skip("Test update", ()=>{
        return cm.get("interview_template").then((previousValue)=>{
            const newValue=previousValue+"_";
            expect(cm.update("interview_template", newValue)).resolves.toBeDefined();
            return expect(cm.get("interview_template")).resolves.toBe(newValue);
        });
    });
    it("update saves on file", ()=>{
        return cm.get("interview_template").then((previousValue)=>{
            const newValue=previousValue+"_";
            cm.update("interview_template", newValue)
                .then(()=>{
                    const rawData=fs.readFileSync(testFilePath);
                    const recrConfigRetr:RecruitmentConfig=JSON.parse(rawData).recruitmentConfig;
                    expect(recrConfigRetr.interview_template).toBe(newValue);
                });
        });
    });
})
