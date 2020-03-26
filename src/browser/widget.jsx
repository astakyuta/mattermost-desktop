import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

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

            {/*<div className="header">*/}
            {/*    <h2>{this.sender}</h2>*/}
            {/*</div>*/}

              {/*<div className="container">*/}
              {/*    <ul className="nav nav-tabs">*/}
              {/*        <li className="active"><a data-toggle="tab" href="#home">Home</a></li>*/}
              {/*        <li><a data-toggle="tab" href="#menu1">Menu 1</a></li>*/}
              {/*        <li><a data-toggle="tab" href="#menu2">Menu 2</a></li>*/}
              {/*        <li><a data-toggle="tab" href="#menu3">Menu 3</a></li>*/}
              {/*    </ul>*/}

              {/*    <div className="tab-content">*/}
              {/*        <div id="home" className="tab-pane fade in active">*/}
              {/*            <h3>HOME</h3>*/}
              {/*            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt*/}
              {/*                ut labore et dolore magna aliqua.</p>*/}
              {/*        </div>*/}
              {/*        <div id="menu1" className="tab-pane fade">*/}
              {/*            <h3>Menu 1</h3>*/}
              {/*            <p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea*/}
              {/*                commodo consequat.</p>*/}
              {/*        </div>*/}
              {/*        <div id="menu2" className="tab-pane fade">*/}
              {/*            <h3>Menu 2</h3>*/}
              {/*            <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque*/}
              {/*                laudantium, totam rem aperiam.</p>*/}
              {/*        </div>*/}
              {/*        <div id="menu3" className="tab-pane fade">*/}
              {/*            <h3>Menu 3</h3>*/}
              {/*            <p>Eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt*/}
              {/*                explicabo.</p>*/}
              {/*        </div>*/}
              {/*    </div>*/}
              {/*</div>*/}

              <Tabs>
                  <TabList>
                      <Tab>{this.sender}</Tab>
                      {/*<Tab>Title 2</Tab>*/}
                  </TabList>

                  <TabPanel>
                      <div className="message-box">
                          <p>{message.body}</p>
                      </div>
                      <div className="reply-box">
                        <textarea className="replyInput" value={reply} onChange={this.handleMessageChange} onKeyDown={this.handleKeyDown}/>
                      </div>
                  </TabPanel>
                  {/*<TabPanel>*/}
                  {/*    <h2>Any content 2</h2>*/}
                  {/*</TabPanel>*/}
              </Tabs>

            {/*  <div className="message-box">*/}
            {/*    <p>{message.body}</p>*/}
            {/*  </div>*/}
            {/*<div className="reply-box">*/}
            {/*    <textarea*/}
            {/*        className="replyInput"*/}
            {/*        value={reply}*/}
            {/*        onChange={this.handleMessageChange}*/}
            {/*        onKeyDown={this.handleKeyDown}*/}
            {/*    />*/}
            {/*</div>*/}
          </div>
        );
    }
}

ReactDOM.render(
    <WidgetContainer /> ,
    document.getElementById('content')
);