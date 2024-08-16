import CryptoJS from 'crypto-js';

const secret = "abcde"

const crypter = {};
crypter.encrypt = (data) => {
    const x = CryptoJS.AES.encrypt(JSON.stringify(data), secret,
 {
    keySize: 128 / 8,
    iv: secret,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  }).toString();
    return x;
}

// Decryption
crypter.decrypt = (data, secret="abcde") => {
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
      return null;
  }
}

// encrypt File
crypter.encryptFile = (file) => {
  
  var reader = new FileReader();
  reader.onload = () => {
      var key = "1234567887654321";
      var wordArray = CryptoJS.lib.WordArray.create(reader.result);           // Convert: ArrayBuffer -> WordArray
      var encrypted = CryptoJS.AES.encrypt(wordArray, key).toString();        // Encryption: I: WordArray -> O: -> Base64 encoded string (OpenSSL-format)
      var fileEnc = new Blob([encrypted]);                                    // Create blob from string
      var a = document.createElement("a");
      var url = window.URL.createObjectURL(fileEnc);
      var filename = file.name + ".enc";
      a.href = url;
      a.download = filename;
  };
  reader.readAsArrayBuffer(file);
  return reader;
}
crypter.toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
});


export default crypter;