import React, { Component } from 'react'

class Counter extends Component {
    render() {
        let message = (<span></span>)
        let count = this.props.counter
        if (count >= 0 && this.props.player.id === this.props.selfId) {
            message = (<span className="count" key={Math.floor(Math.random() * 100000)}>Changing Mode in {count}...</span>)
        } else {
            message = (<span></span>)
        }
        return (
            <center className="counter">
                {message}
            </center>)
    }
}

export default Counter