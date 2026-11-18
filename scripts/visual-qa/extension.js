import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import Shell from 'gi://Shell';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as MessageTray from 'resource:///org/gnome/shell/ui/messageTray.js';

Gio._promisify(Shell.Screenshot.prototype, 'screenshot', 'screenshot_finish');

function delay(milliseconds) {
    return new Promise(resolve => GLib.timeout_add(GLib.PRIORITY_DEFAULT, milliseconds, () => {
        resolve();
        return GLib.SOURCE_REMOVE;
    }));
}

function file(directory, name) {
    return Gio.File.new_for_path(GLib.build_filenamev([directory, name]));
}

function windowMatching(pattern) {
    return global.get_window_actors()
        .map(actor => actor.meta_window)
        .find(window => pattern.test(window.title ?? ''));
}

function position(pattern, x, y, width, height, focus = false) {
    const window = windowMatching(pattern);
    if (!window)
        throw new Error(`Window title did not match ${pattern}`);

    const area = Main.layoutManager.getWorkAreaForMonitor(Main.layoutManager.primaryIndex);
    window.move_resize_frame(true,
        Math.round(area.x + x * area.width),
        Math.round(area.y + y * area.height),
        Math.round(width * area.width),
        Math.round(height * area.height));
    if (focus)
        Main.activateWindow(window);
}

export default class VisualQa extends Extension {
    enable() {
        this.directory = GLib.getenv('GNOME_VISUAL_QA_DIR');
        if (!this.directory)
            throw new Error('Visual QA requires a private test directory');
        this.queue = file(this.directory, 'scene');
        this.poll = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 150, () => {
            if (!this.queue.query_exists(null))
                return GLib.SOURCE_CONTINUE;
            const [, contents] = this.queue.load_contents(null);
            this.queue.delete(null);
            const scene = new TextDecoder().decode(contents).trim();
            this.run(scene).catch(error => {
                logError(error);
                GLib.file_set_contents(file(this.directory, scene + '.error').get_path(),
                    error.message);
            });
            return GLib.SOURCE_CONTINUE;
        });
    }

    disable() {
        GLib.source_remove(this.poll);
    }

    async run(scene) {
        if (!/^[a-z0-9-]+$/.test(scene))
            throw new Error('Invalid scene name');

        if (scene !== 'calendar' && this.notice) {
            this.notice.destroy();
            this.notice = null;
        }

        Main.runDialog?.close();
        Main.panel.closeQuickSettings();
        Main.panel.closeCalendar();
        Main.osdWindowManager.hideAll();
        Main.overview.searchController.reset();
        Main.overview.hide();
        await delay(450);

        const quickSettings = Main.panel.statusArea.quickSettings;
        switch (scene) {
        case 'desktop':
        case 'desktop-plain':
            position(/Field Notes/, 0.07, 0.12, 0.55, 0.65);
            position(/Studio terminal/, 0.57, 0.14, 0.39, 0.38, true);
            position(/^Workshop$/, 0.25, 0.40, 0.56, 0.50, true);
            break;
        case 'quick-settings':
        case 'quick-settings-expanded': {
            // An isolated Shell can read the host network state. Redact its connection name.
            const wifi = quickSettings._network?._wirelessToggle;
            if (wifi?.subtitle)
                wifi.subtitle = 'Connected';
            Main.panel.toggleQuickSettings();
            if (scene === 'quick-settings-expanded') {
                const powerProfile = quickSettings._powerProfiles?._powerProfilesToggle;
                if (!powerProfile?.visible)
                    throw new Error('Power Mode is unavailable');
                powerProfile.menu.open();
            }
            break;
        }
        case 'calendar':
        case 'calendar-empty':
            Main.panel.toggleCalendar();
            break;
        case 'shell-dialog':
            Main.openRunDialog();
            break;
        case 'notification': {
            const source = MessageTray.getSystemSource();
            this.notice = new MessageTray.Notification({
                source,
                title: 'Workshop export is ready',
                body: 'Three samples were saved to Reference.',
                iconName: 'folder-download-symbolic',
            });
            this.notice.addAction('Open folder', () => {});
            source.addNotification(this.notice);
            break;
        }
        case 'volume':
            Main.osdWindowManager.showAll(
                Gio.ThemedIcon.new('audio-volume-medium-symbolic'), 'Volume', 0.56, 1);
            break;
        case 'brightness':
            Main.osdWindowManager.showAll(
                Gio.ThemedIcon.new('display-brightness-symbolic'), 'Brightness', 0.68, 1);
            break;
        case 'overview':
            Main.overview.show();
            break;
        case 'search':
            Main.overview.show();
            Main.overview.searchController._entry.set_text('text');
            break;
        case 'application-grid':
            Main.overview.showApps();
            break;
        case 'settings':
            position(/^Settings$/, 0.13, 0.15, 0.75, 0.71, true);
            break;
        case 'seahorse':
            position(/^Passwords and Keys$/, 0.21, 0.18, 0.58, 0.64, true);
            break;
        case 'gtk3-states':
        case 'gtk3-large-text':
        case 'gtk3-high-contrast':
            position(/^Workshop Controls$/, 0.17, 0.13, 0.66, 0.72, true);
            break;
        case 'gtk4-states':
            position(/^Workshop Controls$/, 0.17, 0.13, 0.66, 0.72, true);
            break;
        default:
            throw new Error(`Unknown scene: ${scene}`);
        }

        await delay(scene === 'search' ? 1200 : 470);
        const image = file(this.directory, scene + '.png');
        const temporary = file(this.directory, scene + '.tmp');
        const stream = temporary.replace(null, false, Gio.FileCreateFlags.NONE, null);
        await new Shell.Screenshot().screenshot(false, stream);
        stream.close(null);
        temporary.move(image, Gio.FileCopyFlags.OVERWRITE, null, null);
    }
}
