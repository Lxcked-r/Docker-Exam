import { lstat, rm, stat } from "fs/promises";
import { updateAvatar } from "./user.mjs";
import { URL } from 'url';
import * as path from 'path';


const __filename = new URL('', import.meta.url).pathname;
const __dirname = new URL('.', import.meta.url).pathname;

const saveFile = async (userUUID, file) => {
    return new Promise((resolve, reject) => {
        file.mv(`./avatars/${userUUID}.png`, async (err) => {
            if (err) {
                console.log(err);
                console.log(path.parse(`./avatars/${userUUID}.png`));
                reject("Failed to upload file");
            } else {
                await updateAvatar(userUUID, `./avatars/${userUUID}.png`);
                resolve();
            }
        });
    });
};

const deleteFile = async (userUUID) => {
    try {
        await lstat(`./avatars/${userUUID}.png`);
        await rm(`./avatars/${userUUID}.png`, { recursive: true });
    } catch (err) {
        // this is fine because it means the file doesn't exist. lstat throws an error if the file doesn't exist
    }
};


export {
    saveFile,
    deleteFile,
};