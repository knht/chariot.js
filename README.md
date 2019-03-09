<div align="middle">
    <p><img src="https://img.kirameki.one/9mAtQ3Nb.png" width="800"></p>
    <a href="https://discord.gg/kKPZdA6"><img src="https://discordapp.com/api/guilds/464440032577716238/embed.png" alt="Discord Server"/></a>
    <a href="#"><img src="https://img.shields.io/npm/v/chariot.js.svg?color=c94e6b"></a>
     <img src="https://img.shields.io/badge/node-10.15.1-c94e6b.svg">
     <a href="https://www.gnu.org/licenses/gpl-3.0.en.html"><img src="https://img.shields.io/badge/license-GPL%20v3-c94e6b.svg"></a>
</div>

# About
**Chariot.js** is an extremely lightweight, easily extensible and unopinionated [Eris](https://github.com/abalabahaha/eris) client and command framework. Chariot was made with the idea of having new bot developers experience an extremely easy entry into the wonderful world of developing bots with Eris while doing all the dirty and seemingly complex work in the background. Chariot is easily set up and features a basic, unopinionated and robust command framework. A new bot powered by Chariot can be up and running in less than 5 minutes! This makes Chariot the perfect core for simple custom bots while still being extremely performant and speedy as bots using the Eris framework are known for.

# Prerequisites
In order to successfully install Chariot you must have a working compiler environment running which node-gyp can use to build needed packages from source.

## On Unix
* `python` with a recommended version of `2.7`. While Python 3+ may very well work, it isn't officially supported by node-gyp!
* `make`
* A working C++ compiler toolset, like [GCC](https://gcc.gnu.org/)

#### Installation:
If using Ubuntu, Python usually is already installed, however if Python were to be missing, you can easily install it with `sudo apt-get install python`. Make sure a working Python installation is in place by checking the version number with `python -V` or `python3 -V`. After assuring that Python is installed, run `sudo apt-get install build-essential` to install all your build tools needed for node-gyp.

## On macOS
* `python` with a recommended version of `2.7`
* Xcode

#### Installation:
Python is already pre-installed on modern versions of macOS. To install Xcode, head over to the App Store ([or click here](https://developer.apple.com/xcode/download/)) and download Xcode. Follow the instructions to install Xcode. In addition to Xcode you'll also need the `Command Line Tools`. You can install those directly within Xcode. Open Xcode, then navigate to `Preferences` or click `⌘ + ,`, then head to `Locations`. Alternatively, you can run this command in your Terminal of choice: `xcode-select --install`. This step will install `gcc` and all related tools including e.g. `make` needed to compile with node-gyp.

## On Windows
You can install all required tools needed to compile with node-gyp by install Microsoft's [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools) running following command in either an elevated PowerShell or CMD.exe running as administrator: `npm install --global --production windows-build-tools`.

# Installation
If all prerequisites are met, installing Chariot is as easy as initializing a new npm project with `npm init` and running `npm install chariot.js`. If you are using a version of npm lower than 4.5 *(you shouldn't)* run following command instead: `npm install chariot.js --save`. This will install the latest stable version of Chariot into your freshly created project. 

**That's it!** You are now able to create a bot with Chariot as its core handling all the ugly stuff for you and dive into the wonderful world of creating extremely powerful, performant, highly extensible and scalable bots with Eris!

# Example Usage
Head on over to the [Chariot example repository](https://github.com/riyacchi/chariot.js-example) to see how easily you can build a bot using Chariot. This repository also comes with empty command templates and easy to understand examples on how to work with Chariot! 

# License
Chariot.js is released under the [GNU GPL v3](https://www.gnu.org/licenses/gpl-3.0.en.html) license.

This software makes use of the Discord API library **Eris** provided by [abalabahaha](https://github.com/abalabahaha/eris), which is licensed under the [MIT License.](https://opensource.org/licenses/MIT)
