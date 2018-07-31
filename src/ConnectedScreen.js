import React, { Component } from 'react';
import './ConnectedScreen.css';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io('https://basalt-opossum.glitch.me/');

class ConnectedScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ip: this.props.ip,
      roomID: this.props.roomID,
      fileList: []
    };
  }

  componentDidMount() {
    socket.emit('mobile', {
      room: this.state.roomID,
      message: 'wtf'
    });
  }

  //send files to device
  onFileDrop = files => {
    console.log(files);
    files.forEach(file => {
      let form = new FormData();
      form.append('filename', file);
      axios
        .post(this.state.ip + '/uploadfile', form)
        .then(response => {
          console.log(response.data);
          let status = response.data.status;
          let fileList = this.state.fileList;
          if (status === 'done') {
            fileList.push(file.name);
            this.setState({
              fileList: fileList
            });
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    });
  };

  //user click on disconnect button
  onDisconnectClicked = () => {
    socket.emit('disconnectAll', {
      room: this.state.roomID,
      status: 'disconnect'
    });
    //change screen back to normal
    this.props.phoneConnected(false);
  };

  render() {
    return (
      <Dropzone
        className="ignore"
        disableClick={true}
        onDrop={this.onFileDrop}
        ref={node => {
          this.dropzoneRef = node;
        }}
      >
        <div className="App">
          <header className="connected-header">
            <h3>Drag and drop your files below</h3>
            <button className="disconnect" onClick={this.onDisconnectClicked}>
              DISCONNECT
            </button>
          </header>
          <div className="dropZone">
            <Dropzone
              className="ignore"
              disableClick={false}
              onDrop={this.onFileDrop}
            >
              <a className="dropText">
                Drop your files here or click here to upload
              </a>

              <ul>
                {this.state.fileList.map(listValue => {
                  return <li>{listValue}</li>;
                })}
              </ul>
            </Dropzone>
          </div>
        </div>
      </Dropzone>
    );
  }
}

//make this component available to the app
export default ConnectedScreen;
