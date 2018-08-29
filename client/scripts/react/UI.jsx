import React, { Component } from 'react'
import Scoreboard from './Scoreboard.jsx'

class UI extends Component {

    constructor(props) {
        super(props)
        this.state = {
            players: []
        }
    }

    componentDidMount() {
        this.props.socket.on('initUI', (data) => {
            const allPlayers = []
            const parsedData = JSON.parse(data)
            for (let i = 0; i < parsedData.players.length; i++) {
                allPlayers.push(parsedData.players[i])
            }
            this.setState({ players: allPlayers })
        })
        this.props.socket.on('updateUI', (data) => {
            const parsedData = JSON.parse(data)
            const updatedPlayers = this.state.players
            for (let i = 0; i < parsedData.players.length; i++) {
                updatedPlayers.push(parsedData.players[i])
            }
            this.setState( { players: updatedPlayers })

        })
    }

    render() {
        return (<Scoreboard players={this.state.players} />)
    }
}

export default UI