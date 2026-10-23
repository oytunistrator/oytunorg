(() => {
  const message = document.getElementById('not-found-message');
  const searchButton = document.getElementById('not-found-search');
  const musicButton = document.getElementById('not-found-music');

  if (!message || !searchButton || !musicButton) return;

  const searchResults = [
    'Found it! Just kidding. That was the homepage in a fake moustache.',
    'The page has taken a personal day. Its out-of-office reply is also missing.',
    'Search complete: one URL, zero pages, and one increasingly confused browser.',
    'We asked the server again. It said 404, but with more confidence this time.'
  ];
  let searchCount = 0;

  searchButton.addEventListener('click', () => {
    searchButton.disabled = true;
    message.textContent = 'Searching the entire internet...';

    window.setTimeout(() => {
      message.textContent = searchResults[searchCount % searchResults.length];
      searchCount += 1;
      searchButton.disabled = false;
    }, 700);
  });

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const notes = [659.25, 523.25, 392, 523.25, 440, 349.23, 293.66, 392];
  let audioContext = null;
  let musicTimer = null;
  let musicPlaying = false;

  if (!AudioContextClass) {
    musicButton.disabled = true;
    musicButton.textContent = 'This browser cannot play the tiny tune';
    return;
  }

  function playPhrase() {
    if (!musicPlaying || !audioContext) return;

    const phraseStart = audioContext.currentTime + 0.04;
    const noteLength = 0.17;

    notes.forEach((frequency, index) => {
      const startAt = phraseStart + index * 0.2;
      const oscillator = audioContext.createOscillator();
      const volume = audioContext.createGain();

      oscillator.type = 'square';
      oscillator.frequency.value = frequency;
      volume.gain.setValueAtTime(0.0001, startAt);
      volume.gain.exponentialRampToValueAtTime(0.035, startAt + 0.015);
      volume.gain.exponentialRampToValueAtTime(0.0001, startAt + noteLength);

      oscillator.connect(volume);
      volume.connect(audioContext.destination);
      oscillator.start(startAt);
      oscillator.stop(startAt + noteLength + 0.01);
      oscillator.addEventListener('ended', () => {
        oscillator.disconnect();
        volume.disconnect();
      }, { once: true });
    });

    musicTimer = window.setTimeout(playPhrase, notes.length * 200 + 120);
  }

  async function startMusic() {
    audioContext = new AudioContextClass();
    await audioContext.resume();
    musicPlaying = true;
    musicButton.textContent = 'Stop the tiny 404 tune';
    musicButton.setAttribute('aria-pressed', 'true');
    playPhrase();
  }

  function stopMusic() {
    musicPlaying = false;
    window.clearTimeout(musicTimer);
    musicTimer = null;

    if (audioContext) {
      const oldContext = audioContext;
      audioContext = null;
      if (oldContext.state !== 'closed') oldContext.close().catch(() => {});
    }

    musicButton.textContent = 'Play the tiny 404 tune';
    musicButton.setAttribute('aria-pressed', 'false');
  }

  musicButton.addEventListener('click', async () => {
    if (musicPlaying) {
      stopMusic();
      return;
    }

    musicButton.disabled = true;
    try {
      await startMusic();
    } catch {
      stopMusic();
      musicButton.textContent = 'The tiny tune is taking a day off';
    } finally {
      musicButton.disabled = false;
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && musicPlaying) stopMusic();
  });
})();
