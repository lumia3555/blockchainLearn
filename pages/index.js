import React from 'react';
import Web3 from 'web3';
import ProjectList from '../libs/projectList';
import Project from '../libs/project';

export default class Index extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     accounts: [],
  //   }
  //   this.web3 = new Web3(window.web3.currentProvider);
  // }

  // async componentDidMount() {
  //   // const web3 = new Web3(window.web3.currentProvider);
  //   const accounts = await this.web3.eth.getAccounts();
  //   const balances = await Promise.all(accounts.map(x => this.web3.eth.getBalance(x)));
  //   console.log(accounts, balances);

  //   this.setState({
  //     accounts: accounts.map(
  //       (x, i) => ({ account: x, balance: balances[i]})
  //     )
  //   });
  // }

  static async getInitialProps({ req }) {
    const projects = await ProjectList.methods.getProjects().call();
    const summaryList = await Promise.all(projects.map(project =>
      Project(project).methods.getSummary().call()
    ))
    console.log(summaryList);
    return { projects, summaryList };
  }

  render() {
    // const { accounts } = this.state;
    const { projects, summaryList } = this.props;
    return <div>
      this is for my blockchain test
      <ul>
        {projects.map((x, index) =>
          <li key={index}>
            {index} - {x}
          </li>)}
      </ul>
    </div>;
  }
}

/*
            {x.account} => {this.web3.utils.fromWei(x.balance, 'ether')}
            {x.account} => {x.balance}

*/