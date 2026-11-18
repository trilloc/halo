# Upstream styling and assets

Halo supplies its own CSS, icons, wallpapers and extension. It uses the Shell, GTK and libadwaita installed on the target system and does not redistribute them.

- GNOME Shell loads Halo as its application stylesheet with the current session stylesheet underneath, including Ubuntu's Yaru stylesheet in Ubuntu mode. The fallback CSS and its images stay in the installed distro packages. The [GNOME Shell](https://gitlab.gnome.org/GNOME/gnome-shell) and [Yaru](https://github.com/ubuntu/yaru) sources carry their own license and attribution notices.
- GTK 3 and ordinary GTK 4 load their packaged Adwaita and GTK Default CSS through runtime resource imports. Those resources carry the license and attribution of [GTK](https://gitlab.gnome.org/GNOME/gtk). The optional palette uses the public color variables of [libadwaita](https://gitlab.gnome.org/GNOME/libadwaita).
- Halo's folder icons inherit whichever icon theme you were using. Fonts, symbolic and application icons, and the cursor stay with your system.
- Blur my Shell is a separate project by its own authors. Halo only writes configuration for it and never bundles it.
- The wallpapers and overview fields are rendered by `scripts/halo-art`. Screenshots were captured in a disposable test session and show application names and icons from the Ubuntu desktop it ran on.
