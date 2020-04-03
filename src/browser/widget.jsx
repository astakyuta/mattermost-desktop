import React from 'react';
import ReactDOM from 'react-dom';
import { ipcRenderer } from 'electron';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

class WidgetContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // message: null,
            message: [],
            reply: '',
            channelIds: [],
            receivedMessages: [],
            tabIndex: 0,
            replyDetails: {
                message: '',
                channel_id: '',
            }, // separately used for different channels
        };

        this.messageDetails = { // changing with replyDetails inside state
            message: '',
            channel_id: '',
        };

        this.receivedMessagesDetails = []; // at the end of assigning value, the whole thing is submitted to receivedMessages state.

        this.sender = '';
    }

    componentDidMount() {
        ipcRenderer.send('widget-ready', null);
        ipcRenderer.on('new-message', (event, payload) => {
            console.log('message received', payload);
            this.sender = payload.message.channel.display_name;
            this.messageDetails.channel_id = payload.message.channel.id;
            // this.messageDetails.user_id = payload.message.channel.teammate_id;


            if(this.receivedMessagesDetails.length < 1) { // For first entry in parent array
                let newMessage = {
                    channelId: payload.message.channel.id,
                    message: [payload.message],
                };
                this.receivedMessagesDetails.push(newMessage);
                console.log('1: ', this.receivedMessagesDetails);
            } else { // For all entries except the first entry in parent array

                const channelExistance = this.handleExistingChannel(payload.message.channel.id);

                if(channelExistance.length > 0) { // If channel already present inside received message's array, add the message data into specific array
                    this.receivedMessagesDetails.find((item) => {
                        if (item.channelId === payload.message.channel.id) {
                            item.message.push(payload.message);
                            console.log('2: ', this.receivedMessagesDetails);
                            return true;
                        }
                    });
                } else { // If channel not found inside received message's array, add a new message object with new channelId in parent array
                    let newMessage = {
                        channelId: payload.message.channel.id,
                        message: [payload.message],
                    };
                    this.receivedMessagesDetails.push(newMessage);
                    console.log('3: ', this.receivedMessagesDetails);
                } // end of inner if

            } // end of outer if

            this.setState({
                // message: payload.message,
                message: this.state.message.concat(payload.message),
                receivedMessages: this.receivedMessagesDetails,
            });

            // this.setState.message.push(payload.message);
        })
    }

    handleExistingChannel(channelId) {

        // console.log('received message details under handle function: ', this.receivedMessagesDetails);

        let testResult = this.receivedMessagesDetails.reduce(function (foundChannel, item) {
            if (item.channelId == channelId) {
                return foundChannel.concat(item.channelId);
            } else {
                return foundChannel;
            }
        }, []);

        return testResult;
    }

    // handleMessageChange = (event) => {
    //     this.setState({ reply: event.target.value });
    // }

    handleReply = (event) => {
        console.log('event data in handle reply: ', event);
        this.setState({
            reply: event.target.value, // can be deleted after
            replyDetails: {
                message: event.target.value,
                channel_id: event.target.name,
            },
        });
    }

    removeTab(tabIndex) {
        console.log('tabindex: ', tabIndex);
        console.log('remove tabs function is called');
        var array = [...this.state.receivedMessages]; // make a separate copy of the array
        // var index = array.indexOf(tabIndex);
        console.log('array is: ', array);
        // console.log('index in console is: ', index);

        array.splice(tabIndex, 1);

        console.log('array after slice: ', array);

        this.setState({
            receivedMessages: array,
            tabIndex: 0,
        });



        // this.setState({
        //     tabs: this.state.tabs.filter((tab, i) => i !== index),
        //     tabIndex: this.state.tabIndex - 1,
        // });
    }

    handleKeyDown = (event) => {
        if (event.keyCode == 13) {
            this.handleSubmit(event);
        }
    }

    handleSubmit = (event) => {
        const { replyDetails } = this.state;
        console.log('event in handle: ', event);
        console.log('this.state in handle: ', this.state);
        const { reply } = this.state;
        const tabCount = this.state.receivedMessages.length;
        // let payload = {
        //     reply: reply,
        //     tabcount: tabcount
        // };

        const payload = {reply, tabCount};

        // const { tabCount } = this.state.receivedMessages.length;
        // const payload = { tabCount };

        console.log('sending reply', payload);



        ipcRenderer.send('widget-reply', payload);


        this.setState({ // resets the reply's textarea
            reply: '',
        });

        this.messageDetails.message = this.state.reply;
        console.log('message details: ', this.messageDetails);
        console.log('reply details: ', replyDetails);

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
            body: JSON.stringify(replyDetails), // body data type must match "Content-Type" header
            // body: JSON.stringify(this.messageDetails),
        })
        .then((response) => {
            return response.json();
        })
        .then((data) => {
            console.log(data);
            console.log('tab index: ', this.state.tabIndex);
            this.removeTab(this.state.tabIndex); // this.state.tabIndex
        }).catch((error) => {
            console.error('Error:', error);
        });
    }

    render() {
        const {message, reply, receivedMessages} = this.state;
        // const { receivedMessages } = this.state.receivedMessages;
        // const { newRenderedessages } = this.receivedMessagesDetails;
        console.log('message is: ', message);
        console.log('receivedMessages inside render: ', receivedMessages);
        if (!message) {
            return null;
        }

        return (

          <div className="wrapper">

              <Tabs selectedIndex={this.state.tabIndex} onSelect={tabIndex => this.setState({ tabIndex })}>
                  <TabList>
                      {/*<Tab>{this.sender}</Tab>*/}
                      {
                          receivedMessages.map((item, key) => {    // function(item) {
                              console.log(key);
                              return <Tab key={key}> {item.message[0].channel.display_name} </Tab>;
                          })
                      }
                  </TabList>

                  {
                      receivedMessages.map((item, key) => {
                          return (
                          <TabPanel key={key}>
                              {
                                  item.message.map((message, index) => {
                                      return (
                                        <div key={index}>
                                            <div className="message-box"><p> {message.body} </p></div>
                                        </div>
                                      );
                                  })
                              }
                              <div className="reply-box">
                                  <textarea className="replyInput" name={item.channelId} value={reply} onChange={this.handleReply} onKeyDown={this.handleKeyDown}/>
                              </div>
                          </TabPanel>);
                      })
                  }

                  {/*<TabPanel>*/}
                  {/*    {*/}
                  {/*        receivedMessages.map((item, key) => {*/}
                  {/*            return <div key={key} className="message-box"><p> {item.message.body} </p></div>;*/}
                  {/*        });*/}
                  {/*    }*/}
                  {/*    <div className="reply-box">*/}
                  {/*        <textarea className="replyInput" value={reply} onChange={this.handleMessageChange} onKeyDown={this.handleKeyDown}/>*/}
                  {/*    </div>*/}
                  {/*</TabPanel>*/}

                  {/*<TabPanel>*/}
                  {/*    {*/}
                  {/*        message.map((item, key) => {    // function(item) {*/}
                  {/*          console.log(key);*/}
                  {/*          return <div key={key} className="message-box"><p> {item.body} </p></div>;*/}
                  {/*        })*/}
                  {/*    }*/}
                  {/*    <div className="reply-box">*/}
                  {/*      <textarea className="replyInput" value={reply} onChange={this.handleMessageChange} onKeyDown={this.handleKeyDown}/>*/}
                  {/*    </div>*/}
                  {/*</TabPanel>*/}

                  {/*<TabPanel>*/}
                  {/*    <h2>Any content 2</h2>*/}
                  {/*</TabPanel>*/}
              </Tabs>

          </div>
        );
    }
}

ReactDOM.render(
    <WidgetContainer /> ,
    document.getElementById('content')
);