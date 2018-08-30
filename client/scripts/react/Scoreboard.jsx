import React, { Component } from 'react'

class Scoreboard extends Component {

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
                    <th colSpan={2} className="title">Scoreboard</th>
                </tr>
                <tr>
                    <td className="player-name">Player</td>
                    <td className="player-score">Score</td>
                </tr>
            </thead>
            <tbody>
                {playerTableRows ? playerTableRows : <tr><td>No players</td></tr>}
            </tbody>
        </table>)
    }
}

export default Scoreboard