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
            this.setState({ players: updatedPlayers })
        })
        this.props.socket.on("updateScore", (data) => {
            const parsedData = BISON.decode(data)
            const updatedPlayers = this.state.players
            this.state.players.find((player, index) => {
                if (player.id === parsedData.players[0].id) {
                    updatedPlayers[index].score = parsedData.players[0].score
                    return true
                }
            })
            this.setState({ players: updatedPlayers })
        })
        this.props.socket.on("remove", (data) => {
            const parsedData = BISON.decode(data)
            for (let i = 0; i < parsedData.players.length; i++) {
                this.setState({
                    players: this.state.players.filter((player) => {
                        return player.id !== parsedData.players[i]
                    })
                })
            }
        })
    }

    render() {
        return (<Scoreboard players={this.state.players} />)
    }
}

export default UI