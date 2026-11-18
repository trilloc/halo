# Halo

Halo is a clear-glass theme for GNOME 50. The top bar is three floating islands of glass, one each for Activities, the clock and the system controls. The dock, menus, Quick Settings, calendar, notifications, dialogs and switchers share the same material: a tinted plane with a light-catching rim and a soft shadow. A cobalt accent marks active controls. Apps get flat header bars that run into their content, a tinted sidebar, rounded selections and 16 px window corners.

Glass is decoration; legibility never depends on it. Every Shell surface is tinted so that text keeps at least 4.5:1 over pure black and over pure white, with no blur at all. When [Blur my Shell](https://extensions.gnome.org/extension/3193/blur-my-shell/) is installed, Halo configures it to blur what sits behind each surface, using the same corner radii as the stylesheet. Halo Glass, a small companion extension installed with the theme, marks the three islands so that each gets its own blur.

## Install and apply

```sh
./scripts/build --family halo
./scripts/theme --family halo install
./scripts/theme --family halo apply dark --wallpaper --adwaita
./scripts/theme --family halo apply light
```

`apply` changes the Shell, GTK theme, colour scheme and accent together. It also:

- **Configures Blur my Shell** (v78 or later), when it is installed. It enables the extension and adds Halo's blur pipelines alongside yours. It also sets the dock, overview, app folder, lock screen and popup blur to Halo's radii. Halo leaves the extension's own background styling off, so the theme's tint stays in charge. Blur my Shell's full-width panel blur is turned off; the islands are blurred one by one instead. Use `--no-blur` to restore your Blur my Shell settings while keeping Halo.
- **Enables Halo Glass.** This extension only tags the three panel boxes with Blur my Shell's documented `bms-popup-blur-target` class. GNOME Shell loads a newly installed extension at login, so **log out and back in once** after the first install. `./scripts/theme --family halo status` shows whether Halo Glass is active. Without Blur my Shell, the islands keep their tint.
- **Fits the island tint to your wallpaper.** Only the wallpaper sits behind the panel; windows stop below it. `apply` reads the top strip of your light and dark wallpapers, unblurred, and lowers the islands' tint to the lightest level that still keeps panel text at 4.8:1 or better. The floor is 0.56 in light and 0.36 in dark: a white pane over a light wallpaper fades as its tint drops, so light keeps more, and the islands carry a hairline edge and a close shadow. Over the Halo wallpapers both variants reach their floor; a busy wallpaper keeps more tint. Run `apply` again after changing wallpaper. Use `--no-tint` for the fixed tint that holds 4.5:1 over any backdrop.
- **Applies the app extras.** These are Halo's folder icons, the Ptyxis palette "Halo" on your default terminal profile, and the Text Editor scheme `halo-light`/`halo-dark`, which follows the system style. The icon theme `Halo-Light`/`Halo-Dark` inherits the icon theme you had before, so only folders change. Use `--no-apps` to restore these.
- **Optionally moves the dock.** `--floating-dock` turns Ubuntu Dock into a floating bottom dock that hides when windows overlap it. `--no-floating-dock` restores your dock layout. Without the flag, Halo styles the dock where it is: a floating dock gets rounded glass, and an extended dock becomes a glass rail.

Every setting Halo changes is recorded and returned by `./scripts/theme restore`. A setting you change yourself afterwards is kept. `./scripts/theme --family halo uninstall` removes the themes, icons and supporting files.

### Login screen (optional, needs sudo)

```sh
sudo ./scripts/halo-login install
sudo ./scripts/halo-login status
sudo ./scripts/halo-login restore
```

GDM reads its stylesheet from the `gdm-theme.gresource` alternative. `install` copies the bundle currently selected, appends Halo's login styles to its GDM stylesheets, and registers the result as a separate alternative at priority 0. It then selects that alternative and installs the dark Halo wallpaper as the login background. `restore` returns your previous selection and removes Halo's files. Changes show after you log out. If the login screen ever looks wrong, switch to a text console (Ctrl+Alt+F3), log in, and run `sudo ./scripts/halo-login restore`.

The lock screen belongs to your session, so it takes Halo's Shell styles directly. With Blur my Shell it also gets Halo's lock-screen blur.

## Validation

- `./scripts/build --family halo` fails if any token pair drops below its target. Glass roles are tested as layered stacks: panel, popup, tile and pressed state are each composited over pure black and pure white. The generated table is written to `build/halo/contrast.md`, and it passes in both variants.
- The islands were checked in the same session: all three carried Blur my Shell's `bms-popup-blurred` marker, the tint fitted to 0.36 in both variants, and `restore` returned the extension list exactly.
- Before delivery, Halo ran in a disposable GNOME Shell **46** session with Ubuntu Dock, User Themes and Blur my Shell **v78**, at 2560 × 1600 and 166⅔%. That session covered install, both variants, the Blur my Shell configuration and the no-blur fallback. It also confirmed that `restore` returned the extension lists, icon theme, GTK theme, colour scheme, wallpaper and editor scheme exactly. The published captures in [halo-screenshots](halo-screenshots/) were re-taken on GNOME Shell 50.1 (without Blur my Shell). That session had no desktop portal, so apps there did not switch to dark. Shell 46 also draws its switches as Ubuntu's SVGs, with an orange edge; GNOME 50 draws them in CSS, which Halo styles.
- The GDM step was exercised against Ubuntu's real alternatives system (install, reinstall, restore). The greeter itself needs a running GDM to draw, so the login screen has not been seen yet.
- The GNOME **50** pass is yours to run: `./scripts/visual-qa/run /tmp/halo-review all halo`. If Blur my Shell is installed for your user, the run copies it into the disposable session.

## Sources

- Tokens: `src/halo/tokens.json` (merged over the shared base in `src/tokens.json`).
- Shell: `src/halo/shell.css` over `src/shell.css`. Selectors cover GNOME 46 and 50 widget names. The island tint sits between the `halo-tint` markers at the end, which `apply` rewrites.
- Halo Glass: `src/halo/extension/`. It uses Blur my Shell's documented opt-in class. If Blur my Shell is already running when Halo Glass starts, it also asks Blur my Shell to search the panel again, through an internal method it checks for first.
- Apps: `src/halo/gtk3.css`, `src/halo/gtk4.css`, `src/halo/adwaita.css`.
- Extras: `src/halo/terminal.palette`, `src/halo/editor-{light,dark}.xml`, `src/halo/icons/`, `src/halo/login.css`. The Blur my Shell settings are generated in `scripts/build` from the radius tokens.
- Art: `scripts/halo-art` renders the 3840 × 2400 wallpapers and the overview fields into `assets/halo/`. It needs NumPy and Pillow.
- Login: `scripts/halo-login`.
