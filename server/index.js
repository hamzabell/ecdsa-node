const express = require("express");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes } = require("ethereum-cryptography/utils");
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require('ethereum-cryptography/utils');


const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "04f623519dc32c4142fe1e964486ccc9ea39895c8bc944f28896ff85daf5271d6d111d1f88a85c103e087c3fb2b7d8de982898d7deed6d021c4b36018ba11b4407": 100,
  "04220d536505439a9b8d1e59f0c7c57e74ea42fa4b490a232bf6fea57d938284c206ce57dbe109c94f63e3737ff15f2224e15aa77eeeebe6d075f7bdf91fab2913": 50,
  "04da40972b5cbd9633a5779f6e4134fd6c9fc18eb6e63993454ea983e297b0a03032159a7ef3a3a6aaba0a5579b82640b23fac57e649643d57f547590daf991141": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", async (req, res) => {
  const { sender, recipient, amount, sig, recoveryBit } = req.body;

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const is_valid = await verifyTranscation(amount, sig, recoveryBit, sender);

  if(is_valid) {
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      res.send({ balance: balances[sender] });
    }
  } else {
     res.status(400).send({ message: "UnAuthorized Funds Transfer!" });
  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}


function hashMessage(message) {
  const message_bytess = utf8ToBytes(message);
  return keccak256(message_bytess);
}


/**
 * 
 * @param {number} amount 
 * @param {string} signature 
 * @param {string} recoveryBit 
 * 
 * @return {boolean} isValid
 */
async function verifyTranscation(amount, signature, recoveryBit, sender) {
  const hashed_message = hashMessage(`${amount}`);

  const recovered_public_key = await secp.recoverPublicKey(hashed_message, signature, recoveryBit);

  return toHex(recovered_public_key) === sender;
}