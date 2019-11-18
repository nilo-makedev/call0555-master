import * as constants from '../constants.js'
import Alerts, { AlertPropType } from './Alerts.js'
import Chat, { MessagePropTypes } from './Chat.js'
import Notifications, { NotificationPropTypes } from './Notifications.js'
import PropTypes from 'prop-types'
import React from 'react'
import Toolbar from './Toolbar.js'
import Video, { StreamPropType } from './Video.js'
import _ from 'underscore'
//import socket from '../socket.js'
import Echo from "laravel-echo";
import axios from 'axios'

const $_GET = (variable) => {
  let query = window.location.search.substring(1);
  let vars = query.split("&");

  for (var i = 0; i < vars.length; i++) {
      let pair = vars[i].split("=");
      if (pair[0] === variable) {
          return pair[1];
      }
  }
  return (false);
};

export default class App extends React.PureComponent {
  static propTypes = {
    active: PropTypes.string,
    alerts: PropTypes.arrayOf(AlertPropType).isRequired,
    dismissAlert: PropTypes.func.isRequired,
    init: PropTypes.func.isRequired,
    notifications: PropTypes.objectOf(NotificationPropTypes).isRequired,
    notify: PropTypes.func.isRequired,
    messages: PropTypes.arrayOf(MessagePropTypes).isRequired,
    peers: PropTypes.object.isRequired,
    sendMessage: PropTypes.func.isRequired,
    streams: PropTypes.objectOf(StreamPropType).isRequired,
    toggleActive: PropTypes.func.isRequired
  }
  constructor () {
    super()
    this.state = {
      videos: {},
      chatVisible: false,
      viewers: []
    }
  }
  handleShowChat = () => {
    this.setState({
      chatVisible: true
    })
  }
  handleHideChat = () => {
    this.setState({
      chatVisible: false
    })
  }
  handleToggleChat = () => {
    return this.state.chatVisible
      ? this.handleHideChat()
      : this.handleShowChat()
  }
  
  
  handleEndCall = () => {
    if (this.state.viewers.length && this.state.viewers.length === 1){
      let data = {
        "message_id": $_GET('mid'),
        "user_ids": this.state.participants.map(v=>v.id)
      }
      let myToken = localStorage.getItem('my_token');
      axios({
        method: "PUT",
        url:  `https://driff.driff.io/api/v2/post-channel-call-ended`,
        crossDomain: true,
        data: data,
        headers: {
            "Content-Type": "application/json",
            Authorization: myToken
        }
      })
        .then(res => {
            console.log(res.data)          
            window.close()
        });
    }else{
      window.close()
    }
  }
  componentDidMount () {
    let myToken = localStorage.getItem('my_token');
    let accessBroadcastToken = localStorage.getItem('socket_token');
    let host = localStorage.getItem('host')
    //let host = 'https://admin.drevv.com';
    localStorage.setItem('my_token', myToken);
    localStorage.setItem('socket_token', accessBroadcastToken);
    if (!window.io) window.io = require("socket.io-client");
    if (!window.Echo) {
      if (myToken && accessBroadcastToken && host){
        window.Echo = new Echo({
          broadcaster: "socket.io",
          host: host,
          auth: {
              headers: {
                  Authorization: myToken,
                  "Driff-Broadcast-Token": accessBroadcastToken
              }
          }
        });
      }
      window.Echo.join(localStorage.getItem('slug') + '.App.Stream.' + $_GET('channel'))
      .here(viewers => {
          console.log(viewers)
          this.setState({viewers: viewers, participants:viewers})
      })
      .joining(user => {
          console.log(user)
          this.setState({viewers: [...this.state.viewers, user], participants:[...this.state.participants, user]})
      })
      .leaving(user => {
          console.log(user, "LEAVE");
          this.setState({viewers: this.state.viewers.filter(v=>v.id!==user.id)})
      });
    }
    //window.addEventListener("beforeunload", this.onUnload)
    const { init } = this.props
    init()
  }
  componentWillUnmount(){
    console.log('unmounted')
    //window.removeEventListener("beforeunload", this.onUnload)
    //alert('unmount')
  }
  render () {
    const {
      active,
      alerts,
      dismissAlert,
      notifications,
      notify,
      messages,
      peers,
      sendMessage,
      toggleActive,
      streams
    } = this.props
    //console.log(this.state, this.props)
    const { videos } = this.state
    console.log(this.state, 'state')
    //console.log(active, constants.ME, window.Echo)
    return (
      <div className="app">
        <Toolbar
          chatVisible={false}
          messages={messages}
          onToggleChat={this.handleToggleChat}
          stream={streams[constants.ME]}
          onEndCall={this.handleEndCall}
        />
        <Alerts alerts={alerts} dismiss={dismissAlert} />
        <Notifications notifications={notifications} />
        {/* <Chat
          messages={messages}
          notify={notify}
          onClose={this.handleHideChat}
          sendMessage={sendMessage}
          videos={videos}
          visible={this.state.chatVisible}
        /> */}
        <div className="videos">
          <Video
            videos={videos}
            active={active === constants.ME}
            onClick={toggleActive}
            stream={streams[constants.ME]}
            userId={constants.ME}
            muted
            mirrored
          />

          {_.map(peers, (_, userId) => (
            <Video
              active={userId === active}
              key={userId}
              onClick={toggleActive}
              stream={streams[userId]}
              userId={userId}
              videos={videos}
            />
          ))}
        </div>
      </div>
    )
  }
}
