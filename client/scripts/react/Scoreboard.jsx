import React, { Component } from 'react'

class Scoreboard extends Component {

    constructor(props) {
        super(props)
        this.state = {
            players: []
        }
    }

    componentDidMount() {
        this.props.socket.on('score', (data)=> {
            const newPlayers = this.state.players
            newPlayers.push(JSON.parse(data))
            console.log(newPlayers)
            this.setState({players: newPlayers})
        }) 
    }

    render() {
        let playerTableRows = null
        
        if (this.state.players.length > 0) {
            playerTableRows = this.state.players.map((player) => {
            return (
            <tr key={player.id}>
                <td>{player.name}</td>
                <td>{player.score}</td>
            </tr>)
            })
        }

        console.log(playerTableRows)

        return (
        <table id="scoreboard">
            <thead>
                <tr>
                    <td>Scoreboard</td>
                </tr>
                <tr>
                    <td>Player</td>
                    <td>Score</td>
                </tr>
            </thead>
            <tbody>
                {playerTableRows ? playerTableRows : <tr><td>No players</td></tr>}
            </tbody>
        </table>)
    }
}

export default Scoreboard