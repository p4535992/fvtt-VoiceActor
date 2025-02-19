# Voice Actor Chatter for FVTT

![Latest Release Download Count](https://img.shields.io/github/downloads/p4535992/foundryvtt-voice-actor-chatter/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge) 

[![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2Ffoundryvtt-voice-actor-chatter&colorB=006400&style=for-the-badge)](https://forge-vtt.com/bazaar#package=foundryvtt-voice-actor-chatter) 

![Foundry Core Compatible Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-voice-actor-chatter%2Fmaster%2Fsrc%2Fmodule.json&label=Foundry%20Version&query=$.compatibleCoreVersion&colorB=orange&style=for-the-badge)

![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2Fp4535992%2Ffoundryvtt-voice-actor-chatter%2Fmaster%2Fsrc%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)

[![Foundry Hub Endorsements](https://img.shields.io/endpoint?logoColor=white&url=https%3A%2F%2Fwww.foundryvtt-hub.com%2Fwp-json%2Fhubapi%2Fv1%2Fpackage%2Ffoundryvtt-voice-actor-chatter%2Fshield%2Fendorsements&style=for-the-badge)](https://www.foundryvtt-hub.com/package/foundryvtt-voice-actor-chatter/)

This module was born as a union of the features of the two [Voice Actor for FVTT by Blitz](https://github.com/BlitzKraig/fvtt-VoiceActor) and [NPC Chatter](https://github.com/cswendrowski/FoundryVtt-Npc-Chatter) modules.

## THIS MODULE IS ABBANDONED IN FAVOR OF [Token Says](https://github.com/napolitanod/Token-Says) IT DOESN'T HAVE THE RECORD UTILITY, BUT IT GOT ALL THE REST AND MORE.

This module arises from the need together with the [Trigger Happy module](https://github.com/League-of-Foundry-Developers/fvtt-module-trigger-happy) to randomize a set of voices for the same actor through a customizable rollTable. Basicaly i want when click on a actor to have a random prepared audio to run.

This work even with external audio just set the source on the roll table.

After you recorded a voice hte module automatically generate a series of rolltable based on the languages of the actor and the polyglot module if present.

Here some macro for give the idea

```
var token = canvas.tokens.placeables.filter(x => x.data.name == "MerchantWeapon01")[0];
game.voiceActorChatter.tokenChatter(token);
```

## Installation

It's always easiest to install modules from the in game add-on browser.

To install this module manually:
1.  Inside the Foundry "Configuration and Setup" screen, click "Add-on Modules"
2.  Click "Install Module"
3.  In the "Manifest URL" field, paste the following url:
`https://raw.githubusercontent.com/p4535992/foundryvtt-voice-actor-chatter/master/src/module.json`
4.  Click 'Install' and wait for installation to complete
5.  Don't forget to enable the module in game using the "Manage Module" button

# Important note for servers accessed over HTTP/IP

Chrome and Firefox will not ask you to grant microphone permissions if you do not have an SSL enabled site, they will just refuse automatically, breaking the module.

If you only want the GM to record via the module, use `localhost` to access Foundry if possible.

If this is not possible due to external hosting etc., I have discovered a workaround for Chrome, and a slightly worse workaround for Firefox.

## *PROCEED AT YOUR OWN RISK*

These workarounds should be safe, but I am not a security expert.
I would advise running via localhost, or setting up SSL for your server.

## Chrome (Secure-ish workaround)

* Navigate to `chrome://flags/#unsafely-treat-insecure-origin-as-secure`
* Enable the flag and add your foundry IP and port: `http://ip.address.here:30000`
* Relaunch, and Chrome will now ask for mic permissions when you try to record to an actor

## Firefox (Less secure workaround)

* Navigate to `about:config`
* Search for `insecure`
* Set `media.devices.insecure.enabled` to `true`
* Set `media.getusermedia.insecure.enabled` to `true`
* Refresh foundry page, Firefox will now ask for mic permission when you try to record to an actor

## The difference

Chrome lets you whitelist the server directly, meaning the security holes this potentially exposes can't be taken advantage of by other insecure sites.
Firefox only lets you blanket allow insecure `getusermedia` and `devices`, meaning an insecure site could theoretically try to take advantage of this.

Because they are both permissions-based, you need to actually allow the site to use them, so the risk is pretty low. HOWEVER, **you do this at your own risk!**
I would advise looking into setting up an HTTPS foundry server.

# Now that's out of the way, on to the module!

## What's it for?

This module is my very late and unofficial D20 day contribution!
I wrote it in a couple of hours, hoping it would help me dip my feet back into Foundry module development.
It's pretty simple, a little hacky, and contains some less than stellar coding practices... BUT, it's also pretty useful!

In a nutshell, I find myself constantly asking my players "What did I make this guy sound like again?..." whenever we revisit an NPC.
This module should help with that problem, allowing the GM to record a sample of an NPC's voice directly in their sheet, or in a journal entry, and play it back privately whenever they want.

## What does it do?

Adds two new buttons to the titlebar of an actor sheet and journal entry, allowing you to record and play-back a clip.

Records directly from whatever your browsers input source is, and saves the file to a VoiceActor directory in your userdata root.

Clips can be 30 seconds max, and can be ended early by clicking the stop button.

Linked actors will have a single recorded clip, saved using their actor ID.

Journal entries will have a single recorded clip, saved using their entry ID in a Journal/ directory inside the VoiceActor/ directory

Unlinked actors will have a clip saved based on their ID and actor name.
This means unlinked actors with the same name will share the same clip, but changing an actors name in their unlinked sheet after spawning will allow you to record a clip for that actor specifically (and any other actors of that 'type' with the same name)

e.g. If you change one unlinked Goblin's name to "Boblin" in his actor sheet, he can have his own special clip recorded. All of the goblins named "Goblin" will share a single clip.

## How do I use it?

- Install & enable the module
- Make sure to create a folder **'Voice Actor'** on the rolltable sidebar
- Double click a token to open their actor sheet (or open a journal entry)
- Note the 2 new buttons at the top left of the window
- Click the microphone button to record (up to 10 seconds)
- Click again to stop recording
- Click play to playback the recorded audio (does not broadcast, only plays for the GM)
- Shift-click play to broadcast to all players (note that this isn't what the module is designed for, but it was easy enough to implement, so I've jammed it in there in case you want to give your NPCs a repeatable greeting, or give your ogres a nice roar)
- Shift-click the microphone button to record a new clip, overwriting the previous clip for that actor

## What else should I know?

Linked actor tokens will save their clip using the actor ID. This means your BBEG NPC can have a clip recorded, and will play back that same clip on every spawned token.

Unlinked actor tokens will save their clip using the actor ID AND the actor name. This means, for example, all of your "Commoner"s will share a clip, except tokens you spawn and then change the name of. Maybe there's a memorable NPC that uses the Commoner statblock - no problem! Spawn a Commoner, double click the token, change the token name to your NPC's name, then record your clip!

# Macro Voice Actor Chatter

# Usage

Chatter can only be triggered via scripting. There are a few Macros included as examples - most work out of the box, but some require additional setup.

The easiest macro is the "Timed Global Chatter" macro - just slap it when a Scene Loads, and they will start chattering!

## Trigger Happy

[Trigger Happy](https://github.com/kakaroto/fvtt-module-trigger-happy) can trigger Voice Actor Chatter as well. Here's an example to get you started:

When an Actor walks into a Room (defined by an invisble actor), have a specific Token chatter: 

```
@Actor[TriggerA] @Macro[OXyjmVhEGo3eTaJz]{Specific Token Chatter}
```

# Features

- Allow Owner recording : Enable to let players record and playback on their owned actors. Requires FILES_UPLOAD permission for players.

- Allow Limited & Observer playback: Enable to let players playback clips on actors they have Limited or Observer permissions on. Players cannot record to these actors.

- Custom directory path: Custom directory path

- Disable header Sheet Buttons: Disable header Sheet Buttons after you are ok with the chatter audio file

- Upload file util: A setting for upload file audio on the server

- Integration with Polyglot: Set up different rolltable one for each language and change the audio file with customized one for that language.

- Integration with NPC Chatter: Integration with NPC Chatter module

# API

## Options Parameters

| Key    | SubKey  | Type              | Description                                                     | Default |
|:------:|:-------:|:-----------------:|:---------------------------------------------------------------:|:-------:|
| toAll  |         | boolean           | Broadcast audio to all players                                  | false   |
| langs  |         | array (of String) | Explicit languages known to target ignore the polyglot settings | []      |

## Actor Voice Global Chatter

Picks a random Chatter Table belonging to a random Actor on the first active scene and play a audio file with rolled Text off of the random Chatter Table.

```js
async globalChatter()
```

Macro code:

```js
game.voiceActorChatter.globalChatter()
```

macro code if you want to share the sounds with all the players

```js
game.voiceActorChatter.globalChatter({toAll: true})
```

macro code if you want to check the language withpolyglot given a explicit language

```js
game.voiceActorChatter.globalChatter({langs: ["gnomish", "gith"]})
```

## Global Chatter Every Interval

Every interval as measured in milliseconds, executes `globalChatter()`.

```js
randomGlobalChatterEvery(milliseconds)
```

Macro code:

```js
game.voiceActorChatter.randomGlobalChatterEvery(milliseconds)
```

macro code if you want to share the sounds with all the players

```js
game.voiceActorChatter.randomGlobalChatterEvery(milliseconds, {toAll: true})
```

macro code if you want to check the language withpolyglot given a explicit language

```js
game.voiceActorChatter.randomGlobalChatterEvery(milliseconds, {langs: ["gnomish", "gith"]});
```

## Disable Global Chatter

Clears out the timer on `randomGlobalChatterEvery`

```js
turnOffGlobalTimerChatter()
```

Macro code:

```js
game.voiceActorChatter.turnOffGlobalTimerChatter()
```

## Token Chatter

Given a `Token`, tries to find a matching Chatter Table. If none, exits. If one or more, randomly picks one and displays a rolled result from it as a ChatBubble.

```js
async tokenChatter(token)
```

Macro code:

```js
var token = game.scenes.filter(x => x.active)[0].data.tokens.filter(x => x.name == "Human Thug C")[0];
game.voiceActorChatter.tokenChatter(token);
```

macro code if you want to share the sounds with all the players

```js
var token = game.scenes.filter(x => x.active)[0].data.tokens.filter(x => x.name == "Human Thug C")[0];
game.voiceActorChatter.tokenChatter(token, {toAll: true});
```

macro code if you want to check the language withpolyglot given a explicit language

```js
var token = game.scenes.filter(x => x.active)[0].data.tokens.filter(x => x.name == "Human Thug C")[0];
game.voiceActorChatter.tokenChatter(token, {langs: ["gnomish", "gith"]});
```

## Selected Chatter

Grabs the currently selected Tokens and tries to find matching Chatter Tables. If none, exits. If one or more, randomly picks one and an elibable Token and displays a rolled result from the Table as a ChatBubble.

```js
  async selectedChatter()
```

Macro code:

```js
game.voiceActorChatter.selectedChatter()
```

macro code if you want to share the sounds with all the players

```js
game.voiceActorChatter.selectedChatter(token, {toAll: true});
```

macro code if you want to check the language withpolyglot given a explicit language

```js
game.voiceActorChatter.selectedChatter(token, {langs: ["gnomish", "gith"]});
```

# Build

## Install all packages

```bash
npm install
```
## npm build scripts

### build

will build the code and copy all necessary assets into the dist folder and make a symlink to install the result into your foundry data; create a
`foundryconfig.json` file with your Foundry Data path.

```json
{
  "dataPath": "~/.local/share/FoundryVTT/"
}
```

`build` will build and set up a symlink between `dist` and your `dataPath`.

```bash
npm run-script build
```

### NOTE:

You don't need to build the `foundryconfig.json` file you can just copy the content of the `dist` folder on the module folder under `modules` of Foundry

### build:watch

`build:watch` will build and watch for changes, rebuilding automatically.

```bash
npm run-script build:watch
```

### clean

`clean` will remove all contents in the dist folder (but keeps the link from build:install).

```bash
npm run-script clean
```
### lint and lintfix

`lint` launch the eslint process based on the configuration [here](./.eslintrc)

```bash
npm run-script lint
```

`lintfix` launch the eslint process with the fix argument

```bash
npm run-script lintfix
```

### prettier-format

`prettier-format` launch the prettier plugin based on the configuration [here](./.prettierrc)

```bash
npm run-script prettier-format
```

### package

`package` generates a zip file containing the contents of the dist folder generated previously with the `build` command. Useful for those who want to manually load the module or want to create their own release

```bash
npm run-script package
```

## [Changelog](./changelog.md)

## Issues

Any issues, bugs, or feature requests are always welcome to be reported directly to the [Issue Tracker](https://github.com/p4535992/foundryvtt-voice-actor-chatter/issues ), or using the [Bug Reporter Module](https://foundryvtt.com/packages/bug-reporter/).

## License

- [NPC Chatter](https://github.com/cswendrowski/FoundryVtt-Npc-Chatter) - [GPL 3.0](https://github.com/cswendrowski/FoundryVtt-Npc-Chatter/blob/master/LICENSE.md)
- [Voice Actor for FVTT by Blitz](https://github.com/BlitzKraig/fvtt-VoiceActor) - [MIT](https://github.com/BlitzKraig/fvtt-VoiceActor/blob/master/LICENSE)

This package is under an [GPL 3.0 license](LICENSE) and the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).

# Credit

- [NPC Chatter](https://github.com/cswendrowski/FoundryVtt-Npc-Chatter)
- [Voice Actor for FVTT by Blitz](https://github.com/BlitzKraig/fvtt-VoiceActor)

## Acknowledgements

Bootstrapped with League of Extraordinary FoundryVTT Developers  [foundry-vtt-types](https://github.com/League-of-Foundry-Developers/foundry-vtt-types).

Mad props to the 'League of Extraordinary FoundryVTT Developers' community which helped me figure out a lot.

