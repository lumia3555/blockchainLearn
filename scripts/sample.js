const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const ganache = require('ganache-cli');
const ProjectList = require('../compiled/ProjectList.json');
const address = require('../address.json');
const fs = require('fs-extra');

// provider config
const provider = new HDWalletProvider(
  'aisle lock damage aerobic obscure rule company opinion chair cargo turn useless',
  'https://rinkeby.infura.io/v3/822d43e930914c939678a5c69d8c1673'
);

const web3 = new Web3(provider);
// const web3 = new Web3(ganache.provider());

const contract = new web3.eth.Contract(JSON.parse(ProjectList.interface), address);
(async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('>>>---', accounts);

  const projects = [
    {
      description: 'Ethereum DApp Tutorial One',
      minInvest: web3.utils.toWei('0.01', 'ether'),
      maxInvest: web3.utils.toWei('0.1', 'ether'),
      goal: web3.utils.toWei('1', 'ether'),
    },{
      description: 'Ethereum DApp Tutorial Two',
      minInvest: web3.utils.toWei('0.1', 'ether'),
      maxInvest: web3.utils.toWei('1', 'ether'),
      goal: web3.utils.toWei('5', 'ether'),
    }
  ];
  console.log('>>>---', projects);
  // console.log(contract);

  const owner = accounts[0];
  const results = await Promise.all(projects.map(x =>
    contract.methods.createProject(x.description, x.minInvest, x.maxInvest, x.goal)
    .send({ from: owner, gas: '1000000' })
  ));

  console.log('>>>---', results);

  const targetAddress = path.resolve(__dirname, '../results/result.json');
  fs.writeFileSync(targetAddress, JSON.stringify(accounts), JSON.stringify(projects), JSON.stringify(results));

})();
