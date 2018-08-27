import React, { Component } from 'react'

class Game extends Component {
    
    constructor(props) {
        super(props)
        this.canvas = React.createRef()
        this.width = 500
        this.height = 500

    }
    
    componentDidMount() {
        const canvas = this.canvas.current
        const ctx = canvas.getContext("2d")
    }

    render() {
        return (
            <canvas id="ctx" ref={this.canvas} width={this.width} height={this.height} tabIndex="0"/>
        )
    }
}

export default Game