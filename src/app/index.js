import React, {Component} from 'react'
import Helmet from 'react-helmet'
import 'normalize.css'
import styles from './terminal.css'
import fileSystem from './fileSystem.js'



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
    history: [],
    historyOffset: 0,
    responses: [],
    workingDirectory: "~/Projects/personal",
  }
  respond = (input) => {
    const args = input.split(' ')
    if (args.length == 0) {
      return ""
    }
    if (args[0] == 'ls') {
      return fileSystem.ls(this.state.workingDirectory, args.slice(1))
    }
    if (args[0] == 'cat') {
      if (args.length != 2) {
        return "usage: cat [file]"
      }
      else  {
        return fileSystem.readFile(fileSystem.join(this.state.workingDirectory, args[1]))
      }
    }
    if (args[0] == 'history') {
      return this.state.history.join("\r\n")
    }
    else {
      return "-bash: "+input+": command not found"
    }
  }
  handleBashInputKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault()
      this.setState({
        responses: this.state.responses.concat([this.respond(this.bashInput.innerText.trim())]),
        history: this.state.history.concat([this.bashInput.innerText])
      }, this.updateScroll)
      this.bashInput.innerHTML = ""
    }
    if (e.keyCode == 38) {
      this.bashInput.innerHTML = this.state.history[this.state.history.length - this.state.historyOffset - 1]
      this.setState({historyOffset: Math.min(this.state.historyOffset + 1, this.state.history.length - 1)})
    }
    if (e.keyCode == 40) {
      this.bashInput.innerHTML = this.state.history[this.state.history.length - this.state.historyOffset - 1]
      this.setState({historyOffset: Math.max(this.state.historyOffset - 1, 0)})
    }
  }
  bindBashInput = (c) => {
    this.bashInput = c
    this.bashInput.focus()
  }
  handleTerminalClick = () => {
    this.bashInput.focus()
  }

  bindBash = (c) => {
    this.bash = c
  }

  updateScroll = () => {
    this.bash.scrollTo(0, this.bash.scrollHeight)
  }

  render () {
    return (
      <div className={styles.terminal} onClick={this.handleTerminalClick}>
        <div ref={this.bindBash} className={styles.bash}>
          <div className={styles.output}>
            -bash: gpg-agent: command not found
          </div>
          {this.state.history.map((buffer, i) => (
            <div key={i} className={styles.output}>
              <div>
                <div className={styles.prompt}>
                  {this.state.workingDirectory} <div className={styles.flower}>⚘</div>
                </div>
                {buffer}
              </div>
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
