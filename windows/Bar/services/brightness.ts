import { exec } from 'astal'
import GObject, { register, property, signal } from 'astal/gobject'

@register({ GTypeName: 'BrightnessService' })
export default class BrightnessService extends GObject.Object {
  private declare _value: number
  private declare _buses: string[]
  private declare _max: number

  @property(Number)
  get value() {
    return this._value
  }

  set value(value: number) {
    // Ensure value is between 0-100
    this._value = Math.min(100, Math.max(0, Math.round(value)))

    console.log(`Setting brightness to ${this._value}%`)
    this._buses.forEach((bus) => {
      exec(`ddcutil setvcp 10 ${this._value} --bus ${bus}`)
    })

    this.emit('value_changed', this._value)
    this.refreshUI()
  }

  @property(String)
  get iconName() {
    if (this._value < 25) {
      return 'display-brightness-low-symbolic'
    } else if (this._value < 75) {
      return 'display-brightness-medium-symbolic'
    } else {
      return 'display-brightness-high-symbolic'
    }
  }

  constructor() {
    super()
    this._value = 0
    this._max = 100 // DDC brightness is typically 0-100
    this._buses = this.detectBuses()

    // Initialize
    this.init()
  }

  detectBuses() {
    try {
      const detectOutput = exec('ddcutil detect')
      const busRegex = /I2C bus:\s+\/dev\/i2c-(\d+)/g

      const buses = []
      let match
      while ((match = busRegex.exec(detectOutput)) !== null) {
        buses.push(match[1])
      }

      return buses
    } catch (error) {
      console.error('Error detecting monitors:', error)
      return []
    }
  }

  // Initial setup - validate monitors and get initial brightness
  init() {
    if (this._buses.length === 0) {
      console.warn('No valid DDC monitors detected')
      return
    }

    // Get initial brightness values from monitors
    this.fetchBrightness()
  }

  // Fetch actual brightness values from monitors
  fetchBrightness() {
    let totalBrightness = 0
    let validMonitors = 0

    console.log('Fetching brightness from monitors...')

    // Get brightness from each monitor
    this._buses.forEach((bus) => {
      try {
        const brightnessOutput = exec(`ddcutil getvcp 10 --bus ${bus}`)
        const match = brightnessOutput.match(/current value\s*=\s*(\d+)/)
        if (match) {
          totalBrightness += parseInt(match[1], 10)
          validMonitors++
        }
      } catch (error) {
        console.error(`Error getting brightness for bus ${bus}:`, error)
      }
    })

    if (validMonitors > 0) {
      this._value = Math.round(totalBrightness / validMonitors)
      this.refreshUI()
    }
  }

  refreshUI() {
    this.notify('icon-name')
    this.notify('value')
    this.emit('value-changed', this._value)
  }

  @signal(Number)
  declare valueChanged: (value: Number) => void
}
