import React from 'react';
import ReactDOM from 'react-dom';
// import Countdown, {zeroPad} from 'react-countdown';
import { ipcRenderer } from 'electron';
// import AutoResponseTimer from './components/AutoResponseTimer.jsx';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';

let sound = require('./sounds/pristine.mp3');

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
            currentAutoResponseTimerTime: 0,
            visibleAutoResponderTimerTime: '',
            visibleTabname: '',
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



        this.autoResponseTimer = this.autoResponseTimer.bind(this);

        // this.startAutoResponseTimer = '';

        this.startAutoResponseTimer = this.startAutoResponseTimer.bind(this);

        this.newAutoResponseTimer = '';

        this.inputRef = React.createRef();

        this.responderActive = '';
    }

    componentDidMount() {
        ipcRenderer.send('widget-ready', null);
        ipcRenderer.on('new-message', (event, payload) => {
            console.log('message received', payload);
            this.sender = payload.message.channel.display_name;
            this.messageDetails.channel_id = payload.message.channel.id;
            // this.messageDetails.user_id = payload.message.channel.teammate_id;
            this.replyDuration = payload.message.notifyProp.auto_responder_duration;
            this.responderActive = payload.message.notifyProp.auto_responder_active;

            this.setState({
                replyDuration: payload.message.notifyProp.auto_responder_duration,
                // visibleAutoResponderTimerTime: payload.message.notifyProp.auto_responder_duration,
            });

            // this.startAutoResponseTimer = setInterval(this.autoResponseTimer, 1000);
            // this.url = 'https://notificationsounds.com/soundfiles/d7a728a67d909e714c0774e22cb806f2/file-sounds-1150-pristine.mp3';

            this.audio = new Audio(sound); //  React.createRef();

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

                this.audio.play();

                let newMessage = {
                    channelId: payload.message.channel.id,
                    message: [payload.message],
                    // duration: this.replyDuration,
                };

                this.receivedMessagesDetails.push(newMessage);
                this.setState({
                    visibleAutoResponderTimerTime: payload.message.notifyProp.auto_responder_duration,
                    visibleTabname: payload.message.channel.display_name,
                });

                // this.startAutoResponseTimer = setInterval(this.autoResponseTimer, 1000);
                if(this.responderActive === "true") {
                    this.startAutoResponseTimer();
                }

                console.log('1: ', this.receivedMessagesDetails);
            } else { // For all entries except the first entry in parent array
                const channelExistance = this.handleExistingChannel(payload.message.channel.id);

                if(channelExistance.length > 0) { // If channel already present inside received message's array, add the message data into specific array
                    this.receivedMessagesDetails.find((item) => {
                        if (item.channelId === payload.message.channel.id) {
                            item.message.push(payload.message);
                            if(this.state.visibleTabname === item.message[0].channel.display_name) {
                                this.audio.play();
                                if(this.responderActive === "true") {
                                    this.clearAutoResponseTimer();
                                    this.startAutoResponseTimer();
                                }
                            }

                            // item.duration = this.replyDuration;
                            console.log('2: ', this.receivedMessagesDetails);
                            return true;
                        }
                    });
                } else { // If channel not found inside received message's array, add a new message object with new channelId in parent array
                    // this.inputRef.current.blur();
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

        if(this.responderActive === "true") {
            clearInterval(this.startTypeCheckTimer);
            this.clearAutoResponseTimer();
            this.startTypeCheckTimer = setInterval(this.typeCheckTimer, (5 * 1000));
            this.LastType = this.getCurrentTimestampInSeconds();
        }

        console.log('new last type: ', this.LastType);
        // console.log('event data in handle reply: ', event);
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
            visibleTabname: msgDetailsArr[0].message[0].channel.display_name,
        });

        console.log('received messages after setting after slice: ', this.state.receivedMessages);



        // this.setState({
        //     tabs: this.state.tabs.filter((tab, i) => i !== index),
        //     tabIndex: this.state.tabIndex - 1,
        // });
    }

    removeAllTabs = () => { // this will automatically remove widget

        let channel_ids = [];
        channel_ids.push(this.receivedMessagesDetails[0].channelId);

        // // fetching list of channels that are not replied
        // this.receivedMessagesDetails.forEach(function(message) {
        //     channel_ids.push(message.channelId);
        // });
        // console.log("channel ids list in array: ", channel_ids);

        // // clears the TypeCheckTimer
        // clearInterval(this.startTypeCheckTimer);
        //
        // // closes the widget
        // const payload = {
        //     tabCount: 1
        // };
        // ipcRenderer.send('widget-reply', payload);
        //
        // // Resets the messages store in widget
        // this.setState({
        //     reply: '',
        //     replyDetails: {
        //         message: '',
        //         channel_id: '',
        //     },
        //     receivedMessages: [],
        //     tabIndex: 0,
        // });
        // this.receivedMessagesDetails = [];


        this.inputRef.current.blur(); // this helps focus out from reply's textarea

        this.setState({ // resets the reply's textarea
            reply: '',
            replyDetails: {
                message: '',
                channel_id: '',
            },
        });

        const tabCount = this.state.receivedMessages.length;
        const payload = {tabCount};
        ipcRenderer.send('widget-reply', payload);


        if(tabCount == 1) {
            // clearing the typechecker interval because all messages have been replied
            clearInterval(this.startTypeCheckTimer);
            this.clearAutoResponseTimer();
        } else if(tabCount > 1) {
            this.clearAutoResponseTimer();
            if(this.responderActive === "true") {
                this.startAutoResponseTimer();
            }
        }



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
            // this.removeTab(this.state.tabIndex);
          }).catch((error) => {
            console.error('Error:', error);
        });

        this.removeTab(this.state.tabIndex);



    }

    handleKeyDown = (event) => {
        if (event.keyCode == 13) {
            this.handleSubmit(event);
        }
    }

    checkReply = (event) => {
        if (this.LastType == 'True') {

        }
    }

    onFocusEvent = (event) => {

        // if ( document.activeElement === ReactDOM.findDOMNode(this.refs.inputRef) ) {
        //     return;
        // }

        // this.clearAutoResponseTimer();
        // clearInterval(this.startTypeCheckTimer);
        // this.startTypeCheckTimer = setInterval(this.typeCheckTimer, (5 * 1000));
        // this.LastType = this.getCurrentTimestampInSeconds();
        // console.log("last type is seconds: ", this.LastType);
    }

    getCurrentTimestampInSeconds() {
        return Math.floor(Date.now() / 1000);
    }

    typeCheckTimer = () =>  { // check user's last type in every 10 seconds interval
        let currentTimestamp = this.getCurrentTimestampInSeconds();
        if( (currentTimestamp - this.LastType) > 30) {
            // As because the auto response timer is visible again, this should be stooped until further action taken by user
            clearInterval(this.startTypeCheckTimer);
            if(this.responderActive === "true") {
                this.startAutoResponseTimer();
            }
            // this.startAutoResponseTimer = setInterval(this.autoResponseTimer, 1000);
            console.log('30 seconds exceeds!');
            // start the auto response timer again
        } else {
            console.log('30 seconds not exceeded yet!');
            // nothing here
        }
    }

    startAutoResponseTimer = () => {
        this.newAutoResponseTimer = setInterval(this.autoResponseTimer, 1000);
        this.setState({
            showAutoResponseTimer: true
        })
    }

    autoResponseTimer = () => {
        console.log('replyDuration: ', this.replyDuration);
        console.log('replyDuration: ', this.state.currentAutoResponseTimerTime);

        if(this.replyDuration > this.state.currentAutoResponseTimerTime) {

            this.setState({
                visibleAutoResponderTimerTime: this.state.visibleAutoResponderTimerTime - 1,
                currentAutoResponseTimerTime: this.state.currentAutoResponseTimerTime + 1,
            });
            // (this.replyDuration - this.state.currentAutoResponseTimerTime)
        } else {
            console.log('comes under 12 = 12');
            this.removeAllTabs();
        }
    }

    clearAutoResponseTimer = () => {
        clearInterval(this.newAutoResponseTimer);
        this.setState({
            visibleAutoResponderTimerTime: this.replyDuration,
            currentAutoResponseTimerTime: 0,
            showAutoResponseTimer: false,
        });
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
        } else if(tabCount > 1) {
            this.clearAutoResponseTimer();
            if(this.responderActive === "true") {
                this.startAutoResponseTimer();
            }
            // this.startAutoResponseTimer = setInterval(this.autoResponseTimer, 1000);
        }

        // This sends data to ipcRenderer from where the widget hide & show logic is being handled
        const payload = {reply, tabCount};
        ipcRenderer.send('widget-reply', payload);

        // const { tabCount } = this.state.receivedMessages.length;
        // const payload = { tabCount };

        // console.log('sending reply', payload);



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

        // this.removeTab(this.state.tabIndex);

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
            // this.removeTab(this.state.tabIndex); // this.state.tabIndex
        }).catch((error) => {
            console.error('Error:', error);
        });

        this.removeTab(this.state.tabIndex);
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
                              if(key == 0) {
                                  return <Tab key={key}> {item.message[0].channel.display_name} </Tab>;
                              } else {
                                  return null;
                              }

                          })
                      }
                  </TabList>

                  {
                      receivedMessages.map((item, key) => {
                          if(key == 0 && this.state.tabIndex == 0) {
                              return (
                                <TabPanel key={key}>
                                    <div className="messages-overflow">
                                        {
                                            item.message.map((message, index) => {
                                                return (
                                                  <div key={index}>
                                                      <div className="message-box"><p
                                                        className="single-message"> {message.body} </p></div>
                                                  </div>
                                                );
                                            })
                                        }
                                    </div>
                                    <div className="timer">
                                        {
                                            (key === 0 && this.state.showAutoResponseTimer === true && this.responderActive === "true") ?

                                                <span>
                                                    {/*<Countdown onComplete={(this.state.showAutoResponseTimer === true) ? this.removeAllTabs : null}*/}
                                                    {/*                   controlled={false}*/}
                                                    {/*                   onTick={this.checkReply}*/}
                                                    {/*                   autoStart={true}*/}
                                                    {/*                   renderer={({ hours, minutes, seconds, completed }) => {*/}
                                                    {/*                       // render completed*/}
                                                    {/*                       // if (completed || this.LastType == 'TRUE') return <span>You are good to go!</span>;*/}
                                                    {/*                      if(this.state.showAutoResponseTimer == false) return <span></span>;*/}

                                                    {/*                       // render current countdown time*/}
                                                    {/*                       return <span>Auto text will be sent in: {zeroPad(minutes)}::{zeroPad(seconds)}</span>;*/}
                                                    {/*                   }}*/}
                                                    {/*                   date={Date.now() + (this.replyDuration*1000)} />*/}

                                                {/*<AutoResponseTimer refCallback={this.setClockRef} time={this.replyDuration}*/}
                                                {/*                   onComplete={this.removeAllTabs}*/}
                                                {/*                   showAutoResponseTimer={this.state.showAutoResponseTimer}/>*/}



                                                {/*<AutoResponseTimer refCallback={this.setClockRef} time={this.replyDuration}*/}
                                                {/*onComplete={this.removeAllTabs}*/}
                                                {/*showAutoResponseTimer={this.state.showAutoResponseTimer}/>*/}

                                                    Auto reply will be sent in: {this.state.visibleAutoResponderTimerTime} second(s)

                                                </span>

                                            :
                                                <span></span>

                                        }
                                    </div>
                                    <div className="reply-box">
                                        <textarea key={key} ref={this.inputRef} className="replyInput"
                                                  name={item.channelId} value={replyDetails.message}
                                                  onChange={this.handleReply} onKeyDown={this.handleKeyDown}
                                                  autoFocus={false}/>

                                    </div>
                                </TabPanel>);
                          } else {
                              return null;
                          }
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