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
 * File:   utils.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 26 maggio 2021, 11:07
 */

/**
 * Return one random element of an array of elements
 * @template T
 * @param items<T> an array of items
 * @return {T} an element of the array
 * @throws {Error} if the array is empty
 */
export function oneOf<T>(items: T[]): T{
    if(items.length===0) throw new Error("Empty array");
    return items[Math.floor(Math.random() * items.length)];
}

export function copyArrayShallow<T>(source: T[], dest: T[], [from, to]: [number, number]){
    if(dest.length<to) throw new Error("Invalid dimensions");
    for(let i=from; i<to; i++)
        dest[i]=source[i];
}

export function partition<T>(items: T[], predicate: (item: T)=>boolean){
    const trues: T[]=[], falsies: T[]=[];
    items.forEach((elem)=>{
        predicate(elem) ? trues.push(elem): falsies.push(elem);
    });
    return [trues, falsies];
}

export async function asyncFilter<T>(items: T[], predicate:  (elem: T)=>Promise<boolean>):Promise<T[]>{
    const results = await Promise.all(items.map(predicate));
    return items.filter((_v, index) => results[index]);
}

export async function asyncMap<T,U>(items: T[], mapper: (elem:T)=>Promise<U>):Promise<U[]>{
    return Promise.all(items.map(mapper));
}

export const sum=(partialSum: number, addendum: number)=>{return partialSum+addendum};
