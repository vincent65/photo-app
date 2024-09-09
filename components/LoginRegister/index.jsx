import React, { Component } from 'react';
import axios from 'axios';
import { withRouter } from 'react-router-dom';

class LoginRegister extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showLogin: true,
      loginName: '',
      firstName: '',
      lastName: '',
      login_name: '',
      error: '',
      password: '',
      confirmPassword: '',
      description: '',
      occupation: '',
      location: '',
    };
  }

  toggleForm = () => {
    this.setState(prevState => ({
      showLogin: !prevState.showLogin,
      error: ''
    }));
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  }

  handleLogin = async () => {
    try {
        const response = await axios.post('/admin/login', { login_name: this.state.loginName, password: this.state.password });
        console.log(response.data);
        this.props.onLogin(response.data);  // Update the parent component's state
        // Redirect to the main page
        this.props.history.push('/');
    } catch (err) {
      this.setState({ error: err.response.data.error });
    }
  }

  handleRegister = async () => {
    try {
        if(this.state.confirmPassword !== this.state.password) {
            this.setState({error: "Passwords do not match"});
            return;
        }
      const { firstName, lastName, login_name, password, occupation, description, location } = this.state;
      const res = await axios.post('/user', { firstName, lastName, login_name, password, occupation, description, location});
      // Update application state to indicate user is logged in
      this.setState({error: res.data.message});
    //   window.location.href = '/';
    } catch (err) {
      this.setState({ error: err.response.data.error });
    }
  }

  render() {
    const { showLogin, loginName, firstName, lastName, login_name, error, password, confirmPassword, description, location, occupation } = this.state;

    return (
      <div>
        {showLogin ? (
          <div>
            <input
              type="text"
              name="loginName"
              placeholder="Login Name"
              value={loginName}
              onChange={this.handleInputChange}
            />
             <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={this.handleInputChange}
            />
            <button onClick={this.handleLogin}>Login</button>
          </div>
        ) : (
          <div>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={firstName}
              onChange={this.handleInputChange}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={lastName}
              onChange={this.handleInputChange}
            />
            <input
              type="text"
              name="login_name"
              placeholder="Login Name"
              value={login_name}
              onChange={this.handleInputChange}
            />
             <input
              type="password"
              name="password"
              placeholder="Password"
              value={password}
              onChange={this.handleInputChange}
            />
             <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={this.handleInputChange}
            />
            <input
              type="text"
              name="description"
              placeholder="Describe yourself"
              value={description}
              onChange={this.handleInputChange}
            />
            <input
              type="text"
              name="occupation"
              placeholder="Occupation"
              value={occupation}
              onChange={this.handleInputChange}
            />
            <input
              type="text"
              name="location"
              placeholder="Location"
              value={location}
              onChange={this.handleInputChange}
            />
            <button onClick={this.handleRegister}>Register</button>
          </div>
        )}
        {error && <div>{error}</div>}
        <button onClick={this.toggleForm}>
          {showLogin ? 'Register' : 'Login'}
        </button>
      </div>
    );
  }
}

export default withRouter(LoginRegister);