const HDWalletProvider = require('truffle-hdwallet-provider');
const Web3 = require('web3');

// Only need to deploy the campaign factory contract
const compiledFactory = require('./build/CampaignFactory.json');

const mnemonic = require('./config/mnemonic');
const { TEST_ENDPOINT } = require('./config/infura');

const provider = new HDWalletProvider(mnemonic, TEST_ENDPOINT);
const web3 = new Web3(provider);

const deploy = async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('account: ', accounts[0]);

  const result = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: `0x${compiledFactory.bytecode}` })
    .send({ from: accounts[0], gas: '2000000' })
    .catch(err => console.log(err));

  console.log('address: ', result.options.address);
};

deploy();