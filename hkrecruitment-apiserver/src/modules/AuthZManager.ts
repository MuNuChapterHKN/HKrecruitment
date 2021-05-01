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

function clone<T>(data: T) :T {
    return JSON.parse(JSON.stringify(data));
}

/**
 * @class AuthZRule represent an authorization rule against which an request
 * to an API should comply
 */
export class AuthZRule implements BasicAuthZRule {
    readonly accept: Constraints;
    readonly action: string;
    readonly deny: Constraints;
    readonly fillablePropsNum: number;

    private static readonly equals=(a,b)=>a===b;
    private static readonly notEquals=(a,b)=>a!==b;


    constructor(rule:BasicAuthZRule) {
        this.accept=rule.accept || [];
        this.deny=rule.deny || [];
        if(this.accept.length===0 && this.deny.length===0)
            throw new Error("accept[] and deny[] can't be both empty");
        this.action=rule.action || "";
        this.fillablePropsNum=this.countFillableProps();
    }

    /**
     * Fills the parameters of a rule with actual values
     * @param accepted_data the values for @member {Constraints} accept constraints
     * @param deny_data the values for @member {Constraints} deny constraints
     */
    fillRule(accepted_data : Constraints, deny_data : Constraints) : AuthZRule{
        if(this.fillablePropsNum===0) return this;
        const newRuleData : BasicAuthZRule = {accept:clone(this.accept), deny:clone(this.deny)};
        const substituteNulls= function (constraint, index){
            for(const field of Object.getOwnPropertyNames(this[index])){
                if(constraint[field]===null)
                    constraint[field]=this[index][field];
            }
        }
        newRuleData.accept.forEach(substituteNulls, accepted_data);
        newRuleData.deny.forEach(substituteNulls, deny_data);
        const ret=new AuthZRule(newRuleData);
        if(ret.fillablePropsNum!==0) throw new Error("Parameters not sufficient to fill the rule");
        return ret;
    }

    /**
     * Verifies that an entity comply with the rule
     * @param data the entity to verify the rule against to
     *
     * @member accept constrains the characteristics that data has to have. A rule with
     * accept = [] will rely on deny to decide if data verifies the rule. A rule with
     * deny = [] will rely on accept to decide if data verifies the rule. A rule with
     * both accept = [] and deny = [] is invalid.
     * Constraints in accept and deny go in AND.
     */
    verifyRule(data:any):boolean{
        if(this.fillablePropsNum!==0) throw new Error("Rule not filled");
        const acceptRes=this.accept.length===0 ?
            true: AuthZRule.verifyConstraints(data, this.accept, AuthZRule.equals);
        const denyRes=this.deny.length===0 ?
            false: AuthZRule.verifyConstraints(data, this.deny, AuthZRule.notEquals);
        return acceptRes && !denyRes;
    }

    /**
     * Verify entity data against some constraints
     * @param data the data describing the entity
     * @param {Constraints} c the constraints to verify
     * @param cmp the comparator to use between entity data and the values for the constraints
     * @private
     *
     * Different constraints in @param c go in OR with each other, e.g. if one matches there
     * is no need to check the others
     */
    private static verifyConstraints(data: any, c: Constraints, cmp: (a, b) => boolean):boolean{
        for(const constraint of c)
            if(AuthZRule.verifyConstraint(data, constraint, cmp))
                return true
        return false;
    }

    /**
     * Verify entity data against a single constraint
     * @param data the data describing the entity
     * @param c the constraint to verify
     * @param cmp the comparator to use between entity data and the values for the constraint
     * @return {boolean} true if the input data verifies the constraint, false otherwise
     * @private
     *
     * Different attribute values for the same constraint go in AND with each other.
     * If data has not an attribute whose value is specified in the constraint, the the
     * constraint is not verified
     */
    private static verifyConstraint(data: any, c: Constraint, cmp: (a, b) => boolean):boolean{
        for(const field of Object.getOwnPropertyNames(c)){
            if(!data.hasOwnProperty(field) || cmp(data[field],c[field]))
                return false
        }
        return true;
    }

    /**
     * Counts the number of properties in all constraint that need to be filled
     * before using the rule
     * @return {number} the number of properties set to null
     * @private
     */
    private countFillableProps(): number{
        const accumNulls=(nulls, constraint:Constraint)=>{
            for(const prop of Object.getOwnPropertyNames(constraint))
                if(constraint[prop]===null)
                    nulls++;
            return nulls
        }
        return this.accept.reduce(accumNulls, 0)+this.deny.reduce(accumNulls, 0);
    }
}

/**
 * @class AuthZManager manages the authorization in the system relying on AuthZRule
 */
export class AuthZManager{
    private readonly _rules : Map<string, AuthZRule>;

    constructor(basic_rules: BasicAuthZRule[]) {
        this._rules=new Map<string, AuthZRule>();
        basic_rules.forEach((basic_rule)=>{
            const rule=new AuthZRule(basic_rule);
            this._rules.set(basic_rule.action, rule);
        })
    }

    /**
     * Authorize an action using the proper AuthZRule
     * @param action the name corresponding to the action to be authorized
     * @param entity the entity data performing the action
     * @param accepted_data the values for accept constraints of the rule
     * @param deny_data the values for deny constraints of the rule
     * @return {boolean} true if the action is authorized, false otherwise
     */
    authorize(action:string, entity:any, accepted_data: Constraints,
              deny_data: Constraints):boolean{
        const rule=this.rules.get(action);
        if(!rule) return false;
        return rule.fillRule(accepted_data, deny_data).verifyRule(entity);
    }

    /**
     * Adds a rule to the system
     * @param action the name corresponding to the action the rule has to be associated to
     * @param rule the rule to add
     * @return {boolean} true if the rule has been added (e.g. there is no other rule
     * associated with @param action)
     */
    addRule(action:string, rule:AuthZRule):boolean{
        return this._rules.has(action) ? false: this._rules.set(action, rule) && true;
    }

    /**
     * Removes a rule from the system
     * @param action the name corresponding to the action the rule is associated to
     * @return {boolean} true if the rule has been removed (e.g. there was a rule
     * associated with @param action)
     */
    removeRule(action:string):boolean{
        return !this._rules.has(action) ? false: this.rules.delete(action) && true;
    }
    get rules(): Map<string, AuthZRule> {
        return this._rules;
    }
}


