pragma solidity ^0.4.0;

contract ProjectList {
  address[] public projects;
  
  function createProject(string _description, uint _minInvest, uint _maxInvest, uint _goal) public {
    address newProject = new Project(_description, _minInvest, _maxInvest, _goal, msg.sender);
    projects.push(newProject);
  }

  function getProjects() public view returns(address[]) {
    return projects;
  }
}

contract Project {
  struct Payment {
    string description;
    uint amount;
    address receiver;
    bool completed;
    mapping(address => bool) voters;
    uint voterCount;
  }

  address public owner;       // 项目所有者
  string public description;  // 项目介绍
  uint public minInvest;      // 最小投资额
  uint public maxInvest;      // 最大投资额
  uint public goal;           // 融资目标
  uint public investorCount;  // 投资人人数统计
  mapping(address => uint) public investors;  // 投资人与投资金额的映射

  Payment[] public payments;  // 项目所有者的资金支出列表

  constructor(string _description, uint _minInvest, uint _maxInvest, uint _goal, address _owner) public {
    // owner = msg.sender;
    owner = _owner;
    description = _description;
    minInvest = _minInvest;
    maxInvest = _maxInvest;
    goal = _goal;
  }

  // 使用modifier复用权限检查
  modifier ownerOnly() {
    require(msg.sender == owner);
    // 这里的_是个占位符，表示使用modifier的函数的代码
    _;
  }

  // 投资人调用该接口，发送资
  // 标记为payable的接口表示接受用户在交易中发送ETH
  function contribute() public payable {
    require(msg.value >= minInvest);
    require(msg.value <= maxInvest);
    require(address(this).balance <= goal);

    investors[msg.sender] = msg.value;
    investorCount += 1;
  }

  // owner发送资金支出请求
  function createPayment(string _description, uint _amount, address _receiver) ownerOnly public {
    // 限定仅有项目owner可以发起资金支出请求
    require(msg.sender == owner);

    Payment memory newPayment = Payment({
      description: _description,
      amount: _amount,
      receiver: _receiver,
      completed: false,
      voterCount: 0
    });

    payments.push(newPayment);
  }

  // investors发起同意支出请求
  function approvePayment(uint index) public {
    Payment storage payment = payments[index];

    // must be an investor to vote
    require(investors[msg.sender] > 0);

    // cannot vote twice
    require(!payment.voters[msg.sender]);
    payment.voters[msg.sender] = true;
    payment.voterCount += 1;
  }

  // 执行资金支出请求
  function doPayment(uint index) ownerOnly public {
    // 限定只有项目owner有权限执行资金支出请求
    require(msg.sender == owner);

    Payment storage payment = payments[index];
    require(!payment.completed);
    require(address(this).balance >= payment.amount);
    require(payment.voterCount > investorCount / 2);

    payment.receiver.transfer(payment.amount);
    payment.completed = true;
  }

  // 获取项目信息
  function getSummary() public view returns (string, uint, uint, uint, uint, uint, uint, address) {
    return (
      description,
      minInvest,
      maxInvest,
      goal,
      address(this).balance,
      investorCount,
      payments.length,
      owner
    );
  }
}
