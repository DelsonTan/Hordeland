import React, { Component } from 'react'

class Eliminations extends Component {
    render() {
        let messages = (<span></span>)
        if (this.props.eliminations.length > 0) {
            messages = this.props.eliminations.map((elimination) => {
                const attacker = elimination.attacker
                const target = elimination.target
                return (<span key={Math.floor(Math.random() * 1000)}>{attacker.name} eliminated {target.name}<br/></span>)
            })
        }
        console.log(this.props)
        return (
            <div id="eliminations">
                {messages}
            </div>)
    }
}

export default Eliminations