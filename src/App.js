import React, { Component } from 'react';
import './App.css';
import ConnectedScreen from './ConnectedScreen';
import NormalScreen from './NormalScreen';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomID: '',
      qrCode: '',
      ip: '',
      phoneConnected: false,
    };
  }

  componentDidMount() {
    
  }

  updateIP = (ip) => {
    this.setState({
      ip: ip,
    })
  }

  updateRoomID = (roomID) => {
    this.setState({
      roomID: roomID,
    })
  }

  updateQRCode = (qrCode) => {
    this.setState({
      qrCode: qrCode,
    })
  }

  updatePhoneConnected = (connected) => {
    this.setState({
      phoneConnected: connected,
    })
  }

  render() {
    return (
      <div>
        {this.state.phoneConnected ? (
          <ConnectedScreen ip={this.state.ip} roomID={this.state.roomID} phoneConnected={this.updatePhoneConnected}/>
        ) : (
          <NormalScreen ip={this.updateIP} roomID={this.updateRoomID} qrCode={this.updateQRCode} phoneConnected={this.updatePhoneConnected}/>
          
        )}
      </div>
    );
  }
}

export default App;
