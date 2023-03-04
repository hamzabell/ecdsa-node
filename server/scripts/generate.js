const { toHex } = require('ethereum-cryptography/utils');
const secp = require('ethereum-cryptography/secp256k1');


const private_key = toHex(secp.utils.randomPrivateKey());

const public_key = toHex(secp.getPublicKey(private_key));


console.log({ private_key, public_key });