/**
 * VoiceActor by Blitz
 */

import { TokenData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import { BaseTableResult } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/documents.mjs';
import { i18n, warn } from '../main';
import { getGame } from './helpers';
import { polyglotIsActive } from './Hooks';
import { VOICE_ACTOR_CHATTER_MODULE_NAME } from './settings';
import { VoiceActorChatter } from './voiceactorchatter';

export class VoiceActor {
  static moduleName = VOICE_ACTOR_CHATTER_MODULE_NAME;

  static getClip = async (
    data: Token,
    customDirectory: string,
    isJournal: boolean,
  ): Promise<{ file: string; name: string }> => {
    if (!customDirectory) {
      customDirectory = <string>getGame().settings.get(VOICE_ACTOR_CHATTER_MODULE_NAME, 'customDirectory') ?? '';
    }

    if (customDirectory) {
      const nameActorFolder = VoiceActor.getClipActorFolderName(data);

      // Create directories
      try {
        await FilePicker.createDirectory(
          //@ts-ignore
          VoiceActor.isForge() ? 'forgevtt' : 'data',
          `${customDirectory}`,
          {},
        );
      } catch (e) {
        // DO NOTHING
      }
      try {
        await FilePicker.createDirectory(
          //@ts-ignore
          VoiceActor.isForge() ? 'forgevtt' : 'data',
          `${customDirectory}/`,
          {},
        );
      } catch (e) {
        // DO NOTHING
      }
      try {
        await FilePicker.createDirectory(
          //@ts-ignore
          VoiceActor.isForge() ? 'forgevtt' : 'data',
          `${customDirectory}/Journal`,
          {},
        );
      } catch (e) {
        // DO NOTHING
      }
      try {
        await FilePicker.createDirectory(
          //@ts-ignore
          VoiceActor.isForge() ? 'forgevtt' : 'data',
          `${customDirectory}/${nameActorFolder}`,
          {},
        );
      } catch (e) {
        // DO NOTHING
      }

      try {
        await FilePicker.createDirectory(
          //@ts-ignore
          VoiceActor.isForge() ? 'forgevtt' : 'data',
          `${customDirectory}/Journal/${nameActorFolder}`,
          {},
        );
      } catch (e) {
        // DO NOTHING
      }

      // Get files
      const vaDir = await FilePicker.browse(
        //@ts-ignore
        VoiceActor.isForge() ? 'forgevtt' : 'data',
        `${customDirectory}${isJournal ? '/Journal' : ''}/${nameActorFolder}`,
      );
      // Check if file exists already
      // const fileName = VoiceActor.getClipActorFileName(data, isJournal);
      const fileName = `${data.actor?._id}-${data.actor?.name
        ?.replace(/[^a-z0-9]/gi, '_')
        .toLowerCase()}-${VoiceActor.generateUUID()}.wav`;
      // const clip = <string>VoiceActor.getFile(vaDir.files, fileName);
      // let clip = <string>vaDir.files.find((el) => el.includes(fileName));
      // if (!clip) {
      //   clip = vaDir.files[0];
      //   fileName = clip.substring(clip.lastIndexOf('/') + 1);
      // }
      const clip = vaDir.target + '/' + fileName;

      return {
        file: clip,
        name: fileName,
      };
    } else {
      return {
        file: '',
        name: '',
      };
    }
  };

  static getClipActorFolderName = function (data: Token) {
    const fileName = `${data.actor?._id}-${data.actor?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    return fileName;
  };

  // static getClipActorFileName = function (data: Token, isJournal: boolean) {
  //   // Check if file exists already
  //   // let fileName;
  //   // if (isJournal) {
  //   //   fileName = `${data.actor?._id}.wav`;
  //   // } else {
  //     // if (data.actorLink) {
  //     //   fileName = `${data.actor.id}.wav`;
  //     // } else {
  //     // fileName = `${data.actor?._id}-${data.actor?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.wav`;
  //     // }
  //   // }
  //   const fileName = `${data.actor?._id}-${data.actor?.name?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${VoiceActor.generateUUID()}.wav`;
  //   return fileName;
  // };

  static generateUUID = function () {
    // Public Domain/MIT
    let d = new Date().getTime(); //Timestamp
    let d2 = (typeof performance !== 'undefined' && performance.now && performance.now() * 1000) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = Math.random() * 16; //random number between 0 and 16
      if (d > 0) {
        //Use timestamp until depleted
        r = (d + r) % 16 | 0;
        d = Math.floor(d / 16);
      } else {
        //Use microseconds since page-load if supported
        r = (d2 + r) % 16 | 0;
        d2 = Math.floor(d2 / 16);
      }
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  };

  // static getFile = (filesArray: string[], filename: string) => {
  //   const file = filesArray.find((el) => el.includes(filename));
  //   return file || '';
  // };

  static isForge = () => {
    //@ts-ignore
    if (typeof ForgeVTT !== 'undefined') {
      //@ts-ignore
      return ForgeVTT.usingTheForge;
    } else {
      return false;
    }
  };

  static playClipRandomFromToken = async function (token: Token) {
    const voiceActorFolder = <Folder>(
      getGame().folders?.contents.filter(
        (x) => x.type == 'RollTable' && x.name?.toLowerCase() == token.name?.toLowerCase() + ' voice actor',
      )[0]
    );
    const tables = <RollTable[]>(
      getGame().tables?.contents.filter(
        (x) => x.name?.toLowerCase().endsWith('voice') || x.data.folder == voiceActorFolder._id,
      )
    );
    const eligableTables: RollTable[] = tables.filter((t: RollTable) =>
      token.name?.toLowerCase().includes(<string>t.name?.toLowerCase().replace(' voice', '').trim()),
    );
    const table: RollTable = eligableTables[0];

    const roll = await table.data.document.roll();
    const clip = roll.results[0].data.text;
    this.playClip(clip, true);
  };

  static playClip = async function (clip: string, toAllWithSocket: boolean) {
    // let playVolume = getGame().settings.get("core", "globalInterfaceVolume"); // TODO CUSTOMIZE WITH MODULE SETTINGS ???

    // Audio file to be played back
    let vaPlaybackFile;
    //@ts-ignore
    const hasHowler = typeof Howl != 'undefined';
    if (clip) {
      // Used for onend and onstop
      const onFinish = (id) => {
        // Prevent caching, in case the user overwrites the clip
        if (vaPlaybackFile) {
          if (hasHowler) {
            vaPlaybackFile.unload();
          }
          vaPlaybackFile = undefined;
        }
        // vaStates.playing = false;
        // title.find("#voiceactor-playback #voiceactor-playback-icon").removeClass('fa-stop').addClass('fa-play');
      };
      // Play file
      const payload = {
        src: clip,
        volume: getGame().settings.get('core', 'globalInterfaceVolume'), // TODO CUSTOMIZE WITH MODULE SETTINGS ???
        onend: onFinish,
        onstop: onFinish,
      };
      if (hasHowler) {
        //@ts-ignore
        vaPlaybackFile = new Howl(payload);
        vaPlaybackFile.play();
      } else {
        //@ts-ignore
        vaPlaybackFile = new Sound(payload.src);
        vaPlaybackFile.on('end', onFinish);
        vaPlaybackFile.on('stop', onFinish);
        await vaPlaybackFile.load();
        vaPlaybackFile.play({ volume: payload.volume });
      }
      // vaStates.playing = true;
      // title.find("#voiceactor-playback #voiceactor-playback-icon").removeClass('fa-play').addClass('fa-stop');
      if (toAllWithSocket) {
        getGame().socket?.emit('playAudio', payload);
        ui.notifications?.notify(i18n('foundryvtt-voice-actor-chatter.notif.broadcasted'));
      } else {
        //AudioHelper.play({src: fileClipPlayPath, volume: playVolume, autoplay: true, loop: false}, true);
      }
    } else {
      ui.notifications?.notify(i18n('foundryvtt-voice-actor-chatter.notif.no-clip-for-actor'));
    }
  };

  // static retrieveOrCreateRollTable = async function (tokenData: Token, fileNamePath: string, fileName: string):Promise<RollTable> {
  static retrieveOrCreateRollTable = async function (actor: Actor, actorRollTableName: string): Promise<RollTable> {
    const voiceActorFolder = await VoiceActor.retrieveOrCreateRollTableFolder(actor);
    let myTable: RollTable | undefined = getGame().tables?.contents.find(
      (table: RollTable) =>
        table.name?.toLowerCase() == actorRollTableName.toLowerCase() && table.folder == voiceActorFolder,
    );
    if (!myTable) {
      const formula = '1d20';
      const min = 1;
      const max = 20;
      // ui.notifications.notify(getGame().i18n.format("foundryvtt-voice-actor-chatter.notif.no-rolltable-for-actor", actorRollTableName));
      myTable = <RollTable>await RollTable.create({
        name: actorRollTableName,
        // description: actorRollTableName, // This appears on every roll in the chat!
        results: [],
        replacement: true,
        displayRoll: true,
        img: 'icons/svg/sound.svg', //"modules/EasyTable/easytable.png"
        folder: voiceActorFolder ? voiceActorFolder : '',
        formula: formula ? formula : min == 1 ? `1d${max}` : `1d${max - min + 1}+${min - 1}`,
        //sort: number,
        //permission: object,
        //flags: object
      });
      // //@ts-ignore
      // await myTable.normalize();
    }
    return myTable;
  };

  static retrieveOrCreateRollTableFolder = async function (actor: Actor): Promise<Folder> {
    let baseFolder = <Folder>(
      getGame().folders?.contents.filter(
        (x: Folder) => x.type == 'RollTable' && x.name?.toLowerCase() == 'voice actor',
      )[0]
    );
    if (!baseFolder) {
      baseFolder = <Folder>await Folder.create({ name: 'Voice Actor', type: 'RollTable', parent: null });
    }
    //@ts-ignore
    let voiceActorFolder = baseFolder.children.filter(
      (x: Folder) =>
        x.type == 'RollTable' && x.name?.toLowerCase() == actor?.token?.name?.toLowerCase() + ' voice actor',
    )[0];
    if (!voiceActorFolder) {
      voiceActorFolder = await Folder.create({
        name: <string>actor?.name + ' voice actor',
        type: 'RollTable',
        parent: baseFolder?.id,
        sorting: 'm',
      });
    }
    if (!voiceActorFolder) {
      ui.notifications?.error(
        `The '${VOICE_ACTOR_CHATTER_MODULE_NAME}' module requires a folder with name (case insensitive) '${actor?.token?.name?.toLowerCase()} voice actor' on the rollTable sidebar.`,
      );
    }
    return voiceActorFolder;
  };

  static async _onCreateResult(rollTable: RollTable, fileNamePath: string, fileName: string) {
    // event.preventDefault();

    // Save any pending changes
    // await this._onSubmit(event);

    // Get existing results
    const results: any[] = Array.from(rollTable.data.document.results.values());
    const last = results[results.length - 1];

    // Get weight and range data
    const weight = last ? last.data.weight || 1 : 1;
    const totalWeight = <number>results.reduce((t: any, r: any) => t + r.data.weight, 0) || 1;
    const minRoll = results.length ? Math.min(...results.map((r: any) => r.data.range[0])) : 0;
    const maxRoll = results.length ? Math.max(...results.map((r: any) => r.data.range[1])) : 0;

    // Determine new starting range
    const spread = maxRoll - minRoll + 1;
    const perW = Math.round(spread / totalWeight);
    const range = [maxRoll + 1, maxRoll + Math.max(1, weight * perW)];

    // Create the new Result
    const resultData: any = {
      label: fileName,
      type: last ? last.type : CONST.TABLE_RESULT_TYPES.TEXT,
      collection: last ? last.collection : null,
      weight: weight,
      range: range,
      drawn: false,
      text: fileNamePath,
      img: 'icons/svg/sound.svg',
    };
    return rollTable.data.document?.createEmbeddedDocuments('TableResult', [resultData]);
  }

  // static getCollection(collection) {
  //   let validCollection = ['Actor', 'Scene', 'Macro', 'Playlist', 'JournalEntry', 'RollTable', 'Item']
  //   if (validCollection.includes(collection)) {
  //       return collection
  //   }
  //   return '';
  // }

  // static getResultId(collection, text) {
  //     let resultId = '';
  //     let img = 'icons/svg/d20-black.svg'
  //     if (collection == 'Text' || !collection) {
  //         return [resultId, img];
  //     }
  //     let entity;
  //     switch (collection) {
  //         case 'Actor':
  //                 entity = getGame().actors.getName(text);
  //                 resultId = entity?.id||''
  //                 img = entity?.img||img;
  //             break;
  //         case 'Scene':
  //                 entity = getGame().scenes.getName(text);
  //                 resultId = entity?.id||''
  //                 img = entity?.img||img;
  //             break;
  //         case 'Macro':
  //                 entity = getGame().macros.getName(text);
  //                 resultId = entity?.id||''
  //                 img = entity?.data?.img||img;
  //             break;
  //         case 'Playlist':
  //                 entity = getGame().playlists.getName(text);
  //                 resultId = entity?.id||''
  //                 // img = entity?.img||img;
  //             break;
  //         case 'JournalEntry':
  //                 entity = getGame().journal.getName(text);
  //                 resultId = entity?.id||''
  //                 img = entity?.data?.img||img;
  //             break;
  //         case 'RollTable':
  //                 entity = getGame().tables.getName(text);
  //                 resultId = entity?.id||''
  //                 img = entity?.data?.img||img;
  //             break;
  //         case 'Item':
  //                 entity = getGame().items.getName(text);
  //                 resultId = entity?.id||''
  //                 img = entity?.img||img;
  //             break;
  //         default:
  //             break;
  //     }
  //     return [resultId, img];
  // }
}

export const onRender = async (app, html, data) => {
  const disableHeaderSheetButtons =
    <string>getGame().settings.get(VOICE_ACTOR_CHATTER_MODULE_NAME, 'disableHeaderSheetButtons') ?? false;
  if (disableHeaderSheetButtons) {
    return;
  }

  const customDirectory = <string>getGame().settings.get(VOICE_ACTOR_CHATTER_MODULE_NAME, 'customDirectory') ?? '';

  // Get window-title from html so we can prepend our buttons
  const title = html.find('.window-title');

  // Store recording and playback states
  const vaStates = {
    recording: false,
    playing: false,
  };

  // Audio file to be played back
  let vaPlaybackFile;

  // MediaRecorder
  let vaRecorder;

  // timeout to sop vaRecorder after 10 seconds if not stopped manually
  let vaRecorderTimeout;

  let isJournal = false;
  if (data.options.classes.indexOf('journal-sheet') > -1) {
    isJournal = true;
  }

  let buttons = ``;

  if (
    getGame().user?.isGM ||
    (data.owner &&
      getGame().settings?.get(VOICE_ACTOR_CHATTER_MODULE_NAME, 'playersRecordOwned') &&
      getGame().user?.hasPermission('FILES_UPLOAD'))
  ) {
    buttons += `<button id="voiceactor-record" class="voiceactor-button" title="${i18n(
      'foundryvtt-voice-actor-chatter.ui.button-tooltip-record',
    )}">
        <i id="voiceactor-record-icon" style="color: white" class="fas fa-microphone"></i>
        </button>`;
  }

  if (
    getGame().user?.isGM ||
    data.owner ||
    getGame().settings.get(VOICE_ACTOR_CHATTER_MODULE_NAME, 'playersPlaybackLimited')
  ) {
    buttons += `<button id="voiceactor-playback" class="voiceactor-button" title="${i18n(
      'foundryvtt-voice-actor-chatter.ui.button-tooltip-playback',
    )}">
        <i id="voiceactor-playback-icon" style="color: white" class="fas fa-play"></i>
        </button>`;
  }

  // Add buttons
  title.prepend(buttons);

  const obj = await VoiceActor.getClip(data, customDirectory, isJournal);
  if (obj.file == '' || obj.name == '') {
    ui.notifications?.notify(i18n('foundryvtt-voice-actor-chatter.notif.no-clip-for-actor'));
    return;
  }
  const clip = obj.file;
  const fileName = obj.name;

  if (clip) {
    // Change button color if this actor has a clip already
    title.find('#voiceactor-record #voiceactor-record-icon').css('color', 'lightgreen');
  }

  title.find('#voiceactor-record').click(async (ev) => {
    if (vaStates.recording) {
      // Stop recording if button is pressed while recording active
      vaRecorder.stop();
      return;
    }

    if (clip) {
      if (!ev.shiftKey) {
        // Notify user if record is clicked but clip exists. Bypass if SHIFT is held when clicking.
        ui.notifications?.notify(i18n('foundryvtt-voice-actor-chatter.notif.clip-exists'));
        return;
      } else {
        if (VoiceActor.isForge()) {
          ui.notifications?.notify(i18n('foundryvtt-voice-actor-chatter.notif.forge-cache'));
        }
      }
    }

    // const fileName = VoiceActor.getClipActorFileName(data, isJournal);

    if (!navigator.mediaDevices) {
      ui.notifications?.error(i18n('foundryvtt-voice-actor-chatter.notif.no-media-devices'));
    }
    // Record clip
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
      })
      .then(async (stream) => {
        vaStates.recording = true;
        title.find('#voiceactor-record #voiceactor-record-icon').removeClass('fa-microphone').addClass('fa-stop');
        title.find('#voiceactor-record #voiceactor-record-icon').css('color', 'red');
        const chunks: any[] = [];
        vaRecorder = new MediaRecorder(stream);
        vaRecorder.ondataavailable = async (e: any) => {
          chunks.push(e.data);
          if (vaRecorder.state == 'inactive') {
            const blob = new Blob(chunks, {
              type: 'audio/wav',
            });
            const file = new File([blob], fileName, {
              type: 'audio/wav',
            });

            const nameActorFolder = VoiceActor.getClipActorFolderName(data);
            const dirName = `${customDirectory}${isJournal ? '/Journal' : ''}/${nameActorFolder}`;
            //@ts-ignore
            await FilePicker.upload(VoiceActor.isForge() ? 'forgevtt' : 'data', dirName, file);
            vaStates.recording = false;

            // Only really works with Firefox, chrome has some weird caching, requiring the user to wait about 30 seconds
            //@ts-ignore
            getGame().audio?.buffers.delete(`${dirName[0] == '/' ? dirName.substr(1) : dirName}/${fileName}`);

            title.find('#voiceactor-record #voiceactor-record-icon').removeClass('fa-stop').addClass('fa-microphone');
            title.find('#voiceactor-record #voiceactor-record-icon').css('color', 'lightgreen');
            vaRecorder = null; //delete vaRecorder;
            clearTimeout(vaRecorderTimeout);
            vaRecorderTimeout = null; //delete vaRecorderTimeout;
            // stream = null; //delete stream;
            const fileNamePath = `${dirName[0] == '/' ? dirName.substr(1) : dirName}/${fileName}`;
            const actorRollTableName = data.actor?.name + ' voice';
            const theTable = await VoiceActor.retrieveOrCreateRollTable(data.actor, actorRollTableName);
            if (polyglotIsActive) {
              await VoiceActorChatter._createAutomaticPolyglotRolltable([data]);
            }
            VoiceActor._onCreateResult(theTable, fileNamePath, fileName);
          }
        };
        vaRecorder.start();
        // Stop recording after 30 seconds. Timeout is cancelled if user stops manually
        vaRecorderTimeout = setTimeout(() => {
          vaRecorder.stop();
        }, 30000);
      })
      .catch((e) => {
        console.log(e);
      });
  });

  title.find('#voiceactor-playback').click(async (ev: any) => {
    if (vaStates.playing) {
      // Stop playback if pressed while playing
      vaPlaybackFile.stop();
      vaStates.playing = false;
      return;
    }

    //@ts-ignore
    const hasHowler = typeof Howl != 'undefined';
    if (clip) {
      // Used for onend and onstop
      const onFinish = (id) => {
        // Prevent caching, in case the user overwrites the clip
        if (vaPlaybackFile) {
          if (hasHowler) {
            vaPlaybackFile.unload();
          }
          vaPlaybackFile = undefined;
        }
        vaStates.playing = false;
        title.find('#voiceactor-playback #voiceactor-playback-icon').removeClass('fa-stop').addClass('fa-play');
      };
      // Play file
      const payload = {
        src: clip,
        volume: getGame().settings.get('core', 'globalInterfaceVolume'), // TODO CUSTOMIZE WITH MODULE SETTINGS ???
        onend: onFinish,
        onstop: onFinish,
      };
      if (hasHowler) {
        //@ts-ignore
        vaPlaybackFile = new Howl(payload);
        vaPlaybackFile.play();
      } else {
        //@ts-ignore
        vaPlaybackFile = new Sound(payload.src);
        vaPlaybackFile.on('end', onFinish);
        vaPlaybackFile.on('stop', onFinish);
        await vaPlaybackFile.load();
        vaPlaybackFile.play({ volume: payload.volume });
      }
      vaStates.playing = true;
      title.find('#voiceactor-playback #voiceactor-playback-icon').removeClass('fa-play').addClass('fa-stop');
      if (ev.shiftKey) {
        getGame().socket?.emit('playAudio', payload);
        ui.notifications?.notify(i18n('foundryvtt-voice-actor-chatter.notif.broadcasted'));
      }
    } else {
      ui.notifications?.notify(i18n('foundryvtt-voice-actor-chatter.notif.no-clip-for-actor'));
    }
  });
};
