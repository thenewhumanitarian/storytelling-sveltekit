/* soundcite - v0.5.1 - 2017-07-10
 * Copyright (c) 2017 Tyler J. Fisher and Northwestern University Knight Lab
 */
(function (window, document, callback) {
  var loaded_p = true;
  var loaded_s = true;
  var insertionPoint = document.head || document.getElementsByTagName("head").item(0) || document.documentElement.childNodes[0];

  function cmp_vers(v1, v2) {
    var a1 = v1.split(".");
    var a2 = v2.split(".");
    for (var i = 0; i < Math.min(a1.length, a2.length); i++) {
      var n1 = parseInt(a1[i]);
      var n2 = parseInt(a2[i]);
      var d = n1 - n2;
      if (d) {
        return d
      }
    }
    return a1.length - a2.length
  }

  function load_popcorn(version, cb) {
    var js = window.Popcorn,
      d, new_js;
    if (loaded_p) {
      cb(js)
    } else if (!js || cmp_vers(version, js.version) > 0 || cb(js)) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://cdn.knightlab.com/libs/soundcite/latest/vendor/popcorn.min.js";
      script.onload = script.onreadystatechange = function () {
        if (!loaded_p && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
          new_js = window.Popcorn;
          if (js) {
            window.Popcorn = js
          }
          cb(new_js, loaded_p = true);
          insertionPoint.removeChild(script)
        }
      };
      insertionPoint.appendChild(script)
    }
  }

  function load_soundcloud(version, cb) {
    var js = window.SC,
      d;
    if (loaded_s) {
      cb(js)
    } else if (!js || !js.Dialog || cmp_vers(version, js._version) > 0 || cb(js)) {
      var script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//connect.soundcloud.com/sdk-2.0.0.js";
      script.onload = script.onreadystatechange = function () {
        if (!loaded_s && (!(d = this.readyState) || d == "loaded" || d == "complete")) {
          cb(window.SC, loaded_s = true);
          insertionPoint.removeChild(script)
        }
      };
      insertionPoint.appendChild(script)
    }
  }

  function r(f) {
    if (/in/.test(document.readyState)) {
      setTimeout(function () {
        r(f)
      }, 9)
    } else {
      f()
    }
  }
  r(function () {
    var elements = document.getElementsByClassName("soundcite");
    for (var i = 0; i < elements.length; i++) {
      if (elements[i].getAttribute("data-url")) {
        loaded_p = false
      } else {
        loaded_s = false
      }
    }
    load_popcorn("1.5.6", function (p) {
      load_soundcloud("2.0.0", function (s) {
        callback(elements, p, s)
      })
    })
  })
})(window, document, function (soundcite_elements, $Popcorn, $SoundCloud) {
  var SOUNDCITE_CONFIG = {
    soundcloud_client_id: "5f016c08c2201881c4217afd5f52e065"
  };
  for (var key in window.SOUNDCITE_CONFIG) {
    SOUNDCITE_CONFIG[key] = window.SOUNDCITE_CONFIG[key]
  }
  var rgb = normalize_background_color(SOUNDCITE_CONFIG.background_color);
  if (rgb) {
    SOUNDCITE_CONFIG.background_color = rgb.join(",")
  } else {
    SOUNDCITE_CONFIG.background_color = "0,0,0"
  }
  var style = document.createElement("style");
  style.type = "text/css";
  style.innerHTML = ".soundcite-loaded { background-color: rgba(" + SOUNDCITE_CONFIG.background_color + ",0) }";
  document.getElementsByTagName("head")[0].appendChild(style);
  var bind = function (func, context) {
    var slice = Array.prototype.slice;
    var args = slice.call(arguments, 2);
    return function () {
      return func.apply(context, args.concat(slice.call(arguments)))
    }
  };

  function removeClass(el, name) {
    var cn = el.className;
    for (var i = 0, arr = name.match(/\S+/g); i < arr.length; i++) {
      cn = cn.replace(new RegExp("(?:^|\\s)" + arr[i] + "(?!\\S)"), "")
    }
    el.className = cn
  }

  function addClass(el, name) {
    var cn = el.className;
    for (var i = 0, arr = name.match(/\S+/g); i < arr.length; i++) {
      if (!cn.match(new RegExp("(?:^|\\s)" + arr[i] + "(?!\\S)"))) {
        cn += " " + arr[i]
      }
    }
    el.className = cn
  }

  function normalize_background_color(str) {
    if (!str) return null;
    var rgb = [];
    var RGB_PATTERN = /^(?:rgb|rgba)?\(?(\d+),(\d+),(\d+).*\)?$/;
    var match_group = str.match(RGB_PATTERN);
    if (match_group) {
      var red = parseInt(match_group[1]);
      var green = parseInt(match_group[2]);
      var blue = parseInt(match_group[3]);
      rgb = [red, green, blue]
    } else {
      var HEX_PATTERN = /^#?([0-9A-F]{1,2})([0-9A-F]{1,2})([0-9A-F]{1,2})$/i;
      var match_group = str.match(HEX_PATTERN);
      if (match_group) {
        function hex_to_int(hex) {
          if (hex.length == 1) hex = hex + hex;
          return parseInt(hex, 16)
        }
        var red = hex_to_int(match_group[1]);
        var green = hex_to_int(match_group[2]);
        var blue = hex_to_int(match_group[3]);
        rgb = [red, green, blue]
      }
    }

    function valid_color(i) {
      return !isNaN(i) && i >= 0 && i <= 255
    }
    if (rgb && valid_color(rgb[0]) && valid_color(rgb[1]) && valid_color(rgb[2])) {
      return rgb
    }
    return null
  }
  var update_playing_element = function (el, percentage) {
    var color = SOUNDCITE_CONFIG.background_color || "0,0,0";
    if (SOUNDCITE_CONFIG.isRtl) {
      el.style.cssText = "background: -webkit-linear-gradient(right, rgba(" + color + ",.5)" + percentage + "%, rgba(" + color + ",.2)" + (percentage + 1) + "%);" + "background: linear-gradient(to left, rgba(" + color + ",.5)" + percentage + "%, rgba(" + color + ",.2)" + (percentage + 1) + "%);"
    }
    else {
      el.style.cssText = "background: -webkit-linear-gradient(left, rgba(" + color + ",.5)" + percentage + "%, rgba(" + color + ",.2)" + (percentage + 1) + "%);" + "background: linear-gradient(to right, rgba(" + color + ",.5)" + percentage + "%, rgba(" + color + ",.2)" + (percentage + 1) + "%);"
    }
  };
  window.soundcite = {};
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    soundcite.mobile = true
  } else {
    soundcite.mobile = false
  }
  var clips = [];
  var audio_container = document.createElement("div");
  addClass(audio_container, "soundcite-audio");
  document.getElementsByTagName("body")[0].appendChild(audio_container);
  if ($SoundCloud) {
    $SoundCloud.initialize({
      client_id: SOUNDCITE_CONFIG["soundcloud_client_id"]
    })
  }

  function pause_all_clips(except_clip) {
    for (var i = 0; i < clips.length; i++) {
      if (clips[i].playing) {
        if (!except_clip || except_clip.el !== clips[i].el) {
          clips[i].pause()
        }
      }
    }
  }

  function Clip(el) {
    this.el = el;
    this.start = el.hasAttribute("data-start") ? el.getAttribute("data-start") : 0;
    this.end = el.hasAttribute("data-end") ? el.getAttribute("data-end") : null;
    this.plays = el.hasAttribute("data-plays") ? parseInt(el.getAttribute("data-plays")) : 1;
    this.plays_left = this.plays;
    this.playing = false;
    this.sound = null;
    clips.push(this)
  }
  Clip.prototype.sound_loaded = function () {
    this.el.addEventListener("click", bind(this.click_handler, this));
    addClass(this.el, "soundcite-loaded soundcite-play")
  };
  Clip.prototype.pause = function () {
    removeClass(this.el, "soundcite-pause");
    addClass(this.el, "soundcite-play");
    this.pause_sound();
    this.playing = false
  };
  Clip.prototype.stop = function () {
    removeClass(this.el, "soundcite-pause");
    addClass(this.el, "soundcite-play");
    this.stop_sound();
    this.playing = false;
    this.plays_left = this.plays
  };
  Clip.prototype.track_progress = function () {
    var totalTime = this.end - this.start;
    var position = this.sound_position();
    var relative_position = position - this.start;
    var percentage = relative_position * 100 / totalTime;
    var update_function = SOUNDCITE_CONFIG.update_playing_element || update_playing_element;
    update_function(this.el, percentage)
  };
  Clip.prototype.click_handler = function (event) {
    event.preventDefault();
    pause_all_clips(this);
    if (this.playing) {
      this.pause()
    } else {
      this.play()
    }
  };

  function SoundCloudClip(el) {
    Clip.apply(this, Array.prototype.slice.call(arguments));
    this.id = el.getAttribute("data-id");
    $SoundCloud.stream(this.id, bind(function (sound) {
      this.sound = sound;
      this.sound._player.on("positionChange", bind(function (pos) {
        this.track_progress();
        if (pos >= this.end) {
          if (this.plays) {
            this.plays_left--;
            if (this.plays_left > 0) {
              this.play();
              this.track_position()
            } else {
              this.stop()
            }
          } else {
            this.play();
            this.track_position()
          }
        }
      }, this));
      if (this.end === null) {
        this.end = this.sound.getDuration()
      }
      this.sound_loaded()
    }, this))
  }
  SoundCloudClip.prototype = Object.create(Clip.prototype);
  SoundCloudClip.prototype.sound_position = function () {
    return this.sound.getCurrentPosition()
  };
  SoundCloudClip.prototype.pause_sound = function () {
    this.sound.pause()
  };
  SoundCloudClip.prototype.stop_sound = function () {
    this.sound.stop()
  };
  SoundCloudClip.prototype.play = function () {
    var pos = this.sound_position();
    if (pos < this.start || pos >= this.end) {
      this.sound.seek(this.start)
    }
    removeClass(this.el, "soundcite-play");
    addClass(this.el, "soundcite-pause");
    this.sound.play();
    this.playing = true
  };

  function PopcornClip(el) {
    Clip.apply(this, Array.prototype.slice.call(arguments));
    this.id = "soundcite-audio-" + clips.length;
    this.url = el.getAttribute("data-url");
    this.start = Math.floor(this.start / 1e3);
    if (this.end !== null) {
      this.end = Math.floor(this.end / 1e3)
    }
    var audio = document.createElement("audio");
    audio.id = this.id;
    audio.setAttribute("src", this.url);
    audio.setAttribute("preload", "true");
    audio_container.appendChild(audio);
    this.sound = $Popcorn("#" + this.id, {
      frameAnimation: true
    });
    this.sound.on("loadeddata", bind(function () {
      if (this.end === null) {
        this.end = this.sound.duration()
      }
      this.sound.cue(this.end, bind(function () {
        if (this.plays) {
          this.plays_left--;
          if (this.plays_left > 0) {
            this.sound.currentTime(this.start);
            this.play()
          } else {
            this.stop();
            this.sound.currentTime(this.start)
          }
        } else {
          this.sound.currentTime(this.start);
          this.play()
        }
      }, this));
      if (!soundcite.mobile) {
        this.sound_loaded()
      }
    }, this));
    if (soundcite.mobile) {
      this.sound_loaded()
    } else if (this.sound.readyState() > 1) {
      this.sound_loaded()
    }
  }
  PopcornClip.prototype = Object.create(Clip.prototype);
  PopcornClip.prototype.sound_position = function () {
    return this.sound.currentTime()
  };
  PopcornClip.prototype.pause_sound = function () {
    this.sound.pause();
    this.sound.off("timeupdate")
  };
  PopcornClip.prototype.stop_sound = function () {
    this.sound.pause();
    this.sound.off("timeupdate")
  };
  PopcornClip.prototype._play_sound = function () {
    removeClass(this.el, "soundcite-loading soundcite-play");
    addClass(this.el, "soundcite-pause");
    this.sound.play();
    this.playing = true;
    this.sound.on("timeupdate", bind(this.track_progress, this))
  };
  PopcornClip.prototype.play_sound = function () {
    var pos = this.sound.roundTime();
    if (pos < this.start || pos >= this.end) {
      this.sound.on("seeked", bind(function () {
        this.sound.off("seeked");
        this._play_sound()
      }, this));
      this.sound.currentTime(this.start)
    } else {
      this._play_sound()
    }
  };
  PopcornClip.prototype.play = function () {
    if (soundcite.mobile) {
      removeClass(this.el, "soundcite-play");
      addClass(this.el, "soundcite-loading");
      if (this.sound.readyState() > 1) {
        this.play_sound()
      } else {
        this.sound.on("canplaythrough", bind(function () {
          this.play_sound()
        }, this));
        document.getElementById(this.id).load()
      }
    } else {
      this.play_sound()
    }
  };
  for (var i = 0; i < soundcite_elements.length; i++) {
    var el = soundcite_elements[i];
    if (el.getAttribute("data-url")) {
      new PopcornClip(el)
    } else if (el.getAttribute("data-id")) {
      new SoundCloudClip(el)
    } else {
      console.log('Unable to form Soundcite element because of missing attributes. The offending Soundcite was "' + el.textContent + '."');
      console.log(el)
    }
  }
  soundcite.Clip = Clip;
  soundcite.SoundCloudClip = SoundCloudClip;
  soundcite.PopcornClip = PopcornClip;
  soundcite.clips = clips;
  soundcite.pause_all_clips = pause_all_clips;
  soundcite.normalize_background_color = normalize_background_color
});
