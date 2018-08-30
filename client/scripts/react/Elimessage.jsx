import React, { Component } from 'react'

class Elimessage extends Component {

    render() {
        let attacker = this.props.attacker;
        let target = this.props.target;
        let message;
        if(attacker && target){
            if(this.props.selfId === target.id) {
                message = <span>{attacker.name} has eliminated you! Kepp going! You are not bad!</span>
            } else if(this.props.selfId === attacker.id) {
                message = <span>You have eliminated {target.name}! Kepp going! Kill them all!!!!</span>
            }
            return (
                <div className="message">
                    {message}
                </div>
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