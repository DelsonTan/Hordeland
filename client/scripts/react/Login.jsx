import React, { Component } from 'react'

class Login extends Component {

    render() {
        return (
              <center id="signDiv">
                <form id="loginForm">
                  <input id="signDiv-username" type="text" placeholder="Type your username..."></input>
                  <br/>
                  <small>[ PRESS ENTER TO PLAY ]</small>
                </form>
              </center>
        )
    }
}

export default Login