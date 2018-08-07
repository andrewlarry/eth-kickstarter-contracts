const path = require('path');
const fs = require('fs-extra');
const { compile } = require('solc');

// Get path to build directory and remove
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath)

// Path to smart contract
const contractPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');

// Read the contract file and compile with solc
const source = fs.readFileSync(contractPath, 'utf8');
const compiled = compile(source, 1).contracts;

// Rebuild the build directory
fs.ensureDirSync(buildPath);

// Write compiled contracts to build directory
for (let contract in compiled) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.substring(1) + '.json'),
    compiled[contract]
  );
}

