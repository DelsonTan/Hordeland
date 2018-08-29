import React, { Component } from 'react'
import Game from './Game.jsx'
import Chat from './Chat.jsx'
import UI from './UI.jsx'

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            socket: io()
        }
    }

    render() {
        return (
        <div>
            <Game socket={this.state.socket}/>
            <Chat/>
            <UI socket={this.state.socket}/>
        </div>
        )
    }
}

export default App