const fs = require('fs-extra');
const path = require('path');
const Web3 = require('web3');
const HDWalletProvider = require('truffle-hdwallet-provider');
const ganache = require('ganache-cli');

// 1. get bytecode
const contractPath = path.resolve(__dirname, '../compiled/ProjectList.json');
const { interface, bytecode } = require(contractPath);

// 2. set provider
const provider = new HDWalletProvider(
  // config.get('hdwallet'),
  // config.get('infuraUrl'),
  'aisle lock damage aerobic obscure rule company opinion chair cargo turn useless',
  'https://rinkeby.infura.io/v3/822d43e930914c939678a5c69d8c1673'
);

const web3 = new Web3(provider);
// const web3 = new Web3(ganache.provider());

// 3. 部署合约
(async () => {
  // 3.1 获取钱包中的账户
  const accounts = await web3.eth.getAccounts();
  console.log('合约部署账户: ', accounts[0]);

  // 3.2 部署
  // console.time('合约部署耗时');
  console.log('开始部署');
  const result = await new web3.eth.Contract(JSON.parse(interface))
    .deploy({ data: bytecode })
    .send({ from: accounts[0], gas: '2000000'});
  // console.timeEnd('合约部署耗时');
  console.log('部署完成');

  // 3.3 存储
  const contractAddress = result.options.address;
  console.log('合约部署成功: ', contractAddress);
  console.log('合约查看地址: ', `https://rinkeby.etherscan.io/address/${contractAddress}`);

  const addressFile = path.resolve(__dirname, '../address.json');
  fs.writeFileSync(addressFile, JSON.stringify(contractAddress));
  console.log('地址写入成功: ', addressFile);

  process.exit();
})();




