import { bind, Variable } from 'astal'
import { App, Astal, Gtk, Gdk } from 'astal/gtk4'
import GLib from 'gi://GLib'
import { Volume, Workspaces, Launcher, Brightness } from './components'

const time = Variable<string>('').poll(1000, () => GLib.DateTime.new_now_local().format('%H:%M - %A %e.')!)

function Left() {
  return (
    <box halign={Gtk.Align.CENTER}>
      <Launcher />
      <Workspaces />
    </box>
  )
}

function Center() {
  return (
    <box halign={Gtk.Align.CENTER}>
      <box>
        <menubutton>
          <label label={time()} />
          <popover>
            <Gtk.Calendar canTarget={false} canFocus={false} />
          </popover>
        </menubutton>
      </box>
    </box>
  )
}

function Right() {
  return (
    <box halign={Gtk.Align.END}>
      <Brightness />
      <Volume />
    </box>
  )
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, LEFT, RIGHT } = Astal.WindowAnchor

  return (
    <window visible cssName="window" gdkmonitor={gdkmonitor} exclusivity={Astal.Exclusivity.EXCLUSIVE} anchor={TOP | LEFT | RIGHT} application={App}>
      <centerbox cssName="centerbox" cssClasses={['container']}>
        <Left />
        <Center />
        <Right />
      </centerbox>
    </window>
  )
}
