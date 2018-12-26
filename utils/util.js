const Crypto = require('../lib/cryptojs/cryptojs.js').Crypto;

const formatTime = date => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
};

const formatNumber = n => {
    n = n.toString();
    return n[1] ? n : '0' + n
};

const Encrypt = function (word, key) {
    let mode = new Crypto.mode.ECB(Crypto.pad.pkcs7);
    let eb = Crypto.charenc.UTF8.stringToBytes(word);
    let kb = Crypto.charenc.UTF8.stringToBytes(key); //KEY
    let vb = Crypto.charenc.UTF8.stringToBytes(key); //IV
    let ub = Crypto.AES.encrypt(eb, kb, {
        iv: vb,
        mode: mode,
        asBpytes: true
    });
    return ub;
};

const Decrypt = function(word, key) {
    let mode = new Crypto.mode.ECB(Crypto.pad.pkcs7);
    let eb = Crypto.util.base64ToBytes(word);
    let kb = Crypto.charenc.UTF8.stringToBytes(key); //KEY
    let vb = Crypto.charenc.UTF8.stringToBytes(key); //IV
    let ub = Crypto.AES.decrypt(eb, kb, {
        asBpytes: true,
        mode: mode,
        iv: vb
    });
    return ub;
};

/**
 * @param passTxt    加密值
 * @param exponent  公钥指数 后台传过来
 * @param modulus   公钥模数 后台传过来
 * @constructor
 */
function RSAPassAndSubmit(passTxt, exponent, modulus) {
    BigIntJs.setMaxDigits(130);
    // 生成公钥
    var pubKey = new RSA.RSAKeyPair(exponent, "", modulus);
    return RSA.encryptedString(pubKey, passTxt);
}

module.exports = {
    formatTime: formatTime,
    Encrypt: Encrypt,
    Decrypt: Decrypt,
    RSAPassAndSubmit: RSAPassAndSubmit
};

