# filter-log README
This is the "filter-log" extension for vscode. It helps to conveniently filter out unnecessary content and view the desired information in large log files. Similar to (hopefully) logcat in Android.

## Features

You can set a whitelist of phrases, so if a log line contains any of these phrases, the line will be kept. If not, it will be removed.

You can also set a blacklist of phrases, so if a log line contains any of these phrases, it will be removed regardless of the whitelist.

## How to use

In the extension settings, you can modify the whitelist and blacklist.

After that, select the log file and use the command palette (`Shift+Cmd+P` on macOS or `Shift+Ctrl+P` on Windows and Linux) to choose "Filter Logs". This will open the filtered log file.
