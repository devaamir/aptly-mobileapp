// Web shim for react-native-sound — uses HTML5 Audio on web
class Sound {
  static setCategory() {}
  static enable() {}
  static enableInSilenceMode() {}
  static setActive() {}

  constructor(filename, basePath, onLoad) {
    this._audio = null;
    this._loaded = false;
    try {
      const src = basePath ? `${basePath}/${filename}` : filename;
      this._audio = new Audio(src);
      this._audio.addEventListener('canplaythrough', () => {
        this._loaded = true;
        onLoad?.(null);
      });
      this._audio.addEventListener('error', (e) => {
        onLoad?.(e);
      });
    } catch (e) {
      onLoad?.(e);
    }
  }

  play(cb) {
    if (this._audio) {
      this._audio.play().then(() => cb?.(true)).catch(() => cb?.(false));
    } else {
      cb?.(false);
    }
    return this;
  }

  pause(cb) {
    this._audio?.pause();
    cb?.();
    return this;
  }

  stop(cb) {
    if (this._audio) {
      this._audio.pause();
      this._audio.currentTime = 0;
    }
    cb?.();
    return this;
  }

  release() {
    this._audio = null;
  }

  setVolume(v) { if (this._audio) this._audio.volume = v; return this; }
  setNumberOfLoops(n) { if (this._audio) this._audio.loop = n !== 0; return this; }
  setCurrentTime(t) { if (this._audio) this._audio.currentTime = t; return this; }
  getCurrentTime(cb) { cb?.(this._audio?.currentTime ?? 0, true); }
  getDuration() { return this._audio?.duration ?? -1; }
  isLoaded() { return this._loaded; }
  isPlaying() { return this._audio ? !this._audio.paused : false; }
}

export default Sound;
