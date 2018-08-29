import React, { Component } from 'react'

class Scoreboard extends Component {

    // componentDidUpdate(prevProps) {
    //     console.log("Scoreboard update:", this.state.players)
        // if (prevProps.players.length === 0) {
        //     console.log("Scoreboard: ", this.props.players)
        // }
        //     const newPlayers = this.state.players
        //     newPlayers.push(JSON.parse(data))
        //     console.log(newPlayers)
        //     this.setState({players: newPlayers})
        // }) 
    // }

    render() {
        let playerTableRows = null
        
        if (this.props.players.length > 0) {
            playerTableRows = this.props.players.map((player) => {
            return (
            <tr key={player.id}>
                <td>{player.name}</td>
                <td>{player.score}</td>
            </tr>)
            })
        }

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