import * as constants from '../constants.js'
import Alerts, { AlertPropType } from './Alerts.js'
import Chat, { MessagePropTypes } from './Chat.js'
import Notifications, { NotificationPropTypes } from './Notifications.js'
import PropTypes from 'prop-types'
import React from 'react'
import Toolbar from './Toolbar.js'
import Video, { StreamPropType } from './Video.js'
import _ from 'underscore'
import socket from '../socket.js'

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
      chatVisible: false
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
  onUnload(event) { // the method that will be used for both add and remove event
    //console.log("hellooww")
    //alert('hello')
    event.returnValue = "Hellooww"
  }
  componentDidMount () {
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

    return (
      <div className="app">
        <Toolbar
          chatVisible={false}
          messages={messages}
          onToggleChat={this.handleToggleChat}
          stream={streams[constants.ME]}
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
