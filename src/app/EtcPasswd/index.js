import React, {Component} from 'react'
import styles from './EtcPasswd.css'

export default class EtcPasswd extends Component {
  render () {
    return (
      <div data-href="https://etcpasswd.netlify.com" data-layout="button" data-size="large" data-mobile-iframe="true">
        <a className={styles.link} target="_blank" rel="noopener noreferrer" href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fetcpasswd.netlify.com%2F&amp;src=sdkpreparse">
          share on fb
        </a>
      </div>
    )
  }
}
