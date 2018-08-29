import React, { Component } from 'react'
import Scoreboard from './Scoreboard.jsx'
class Game extends Component {

    constructor(props) {
        super(props)
        // this.canvas = React.createRef()
        this.width = window.innerWidth
        this.height = window.innerHeight
    }

    componentDidMount() {
    }

    render() {
        return (
            <div id="game"tabIndex="0">
            <canvas id="ctx" width={this.width} height={this.height}/>
            <canvas id="ctx-ent" width={this.width} height={this.height}/>
            </div>
        )
    }
}

export default Game