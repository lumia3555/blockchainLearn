const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const path = require('path');
const BigNumber = require('bignumber.js');

// 获取bytecode
const projectPath = path.resolve(__dirname, '../compiled/Project.json');
const projectListPath = path.resolve(__dirname, '../compiled/ProjectList.json');
const pInterface = require(projectPath).interface;
const { interface, bytecode } = require(projectListPath);


// 配置provider
const web3 = new Web3(ganache.provider());

let accounts;
let project, projectList;

describe('Project Contract', () => {
  const _description = 'project list test';
  beforeEach(async () => {

    // 1.1 获得ganache提供的本地网络测试账号
    accounts = await web3.eth.getAccounts();
    console.log('合约部署账户 ', accounts[0]);

    // 1.2 部署projectList
    projectList = await new web3.eth.Contract(JSON.parse(interface))
      .deploy({ data: bytecode})
      .send({ from: accounts[0], gas: '5000000' });

    // 1.3 调用createProject方法创建新合约
    await projectList.methods.createProject(_description, 100, 10000, 1000000).send({
      from: accounts[0],
      gas: '1000000',
    });

    // 1.4 获取部署的合约地址
    const [address] = await projectList.methods.getProjects().call();

    // 1.5 生成可用的project对象
    project = await new web3.eth.Contract(JSON.parse(pInterface), address);
  });

  // 2.1 测试部署了project和projectList合约
  it('should deploy both projectList and project', () => {
    assert.ok(projectList.options.address);
    assert.ok(project.options.address);
  });

  it('project should have correct properties', async () => {
    const owner = await project.methods.owner().call();
    const description = await project.methods.description().call();
    const minInvest = await project.methods.minInvest().call();
    const maxInvest = await project.methods.maxInvest().call();
    const goal = await project.methods.goal().call();

    assert.equal(owner, accounts[0]);
    assert.equal(description, _description);
    assert.equal(minInvest, 100);
    assert.equal(maxInvest, 10000);
    assert.equal(goal, 1000000);
  });

  it('allow investor to contribute', async () => {
    const investor = accounts[1];
    await project.methods.contribute().send({
      from: investor,
      value: '200',
    });

    const amount = await project.methods.investors(investor).call();
    assert.ok(amount == '200');
  });

  it('should require minInvest', async () => {
    try {
      const investor = accounts[1];
      await project.methods.contribute().send({
        from: investor,
        value: '10',
      });
      assert.ok(false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('should require maxInvest', async () => {
    try {
      const investor = accounts[1];
      await project.methods.contribute().send({
        from: investor,
        value: '100000',
      });
      assert.ok(false);
    } catch (err) {
      assert.ok(err);
    }
  });

  it('allows investor to approve payments', async () => {
    const owner = accounts[0];
    const investor = accounts[1];
    const receiver = accounts[2];

    const oldBalance = new BigNumber(await web3.eth.getBalance(receiver));

    await project.methods.contribute().send({
      from: investor,
      value: '5000',
    });

    await project.methods.createPayment('Rent office', 2000, receiver).send({
      from: owner,
      gas: '1000000',
    });

    await project.methods.approvePayment(0).send({
      from: investor,
      gas: '1000000',
    });

    await project.methods.doPayment(0).send({
      from: owner,
      gas: '1000000',
    });

    const payment = await project.methods.payments(0).call();
    assert.equal(payment.completed, true);
    assert.equal(payment.voterCount, 1);

    const newBalance = new BigNumber(await web3.eth.getBalance(receiver));
    const balanceDiff = newBalance.minus(oldBalance);
    console.log({ oldBalance, newBalance, balanceDiff });    

    assert.equal(balanceDiff, 2000);
  });
})
