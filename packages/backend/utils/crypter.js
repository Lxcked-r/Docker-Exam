import CryptoJS from "crypto-js";

const secret = "abcde";

// Decryption
const decryptData = (data) => {
    try {
    return JSON.parse(CryptoJS.enc.Utf8.stringify(CryptoJS.AES.decrypt(data,  secret, 
    {
        keySize: 128 / 8,
        iv: secret,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    })));
    }
    catch (err) {
        console.log(err);
    }
}
const decryptFile = async (dataURL) => {
    
    var byteArr = b64toArray(dataURL);
    
    function b64toArray(b64Data){
    var byteCharacters = atob(b64Data);
    
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    
    var byteArray = new Uint8Array(byteNumbers);

    console.log(byteArray);
    return byteArray;}
}

// Encryption
const encrypt = async (data) => {
    const x = CryptoJS.AES.encrypt(JSON.stringify(data), secret,
    {
    keySize: 128 / 8,
    iv: secret,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
    }).toString();
    return x;
}
export { decryptData, decryptFile, encrypt };