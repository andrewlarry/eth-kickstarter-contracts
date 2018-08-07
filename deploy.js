const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

const { interface, bytecode } = require('./compile');
const mnemonic = require('./config/mnemonic');
const { TEST_ENDPOINT } = require('./config/infura');

const provider = new HDWalletProvider(mnemonic, TEST_ENDPOINT);

const web3 = new Web3(provider);

console.log(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('account: ', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: `0x${bytecode}`, arguments: ['deploy'] })
    .send({ from: accounts[0], gas: '2000000' })
    .catch(err => console.log(err));

  console.log('address: ', result.options.address);
};


// Address: 0xD78Aa3a3CAe685e76Df31A034DE921ED1dF96192

deploy();