import React, { Component } from 'react'

class Elimessage extends Component {

    render() {
        let attacker = this.props.attacker;
        let target = this.props.target;
        let message;
        if(attacker && target){
            if(this.props.selfId === target.id) {
                message = <span>{attacker.name} has eliminated you!</span>
            } else if(this.props.selfId === attacker.id) {
                message = <span>You have eliminated {target.name}!</span>
            }
            return (
                <center className="message">
                    {message}
                </center>
            )
        } else {
            return(
                <div className="invisible">
                </div>
            )
        }
    }
}


export default Elimessage