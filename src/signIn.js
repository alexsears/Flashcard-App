import React, { Component } from 'react';
import { auth } from './firebase';

class SignIn extends Component {
  state = { email: '', password: '' };

  handleChange = (event) => {
    this.setState({ [event.target.name]: event.target.value });
  }

  handleSubmit = async (event) => {
    event.preventDefault();
    const { email, password } = this.state;
    try {
      await auth.signInWithEmailAndPassword(email, password);
      this.setState({ email: '', password: '' }); // clear form
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="email" name="email" onChange={this.handleChange} value={this.state.email} required />
        <input type="password" name="password" onChange={this.handleChange} value={this.state.password} required />
        <button type="submit">Sign In</button>
      </form>
    );
  }
}

export default SignIn;
