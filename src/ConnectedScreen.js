import React, { Component } from 'react';
import './ConnectedScreen.css';
import Dropzone from 'react-dropzone';
import axios from 'axios';
import io from 'socket.io-client';
import { Line } from 'rc-progress';
import filesize from 'filesize';

const socket = io('https://basalt-opossum.glitch.me/');

class ConnectedScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ip: this.props.ip,
      roomID: this.props.roomID,
      fileList: [],
      numOfFiles: 0
    };
  }

  componentDidMount() {
    socket.emit('mobile', {
      room: this.state.roomID,
      message: 'wtf'
    });
  }

  myUploadProgress = myFileId => progress => {
    let percentage = Math.floor((progress.loaded * 100) / progress.total);
    let fileList = this.state.fileList;
    let f = fileList[myFileId];
    f.progress = percentage;
    fileList[myFileId] = f;
    this.setState({
      fileList: fileList
    });
  };

  //send files to device
  onFileDrop = files => {
    console.log(files);
    let numOfFiles = this.state.numOfFiles;
    for (let i = 0; i < files.length; i++) {
      let file = files[i];
      let form = new FormData();
      form.append('filename', file);

      //show files in list
      let fileList = this.state.fileList;
      fileList.push(file);
      this.setState({
        fileList: fileList
      });

      //axios config
      const config = {
        onUploadProgress: this.myUploadProgress(numOfFiles)
      };
      numOfFiles += 1;

      axios
        .post(this.state.ip + '/uploadfile', form, config)
        .then(response => {
          console.log(response.data);
          let status = response.data.status;
          if (status === 'done') {
            console.log('filetransfer done');
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }

    this.setState({
      numOfFiles: numOfFiles
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

  renderNotEmptyList = () => {
    return (
      <div className="dropZone1">
        <ul className="sentList">
          {this.state.fileList.map(file => {
            return (
              <li>
                <div className="card">
                  <span>{file.name}</span>
                  <span>{filesize(file.size)}</span>
                  <Line
                    className="progressBar"
                    percent={file.progress}
                    strokeWidth="4"
                    strokeColor="#D3D3D3"/> 
                </div>
              </li>
            );
          })}
        </ul>

        <Dropzone
          className="ignore"
          disableClick={false}
          onDrop={this.onFileDrop}
        >
          <a className="dropText">
            Drop your files here or click here to upload
          </a>
        </Dropzone>
      </div>
    );
  };

  renderDropZone = () => {
    return (
      <Dropzone
        className="ignore"
        disableClick={false}
        onDrop={this.onFileDrop}
      >
        <a className="dropText">
          Drop your files here or click here to uploadssssssss
        </a>
      </Dropzone>
    );
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
            {this.state.fileList.length > 0
              ? this.renderNotEmptyList()
              : this.renderDropZone()}
          </div>
        </div>
      </Dropzone>
    );
  }
}

//make this component available to the app
export default ConnectedScreen;
