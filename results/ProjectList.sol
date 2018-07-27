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