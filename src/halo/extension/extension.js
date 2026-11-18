// Halo Glass: give each of Halo's panel islands its own blur.
//
// Blur my Shell blurs any surface carrying the `bms-popup-blur-target` style
// class, following the surface's own border-radius. Its panel blur covers the
// whole bar, so Halo turns that off and marks the three panel boxes instead.
// Without Blur my Shell the class does nothing and the islands keep their tint.
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';

const BLUR_TARGET = 'bms-popup-blur-target';

export default class HaloGlass extends Extension {
    enable() {
        this._islands = [Main.panel._leftBox, Main.panel._centerBox, Main.panel._rightBox]
            .filter(Boolean);
        this._islands.forEach(island => island.add_style_class_name(BLUR_TARGET));
        this._rescan();
    }

    disable() {
        this._islands?.forEach(island => island.remove_style_class_name(BLUR_TARGET));
        this._islands = null;
    }

    // Blur my Shell finds the marked islands when it starts. Halo enables this
    // extension first, so that is the usual path. When Blur my Shell is already
    // running, ask it to search the panel again; if a later version of Blur my
    // Shell drops this method, the islands keep their tint until the next login.
    _rescan() {
        const popups = global.blur_my_shell?._popup;
        if (typeof popups?.queue_try_blur === 'function')
            popups.queue_try_blur(Main.layoutManager.panelBox);
    }
}
