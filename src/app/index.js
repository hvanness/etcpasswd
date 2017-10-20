import React, {Component} from 'react'
import Helmet from 'react-helmet'
import 'normalize.css'
import styles from './terminal.css'
import blog from './blog.txt'



export default class App extends Component {
  render() {
    return (
      <div>
        <Helmet titleTemplate="/etc/passwd">
          <title>/etc/passwd</title>
        </Helmet>

        <Terminal/>
      </div>
    )
  }
}

class Terminal extends Component {
  state = {
    bashInput: '',
    history: [],
    responses: [],
    workingDirectory: "~/Projects/personal",
  }
  respond = (input) => {
    if (input == 'ls') {
      return "blog.txt"
    }
    if (input == 'cat blog.txt') {
      return blog
    }
    else {
      return "-bash: "+input+": command not found"
    }
  }
  handleBashInputKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault()
      this.setState({
        history: this.state.history.concat([this.bashInput.innerHTML]),
        responses: this.state.responses.concat([this.respond(this.bashInput.innerHTML)]),
      })
      this.bashInput.innerHTML = ""
    }
  }
  bindBashInput = (c) => {
    this.bashInput = c
    this.bashInput.focus()
  }
  handleTerminalClick = () => {
    this.bashInput.focus()
  }

  render () {
    return (
      <div className={styles.terminal} onClick={this.handleTerminalClick}>
        <div className={styles.bash}>
          <div className={styles.history}>
            -bash: gpg-agent: command not found
          </div>
          {this.state.history.map((buffer, i) => (
            <div key={i} className={styles.history}>
              <div className={styles.prompt}>
                {this.state.workingDirectory} <div className={styles.flower}>⚘</div>
              </div>
              {buffer}
              <div className={styles.response}>
                {this.state.responses[i]}
              </div>
            </div>
          ))}
          <div>
            <div className={styles.prompt}>
              {this.state.workingDirectory} <div className={styles.flower}>⚘</div>
            </div>
            <div
              contentEditable
              ref={this.bindBashInput}
              className={styles.bashInput}
              onKeyDown={this.handleBashInputKeyDown}
              onKeyPress={this.handleBashInputKeyPress}
            />
          </div>
        </div>
      </div>
    )
  }
}
