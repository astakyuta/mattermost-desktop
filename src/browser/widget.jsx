import React from 'react';
import ReactDOM from 'react-dom';
import Countdown from 'react-countdown';
import { ipcRenderer } from 'electron';
import AutoResponseTimer from './components/AutoResponseTimer.jsx';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

class WidgetContainer extends React.Component {
    clockRef = null;

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
            replyDuration: '',
            showAutoResponseTimer: true,
        };

        this.messageDetails = { // changing with replyDetails inside state
            message: '',
            channel_id: '',
        };

        this.receivedMessagesDetails = []; // at the end of assigning value, the whole thing is submitted to receivedMessages state.

        this.sender = '';

        this.replyDuration = '';

        this.LastType = '';

        this.removeAllTabs = this.removeAllTabs.bind(this);

        this.typeCheckTimer = this.typeCheckTimer.bind(this);

        this.startTypeCheckTimer = '';

        this.showAutoResponseTimer = true;

        // this.forceUpdateHandler = this.forceUpdateHandler.bind(this);

        this.setClockRef = this.setClockRef.bind(this);
        this.start = this.start.bind(this);
        this.pause = this.pause.bind(this);

        this.inputRef = React.createRef();
    }

    componentDidMount() {
        ipcRenderer.send('widget-ready', null);
        ipcRenderer.on('new-message', (event, payload) => {
            console.log('message received', payload);
            this.sender = payload.message.channel.display_name;
            this.messageDetails.channel_id = payload.message.channel.id;
            // this.messageDetails.user_id = payload.message.channel.teammate_id;
            this.replyDuration = payload.message.notifyProp.auto_responder_duration;

            this.setState({
                replyDuration: payload.message.notifyProp.auto_responder_duration
            });


            if(this.receivedMessagesDetails.length < 1) { // For first entry in parent array

              // this.interval = setInterval(() => {
              //   let newMessage = {
              //     channelId: payload.message.channel.id,
              //     message: [payload.message],
              //     duration: this.replyDuration,
              //   };
              //   console.log('This will run every second!');
              // }, 1000);
              // return () => clearInterval(this.replyDuration);

                let newMessage = {
                    channelId: payload.message.channel.id,
                    message: [payload.message],
                    // duration: this.replyDuration,
                };

                this.receivedMessagesDetails.push(newMessage);
                console.log('1: ', this.receivedMessagesDetails);
            } else { // For all entries except the first entry in parent array

                const channelExistance = this.handleExistingChannel(payload.message.channel.id);

                if(channelExistance.length > 0) { // If channel already present inside received message's array, add the message data into specific array
                    this.receivedMessagesDetails.find((item) => {
                        if (item.channelId === payload.message.channel.id) {
                            item.message.push(payload.message);
                            // item.duration = this.replyDuration;
                            console.log('2: ', this.receivedMessagesDetails);
                            return true;
                        }
                    });
                } else { // If channel not found inside received message's array, add a new message object with new channelId in parent array
                    let newMessage = {
                        channelId: payload.message.channel.id,
                        message: [payload.message],
                        // duration: this.replyDuration,
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

        // setTimeout(() => {
        //     this.removeAllTabs();
        // }, (this.replyDuration * 1000));
        // return () => clearTimeout(timer);

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
        clearInterval(this.startTypeCheckTimer);
        this.startTypeCheckTimer = setInterval(this.typeCheckTimer, (5 * 1000));
        this.LastType = this.getCurrentTimestampInSeconds();
        console.log('new last type: ', this.LastType);
        // console.log('event data in handle reply: ', event);
        this.setState({
            showAutoResponseTimer: false,
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
        console.log('received messages details after array is: ', this.receivedMessagesDetails);
        // console.log('index in console is: ', index);

        var msgDetailsArr = [...this.receivedMessagesDetails];
        msgDetailsArr.splice(tabIndex, 1);
        this.receivedMessagesDetails = msgDetailsArr;

        console.log('received messages details after slicing array is: ', this.receivedMessagesDetails);


        array.splice(tabIndex, 1);

        console.log('array after slice: ', array);
        console.log('received messages after slice: ', this.state.receivedMessages);

        this.setState({
            receivedMessages: array,
            tabIndex: 0,
        });

        console.log('received messages after setting after slice: ', this.state.receivedMessages);



        // this.setState({
        //     tabs: this.state.tabs.filter((tab, i) => i !== index),
        //     tabIndex: this.state.tabIndex - 1,
        // });
    }

    removeAllTabs = () => { // this will automatically remove widget

        let channel_ids = [];
        this.receivedMessagesDetails.forEach(function(message) {
            channel_ids.push(message.channelId);
        });
        console.log("channel ids list in array: ", channel_ids);

        // clears the TypeCheckTimer
        clearInterval(this.startTypeCheckTimer);

        // closes the widget
        const payload = {
            tabCount: 1
        };
        ipcRenderer.send('widget-reply', payload);

        // Resets the messages store in widget
        this.setState({
            reply: '',
            replyDetails: {
                message: '',
                channel_id: '',
            },
            receivedMessages: [],
            tabIndex: 0,
        });
        this.receivedMessagesDetails = [];

        // Send auto responses to the unreplied messages
        const obj = {channel_ids: channel_ids};
        let url = 'http://teamcomm.ga/api/v4/posts/auto_response';
        fetch(url, {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              // 'Authorization': token,
              'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(obj), // body data type must match "Content-Type" header
            // body: JSON.stringify(this.messageDetails),
          })
          .then((response) => {
            console.log(response);
            // return response.json();
          })
          .then((data) => {
            console.log('returned data: ', data);
          }).catch((error) => {
            console.error('Error:', error);
        });



    }

    handleKeyDown = (event) => {
        if (event.keyCode == 13) {
            this.setState({
                showAutoResponseTimer: true, // this.state.replyDuration
            });
            // this.forceUpdateHandler();

            this.start();
            this.showAutoResponseTimer = true;
            this.handleSubmit(event);
        }
    }

    checkReply = (event) => {
        if (this.LastType == 'True') {

        }
    }

    onFocusEvent = (event) => {
        this.setState({
            showAutoResponseTimer: false, // for changing timer text in widegt view
        });
        this.showAutoResponseTimer = false;
        clearInterval(this.startTypeCheckTimer);
        this.startTypeCheckTimer = setInterval(this.typeCheckTimer, (5 * 1000));
        this.LastType = this.getCurrentTimestampInSeconds();
        console.log("last type is seconds: ", this.LastType);
    }

    getCurrentTimestampInSeconds() {
        return Math.floor(Date.now() / 1000);
    }

    typeCheckTimer = () =>  { // check user's last type in every 10 seconds interval
        let currentTimestamp = this.getCurrentTimestampInSeconds();
        if( (currentTimestamp - this.LastType) > 30) {
            // As because the auto response timer is visible again, this should be stooped until further action taken by user
            clearInterval(this.startTypeCheckTimer);
            this.setState({
                showAutoResponseTimer: true, // this.state.replyDuration
            });
            this.start(); // starts the auto response timer again
            console.log('30 seconds exceeds!');
            console.log('showAutoResponseTimer: ', this.state.showAutoResponseTimer);
            // start the auto response timer again
        } else {
            console.log('30 seconds not exceeded yet!');
            // nothing here
        }
    }

    // forceUpdateHandler(){
    //     this.forceUpdate();
    // };


    // code for is_typing API call
    // onFocusEvent = (event) => {
    //     this.LastType = 'True';
    //
    //     const obj = { is_typing: 'True' };
    //     let url = 'http://teamcomm.ga/api/v4/users/4bw1u1dbgibpfkwhj4qugjepmc/is_typing';
    //     fetch(url, {
    //         method: 'PUT', // *GET, POST, PUT, DELETE, etc.
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json',
    //             'X-Requested-With': 'XMLHttpRequest',
    //         },
    //         body: JSON.stringify(obj), // body data type must match "Content-Type" header
    //     })
    //     .then((response) => {
    //         console.log(response);
    //     })
    //     .then((data) => {
    //         console.log('returned data: ', data);
    //     }).catch((error) => {
    //         console.error('Error:', error);
    //     });
    //
    // }


    // code to send auto response
    // onFocusEvent = (event) => {
    //
    //   const obj = { channel_ids: ['919tqmpbqif1iq16n5kzu45ufo', '19bro6rt73rjid411ap7yaeuuo'] };
    //   let url = 'http://teamcomm.ga/api/v4/posts/auto_response';
    //   fetch(url, {
    //     method: 'POST', // *GET, POST, PUT, DELETE, etc.
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Accept': 'application/json',
    //       // 'Authorization': token,
    //       'X-Requested-With': 'XMLHttpRequest',
    //     },
    //     body: JSON.stringify(obj), // body data type must match "Content-Type" header
    //     // body: JSON.stringify(this.messageDetails),
    //   })
    //   .then((response) => {
    //     console.log(response);
    //     // return response.json();
    //   })
    //   .then((data) => {
    //     console.log('returned data: ', data);
    //   }).catch((error) => {
    //     console.error('Error:', error);
    //   });
    //
    // }


    start() {
        this.clockRef.start();
    }

    pause() {
        this.clockRef.pause();
    }

    setClockRef(ref) {
        // When the `Clock` (and subsequently `Countdown` mounts
        // this will give us access to the API
        this.clockRef = ref;
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

        if(tabCount == 1) {
            // clearing the typechecker interval because all messages have been replied
            clearInterval(this.startTypeCheckTimer);
        }

        const payload = {reply, tabCount};

        // const { tabCount } = this.state.receivedMessages.length;
        // const payload = { tabCount };

        console.log('sending reply', payload);

        ipcRenderer.send('widget-reply', payload);

        this.inputRef.current.blur(); // this helps focus out from reply's textarea

        this.setState({ // resets the reply's textarea
            reply: '',
            replyDetails: {
                message: '',
                channel_id: '',
            },
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
        const {message, reply, receivedMessages, replyDetails} = this.state;
        // const { receivedMessages } = this.state.receivedMessages;
        // const { newRenderedessages } = this.receivedMessagesDetails;

        if (receivedMessages.length < 1 || message.length < 1) {
            return null;
        }
        console.log('message is: ', message);
        console.log('receivedMessages inside render: ', receivedMessages);




        return (

          <div className="wrapper">

              <Tabs selectedIndex={this.state.tabIndex} onSelect={tabIndex => this.setState({ tabIndex, replyDetails: {message: ''} })}>
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
                              <div className="messages-overflow">
                              {
                                  item.message.map((message, index) => {
                                      return (
                                        <div key={index}>
                                            <div className="message-box"><p className="single-message"> {message.body} </p></div>
                                        </div>
                                      );
                                  })
                              }
                              </div>
                              <div className="timer">
                                  <span>
                                      {/*{timerText} <Countdown onComplete={this.removeAllTabs}*/}
                                      {/*                       onTick={this.checkReply}*/}
                                      {/*                       autoStart={true}*/}
                                      {/*                       renderer={({ hours, minutes, seconds, completed }) => {*/}
                                      {/*                           // render completed*/}
                                      {/*                           // if (completed || this.LastType == 'TRUE') return <span>You are good to go!</span>;*/}
                                      {/*                          if(this.showAutoResponseTimer == false) return <span>Timer disabled!</span>;*/}

                                      {/*                           // render current countdown time*/}
                                      {/*                           return <span>{hours}::{minutes}::{seconds}</span>;*/}
                                      {/*                       }}*/}
                                      {/*                       date={Date.now() + (this.replyDuration*1000)} />*/}

                                      <AutoResponseTimer refCallback={this.setClockRef} time={this.replyDuration} onComplete={this.removeAllTabs} showAutoResponseTimer={this.state.showAutoResponseTimer}/>
                                  </span>
                              </div>
                              <div className="reply-box">
                                  <textarea key={key} ref={this.inputRef} className="replyInput" name={item.channelId} value={replyDetails.message} onChange={this.handleReply} onKeyDown={this.handleKeyDown} onFocus={this.onFocusEvent}/>
                              </div>
                          </TabPanel>);
                      })
                  }


              </Tabs>

          </div>
        );
    }
}

ReactDOM.render(
    <WidgetContainer /> ,
    document.getElementById('content')
);