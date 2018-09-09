import React, { Component } from 'react'
import Game from './Game.jsx'
import Chat from './Chat.jsx'
import Login from './Login.jsx'
import UI from './UI.jsx'

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            socket: io(),
            selfId: null
        }
    }

    componentDidMount() {
        
        const audio = document.getElementById('audio')
        audio.muted = false
        this.state.socket.on('init', (data) => {
            const parsedData = JSON.parse(data)
            if (parsedData.selfId) {
                this.setState({ selfId: parsedData.selfId })
            }
        })
    }

    render() {
        return (
            <div>
                <Login />
                <Game socket={this.state.socket} selfId={this.state.selfId} />
                <Chat />
                <UI socket={this.state.socket} selfId={this.state.selfId} />
                <button id="pvp-button">
                    PvP Mode
            </button>
            </div>
        )
    }
}

export default App