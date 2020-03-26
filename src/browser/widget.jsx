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

        this.messageDetails = {
            message: '',
            channel_id: '',
            // user_id: '',
            // props: '',
            // root_id: '',
        };

        this.sender = '';
    }

    componentDidMount() {
        ipcRenderer.send('widget-ready', null);
        ipcRenderer.on('new-message', (event, payload) => {
            console.log('message received', payload);
            this.sender = payload.message.channel.display_name;
            this.messageDetails.channel_id = payload.message.channel.id;
            // this.messageDetails.user_id = payload.message.channel.teammate_id;

            this.setState({
                message: payload.message,
            });
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
        console.log('event in handle: ', event);
        console.log('this.state in handle: ', this.state);
        const { reply } = this.state;
        const payload = { reply };
        console.log('sending reply', payload);
        ipcRenderer.send('widget-reply', payload);
        this.setState({
            reply: '',
        });
        this.messageDetails.message = this.state.reply;

        // let token = 'Bearer eeodjab9wbnyxyabdbfern7rzw';
        let url = 'http://teamcomm.ga/api/v4/posts';
        fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // 'Authorization': token,
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(this.messageDetails), // body data type must match "Content-Type" header
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
        }).catch((error) => {
            console.error('Error:', error);
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
                    <h2>{this.sender}</h2>
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