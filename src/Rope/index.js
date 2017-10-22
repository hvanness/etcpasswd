import React, { Component } from 'react'
import styles from './Rope.css'

const VIEW_WIDTH = 1
const NUM_NODES = 1729

const RED = opacity => 'rgba(255,0,0,'+opacity+')'
const CYAN = opacity => 'rgba(0,255,255,'+opacity+')'

const spaceWidth = Math.floor(Math.pow(NUM_NODES, 1/3))

const coordinates = () =>
  Array(spaceWidth).fill(Array(spaceWidth).fill(Array(spaceWidth).fill(spaceWidth)))
  .map((a, i) => a.map((b, j) => b.map((c, k) => [i / (c - 1), j / (c - 1), k / (c - 1)])))
  .reduce((arr, x) => arr.concat(x.reduce((b, y) => b.concat(y), [])), [])


const rawGaussian = (numNodes = NUM_NODES) =>
  coordinates(numNodes)
  .map(x => ([
    x,
    20000 * Math.exp(-10 * VIEW_WIDTH * Math.sqrt((x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + (x[2] - 0.5) * (x[2] - 0.5))),
    0,
  ]))

/*
const smallGauss = (numNodes = NUM_NODES) =>
  coordinates(numNodes)
  .map(x => 0.0001 * Math.exp(-40 * VIEW_WIDTH * Math.sqrt((x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + (x[2] - 0.5) * (x[2] - 0.5))))
*/

const centralForce = (numNodes = NUM_NODES) =>
  coordinates(numNodes)
  .map(x => 0.01 * ((x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + (x[2] - 0.5) * (x[2] - 0.5)))




function Wave (initial, render) {
  const numNodes = initial.length
  const planeWidth = spaceWidth

  let buffer0 = [...initial]
  let buffer1 = [...initial]
  let currentBuffer = buffer0

  let curvature = [0,0,0]
  let potential = centralForce()

  this.frames = 0

  const runRender = () => {
    render(currentBuffer, this.doneRender)
  }

  this.doneRender = () => {
    this.ticking = false
  }

  this.start = () => {
    this.update()
  }
  this.tryRender = () => {
    if (!this.ticking) {
      this.ticking = true
      window.requestAnimationFrame(runRender)
    }
  }
  this.update = () => {
    currentBuffer = currentBuffer == buffer0 ? buffer1 : buffer0
    const writeBuffer = currentBuffer == buffer0 ? buffer1 : buffer0

    for (var i = 1; i < numNodes - 1; i++) {
      if ((i+1) % planeWidth != 0) {
        const curr = currentBuffer[i]
        const prevZ = currentBuffer[i-1]
        const nextZ = currentBuffer[i+1]
        curvature[0] = prevZ[1] - 2 * curr[1] + nextZ[1]
        curvature[1] = prevZ[2] - 2 * curr[2] + nextZ[2]

        const prevY = currentBuffer[i - planeWidth]
        const nextY = currentBuffer[i + planeWidth]
        if (i + planeWidth < numNodes && i - planeWidth > 0) {
          curvature[0] += prevY[1] - 2 * curr[1] + nextY[1]
          curvature[1] += prevY[2] - 2 * curr[2] + nextY[2]
        }

        const prevX = currentBuffer[i - planeWidth * planeWidth]
        const nextX = currentBuffer[i + planeWidth * planeWidth]
        if (i + planeWidth * planeWidth < numNodes && i - planeWidth * planeWidth > 0) {
          curvature[0] += prevX[1] - 2 * curr[1] + nextX[1]
          curvature[1] += prevX[2] - 2 * curr[2] + nextX[2]
        }
        writeBuffer[i][1] = curr[1] - 0.0001 * curvature[1] + potential[i]*curr[2]
        writeBuffer[i][2] = curr[2] + 0.0001 * curvature[0] - potential[i]*curr[1]
      }
      else {
        writeBuffer[i] = currentBuffer[i]
      }
    }

    this.frames = this.frames + 1
    if (this.frames % 40 == 0) {
      this.tryRender()
      window.setTimeout(this.update, 1)
    }
    else {
      this.update()
    }
  }
}

export default class Rope extends Component {
  constructor (props) {
    super(props)
  }

  componentDidMount () {
    this.cnv.width = this.cont.clientWidth
    this.cont.style.height = this.cont.clientWidth * 9 / 16 + 'px'
    this.cnv.height = this.cont.clientWidth * 9 / 16
    this.startRenderCycle(this.cnv.getContext('2d'))
    this.startClock()
  }

  componentWillUnmount () {
    this.isUnmounting = true
  }

  chartMap (node) {
    const x = node[0]
    const y = node[1]
    const z = node[2]
    return [
      this.cnv.width / 6 + x / VIEW_WIDTH * (this.cnv.width - 2) * 0.4 + y * this.cnv.width * 0.3,
      this.cnv.height * 0.07 - y * this.cnv.height * 0.04 - z * this.cnv.height * 0.8,
    ]
  }

  startClock = () => {
    this.wave.start()
  }

  startRenderCycle = (ctx) => {
    const update = (state, cb) => {
      if (!this.isUnmounting) {
        this.renderRope3D(ctx, state)
        cb()
      }
    }
    this.wave = new Wave(rawGaussian(), update)
  }

  renderRope3D = (ctx, rope) => {
    ctx.fillStyle = 'rgb(2,42,52)'
    ctx.fillRect(0,0,this.cnv.width, this.cnv.width)
    const width = spaceWidth
    for (var i=0; i < rope.length - 1; i++) {
      let x = this.chartMap(rope[i][0])
      /*
      if ((i+1) % width != 0) {
        let y = this.chartMap(rope[i+1][0])
        ctx.beginPath()
        ctx.strokeStyle = RED
        ctx.moveTo(x[0], x[1] - rope[i][1]/100 + this.cnv.width / 2)
        ctx.lineTo(y[0], y[1] - rope[i+1][1]/100 + this.cnv.width / 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.strokeStyle = CYAN
        ctx.moveTo(x[0], x[1] - rope[i][2]/100 + this.cnv.width / 2)
        ctx.lineTo(y[0], y[1] - rope[i+1][2]/100 + this.cnv.width / 2)
        ctx.stroke()
      }
      */

      if (i + width < rope.length && (i) % (width*width) < width*width - width){
        let prob = 0.0001 * (rope[i+width][1] * rope[i+width][1] + rope[i+width][2] * rope[i+width][2])
        let z = this.chartMap(rope[i+width][0])
        ctx.beginPath()
        ctx.strokeStyle = RED(prob)
        ctx.moveTo(x[0], x[1] - rope[i][1]/100 + this.cnv.width / 2)
        ctx.lineTo(z[0], z[1] - rope[i+width][1]/100 + this.cnv.width / 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.strokeStyle = CYAN(prob)
        ctx.moveTo(x[0], x[1] - rope[i][2]/100 + this.cnv.width / 2)
        ctx.lineTo(z[0], z[1] - rope[i+width][2]/100 + this.cnv.width / 2)
        ctx.stroke()
      }

      if (i < rope.length - width * width) {
        let prob = 0.0001 * (rope[i+width*width][1] * rope[i+width*width][1] + rope[i+width*width][2] * rope[i+width][2])
        let p = this.chartMap(rope[i+width * width][0])
        ctx.beginPath()
        ctx.strokeStyle = RED(prob)
        ctx.moveTo(x[0], x[1] - rope[i][1]/100 + this.cnv.width / 2)
        ctx.lineTo(p[0], p[1] - rope[i+width*width][1]/100 + this.cnv.width / 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.strokeStyle = CYAN(prob)
        ctx.moveTo(x[0], x[1] - rope[i][2]/100 + this.cnv.width / 2)
        ctx.lineTo(p[0], p[1] - rope[i+width*width][2]/100 + this.cnv.width / 2)
        ctx.stroke()
      }

    }
    /*
    rope.forEach(node => {
      const origin = this.chartMap(node.x)
      ctx.fillStyle = "red"
      ctx.fillRect(origin[0], origin[1] - node.re/100 + this.cnv.width / 2, 2, 2)
      ctx.fillStyle = "cyan"
      ctx.fillRect(origin[0], origin[1] - node.im/100 + this.cnv.width / 2, 2, 2)
    })
    */
  }

  bindCont = c => {this.cont = c}
  bindCnv = c => {this.cnv = c}

  render () {
    return (
      <div className={styles.cont} ref={this.bindCont}>
        <canvas ref={this.bindCnv}/>
      </div>
    )
  }
}
