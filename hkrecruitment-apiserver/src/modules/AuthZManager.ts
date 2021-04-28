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
 * File:   AuthZManager.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 22 aprile 2021, 00:31
 */

import {BasicAuthZRule} from "../datatypes/authZRule";

type Constraint={ [p: string]: unknown};
type Constraints = Constraint[];

class AuthZRule implements BasicAuthZRule {
    readonly accept: Constraints;
    readonly action: string;
    readonly deny: Constraints;

    constructor(rule:BasicAuthZRule) {
        this.accept=rule.accept || [];
        this.deny=rule.deny || [];
        this.action=rule.action || "";
    }

    fillRule(accepted_data : Constraints, deny_data : Constraints) : AuthZRule{
        //TODO: implement
        return {...this};
    }
    verifyRule(data:any):boolean{
        //TODO: implement
        return false;
    }
    private verifyConstraints(data:any, c: Constraints):boolean{
        //TODO: implement
        return false;
    }
    private verifyConstraint(data:any, c: Constraint):boolean{
        //TODO: implement
        return false;
    }
}

export class AuthZManager{
    private rules : Map<string, AuthZRule>;

    constructor(rules_source:string) {
        this.rules=new Map<string, AuthZRule>();
        //TODO: implement
    }
    authorize(action:string, entity:any, accepted_data: Constraints,
              deny_data: Constraints):boolean{
        //TODO: implement
        return false;
    }
    addRule(action:string, rule:AuthZRule){
        //TODO: implement
    }
    removeRule(action:string){
        //TODO: implement
    }
}


