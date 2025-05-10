import { bind } from 'astal'
import { Gdk } from 'astal/gtk4'
import { Box } from 'astal/gtk4/widget'
import BrightnessService from '../services/brightness'

const brightness = new BrightnessService()

// Throttling settings
const THROTTLE_DELAY = 250 // milliseconds
let lastUpdateTime = 0

function handleScroll(dy: number) {
  const now = Date.now()

  // If enough time passed
  if (now - lastUpdateTime >= THROTTLE_DELAY) {
    // Handle brightness
    if (dy > 0) {
      brightness.value -= 10
    } else if (dy < 0) {
      brightness.value += 10
    }

    lastUpdateTime = now // Update timestamp
  }

  // If not ignore this scroll event
}

function handleButtonReleased(button: Gdk.ButtonEvent) {
  // If middle click refresh brightness with ddcutil
  if (button.get_button() === 2) {
    brightness.fetchBrightness()
  }
}

export default function Brightness() {
  return (
    <Box
      onScroll={(_, __, dy) => handleScroll(dy)}
      onButtonReleased={(_, button) => handleButtonReleased(button)}
      cssClasses={['brightness']}
      spacing={2}>
      <image iconName={bind(brightness, 'iconName')} />
      <label label={bind(brightness, 'value').as((p) => `${p}%`)} />
    </Box>
  )
}
