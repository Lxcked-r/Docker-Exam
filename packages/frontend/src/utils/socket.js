import { io } from "socket.io-client";

import config from "@/../config.json";
const baseUrl = config.use_current_origin ? window.location.origin : config.base_url;

const socket = io(baseUrl, {
});
socket.encryptData = (data) => {
    const encrypted = crypter.encrypt(data, secret);
    return encrypted;
};



export default socket;
