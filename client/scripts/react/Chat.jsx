import React, { Component } from 'react'

class Chat extends Component {

    render() {
        return (
            <div id="chat">
                <div id="chat-text"></div>
                <form id="chat-form">
                    <input tabIndex="0" id="chat-input" maxLength="80" type="text"></input>
                </form>
            </div>)
    }
}

export default Chat