import React, { Component } from 'react'

class Login extends Component {

    render() {
        return (
              <center id="signDiv">
                Username: <input id="signDiv-username" type="text"></input>
                <button id="signDiv-signIn">Sign In</button>
              </center>
        )
    }
}

export default Login