import React, { Component } from 'react'
import Scoreboard from './Scoreboard.jsx'
import Elimessage from './Elimessage.jsx'
import Eliminations from './Eliminations.jsx'

class UI extends Component {

    constructor(props) {
        super(props)
        this.state = {
            players: [],
            attacker: null,
            target: null,
            eliminations: []
        }
    }

    sortPlayersByScore(a, b) {
        if (a.score < b.score) {
            return 1
        }
        if (a.score > b.score) {
            return -1
        }
        return 0
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
        // new player already sorted, as they are always placed at bottom of scoreboard
        this.props.socket.on('updateUI', (data) => {
            const parsedData = JSON.parse(data)
            const updatedPlayers = this.state.players
            for (let i = 0; i < parsedData.players.length; i++) {
                updatedPlayers.push(parsedData.players[i])
            }
            this.setState({ players: updatedPlayers })
        })

        this.props.socket.on("elimination", (data) => {
            const parsedData = BISON.decode(data)
            const attacker = parsedData.attacker
            
            const target = parsedData.target
            const updatedPlayers = this.state.players
            for (let i = 0; i < this.state.players.length; i++) {
                const player = this.state.players[i]
                if (player.id === attacker.id) {
                    player.score = attacker.score
                }
                if (player.id === target.id) {
                    player.score = target.score
                } 
            }
            const newEliminations = this.state.eliminations
            if (newEliminations.length >= 5) {
                newEliminations.shift()
            }
            newEliminations.push({ attacker, target })
            console.log(updatedPlayers)
            const sortedPlayers = updatedPlayers.sort(this.sortPlayersByScore)
            console.log(sortedPlayers)
            this.setState({ players: sortedPlayers, attacker: attacker, target: target, eliminations: newEliminations })
            setTimeout(() => { this.setState({ attacker: null, target: null }) }, 5000)
        })

        this.props.socket.on("remove", (data) => {
            const parsedData = BISON.decode(data)
            if (parsedData.players) {
                for (let i = 0; i < parsedData.players.length; i++) {
                    this.setState({
                        players: this.state.players.filter((player) => {
                            return player.id !== parsedData.players[i]
                        })
                    })
                }
            }
        })
    }

    render() {

        return (
            <div id="UI">
                <Scoreboard players={this.state.players} />
                <Eliminations eliminations={this.state.eliminations} />
                <Elimessage selfId={this.props.selfId} target={this.state.target} attacker={this.state.attacker} />
            </div>)
    }
}

export default UI