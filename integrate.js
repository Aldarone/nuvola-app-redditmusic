/*
 * Copyright 2016 Alda Marteau-Hardi <alda@leetchee.fr>
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

"use strict";

(function(Nuvola)
{

// Create media player component
var player = Nuvola.$object(Nuvola.MediaPlayer);

// Handy aliases
var PlaybackState = Nuvola.PlaybackState;
var PlayerAction = Nuvola.PlayerAction;

// Create new WebApp prototype
var WebApp = Nuvola.$WebApp();

// Initialization routines
WebApp._onInitWebWorker = function(emitter)
{
    Nuvola.WebApp._onInitWebWorker.call(this, emitter);

    var state = document.readyState;
    if (state === "interactive" || state === "complete")
        this._onPageReady();
    else
        document.addEventListener("DOMContentLoaded", this._onPageReady.bind(this));
}

// Page is ready for magic
WebApp._onPageReady = function()
{
    // Connect handler for signal ActionActivated
    Nuvola.actions.connect("ActionActivated", this);

    // Start update routine
    this.update();
}

// Extract data from the web page
WebApp.update = function()
{
    /*
     * Populate the song metadata
     */
    var activeSong = document.querySelector('.music.playlist .active')
    var track = {
        title: null,
        artist: null,
        album: null,
        artLocation: null
    }

    if (activeSong) {
        track = {
            title: activeSong.querySelector('.title').textContent,
            artist: activeSong.querySelector('.author').textContent,
            album: activeSong.querySelector('.subreddit').textContent,
            artLocation: activeSong.querySelector('.image').src
        }
    }

    /*
     * Deal with the playback state
     */
    var playButton = document.querySelector('.controls .play.active')
    var playing = PlaybackState.UNKNOWN
    if (activeSong && ! playButton) {
      playing = PlaybackState.PAUSED
    }

    if (activeSong && playButton) {
      playing = PlaybackState.PLAYING
    }

    /*
     * Control the action buttons
     */
    var enabled

    enabled = !!document.querySelector('.controls .forward')
    player.setCanGoNext(enabled)

    enabled = !!document.querySelector('.controls .backward')
    player.setCanGoPrev(enabled)

    enabled = (playing == PlaybackState.PLAYING)
    player.setCanPause(enabled)

    enabled = (!!document.querySelector('.controls .play') && (playing == PlaybackState.PAUSED || playing == PlaybackState.UNKNOWN))
    player.setCanPlay(enabled)

    /*
     * Set the state
     */
    player.setTrack(track);
    player.setPlaybackState(playing);

    // Schedule the next update
    setTimeout(this.update.bind(this), 500);
}

// Handler of playback actions
WebApp._onActionActivated = function(emitter, name, param)
{
  switch (name) {
    case PlayerAction.TOGGLE_PLAY:
    case PlayerAction.PLAY:
    case PlayerAction.PAUSE:
    case PlayerAction.STOP:
      Nuvola.clickOnElement(document.querySelector('.controls .play'))
      break
    case PlayerAction.PREV_SONG:
      Nuvola.clickOnElement(document.querySelector('.controls .backward'))
      break
    case PlayerAction.NEXT_SONG:
      Nuvola.clickOnElement(document.querySelector('.controls .forward'))
  }
}

WebApp.start();

})(this);  // function(Nuvola)
