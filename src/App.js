import './App.css';
import './Fieldset';
import React, { Component } from 'react';
import axios from 'axios';
import WalletInfo from "./WalletInfo";


class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tableWidth: 0,
      isLoggedIn: false,
      username: '',
      password: '',
      userAddress: ''
    };
    this.tableRef = React.createRef();
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.handleSignUp = this.handleSignUp.bind(this);
    this.handleLogIn = this.handleLogIn.bind(this);
    this.handleLogOut = this.handleLogOut.bind(this);
    this.requestAddressCreation = this.requestAddressCreation.bind(this);
  }

  componentDidMount() {
    this.setState({
      tableWidth: this.tableRef.current.clientWidth
    });
  }

  requestAddressCreation() {
    axios.post(`users/${this.state.username}/addresses`)
      .then((response) => {
        let { successful, data } = response.data;
        if (successful) {
          this.setState({ userAddress: data });
        }
      })
      .catch(error => alert(error))
  }

  updateUsername(event) {
    console.log(event.target.value);
    this.setState({ username: event.target.value });
  }

  updatePassword(event) {
    this.setState({ password: event.target.value });
  }

  handleSignUp() {
    axios.post("/users", { username: this.state.username, password: this.state.password })
      .then((response) => {
        let { successful, data } = response.data;
        console.log(response);
        console.log(data);

        if (successful) {
          alert("Successfully signed up! Now log in using your new account.")
        } else {
          alert(data)
        }
      })
      .catch(error => alert(`Server is not responding.\n${error}.`))
  }

  handleLogIn(event) {
    event.preventDefault();
    axios.post("/users/validation", { username: this.state.username, password: this.state.password })
      .then((response) => {
        let { successful, data } = response.data;
        console.log(successful);
        if (successful) {
          this.setState({ isLoggedIn: true });
        } else {
          alert(data);
        }
      })
      .then(() => {
        if (this.state.isLoggedIn) {
          axios.get(`/users/${this.state.username}/addresses`)
            .then((response) => {
              console.log(response);
              let { successful, data } = response.data;
              if (successful) {
                this.setState({ userAddress: data });
              }
            })
            .catch(error => alert(error))
        }
      })
      .catch(error => alert(`Server is not responding.\n${error}.`))
  }

  handleLogOut() {
    this.setState({ isLoggedIn: false, username: "", passowrd: "", userAddress: "" });
  }

  render() {
    let buttonWidth = this.state.tableWidth / 2;

    const buttonStyle = {
      width: buttonWidth
    };

    const overlayStyle = {
      position: 'fixed',
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(255,255,255, 0.9)',
      zIndex: 2,
      display: this.state.isLoggedIn ? 'none' : 'block',
      textAlign: 'center',
    }

    const overlayTextStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      flexDirection: 'row'
    }

    let greetingsOrLogin = this.state.isLoggedIn ?
      <div>
        <h2>HELLO, {this.state.username}</h2>
        <button onClick={this.handleLogOut}>LOG OUT</button>
      </div>
      :
      <div>
        <table ref={this.tableRef} >
          <tbody >
            <tr>
              <td>ID</td>
              <td>
                <input form="defaultForm" type="text" value={this.state.username} onChange={this.updateUsername}></input>
              </td>
            </tr>
            <tr>
              <td>PW</td>
              <td>
                <input form="defaultForm" type="password" value={this.state.password} onChange={this.updatePassword}></input>
              </td>
            </tr>
          </tbody>
        </table>
        <form id="defaultForm" onSubmit={this.handleLogIn}>
          <button type="button" style={buttonStyle} onClick={this.handleSignUp} >SIGN UP</button>
          <button type="submit" style={buttonStyle} >LOG IN</button>
        </form>
      </div>

    const addressOrButton = this.state.userAddress != '' ? <h3>YOUR ETHEREUM ADDRESS IS <br/>{this.state.userAddress}<br/></h3> : <button onClick={this.requestAddressCreation}>Create Address</button>

    return (
      <div className="App">
        <div id="bannerImage">
          <h1 className="bannerText">CRYPTO WALLET</h1>
          <h4 className="bannerText">DEPOSIT AND WITHDRAW CRYPTOCURRENCIES FOR FREE</h4>
        </div>
        <div id="credentialsInputForm">
          {greetingsOrLogin}
        </div>
        <hr></hr>
        <div>
          <div id="overlay" style={overlayStyle}>
            <h2 style={overlayTextStyle}>PLEASE LOG IN FIRST</h2>
          </div>
          {addressOrButton}
          <WalletInfo isLoggedIn={this.state.isLoggedIn} username={this.state.username} />
        </div>
      </div>
    )
  }
}

export default App;
