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
 * File:   GAuth.ts
 * Project: hkrecruitment-apiserver
 * Authors:
 * Riccardo Zaccone <riccardo.zaccone at hknpolito.org>
 *
 * Created on 23 aprile 2021, 10:35
 */

const fsp = require('fs').promises;
const readline = require('readline');
const {google} = require('googleapis');

// If modifying these scopes, delete token.json.
const SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive'];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = './src/modules/GAuth/authInfo/token.json';
const CREDENTIALS_PATH = './src/modules/GAuth/authInfo/credentials.json';

let OAuth2Client=null;

export function getAuth(){
    return new Promise((resolve, reject)=>{
        if(OAuth2Client==null){
            authorize().then((client)=>{
                OAuth2Client=client;
                resolve(OAuth2Client);
            }).catch((err)=>reject(err));
        }
        else
            resolve(OAuth2Client);
    });
}


function authorize(){
    //read credentials
    return new Promise((resolve, reject)=>{
        fsp.readFile(CREDENTIALS_PATH)
            .then(async (content)=>{
                const credentials=JSON.parse(content);
                const {client_secret, client_id, redirect_uris} = credentials.installed;

                //get an OAuth2Client
                const oAuth2Client = new google.auth.OAuth2(
                    client_id, client_secret, redirect_uris[0]);
                // Check if we have previously stored a token.
                fsp.readFile(TOKEN_PATH)
                    .then((token)=>{
                        oAuth2Client.setCredentials(JSON.parse(token));
                        resolve(oAuth2Client);
                    })
                    .catch((err)=>{ // error on reading the token
                        getNewToken(oAuth2Client)
                            .then((client)=>{resolve(client)})
                            .catch((err)=>{reject(err)});
                    });
            })
            .catch((err)=>{reject(err)}); //error on reading credentials
    });
}

/**
 * Get and store new token after prompting for user authorization,
 * configuring the OAuth2Client received as parameter
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @return {Promise} Promise object containing the configured oAuth2Client
 */
async function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    rl.question('Enter the code from that page here: ');
    const it = rl[Symbol.asyncIterator]();
    const line = await it.next();
    const code=line.value;
    rl.close();
    return new Promise((resolve, reject) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err)  reject('Error retrieving access token: '+err);
            else {
                oAuth2Client.setCredentials(token);
                // Store the token to disk for later program executions
                fsp.writeFile(TOKEN_PATH, JSON.stringify(token))
                    .then(()=>resolve(oAuth2Client))
                    .catch((err)=>reject(err));
            }
        });
    })
}
