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
 * File:   AuthZManager.test.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 29 aprile 2021, 14:59
 */

import {BasicAuthZRule} from "../src/datatypes/authZRule";
import {AuthZManager, AuthZRule} from "../src/modules/AuthZManager";

describe("Test AuthZRule", ()=>{
    describe("Construction", ()=>{
        const voidAcceptRule:BasicAuthZRule={
            deny: [
                {role:"none"}
            ]
        };
        const voidDenyRule:BasicAuthZRule={
            accept: [
                {role:"supervisor"}
            ]
        }
        it("accept[] is defined", ()=>{
            const rule=new AuthZRule(voidAcceptRule);
            expect(rule.accept).toStrictEqual([]);
            expect(rule.deny[0]).toStrictEqual({role:"none"})
        });
        it("deny[] is defined", ()=>{
            const rule=new AuthZRule(voidDenyRule);
            expect(rule.deny).toStrictEqual([]);
            expect(rule.accept[0]).toStrictEqual({role:"supervisor"});
        });
        it("accept and deny mustn't be both empty", ()=>{
            expect(()=>new AuthZRule({})).toThrow();
        })
    });

    describe("fillRule", ()=>{
        const paramId : BasicAuthZRule={
            accept: [
                {id: null, role:"none"},
                {role: null}
            ]
        };
        const paramId1 : BasicAuthZRule={
            accept: [
                {id: null, role:"none"}
            ]
        };
        const paramId2 : BasicAuthZRule={
            accept: [
                {id: null}
            ],
            deny: [
                {state: null}
            ]
        };
        it("Right number of nulls", ()=>{
            const rule1=new AuthZRule(paramId);
            const rule2=new AuthZRule(paramId1);
            const rule3=new AuthZRule(paramId2);
            expect(rule1.fillablePropsNum).toBe(2);
            expect(rule2.fillablePropsNum).toBe(1);
            expect(rule3.fillablePropsNum).toBe(2);
        });
        it("Fills part of constraint", ()=>{
            const rule=new AuthZRule(paramId1);
            const acceptedParams = [{id:1}];
            const filledRule= rule.fillRule(acceptedParams, []);
            expect(filledRule.accept[0]).toStrictEqual({id: acceptedParams[0].id, role: "none"});
        });
        it("Fills all constraints", ()=>{
            const rule=new AuthZRule(paramId);
            const acceptedParams = [{id:1}, {role:"supervisor"}];
            const filledRule=rule.fillRule(acceptedParams, []);
            expect(filledRule.accept[0]).toStrictEqual({id: acceptedParams[0].id, role: "none"});
            expect(filledRule.accept[1].role).toBe(acceptedParams[1].role);
        })
        it("Fills deny and accept", ()=>{
            const rule=new AuthZRule(paramId2);
            const acceptedParams = [{id:1}];
            const denyParams=[{state: "new"}];
            const filledRule=rule.fillRule(acceptedParams, denyParams);
            expect(filledRule.accept[0].id).toBe(acceptedParams[0].id);
            expect(filledRule.deny[0].state).toBe(denyParams[0].state);
        });
        it("Input must fill all nulls", ()=>{
            const rule=new AuthZRule(paramId);
            const acceptedParams = [{id:1}];
            expect(()=>rule.fillRule(acceptedParams, [])).toThrow();
        });
    });

    describe("verifyRule", ()=>{
        it("Empty accept rule always returns true", ()=>{
            const emptyAccept= new AuthZRule({deny: [{id:1}]});
            expect(emptyAccept.verifyRule({})).toBe(true);
        });
        it("single constraint goes in AND", ()=>{
            const data ={is_board:true, is_expert:false};
            const bsrule :BasicAuthZRule={accept: [{is_board:true, is_expert:true}]};
            const rule =new AuthZRule(bsrule);
            expect(rule.verifyRule(data)).toBe(false);
        });
        it("multiple constraints go in OR", ()=>{
            const data ={is_board:true, is_expert:false};
            const bsrule :BasicAuthZRule={accept: [{is_board:true}, {is_expert:true}]};
            const rule =new AuthZRule(bsrule);
            expect(rule.verifyRule(data)).toBe(true);
        });
        it("accept and deny constraints go in AND", ()=>{
            const data ={is_board:true, is_expert:false};
            const bsrule :BasicAuthZRule={accept: [{is_board:true}], deny:[{is_expert:true}]};
            const rule =new AuthZRule(bsrule);
            expect(rule.verifyRule(data)).toBe(false);
        });
        it("Missing property in data makes rule not verified", ()=>{
            const data ={is_expert:false};
            const data2 ={is_board:true};
            const bsrule :BasicAuthZRule={accept: [{is_board:true}], deny:[{is_expert:true}]};
            const rule =new AuthZRule(bsrule);
            expect(rule.verifyRule(data)).toBe(false);
            expect(rule.verifyRule(data2)).toBe(false);
        });
        it("Rule not filled cannot be verified", ()=>{
            const bsrule :BasicAuthZRule={accept: [{is_board:null}], deny:[{is_expert:true}]};
            const rule =new AuthZRule(bsrule);
            expect(()=>rule.verifyRule({})).toThrow();
        })
    })
})

