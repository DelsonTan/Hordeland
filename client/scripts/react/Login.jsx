import React, { Component } from 'react'

class Login extends Component {
    render() {
        return (
              <center id="signDiv">
              <img src={window.location.origin + '/client/images/logo.png'} />
                <form id="loginForm">
                  <input id="signDiv-username" type="text" maxLength="12" placeholder="Type your username..."></input>
                  <br/>
                  <small>[ PRESS ENTER TO PLAY ]</small>
                </form>
              </center>
        )
    }
}

export default Login