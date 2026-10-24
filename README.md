# Primnox's Nimbus

A web browser for Windows, built on Firefox. Tabs run across the top or down a
glass sidebar, over a watercolor painting that changes with the theme.

- Workspaces: separate sets of tabs, each with its own painting
- Pinned apps beside the page, like WhatsApp and Telegram
- Link peek: Alt+click a link to open it in a floating card
- A notebook for pages to read later and quick notes
- Split view, tab groups and built-in ad blocking
- One player for whatever is playing, in a tab or in another app

## Download

Get the newest installer from [Releases](https://github.com/Primnox/nimbus/releases).
Nimbus checks for a newer version once a day and offers it in Settings, About.
Nothing installs until you say so.

The installer isn't code-signed yet, so Windows may say it's from an unknown
publisher.

## Removing Nimbus completely

Uninstalling Nimbus from Windows Settings keeps your history, passwords, tabs
and settings, so installing it again picks up where you left off. To remove
Nimbus and everything it keeps, open PowerShell and run:

```powershell
powershell -Command "irm https://raw.githubusercontent.com/Primnox/nimbus/main/remove-nimbus.ps1 -OutFile remove-nimbus.ps1"
powershell -ExecutionPolicy Bypass -File remove-nimbus.ps1
```

Windows asks for permission to uninstall. Add `-DryRun` to see what would be
removed without removing anything, or `-DataOnly` to keep Nimbus installed and
only start over with fresh data. If Firefox is also on the PC, its profiles
are left alone.

## License

Nimbus is built on Mozilla Firefox and is distributed under the
[Mozilla Public License 2.0](LICENSE).
