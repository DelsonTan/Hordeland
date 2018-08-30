import React, { Component } from 'react'

class Login extends Component {

    render() {
        return (
              <center id="signDiv">
                <form id="loginForm">
                  <input id="signDiv-username" type="text" placeholder="What's your name?"></input>
                </form>
              </center>
        )
    }
}

export default Login