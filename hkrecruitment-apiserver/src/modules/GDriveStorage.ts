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

class GDriveStorage implements FileStorageInterface{
    copyFileFromStorage(file_id: string, parent_folder: string, name: string): string {
        //TODO: implement
        return "";
    }

    createFolder(parent_folder: string, name: string): string {
        //TODO: implement
        return "";
    }

    deleteFile(file_id: string): void {
        //TODO: implement
    }

    insertFile(parent_folder: string, name: string, rawData: any): string {
        //TODO: implement
        return "";
    }

}
