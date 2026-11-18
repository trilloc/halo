#!/usr/bin/python3
"""Set a temporary scale on the isolated Mutter virtual monitor."""
import math
import sys

from gi.repository import Gio, GLib


def main():
    requested_scale = float(sys.argv[1])
    interface = "org.gnome.Mutter.DisplayConfig"
    connection = Gio.bus_get_sync(Gio.BusType.SESSION, None)
    proxy = Gio.DBusProxy.new_sync(
        connection, Gio.DBusProxyFlags.DO_NOT_LOAD_PROPERTIES, None, interface,
        "/org/gnome/Mutter/DisplayConfig", interface, None,
    )
    serial, monitors, _, _ = proxy.call_sync(
        "GetCurrentState", None, Gio.DBusCallFlags.NONE, 5000, None,
    ).unpack()
    if len(monitors) != 1:
        raise SystemExit("Expected one isolated virtual monitor")
    display, modes, _ = monitors[0]
    connector = display[0]
    if not connector.startswith("Meta-"):
        raise SystemExit("Expected an isolated virtual monitor")
    mode, width, height, _, _, supported_scales, _ = modes[0]
    scale = min(supported_scales, key=lambda candidate: abs(candidate - requested_scale))
    if not math.isclose(requested_scale, scale, abs_tol=0.005):
        raise SystemExit(f"Scale {requested_scale} unavailable ({supported_scales})")

    settings = GLib.Variant(
        "(uua(iiduba(ssa{sv}))a{sv})",
        (serial, 1, [(0, 0, scale, 0, True, [(connector, mode, {})])], {}),
    )
    proxy.call_sync("ApplyMonitorsConfig", settings, Gio.DBusCallFlags.NONE, 5000, None)
    print(f"Virtual output {width}×{height} at {scale * 100:.1f}%")


if __name__ == "__main__":
    main()
