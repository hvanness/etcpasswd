import React, {Component} from 'react'
import Helmet from 'react-helmet'
import 'normalize.css'
import styles from './terminal.css'
import help from './help.txt'
import fileSystem from './fileSystem.js'
import ReactFavicon from 'react-favicon'
import favicon from './favicon.png'
import cd from './cd'

function setEndOfContenteditable(contentEditableElement)
{
  var range,selection;
  range = document.createRange();//Create a range (a range is a like the selection but invisible)
  range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
  range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
  selection = window.getSelection();//get the selection object (allows you to change selection)
  selection.removeAllRanges();//remove any selections already made
  selection.addRange(range);//make the range you have just created the visible selection
}


const commands = {
  ls: (workingDirectory, args, fs) => fs.ls(workingDirectory, args),
  help: () => help,
  cat: (workingDirectory, args, fs) => args.length != 1 ? "usage: cat [file]" : fs.readFile(workingDirectory, args[0]),
  history: (history) => history.join("\r\n"),
  cd: cd,
}

const suggestion = (workingDirectory, input, fs, cmds) => {
  const args = input.split(" ")
  const lastArg = args.slice(-1)[0]

  const path = fs.suggestion(workingDirectory, lastArg)
  const command = !path && Object.keys(cmds).find(c => c.startsWith(lastArg))

  return (
    args.slice(0, -1).join(" ")
    + (args.length > 1 ? " " : "")
    + (path || command || lastArg)
    + (command ? " " : "")
  )
}


export default class App extends Component {
  render() {
    return (
      <div>
        <Helmet titleTemplate="/etc/passwd">
          <title>/etc/passwd</title>
        </Helmet>
        <ReactFavicon url={[favicon]}/>

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
    return (
      args.length == 0 ? ""
      : (
        args[0] == 'ls' ? commands.ls(this.state.workingDirectory, args.slice(1), fileSystem)
        : args[0] == 'cd' ? commands.cd(this.state.workingDirectory, args.slice(1), fileSystem, this.handleCd)
        : args[0] == 'cat' ? commands.cat(this.state.workingDirectory, args.slice(1), fileSystem)
        : args[0] == 'history' ? commands.history(this.state.history)
        : args[0] == 'help' ? commands.help()
        : "-bash: "+input+": command not found"
      )
    )
  }

  handleCd = (path) => {
    this.setState({workingDirectory: path})
  }

  handleBashInputKeyDown = (e) => {
    if (e.keyCode == 13) {
      e.preventDefault()
      const response = this.respond(this.bashInput.textContent.trim())
      this.setState({
        responses: this.state.responses.concat([]),
        history: this.state.history.concat([{
          workingDirectory: this.state.workingDirectory,
          input: this.bashInput.textContent,
          response: response,
        }]),
        historyOffset: 0,
      }, this.updateScroll)
      this.bashInput.innerHTML = ""
    }
    if (e.keyCode == 38) {
      if (this.state.history.length) {
        e.preventDefault()
        this.bashInput.textContent = this.state.history[this.state.history.length - 1 - this.state.historyOffset].input
        this.setState({historyOffset: Math.min(this.state.historyOffset + 1, this.state.history.length - 1)})
        setEndOfContenteditable(this.bashInput)
      }
    }
    if (e.keyCode == 40) {
      if (this.state.history.length) {
        e.preventDefault()
        this.bashInput.textContent = this.state.history[this.state.history.length - 1 - this.state.historyOffset].input
        this.setState({historyOffset: Math.max(this.state.historyOffset - 1, 0)})
        setEndOfContenteditable(this.bashInput)
      }
    }
    if (e.keyCode == 9) {
      e.preventDefault()
      this.bashInput.textContent = suggestion(this.state.workingDirectory, this.bashInput.textContent, fileSystem, commands)
      setEndOfContenteditable(this.bashInput)
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
          {this.state.history.map(({workingDirectory, input, response}, i) => (
            <div key={i} className={styles.output}>
              <div>
                <div className={styles.prompt}>
                  {workingDirectory} <div className={styles.flower}>⚘</div>
                </div>
                {input}
              </div>
              <div className={styles.response}>
                <Response response={response}/>
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

class Response extends Component {
  render () {
    const Res = this.props.response
    return (
      <div>
        {
          Component.isPrototypeOf(Res) ? <Res />
          : Res && Res.constructor === Object ? JSON.stringify(Res)
          : Res
        }
      </div>
    )
  }
}
