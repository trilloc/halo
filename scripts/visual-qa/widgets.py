#!/usr/bin/python3
"""Render the same representative control states in GTK 3 and GTK 4."""
import sys

import gi

version = sys.argv[1]
gtk4 = version == "4.0"
gi.require_version("Gtk", version)
from gi.repository import Gtk  # noqa: E402


def add(parent, child):
    if gtk4:
        parent.append(child)
    else:
        parent.pack_start(child, False, False, 0)


def style(widget, name):
    if gtk4:
        widget.add_css_class(name)
    else:
        widget.get_style_context().add_class(name)


def label(text, css_class=None):
    widget = Gtk.Label(label=text, xalign=0)
    if css_class:
        style(widget, css_class)
    return widget


def row_label(text):
    item = label(text)
    item.set_margin_start(12)
    item.set_margin_end(12)
    item.set_margin_top(7)
    item.set_margin_bottom(7)
    return item


def set_child(container, child):
    if gtk4:
        container.set_child(child)
    else:
        container.add(child)


def show(application):
    window = Gtk.ApplicationWindow(application=application, title="Workshop Controls")
    window.set_default_size(1160, 760)

    header = Gtk.HeaderBar()
    if not gtk4:
        header.set_title("Workshop Controls")
        header.set_show_close_button(True)
    window.set_titlebar(header)

    content = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=16)
    content.set_margin_start(28)
    content.set_margin_end(28)
    content.set_margin_top(28)
    content.set_margin_bottom(28)
    set_child(window, content)

    add(content, label("Reference archive", "title-1"))
    add(content, label("Choose a set for the publication review.", "dim-label"))
    toolbar = Gtk.Box(spacing=10)
    add(content, toolbar)
    for name, css_class in [
        ("Add reference", "suggested-action"),
        ("Archive draft", "destructive-action"),
        ("Rename", None),
        ("Publish", None),
    ]:
        button = Gtk.Button(label=name)
        if css_class:
            style(button, css_class)
        if name == "Publish":
            button.set_sensitive(False)
        add(toolbar, button)
    entry = Gtk.Entry()
    entry.set_placeholder_text("Filter references")
    add(content, entry)

    switcher = Gtk.Notebook()
    add(content, switcher)

    archive = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=14)
    archive.set_margin_start(12)
    archive.set_margin_end(12)
    archive.set_margin_top(12)
    archive.set_margin_bottom(12)

    scroll = Gtk.ScrolledWindow(min_content_height=200)
    scroll.set_propagate_natural_height(False)
    scroll.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.ALWAYS)
    add(archive, scroll)
    results = Gtk.ListBox(selection_mode=Gtk.SelectionMode.SINGLE)
    set_child(scroll, results)
    names = [
        "01   Site survey and measurements",
        "02   Letterpress proof and annotations",
        "03   Surface finish notes and observations for the south-facing reading room",
        "04   Test sheets and small-format samples",
        "05   Window hardware and fastener schedule",
        "06   Tooling guide",
        "07   Control samples",
        "08   Drawings and approval records",
        "09   Publication layouts",
        "10   Review copy and correspondence",
    ]
    add_row = results.append if gtk4 else results.add
    for name in names:
        add_row(row_label(name))
    results.select_row(results.get_row_at_index(2))
    switcher.append_page(archive, Gtk.Label(label="Archive"))

    empty = Gtk.Box(orientation=Gtk.Orientation.VERTICAL, spacing=8)
    empty.set_margin_start(12)
    empty.set_margin_top(14)
    add(empty, label("No pending drafts", "dim-label"))
    switcher.append_page(empty, Gtk.Label(label="Drafts"))

    options = Gtk.Box(spacing=18)
    add(content, options)
    add(options, Gtk.CheckButton(label="Show archived", active=True))
    add(options, Gtk.CheckButton(label="Include unpublished", sensitive=False))
    add(options, Gtk.Switch(active=True, valign=Gtk.Align.CENTER))
    add(options, label("Auto-save"))
    if not gtk4:
        window.show_all()
    window.present()
    if len(sys.argv) == 3 and sys.argv[2] == "empty":
        switcher.set_current_page(1)
    entry.grab_focus()


application = Gtk.Application(application_id="org.example.WorkshopControls")
application.connect("activate", show)
application.run([])
