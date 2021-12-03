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
 * File:   FileStorageInterface.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 19 aprile 2021, 10:58
 */

/**
 * Represent a file storage service
 * @interface
 */
export interface FileStorageInterface {
     /**
      * Creates a folder
      * @param name the name to assign to the folder to be created
      * @param parent_folder? the id of the parent folder
      * @return {Promise<string>} the id of the created folder
      */
     createFolder(name: string, parent_folder?: string): Promise<string>;

     /**
      * Uploads a file
      * @param name the name to assign to the file to be created
      * @param rawData the data to upload
      * @param parent_folder? the id of the parent folder
      * @return {Promise<string>} the id of the created file
      */
     insertFile(name: string, rawData: Uint8Array, parent_folder?: string): Promise<string>;

     /**
      * Creates a file copying a file from the same service
      * @param file_id the id of the file to be copied
      * @param name the name to assign to the file to be created
      * @param parent_folder? the id of the parent folder
      * @return {Promise<string>} the id of the created file
      */
     copyFileFromStorage(file_id: string, name: string, parent_folder?: string): Promise<string>;

     /**
      * Deletes a file or directory
      * @param item_id the id of the file to be deleted
      * @return {Promise<number>} the HTTP status code of the response
      */
     deleteItem(item_id: string): Promise<number>;

     /**
      * Retrieves the id of a folder given its name
      * @param name the name of the target folder
      * @param parent_folder? the id of the folder to search into
      * @return {Promise<string>} the id of the folder
      */
     getFolderByName(name: string, parent_folder?: string): Promise<string>;

     /**
      * Extracts the id of item (file or folder) from a string
      * @param src a string containing the id of the resource
      * @return {string} the id of the resource
      */
     extractIdFrom(src: string): string;
}
