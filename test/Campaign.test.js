const assert = require('assert');

// Ganche is a node.js Ethereum client
const ganche = require('ganache-cli');

// Web3 is the JavaScript API for communicating with an Ethereum node
const Web3 = require('web3');

// A provider is a link to a running Etherem node
const web3 = new Web3(ganche.provider());

const compiledFactory = require('../build/CampaignFactory.json');
const comiledCampaign = require('../build/Campaign.json');

// beforeEach variables
let accounts;
let factory;
let campaign;
let campaignAddress; 

beforeEach(async () => {
  // Get a list of all accounts
  accounts = await web3.eth.getAccounts();

  // Use one of those accounts to deploy factory
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({ data: compiledFactory.bytecode })
    .send({ from: accounts[0], gas: '1000000' });

  // Call the createCampaign method to deploy a campaign contract instance
  // A 'send' does not return a value, just a tx reciept
  await factory.methods.createCampaign('100').send({ 
    from: accounts[0], 
    gas: '1000000'
  });
  
  // Get the list of campaigns (should only be one)
  const campaigns = await factory.methods.getDeloyedCampaigns().call();
  campaignAddress = campaigns[0];

  // Create the JS API for the deployed campaign contract, no need to deploy or send a tx
  campaign = await new web3.eth.Contract(
    JSON.parse(comiledCampaign.interface),
    campaignAddress
  );
});

describe('Campaigns', () => {
  it('Deploys a factory and campaign contract', () => {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('Marks caller as the campaign manager', async () => {
    const manager = await campaign.methods.manager().call();
    assert.equal(accounts[0], manager);
  });

  it('Adds contributor to the campaign as an approver', async () => {
    await campaign.methods.contribute().send({
      from: accounts[1],
      value: '101'
    });

    const isContributor = await campaign.methods.approvers(accounts[1]).call();
    assert(isContributor);
  });

  it('Requires a minimum contribution', async () => {
    try {
      await campaign.methods.contribute().send({
        from: accounts[2],
        value: '50'
      });
      assert(false);
    } catch(err) {
      assert(err);
    }
  });

  it('Allows a manager to make a payment request', async ()  => {
    await campaign.methods
      .createRequest('test', '100', accounts[1])
      .send({
        from: accounts[0],
        gas: '1000000'
      });
    
    const request = await campaign.methods.requests(0).call();
    assert.equal('test', request.description);
  });
});
