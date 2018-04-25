/**
 * @providesModule MediaPlayer
 * @flow
 */
'use strict';

const NativeEventEmitter = require('NativeEventEmitter');
const EventTarget = require('event-target-shim');
const Platform = require('Platform');
const MediaPlayerModule = require('NativeModules').MediaPlayer;
const resolveAssetSource = require('resolveAssetSource');

const MEDIA_PLAYER_EVENTS = {
  idle: 'idle',
  preparing: 'preparing',
  prepared: 'prepared',
  started: 'started',//playing: 'playing',
  paused: 'paused',
  updateplayinfo: 'updatePlayInfo',
  seeking: 'seeking',
  seeked: 'seeked',
  playbackcomplete: 'playbackComplete',
  playbackinterrupted: 'playbackInterrupted',
  //error: 'error',
  erroroccurred: 'errorOccurred',
  exceptionhappened: 'exceptionHappened'
}

const EVENT_RESULTS = [
  'PLAYER_OK', // PLAYER_OK = 0, Success
  'PLAYER_INVALID_URI', // No source is set.
  'PLAYER_INVALID_SOURCE', // No source is set.
  'PLAYER_DUPLICATED_URI', // No source is set.
  'PLAYER_INSTANCE_DISPOSED', // The player has already been disposed of.
  'PLAYER_INVALID_STATE', // The player is not in the valid state.
  'PLAYER_INVALID_INSTANCE_OR_POLICY', // The player has already been disposed of.\n /// -or-\n /// poilcy has already been disposed of.
  'PLAYER_NONE_POLICY', // policy is null
  'PLAYER_FEATURE_NOT_SUPPORTED', // feature is not supported
  'PLAYER_VALUE_IN_USE', // The value has already been assigned to another player.
  'PLAYER_WRONG_RANGE_RATE', // less than -5.0 or greater than 5.0 or equals to 0
  'PLAYER_POSITION_OUT_OF_RANGE', // The specified position is not valid.
  'PLAYER_SUBTITLE_EMPTY_PATH', // subtitle's path is an empty string.
  'PLAYER_SUBTITLE_FILE_PATH_NOT_EXIST', // The specified path does not exist.
  'PLAYER_SUBTITLE_NULL_PATH', // The path is null.
  'PLAYER_SUBTITLE_FORMAT_NOT_SUPPORTED', // feature is not supported
  'PLAYER_PLAYBACK_INTERRUPTED',
  'PLAYER_ERROR_OCCURED',
  'PLAYER_TO_BE_EXTENDED'
]

type EventName = $Keys<typeof MEDIA_PLAYER_EVENTS>;

const MediaPlayerEventEmitter = new NativeEventEmitter(MediaPlayerModule);

const _subscriptions = new Map();

/**
 * MediaPlayer is used to play media file. It provides the API, play, pause, stop, etc. 
 * And you can add event listeners. It is singleton object for the device.
 * In current version, it supprots only audio files on Tizen TV plateform.
 *
 * ```
 * MediaPlayer.init(song.url)
 * MediaPlayer.addEventListener('prepared', (event) => {
 *   MediaPlayer.play()
 * })
 * MediaPlayer.addEventListener('started', (event) => {
 *   console.log('audio played.')
 * })
 * ```
 *
 * ### Tizen TV
 *
 * MEDIA PLAYER EVENTS: You can add the following events by the function MediaPlayer.addEventListener.
    - idle
    - preparing
    - prepared
    - started
    - paused
    - updateplayinfo
    - seeking
    - seeked
    - playbackcomplete
    - playbackinterrupted
    - erroroccurred
    - exceptionhappened
 *
 */
