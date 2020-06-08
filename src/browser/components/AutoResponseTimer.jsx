import React from 'react';
import Countdown, { zeroPad } from 'react-countdown';

export default class AutoResponseTimer extends React.Component {
  render() {
    const { refCallback, time, onComplete, showAutoResponseTimer } = this.props;

    function f() {
      console.log("none here is called");
    }

    console.log(showAutoResponseTimer);
    return (
        <Countdown onComplete={(showAutoResponseTimer === true) ? onComplete : f()}
           // onTick={this.checkReply}
           autoStart={true}
           ref={refCallback}
           renderer={({ hours, minutes, seconds, completed }) => {
             // render completed
             // if (completed || this.LastType == 'TRUE') return <span>You are good to go!</span>;
             if(showAutoResponseTimer == false) return <span></span>;

             // render current countdown time
             return <span>Auto text will be sent in: {zeroPad(hours)}::{zeroPad(minutes)}::{zeroPad(seconds)}</span>;
           }}
           date={Date.now() + (time * 1000)} />


      // <Countdown
      //   // When the component mounts, this will
      //   // call `refCallback` in the parent component,
      //   // passing a reference to this `Countdown` component
      //   ref={refCallback}
      //   date={Date.now() + (time * 60000)}
      //   intervalDelay={3}
      //   zeroPadTime={2}
      //   autoStart={false}
      //   daysInHours
      // />
    );
  }
}