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
 * File:   GDriveStorage.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 19 aprile 2021, 11:21
 */

import {FileStorageInterface} from "./FileStorageInterface";
import {getAuth} from "./GAuth/GAuth";
import {google} from "googleapis";
import {OAuth2Client} from "google-auth-library";
import {Readable} from "stream";

/**
 * @class GDriveStorage implements a storage service using Google Drive
 * @inheritDoc
 * @implements FileStorageInterface
 */
export class GDriveStorage implements FileStorageInterface{
    copyFileFromStorage(file_id: string, parent_folder: string, name: string): Promise<string> {
        return new Promise<string>((resolve, reject)=>{
            getAuth().then((auth: OAuth2Client)=>{
                const drive = google.drive({version: 'v3', auth});
                // @ts-ignore
                drive.files.copy({
                    fileId: file_id,
                    resource: {
                        parents: [parent_folder],
                        name: name
                    },
                    supportsAllDrives: true,
                    fields: 'id'
                }).then((file)=> // @ts-ignore
                    resolve(file.data.id)).catch((err)=>reject(err));
            }).catch(err=>reject(err));
        })
    }

    createFolder(parent_folder: string, name: string): Promise<string> {
        return new Promise((resolve, reject)=>{
            getAuth().then((auth: OAuth2Client)=>{
                const fileMetadata = {
                    name: name,
                    mimeType: 'application/vnd.google-apps.folder',
                    parents: undefined
                };
                if(parent_folder && parent_folder!=="")
                    fileMetadata.parents=[parent_folder];
                this.getFolderByName(name).then((folder_id)=>{
                    if(folder_id)
                        resolve(folder_id);
                    else{
                        const drive = google.drive({version: 'v3', auth});
                        drive.files.create({ // @ts-ignore
                            resource: fileMetadata,
                            fields: 'id'
                        }).then((file)=>  // @ts-ignore
                            resolve(file.data.id)).catch((err)=>reject(err));
                    }
                }).catch((err)=>reject(err));
            }).catch(err=>reject(err));
        });
    }

    deleteFile(file_id: string): Promise<number> {
        return new Promise((resolve, reject)=>{
            getAuth().then((auth:OAuth2Client)=>{
                const drive = google.drive({version: 'v3', auth});
                drive.files.delete({
                    fileId: file_id // @ts-ignore
                }).then((res)=>resolve(res.status)).catch((err)=>reject(err));
            }).catch(err=>reject(err));
        })
    }

    insertFile(parent_folder: string, name: string, rawData: Uint8Array): Promise<string> {
        return new Promise<string>((resolve, reject)=>{
            getAuth().then((auth:OAuth2Client)=>{
                const drive = google.drive({version: 'v3', auth});
                const fileMetadata = {
                    title: name,
                    parents: [parent_folder],
                };
                const stream = new Readable();
                stream.push(rawData);
                const media = {
                    mimeType: 'application/pdf',
                    body: stream
                };
                drive.files.create({ // @ts-ignore
                    resource: fileMetadata,
                    media: media,
                    fields: 'id'
                }).then((file)=> // @ts-ignore
                    resolve(file.data.id)).catch((err)=>reject(err));
            }).catch(err=>reject(err));
        });
    }

    getFolderByName(name: string): Promise<string>{
        return new Promise((resolve, reject)=>{
            getAuth().then((auth: OAuth2Client)=>{
                const drive = google.drive({version: 'v3', auth});
                drive.files.list({
                    q: `mimeType ='application/vnd.google-apps.folder' and name='${name}'`,
                    fields: 'files(id, name)',
                }).then((res)=>{
                    if (res.data.files.length===1)
                        resolve(res.data.files.pop().id);
                    else if(res.data.files.length===0)
                        resolve(null); //directory not present
                    else
                        reject("Multiple folders with same name");
                }).catch((err)=>reject(err));
            })
        });
    }
}
