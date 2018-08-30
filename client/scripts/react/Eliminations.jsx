import React, { Component } from 'react'

class Eliminations extends Component {
    render() {
        let messages = (<span></span>)
        if (this.props.eliminations.length > 0) {
            messages = this.props.eliminations.map((elimination) => {
                const attacker = elimination.attacker
                const target = elimination.target
                return (<span className="log" key={Math.floor(Math.random() * 10000)}>{attacker.name} <span className="elim">eliminated</span> <i className="fas fa-skull"></i> {target.name}<br/></span>)
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