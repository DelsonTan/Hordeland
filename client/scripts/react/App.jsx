import React, { Component } from 'react'
import Game from './Game.jsx'
import Chat from './Chat.jsx'

class App extends Component {
    render() {
        return (
        <div>
            <Game/>
            <Chat/>
        </div>
        )
    }
}

export default App