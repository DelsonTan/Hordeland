import React, { Component } from 'react'

class Login extends Component {

  constructor(props) {
    super(props)
    this.state = {
      tips: [
        'Holding down fire slows down your movement',
        'Eliminating the hydra grants a player 2x attack speed for 20 seconds',
        'Eliminating the house boss removes your movement penalty while firing and increases your movement speed by 50%',
        'The potion in the cave heals a player by a large amount, but is guarded by ferocious bats',
        'The forest provides great cover against hostile player fire, if you can handle bees...',
        'Every three player kills, or the score equivalent in AI kills, nets you a small power boost',
        'In version 1.0, players could shoot an infinite number of projectiles with enough score, if the server did not crash first',
        'Prefer playing against your friends with no AI? Then PVP mode is for you!',
        'Please be civil to your fellow players on the in-game chat',
        '🤗Jazzhands🤗',
        'If it can break, Jeremie will break it',
        'When in doubt, "fluffybunny" is a great password',
        'Please email any complaints to Joel@Joel.Joel'
      ]
    }
  }

  randomTip() {
    const tip = this.state.tips[Math.floor(Math.random() * this.state.tips.length)]
    return (<span>{tip}</span>)
  }

  render() {
    return (
      <center id="signDiv">
        <img src={window.location.origin + '/client/images/logo.png'} />
        <form id="loginForm">
          <input id="signDiv-username" type="text" maxLength="12" placeholder="Type your username..."></input>
          <br />
          <small>[ PRESS ENTER TO PLAY ]</small>
        </form>
        <span>{`Press WASD or arrow keys to move. Hold down left click to fire`}</span>
        {this.randomTip()}
      </center>
    )
  }
}

export default Login