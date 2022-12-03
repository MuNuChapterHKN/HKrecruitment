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
 * File:   GDriveStorage.test.ts
 * Project: api
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 04 maggio 2021, 15:09
 */

import {GDriveStorage} from "../src/modules/GDriveStorage";

describe.skip("GDriveStorage Test", ()=>{
    const storage = new GDriveStorage();
    const folderName="Test Folder (you can safely remove)";
    let folder_id:string;
    let file_id:string;
    const sharedFileUrl="https://drive.google.com/file/d/1gxnPe-IztExwYhSVevHIqnoOwxU7BJlW/view?usp=sharing";
    const sharedFileId="1gxnPe-IztExwYhSVevHIqnoOwxU7BJlW";
    let copied_file_id:string;
    describe("Resource creation", ()=>{
        it("createFolder", ()=>{
            return storage.createFolder(folderName)
                .then((id)=>{folder_id=id; expect(id).toBeDefined()})
        });
        it("insertFile", ()=>{
            return storage.insertFile("Test File (you can safely remove)", new Uint8Array([42]))
                .then((id)=>{file_id=id; expect(id).toBeDefined()});
        });
        it("copyFileFromStorage", ()=>{
            return storage.copyFileFromStorage(sharedFileId, "Test Shared File (you can safely remove)")
                .then((id)=>{copied_file_id=id; expect(id).toBeDefined()});
        })
        it("getFolderByName", ()=>{
            return expect(storage.getFolderByName(folderName)).resolves.toBe(folder_id);
        });
        it("fromUrlToId", ()=>{
            expect(storage.extractIdFrom(sharedFileUrl)).toBe(sharedFileId);
        })
        describe("Resource creation inside folder", ()=>{
            let file_id2:string;
            let folder_id2:string;
            it("createFolder", ()=>{
                return storage.createFolder(folderName, folder_id)
                    .then((id)=>{folder_id2=id; expect(id).toBeDefined()})
            });
            it("insertFile", ()=>{
                return storage.insertFile("Test File (you can safely remove)", new Uint8Array([42]), folder_id)
                    .then((id)=>{file_id2=id; expect(id).toBeDefined()});
            });
            it("Multiple folders with same name inside same folder forbidden", ()=>{
                return expect(storage.createFolder(folderName))
                    .rejects.toMatch('Multiple folders with same name inside the same folder');
            })
            describe("Resource deletion", ()=>{
                it("deleteFile", ()=>{
                    //clean all the things done
                    expect(storage.deleteItem(file_id)).resolves.toBe(204);
                    expect(storage.deleteItem(file_id2)).resolves.toBe(204);
                    expect(storage.deleteItem(copied_file_id)).resolves.toBe(204);
                    expect(storage.deleteItem(folder_id2)).resolves.toBe(204);
                    return expect(storage.deleteItem(folder_id)).resolves.toBe(204);
                });
            })
        });
    });
});