const MediaPlayer = {
  /**
   * The current media file url.
   */
  url: null,
  /**
   * The current media file duration
   */
  duration: null,
  /**
   *  - MEDIA_PLAYER_EVENTS: events supported by the MediaPlayer
   *  - EVENT_RESULTS: the results passed into the MediaPlayer event callback
   */
  CONSTANTS: {
    MEDIA_PLAYER_EVENTS,
    EVENT_RESULTS
  },
  /**
   * Add a handler to MediaPlayer events by listening to the supported event type
   * and providing the handler.
   * 
   * @param eventName: EventName
   *  @see MEDIA_PLAYER_EVENTS
   * 
   * @param handler: Function
   *  The callback of the event, and there are results passed into the MediaPlayer event callback:
   *   - updateplayinfo: the results objects including position, duration props.
   *   - idle: the results objects including EVENT_RESULT.
      - preparing: the results objects including EVENT_RESULT.
      - prepared: the results objects including EVENT_RESULT.
      - started: the results objects including EVENT_RESULT.
      - paused: the results objects including EVENT_RESULT.
      - seeking: the results objects including EVENT_RESULT.
      - seeked: the results objects including EVENT_RESULT.
      - playbackcomplete: the results objects including EVENT_RESULT.
      - playbackinterrupted: the results objects including EVENT_RESULT.
      - erroroccurred: the results objects including EVENT_RESULT.
      - exceptionhappened: the results objects including EVENT_RESULT.
   * 
   * @return remove: () => void
   * 
   */
  addEventListener(
    eventName: EventName,
    handler: Function
  ): {remove: () => void} {
    const listener = MediaPlayerEventEmitter.addListener(
      MEDIA_PLAYER_EVENTS[eventName], 
      (eventData) => {
        Number.isInteger(eventData.ret_code) && (eventData.EVENT_RESULT = EVENT_RESULTS[eventData.ret_code])
        handler(eventData);
      }
    );
    let listeners = _subscriptions.get(eventName) || {}
    listeners[handler] = listener
    _subscriptions.set(eventName, listeners)
    return {
      remove: () => MediaPlayer.removeEventListener(eventName, handler)
    };
  },

  /**
   * Remove a handler by passing the `change` event type and the handler
   */
  removeEventListener(eventName: EventName, handler: Function): void {
    const listeners = _subscriptions.get(eventName)
    if (!listeners) {
      return
    }
    listeners[handler] && listeners[handler].remove()
    if(Object.getOwnPropertyNames(listeners).length === 1) {
      _subscriptions.delete(eventName)
    } else {
      delete listeners[handler]
      _subscriptions.set(eventName, listeners)
    }
  },
  
  /**
   * Initialize the media player.
   * 
   * @param {string | number} source 
   *  The source to play. 
   *  The source can be a string: http://www.samsung.com/a.mp3 or require('')
   */
  init(source): void {
    this.uri = Number.isInteger(source) ? resolveAssetSource(source).uri : source
    this.duration = null
    if (!this.uri) {
      console.warn('uri should not be an empty')
      return
    }
    MediaPlayerModule.init(this.uri)
    this._isPreparedEventReg || this.addEventListener('prepared', (event) => {
      this.duration = event.duration
    })
    this._isPreparedEventReg = true
  },
  /**
   * Plays the media
   */
  play(): void {
    this.uri && MediaPlayerModule.play()
  },
  /**
   * Pauses the media
   */
  pause(): void {
    this.uri && MediaPlayerModule.pause()
  },
  /**
   * Stops the media
   */
  stop(): void {
    this.uri && MediaPlayerModule.stop()
  },
  /**
   * Seek the media to a given position
   * @param {number} time
   */
  seekTo(time: number): void {
    time = time > 0 ? time : 0
    this.duration && (time = time < this.duration ? time : this.duration)
    this.uri && MediaPlayerModule.seekTo(time)
  },

  /**
   * Gets the media current position
   * @returns {number} position
   */
  position() {
    return this.uri && MediaPlayerModule.position
  },
  /**
   * 
   * Destroys the media player
   */
  destroy(): void {
    this._unregisterEvents()
    MediaPlayerModule.stop()
    MediaPlayerModule.deInit()
  },
  
  _unregisterEvents(): void {
    _subscriptions.forEach(listeners => {
      for(let i in listeners){
        listeners[i] && listeners[i].remove()
      }
    })
    _subscriptions.clear()
  }
}

module.exports = MediaPlayer
