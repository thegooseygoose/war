"""
Standalone PC launcher for War: The Long March (originally made on phone).
Serves index.html from a fixed local port so the page keeps the same origin
between launches, and turns off pywebview's private mode so the saved run and
records (localStorage) persist in %APPDATA%\WarTheLongMarch.
"""
import hashlib
import os
import sys
import webview


def resource_path(rel):
    base = getattr(sys, "_MEIPASS", os.path.dirname(os.path.abspath(__file__)))
    return os.path.join(base, rel)


def page_url():
    # The webview keeps an HTTP cache in the storage folder, so after an update it
    # could keep showing the old page or old card art. A content hash in the URL
    # (page + sprites/cards) forces a fresh load, and the page adds it to art URLs.
    path = resource_path("index.html")
    h = hashlib.md5()
    with open(path, "rb") as f:
        h.update(f.read())
    art = resource_path(os.path.join("sprites", "cards"))
    for name in sorted(os.listdir(art)) if os.path.isdir(art) else []:
        with open(os.path.join(art, name), "rb") as f:
            h.update(name.encode() + f.read())
    return path + "?v=" + h.hexdigest()[:10]


class Api:
    def toggle_fullscreen(self):
        webview.windows[0].toggle_fullscreen()

    def quit(self):
        webview.windows[0].destroy()


def main():
    # WAR_STORAGE / WAR_PORT are only for testing a second copy side by side.
    storage = os.environ.get("WAR_STORAGE") or os.path.join(os.environ.get("APPDATA", os.path.expanduser("~")), "WarTheLongMarch")
    os.makedirs(storage, exist_ok=True)
    webview.create_window(
        "War: The Long March",
        page_url(),
        width=1280,
        height=720,
        min_size=(800, 450),
        maximized=True,
        background_color="#2a0a11",
        js_api=Api(),
    )
    webview.start(http_server=True, http_port=int(os.environ.get("WAR_PORT", 47813)), private_mode=False, storage_path=storage)


if __name__ == "__main__":
    main()
