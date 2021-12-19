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
 * File:   ValidatorInterface.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 17 aprile 2021, 18:40
 */

import Ajv, {ErrorObject, ValidateFunction} from "ajv";
import addFormats from "ajv-formats";

const schemaPath=process.cwd()+"/src/datatypes/json-schemas";

export interface Validator<T>{
    validate : (entity:any) =>T;
}


export abstract class AjvValidator<T> implements Validator<T> {
    protected static readonly ajv:Ajv=AjvValidator.initAjv();
    private static initAjv():Ajv{
        const ajv=new Ajv();
        addFormats(ajv);
        ajv.addMetaSchema(require(schemaPath+"/json-schema-draft-06.json"))
        const enums = require(schemaPath+'/enums.json');
        const Entities = require(schemaPath+'/entities.json');
        const DataTypes = require(schemaPath+'/dataTypes.json');
        const Person = require(schemaPath+'/person.json');
        const Application = require(schemaPath+'/application.json');
        const Payloads= require(schemaPath+'/payloads.json');

        ajv.addSchema(Entities).addSchema(DataTypes).addSchema(Person).addSchema(Application)
            .addSchema(enums).addSchema(Payloads);
        return ajv;
    }
    abstract validate(entity: any): T;
    throwError(errors : ErrorObject[]): never {
        const errorStrings: string[] = [];
        for (const error of errors){
            errorStrings.push(JSON.stringify(error));
        }
        throw Error(errorStrings.join());
    }
}
