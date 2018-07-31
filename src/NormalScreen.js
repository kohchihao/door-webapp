import React, { Component } from 'react';
import './App.css';
import io from 'socket.io-client';
import QRCode from 'qrcode';
import axios from 'axios';

const socket = io('https://basalt-opossum.glitch.me/');

class NormalScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomID: '',
      qrCode: '',
      ip: '',
      phoneConnected: false
    };
  }

  componentDidMount() {
    let roomID =
      Math.random()
        .toString(32)
        .slice(2) +
      Math.random()
        .toString(32)
        .slice(2);

    this.setState({
      roomID: roomID
    });
    this.props.roomID(roomID);

    //required for try to reconnect
    socket.disconnect();
    socket.connect();

    //connect to server
    console.log('roomID will be', roomID);
    socket.on('connect', () => {
      console.log('connecting...', roomID);
      socket.emit('room', roomID);
    });

    //basic communication
    socket.on('message', data => {
      console.log('incoming message:', data);
      if (data.status === 'phone_connected') {
        console.log('phone IP:', data.ip);
        this.checkConnection(data.ip);
        this.setState({
          ip: data.ip
        });

        this.props.ip(data.ip);
      }
    });

    //to download incoming files
    socket.on('incoming_files', data => {
      console.log('incoming_files', data);
      axios({
        url: data.ip + '/download/' + data.file_path,
        method: 'GET',
        responseType: 'blob' // important
      }).then(response => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        console.log(data.file_name);
        link.setAttribute('download', data.file_name);
        document.body.appendChild(link);
        link.click();
      });
    });

    //create QR Code
    QRCode.toDataURL(roomID)
      .then(qrCode => {
        console.log(qrCode);
        this.setState({
          qrCode: qrCode
        });
        this.props.qrCode(qrCode);
      })
      .catch(err => {
        console.error(err);
      });
  }

  //turn off all socket.
  componentWillUnmount() {
    socket.off();
  }

  //check user device connected
  checkConnection = ip => {
    axios.get(ip + '/check').then(response => {
      // handle success
      console.log(response.data);
      if (response.data.check === 'success') {
        this.setState({
          phoneConnected: true
        });
        this.props.phoneConnected(true);
      }
    });
  };

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className="logoWrapper">
            <img src={this.state.qrCode} className="App-logo" alt={'QrCode'} />
          </div>
          <div className="headerText">
            <h1 className="App-title">Door</h1>
            <h3>Transfer large files with WiFi</h3>
          </div>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
        
        <p>{this.state.roomID}</p>
       
      </div>
    );
  }
}

//make this component available to the app
export default NormalScreen;
