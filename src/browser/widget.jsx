import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

class WidgetContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: null,
            reply: '',
        };
    }

    componentDidMount() {
        ipcRenderer.send('widget-ready', null);
        ipcRenderer.on('new-message', (event, payload) => {
            console.log('message received', payload);
            this.setState({
                message: payload.message,
            })
        })
    }

    handleMessageChange = (event) => {
        this.setState({ reply: event.target.value });
    }

    handleKeyDown = (event) => {
        if (event.keyCode == 13) {
            this.handleSubmit(event);
        }
    }

    handleSubmit = (event) => {
        const { reply } = this.state;
        const payload = { reply };
        console.log('sending reply', payload);
        ipcRenderer.send('widget-reply', payload);
        this.setState({
            reply: '',
        });
    }

    render() {
        const { message, reply } = this.state;
        if (!message) {
            return null;
        }

        return (
            <div className="wrapper">
                <div className="header">
                    <h2>{message.title}</h2>
                </div>
                <div className="message-box">
                    <p>{message.body}</p>
                </div>
                <div className="reply-box">
                    <textarea
                        className="replyInput"
                        value={reply}
                        onChange={this.handleMessageChange}
                        onKeyDown={this.handleKeyDown}
                    />
                </div>
            </div>
        );
    }
}

ReactDOM.render(
    <WidgetContainer /> ,
    document.getElementById('content')
);