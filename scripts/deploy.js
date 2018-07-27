const path = require('path');
const Web3 = require('web3');
const fs = require('fs-extra');
const HDWalletProvider = require('truffle-hdwallet-provider');

// get bytecode
const contractPath = path.resolve(__dirname, '../compiled/Car.json');
const { interface, bytecode } = require(contractPath);

// provider config
const provider = new HDWalletProvider(
  'aisle lock damage aerobic obscure rule company opinion chair cargo turn useless',
  'https://rinkeby.infura.io/v3/822d43e930914c939678a5c69d8c1673'
);

const web3 = new Web3(provider);

(async () => {
  const accounts = await web3.eth.getAccounts();
  console.log('Account used to set contract: ' + accounts[0]);
  console.log('=========== waiting ==============');

  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode, arguments: ['BMW'] })
    .send({ from: accounts[0], gas: '1000000' });

  // const contract = new web3.eth.Contract(JSON.stringify(interface));
  // const transaction = contract.deploy({ data: bytecode, arguments: ['BMW'] });
  // const result = await transaction.send({ from: accounts[0], gas: '1000000' });

  const resultDir = path.resolve(__dirname, '../results');
  fs.removeSync(resultDir);
  fs.ensureDirSync(resultDir);
  console.log('=========== DONE ==============');
  console.log('Contract address at :' + result.options.address);

  // Object.keys(result).forEach(name => {
  //   const key = name.replace(/^:/, '');
  //   const filePath = path.resolve(resultDir, `${key}.json`);
  //   fs.outputJsonSync(filePath, result[name]);
  // })

})();