describe("Test AuthZManager", ()=>{
    const rules: BasicAuthZRule[]=[
        {
            action: "italianStudentApplication",
            accept: [
                {role: "clerk"},
                {role: "supervisor"},
                {role: "admin"}
            ]
        },
        {
            action: "foreignStudentApplication",
            accept: [
                {
                    role: "clerk", is_board: true
                },
                {
                    role: "supervisor", is_board: true
                },
                {
                    role: "admin"
                }
            ]
        },
        {
            action: "changeInterviewerSet",
            accept: [
                {role: "supervisor"},
                {role: "admin"}
            ]
        },
        {
            action: "changeSettings",
            accept: [
                {role: "admin"}
            ]
        }
    ];

    describe("Construction and rule management", ()=>{
        it("Stores rules", ()=>{
            const m:AuthZManager=new AuthZManager(rules);
            for(const rule of rules)
                expect(m.rules.has(rule.action)).toBe(true);
        })
        it("Add rule not present", ()=>{
            const m1=new AuthZManager(rules.slice(1));
            expect(m1.addRule(rules[0].action, new AuthZRule(rules[0]))).toBe(true);
            expect(m1.rules.has(rules[0].action)).toBe(true);
        })
        it("Does not add rule with same action", ()=>{
            const m1=new AuthZManager(rules.slice(1));
            const rule=new AuthZRule(rules[0]);
            m1.addRule(rule.action, rule);
            expect(m1.addRule(rule.action, rule)).toBe(false);
        })
        it("Remove rule", ()=>{
            const m1=new AuthZManager(rules.slice(0,1));
            expect(m1.rules.has(rules[0].action)).toBe(true);
            expect(m1.removeRule(rules[0].action)).toBe(true);
            expect(m1.rules.has(rules[0].action)).toBe(false);
        })
        it("Remove rule return false if no rule to remove", ()=>{
            const m1=new AuthZManager(rules.slice(0,1));
            expect(m1.removeRule("Not present")).toBe(false);
        })
    })
    describe("Authorization", ()=>{
        const m:AuthZManager=new AuthZManager(rules);
        it("Calls fillRule and verifyRule on the rule", ()=>{
            const spyAuthorize=jest.spyOn(m.rules.get(rules[0].action), "verifyRule")
            const spyFill=jest.spyOn(m.rules.get(rules[0].action), "fillRule")
            m.authorize(rules[0].action, {role:"clerk"}, [], []);
            expect(spyFill).toHaveBeenCalled();
            expect(spyAuthorize).toHaveBeenCalled();
        })
    })
})
