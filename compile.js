const path = require('path');
const fs = require('fs');
const { compile } = require('solc');

// Path to a smart contract
const contractPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');

// Read the contract file and encode utf8
const source = fs.readFileSync(contractPath, 'utf8');

module.exports = compile(source, 1).contracts[':Campaign'];

