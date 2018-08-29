import React, { Component } from 'react'
import Game from './Game.jsx'
import Chat from './Chat.jsx'
import Scoreboard from './Scoreboard.jsx'

class App extends Component {

    constructor(props) {
        super(props)
        this.state = {
            socket: io()
        }
    }

    componentDidMount() {
        // this.socket = io()
        // this.socket.on('scoring', (data) => {
        //     console.log(data)
        // })
        // console.log(socket)
    }

    render() {
        return (
        <div>
            <Game socket={this.state.socket}/>
            <Chat/>
            <Scoreboard socket={this.state.socket}/>
        </div>
        )
    }
}

export default App