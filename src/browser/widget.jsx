import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

class WidgetContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
        };
    }

    componentDidMount() {
        console.log('widget window loaded');
        ipcRenderer.on('response', (event, response) => {
            console.log('message received', response.message);
        })
    }

    handleMessageChange = (event) => {
        this.setState({ message: event.target.value });
    }

    handleOutgoingReply = () => {
        const message = this.state.message;
        const payload = { message: message };
        console.log('sending reply', payload);
        ipcRenderer.send('widget-reply', payload);
    }

    render() {
        return (
            <div>
                <h2>Hey, you got a new message</h2>
                <textarea
                    id="message"
                    style={{ width: '1000%' }}
                    value={this.state.message}
                    onChange={this.handleMessageChange}
                />
                <br />
                <button id="reply" onClick={this.handleOutgoingReply}>Send</button>
            </div>
        );
    }
}

ReactDOM.render(
    <WidgetContainer /> ,
    document.getElementById('content')
);