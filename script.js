"use strict";

const STORAGE_KEY = "recel-love-page:v2";
const PASSWORD_UNLOCK_KEY = "recel-love-page:password-unlocked";

const siteConfig = {
  unlockDate: "2026-02-14T00:00:00",
  knownSince: "2025-04-01T00:00:00",
  togetherSince: "2025-07-08T00:00:00",
  passwordGate: {
    enabled: true,
    password: "070825",
    hint: "Enter our anniversary in MMDDYY format.",
    rememberUnlock: false
  },
  video: {
    embedUrl: "",
    title: "Video message"
  },
  emailShare: {
    subject: "A little page made with love",
    body:
      "I made this page just for you.\n\n" +
      "Here is a little link made with love:\n"
  }
};

const defaultState = {
  theme: "light",
  volume: 55,
  effectsEnabled: true,
  envelopeOpen: false,
  giftOpen: false,
  navOpen: false,
  loveLetterOpen: false,
  openWhen: {},
  revealedReasons: 0,
  lastDailyReasonIndex: -1,
  messages: []
};

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const finePointer = window.matchMedia("(pointer:fine)");

const root = document.documentElement;
const body = document.body;

body.classList.remove("no-js");
body.classList.add("js-ready");

const elements = {
  bgMusic: document.getElementById("bgMusic"),
  cdDays: document.getElementById("cdDays"),
  cdHours: document.getElementById("cdHours"),
  cdMinutes: document.getElementById("cdMinutes"),
  cdSeconds: document.getElementById("cdSeconds"),
  confettiLayer: document.getElementById("confettiLayer"),
  currentTime: document.getElementById("currentTime"),
  dailyReasonBadge: document.getElementById("dailyReasonBadge"),
  dailyReasonText: document.getElementById("dailyReasonText"),
  dailyReasonTitle: document.getElementById("dailyReasonTitle"),
  durationTime: document.getElementById("durationTime"),
  emailShareButton: document.getElementById("emailShareButton"),
  envelopeSurprise: document.getElementById("envelopeSurprise"),
  envelopeTrigger: document.getElementById("envelopeTrigger"),
  effectsToggle: document.getElementById("effectsToggle"),
  finalMessage: document.getElementById("finalMessage"),
  floatingHearts: document.getElementById("floatingHearts"),
  galleryCaption: document.getElementById("galleryCaption"),
  galleryNext: document.getElementById("galleryNext"),
  galleryPrev: document.getElementById("galleryPrev"),
  galleryThumbs: document.getElementById("galleryThumbs"),
  giftCard: document.getElementById("giftCard"),
  giftRevealButton: document.getElementById("giftRevealButton"),
  heartCursor: document.getElementById("heartCursor"),
  heroNote: document.getElementById("heroNote"),
  introScreen: document.getElementById("introScreen"),
  introSkip: document.getElementById("introSkip"),
  knownDays: document.getElementById("knownDays"),
  letterRevealButton: document.getElementById("letterRevealButton"),
  lightboxCaption: document.getElementById("lightboxCaption"),
  lightboxClose: document.getElementById("lightboxClose"),
  lightboxImage: document.getElementById("lightboxImage"),
  lightboxNext: document.getElementById("lightboxNext"),
  lightboxOverlay: document.getElementById("lightboxOverlay"),
  lightboxPrev: document.getElementById("lightboxPrev"),
  lockOverlay: document.getElementById("lockOverlay"),
  loveButton: document.getElementById("loveButton"),
  loveLetterBody: document.getElementById("loveLetterBody"),
  loveLetterCard: document.getElementById("loveLetterCard"),
  loveTimer: document.getElementById("loveTimer"),
  messageEmpty: document.getElementById("messageEmpty"),
  messageForm: document.getElementById("messageForm"),
  messageList: document.getElementById("messageList"),
  messageName: document.getElementById("messageName"),
  messageText: document.getElementById("messageText"),
  musicSeek: document.getElementById("musicSeek"),
  musicStatus: document.getElementById("musicStatus"),
  musicToggle: document.getElementById("musicToggle"),
  musicVolume: document.getElementById("musicVolume"),
  navToggle: document.getElementById("navToggle"),
  passwordFeedback: document.getElementById("passwordFeedback"),
  passwordForm: document.getElementById("passwordForm"),
  passwordHintText: document.getElementById("passwordHintText"),
  passwordInput: document.getElementById("passwordInput"),
  passwordOverlay: document.getElementById("passwordOverlay"),
  photoTrack: document.getElementById("photoTrack"),
  reasonEmptyState: document.getElementById("reasonEmptyState"),
  reasonNext: document.getElementById("reasonNext"),
  reasonPrev: document.getElementById("reasonPrev"),
  reasonProgress: document.getElementById("reasonProgress"),
  reasonsCount: document.getElementById("reasonsCount"),
  reasonsTrack: document.getElementById("reasonsTrack"),
  siteNav: document.getElementById("siteNav"),
  themeToggle: document.getElementById("themeToggle"),
  toastRegion: document.getElementById("toastRegion"),
  togetherDays: document.getElementById("togetherDays"),
  unlockDateLabel: document.getElementById("unlockDateLabel"),
  videoFrame: document.getElementById("videoFrame"),
  videoFrameWrap: document.getElementById("videoFrameWrap"),
  videoPlaceholder: document.getElementById("videoPlaceholder")
};

const reasonSlides = Array.from(document.querySelectorAll("[data-slide]"));
const photoSlides = Array.from(document.querySelectorAll("[data-photo-slide]"));
const letterLines = Array.from(document.querySelectorAll("[data-letter-line]"));
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const openWhenCards = Array.from(document.querySelectorAll("[data-open-when]"));
const burstTargets = Array.from(document.querySelectorAll(".burst-on-click"));

const knownSinceDate = new Date(siteConfig.knownSince);
const relationshipSinceDate = new Date(siteConfig.togetherSince);
const unlockDate = new Date(siteConfig.unlockDate);

let state = loadState();
let activeReasonIndex = 0;
let activePhotoIndex = 0;
let countdownTimer = null;
let storageWarningShown = false;
let finaleTriggered = state.revealedReasons >= reasonSlides.length;
let parallaxX = 0;
let parallaxY = 0;
let photoScrollLockUntil = 0;
let photoScrollTargetIndex = 0;
let currentLightboxIndex = 0;
let introTimer = null;
let letterTimers = [];

init();

function init() {
  state.revealedReasons = clamp(state.revealedReasons, 0, reasonSlides.length);
  state.volume = clamp(Number(state.volume) || defaultState.volume, 0, 100);
  state.effectsEnabled = state.effectsEnabled !== false;
  state.openWhen = state.openWhen && typeof state.openWhen === "object" ? state.openWhen : {};

  bindMediaQuery(prefersReducedMotion, handleMotionPreferenceChange);
  bindMediaQuery(finePointer, updateCursorMode);

  initializeIntro();
  initializeTheme();
  initializeNavigation();
  initializeEffectsToggle();
  initializeCounters();
  initializeAudio();
  initializeEnvelope();
  initializeGiftReveal();
  initializeLoveLetter();
  initializeOpenWhenCards();
  initializeReasons();
  initializeReasonOfTheVisit();
  initializeGallery();
  initializeLightbox();
  initializeMessages();
  initializeEmailShare();
  initializeVideoEmbed();
  initializeRevealObserver();
  initializeButtonBursts();
  initializeAmbientEffects();
  initializeAccessGates();
  renderMessages();
  safeTrack("page_loaded");
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return { ...defaultState };
    }

    const parsed = JSON.parse(raw);

    return {
      ...defaultState,
      ...parsed,
      openWhen: parsed.openWhen && typeof parsed.openWhen === "object" ? parsed.openWhen : {},
      messages: sanitizeMessages(parsed.messages)
    };
  } catch (error) {
    return { ...defaultState };
  }
}

function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (error) {
    if (!storageWarningShown) {
      storageWarningShown = true;
      showToast("Some page preferences could not be saved.");
    }

    return false;
  }
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((entry) => ({
      id: String(entry.id || Date.now()),
      name: String(entry.name || "").slice(0, 40),
      message: String(entry.message || "").slice(0, 280),
      createdAt: typeof entry.createdAt === "string" ? entry.createdAt : new Date().toISOString()
    }))
    .filter((entry) => entry.name && entry.message);
}

function bindMediaQuery(query, handler) {
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return;
  }

  if (typeof query.addListener === "function") {
    query.addListener(handler);
  }
}

function safeTrack(eventName, payload = {}) {
  try {
    if (typeof window.lovePageAnalytics === "function") {
      window.lovePageAnalytics(eventName, payload);
    }
  } catch (error) {
    return undefined;
  }

  return undefined;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatTwoDigits(value) {
  return String(value).padStart(2, "0");
}

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return "0:00";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function getDaysSince(startDate) {
  const difference = Math.max(Date.now() - startDate.getTime(), 0);
  return Math.floor(difference / (1000 * 60 * 60 * 24));
}

function getDurationParts(startDate) {
  const difference = Math.max(Date.now() - startDate.getTime(), 0);
  const totalSeconds = Math.floor(difference / 1000);

  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60
  };
}

function showToast(message) {
  if (!elements.toastRegion) {
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  elements.toastRegion.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add("is-leaving");

    window.setTimeout(() => {
      toast.remove();
    }, 220);
  }, 2800);
}

function initializeIntro() {
  if (!elements.introScreen || !elements.introSkip) {
    body.classList.remove("intro-pending");
    return;
  }

  const closeIntro = () => {
    if (!body.classList.contains("intro-pending")) {
      return;
    }

    body.classList.remove("intro-pending");
    elements.introScreen.setAttribute("aria-hidden", "true");

    if (introTimer) {
      window.clearTimeout(introTimer);
      introTimer = null;
    }
  };

  elements.introSkip.addEventListener("click", closeIntro);
  elements.introScreen.addEventListener("click", (event) => {
    if (event.target === elements.introScreen) {
      closeIntro();
    }
  });

  introTimer = window.setTimeout(closeIntro, prefersReducedMotion.matches ? 800 : 1700);
}

function initializeTheme() {
  setTheme(state.theme, false);

  elements.themeToggle.addEventListener("click", () => {
    const nextTheme = body.dataset.theme === "dark" ? "light" : "dark";
    setTheme(nextTheme, true);
  });
}

function setTheme(theme, shouldNotify) {
  const normalizedTheme = theme === "dark" ? "dark" : "light";
  body.dataset.theme = normalizedTheme;
  state.theme = normalizedTheme;
  elements.themeToggle.setAttribute("aria-pressed", String(normalizedTheme === "dark"));
  elements.themeToggle.textContent = normalizedTheme === "dark" ? "Light Mode" : "Dark Mode";
  persistState();

  if (shouldNotify) {
    showToast(normalizedTheme === "dark" ? "Dark mode enabled." : "Light mode enabled.");
    safeTrack("theme_changed", { theme: normalizedTheme });
  }
}

function initializeEffectsToggle() {
  if (!elements.effectsToggle) {
    return;
  }

  setEffectsEnabled(state.effectsEnabled, false);

  elements.effectsToggle.addEventListener("click", () => {
    setEffectsEnabled(!state.effectsEnabled, true);
  });
}

function setEffectsEnabled(enabled, shouldNotify) {
  state.effectsEnabled = Boolean(enabled);
  body.classList.toggle("effects-muted", !state.effectsEnabled);
  elements.effectsToggle.setAttribute("aria-pressed", String(state.effectsEnabled));
  elements.effectsToggle.textContent = state.effectsEnabled ? "Effects On" : "Effects Off";

  if (!state.effectsEnabled) {
    elements.floatingHearts.innerHTML = "";
    root.style.setProperty("--parallax-x", "0px");
    root.style.setProperty("--parallax-y", "0px");
  } else {
    createFloatingHearts();
  }

  updateCursorMode();
  persistState();

  if (shouldNotify) {
    showToast(state.effectsEnabled ? "Floating effects are back on." : "Floating effects have been softened.");
    safeTrack("effects_toggle", { enabled: state.effectsEnabled });
  }
}

function initializeNavigation() {
  setNavigationOpen(window.innerWidth <= 760 ? state.navOpen : false, false);

  elements.navToggle.addEventListener("click", () => {
    setNavigationOpen(!elements.siteNav.classList.contains("is-open"), true);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth <= 760) {
        setNavigationOpen(false, true);
      }
    });
  });

  document.addEventListener("click", (event) => {
    if (window.innerWidth > 760 || !elements.siteNav.classList.contains("is-open")) {
      return;
    }

    if (elements.siteNav.contains(event.target) || elements.navToggle.contains(event.target)) {
      return;
    }

    setNavigationOpen(false, true);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) {
      setNavigationOpen(false, false);
    } else {
      setNavigationOpen(state.navOpen, false);
    }
  });
}

function setNavigationOpen(isOpen, shouldSave) {
  elements.siteNav.classList.toggle("is-open", isOpen);
  elements.navToggle.setAttribute("aria-expanded", String(isOpen));
  elements.navToggle.textContent = isOpen ? "Close Menu" : "Menu";

  if (shouldSave) {
    state.navOpen = isOpen;
    persistState();
  }
}

function initializeCounters() {
  updateMemoryCounters();
  window.setInterval(updateMemoryCounters, 1000);
}

function updateMemoryCounters() {
  const liveDuration = getDurationParts(relationshipSinceDate);

  elements.knownDays.textContent = `${getDaysSince(knownSinceDate)} days`;
  elements.togetherDays.textContent = `${getDaysSince(relationshipSinceDate)} days`;
  elements.loveTimer.textContent =
    `${liveDuration.days}d ${formatTwoDigits(liveDuration.hours)}h ` +
    `${formatTwoDigits(liveDuration.minutes)}m ${formatTwoDigits(liveDuration.seconds)}s`;
}

function initializeAudio() {
  elements.musicVolume.value = String(state.volume);
  elements.bgMusic.volume = state.volume / 100;
  updatePlaybackButton();
  updateTimeDisplay();

  elements.musicToggle.addEventListener("click", toggleMusicPlayback);
  elements.musicVolume.addEventListener("input", handleVolumeChange);
  elements.musicSeek.addEventListener("input", handleSeekInput);
  elements.bgMusic.addEventListener("loadedmetadata", handleAudioMetadata);
  elements.bgMusic.addEventListener("timeupdate", updateTimeDisplay);
  elements.bgMusic.addEventListener("play", handleAudioPlayStateChange);
  elements.bgMusic.addEventListener("pause", handleAudioPlayStateChange);
  elements.bgMusic.addEventListener("error", handleAudioError);
}

async function toggleMusicPlayback() {
  if (elements.bgMusic.paused) {
    try {
      await elements.bgMusic.play();
      setMusicStatus("Playing softly in the background.", false);
      showToast("Music started.");
      safeTrack("audio_play");
    } catch (error) {
      setMusicStatus("Playback was paused for now. Tap again to start the song.", true);
      showToast("Playback needs another tap.");
      safeTrack("audio_play_failed");
    }
  } else {
    elements.bgMusic.pause();
    setMusicStatus("Paused for now.", false);
    safeTrack("audio_pause");
  }

  updatePlaybackButton();
}

function handleAudioPlayStateChange() {
  updatePlaybackButton();
}

function updatePlaybackButton() {
  const isPlaying = !elements.bgMusic.paused;
  elements.musicToggle.textContent = isPlaying ? "Pause Our Song ❚❚" : "Play Our Song ♪";
  elements.musicToggle.setAttribute("aria-pressed", String(isPlaying));
}

function handleVolumeChange() {
  const nextVolume = clamp(Number(elements.musicVolume.value) || 0, 0, 100);
  elements.bgMusic.volume = nextVolume / 100;
  state.volume = nextVolume;
  persistState();
}

function handleSeekInput() {
  if (!Number.isFinite(elements.bgMusic.duration)) {
    return;
  }

  elements.bgMusic.currentTime = Number(elements.musicSeek.value) || 0;
  updateTimeDisplay();
}

function handleAudioMetadata() {
  elements.musicSeek.max = String(elements.bgMusic.duration || 0);
  updateTimeDisplay();
  setMusicStatus("Ready when you are.", false);
}

function updateTimeDisplay() {
  elements.currentTime.textContent = formatTime(elements.bgMusic.currentTime);
  elements.durationTime.textContent = formatTime(elements.bgMusic.duration);

  if (Number.isFinite(elements.bgMusic.duration)) {
    elements.musicSeek.max = String(elements.bgMusic.duration);
    elements.musicSeek.value = String(elements.bgMusic.currentTime);
  }
}

function handleAudioError() {
  elements.musicToggle.disabled = true;
  elements.musicSeek.disabled = true;
  setMusicStatus("The audio file could not be played. Check that To The Bone.mp3 is available.", true);
  showToast("Audio file could not be played.");
  safeTrack("audio_error");
}

function setMusicStatus(message, isError) {
  elements.musicStatus.textContent = message;
  elements.musicStatus.classList.toggle("is-error", Boolean(isError));
}

function initializeEnvelope() {
  setEnvelopeOpen(Boolean(state.envelopeOpen), false);

  elements.envelopeTrigger.addEventListener("click", () => {
    const nextState = !elements.envelopeSurprise.classList.contains("open");
    setEnvelopeOpen(nextState, true);

    if (nextState) {
      showToast("Secret envelope opened.");
      safeTrack("envelope_opened");
    }
  });
}

function setEnvelopeOpen(isOpen, shouldSave) {
  elements.envelopeSurprise.classList.toggle("open", isOpen);
  elements.envelopeTrigger.setAttribute("aria-expanded", String(isOpen));

  if (shouldSave) {
    state.envelopeOpen = isOpen;
    persistState();
  }
}

function initializeGiftReveal() {
  setGiftOpen(Boolean(state.giftOpen), false);

  elements.giftRevealButton.addEventListener("click", () => {
    const nextState = !elements.giftCard.classList.contains("is-open");
    setGiftOpen(nextState, true);

    if (nextState) {
      showToast("Gift opened.");
      launchConfetti({ count: 48, originX: 62 });
      safeTrack("gift_opened");
    }
  });
}

function setGiftOpen(isOpen, shouldSave) {
  elements.giftCard.classList.toggle("is-open", isOpen);
  elements.giftRevealButton.setAttribute("aria-expanded", String(isOpen));

  if (shouldSave) {
    state.giftOpen = isOpen;
    persistState();
  }
}

function initializeLoveLetter() {
  if (!elements.letterRevealButton || !elements.loveLetterCard) {
    return;
  }

  setLoveLetterOpen(Boolean(state.loveLetterOpen), false, false);

  elements.letterRevealButton.addEventListener("click", () => {
    if (state.loveLetterOpen) {
      replayLoveLetter();
      showToast("The letter is unfolding again.");
      return;
    }

    setLoveLetterOpen(true, true, true);
    showToast("Your letter is opening.");
    safeTrack("love_letter_opened");
  });
}

function setLoveLetterOpen(isOpen, shouldSave, animate) {
  state.loveLetterOpen = Boolean(isOpen);
  elements.loveLetterCard.classList.toggle("is-open", state.loveLetterOpen);
  elements.letterRevealButton.setAttribute("aria-expanded", String(state.loveLetterOpen));
  elements.letterRevealButton.textContent = state.loveLetterOpen ? "Read it again slowly" : "Open my letter";

  clearLoveLetterTimers();
  letterLines.forEach((line) => line.classList.remove("is-visible"));

  if (state.loveLetterOpen) {
    if (animate) {
      replayLoveLetter();
    } else {
      letterLines.forEach((line) => line.classList.add("is-visible"));
    }
  }

  if (shouldSave) {
    persistState();
  }
}

function replayLoveLetter() {
  clearLoveLetterTimers();
  letterLines.forEach((line) => line.classList.remove("is-visible"));

  letterLines.forEach((line, index) => {
    const timer = window.setTimeout(() => {
      line.classList.add("is-visible");
    }, 160 + index * 430);

    letterTimers.push(timer);
  });
}

function clearLoveLetterTimers() {
  letterTimers.forEach((timer) => window.clearTimeout(timer));
  letterTimers = [];
}

function initializeOpenWhenCards() {
  if (!openWhenCards.length) {
    return;
  }

  openWhenCards.forEach((card) => {
    const key = card.dataset.openWhen || "";
    card.open = Boolean(state.openWhen[key]);

    card.addEventListener("toggle", () => {
      state.openWhen = {
        ...state.openWhen,
        [key]: card.open
      };
      persistState();
    });
  });
}

function initializeReasonOfTheVisit() {
  if (!elements.dailyReasonTitle || !elements.dailyReasonText || !elements.dailyReasonBadge) {
    return;
  }

  const reasonEntries = reasonSlides.map((slide, index) => ({
    badge: slide.querySelector(".reason-badge")?.textContent?.trim() || formatTwoDigits(index + 1),
    title: slide.querySelector("h3")?.textContent?.trim() || "A little reason",
    text: slide.querySelector(".reason-text")?.textContent?.trim() || ""
  }));

  if (!reasonEntries.length) {
    return;
  }

  const nextIndex = getNextRandomIndex(reasonEntries.length, Number(state.lastDailyReasonIndex));
  const reason = reasonEntries[nextIndex];

  state.lastDailyReasonIndex = nextIndex;
  persistState();

  elements.dailyReasonBadge.textContent = reason.badge;
  elements.dailyReasonTitle.textContent = reason.title;
  elements.dailyReasonText.textContent = reason.text;
}

function getNextRandomIndex(length, previousIndex) {
  if (length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * length);

  while (nextIndex === previousIndex) {
    nextIndex = Math.floor(Math.random() * length);
  }

  return nextIndex;
}

function initializeReasons() {
  renderReasons();

  elements.loveButton.addEventListener("click", revealNextReason);
  elements.reasonPrev.addEventListener("click", () => goToReasonSlide(activeReasonIndex - 1));
  elements.reasonNext.addEventListener("click", () => goToReasonSlide(activeReasonIndex + 1));
  elements.reasonsTrack.addEventListener("scroll", handleReasonTrackScroll, { passive: true });
  elements.reasonsTrack.addEventListener("keydown", handleReasonTrackKeydown);
}

function revealNextReason() {
  if (state.revealedReasons >= reasonSlides.length) {
    return;
  }

  state.revealedReasons += 1;
  persistState();
  renderReasons();
  goToReasonSlide(state.revealedReasons - 1);
  showToast(`Reason ${state.revealedReasons} revealed.`);
  safeTrack("reason_revealed", { count: state.revealedReasons });
}

function renderReasons() {
  reasonSlides.forEach((slide, index) => {
    slide.classList.toggle("is-locked", index >= state.revealedReasons);
  });

  const revealedSlides = getVisibleReasonSlides();
  const totalReasons = reasonSlides.length;

  elements.reasonEmptyState.hidden = revealedSlides.length !== 0;
  elements.reasonProgress.textContent = `${state.revealedReasons} of ${totalReasons} reasons revealed`;
  elements.reasonsCount.textContent = `${state.revealedReasons} / ${totalReasons}`;

  if (revealedSlides.length === 0) {
    activeReasonIndex = 0;
  } else {
    activeReasonIndex = clamp(activeReasonIndex, 0, revealedSlides.length - 1);
  }

  const isComplete = state.revealedReasons >= totalReasons;
  elements.finalMessage.classList.toggle("show", isComplete);
  elements.loveButton.disabled = isComplete;
  elements.loveButton.textContent = isComplete ? "Forever & Always ❤️" : "Reveal Another Reason";
  elements.heroNote.textContent = isComplete
    ? "Every reason is here now, and every one is true."
    : state.revealedReasons === 0
      ? "Press the button and we’ll uncover them one by one."
      : `Reason ${state.revealedReasons + 1} is waiting when you're ready.`;

  elements.reasonPrev.disabled = revealedSlides.length <= 1 || activeReasonIndex <= 0;
  elements.reasonNext.disabled = revealedSlides.length <= 1 || activeReasonIndex >= revealedSlides.length - 1;

  if (revealedSlides.length > 0) {
    const targetSlide = revealedSlides[activeReasonIndex];

    requestAnimationFrame(() => {
      if (targetSlide) {
        scrollTrackToSlide(elements.reasonsTrack, targetSlide, false);
      }
    });
  }

  if (isComplete && !finaleTriggered) {
    finaleTriggered = true;
    launchConfetti({ count: 170, originX: 50 });
    showToast("All the reasons are revealed.");
    safeTrack("reasons_completed");
  }
}

function getVisibleReasonSlides() {
  return reasonSlides.filter((slide) => !slide.classList.contains("is-locked"));
}

function goToReasonSlide(index) {
  const slides = getVisibleReasonSlides();

  if (!slides.length) {
    return;
  }

  activeReasonIndex = clamp(index, 0, slides.length - 1);
  scrollTrackToSlide(elements.reasonsTrack, slides[activeReasonIndex], true);
  updateReasonButtons();
}

function updateReasonButtons() {
  const slides = getVisibleReasonSlides();
  elements.reasonPrev.disabled = slides.length <= 1 || activeReasonIndex <= 0;
  elements.reasonNext.disabled = slides.length <= 1 || activeReasonIndex >= slides.length - 1;
}

function handleReasonTrackScroll() {
  const slides = getVisibleReasonSlides();

  if (!slides.length) {
    return;
  }

  activeReasonIndex = getClosestSlideIndex(elements.reasonsTrack, slides);
  updateReasonButtons();
}

function handleReasonTrackKeydown(event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goToReasonSlide(activeReasonIndex + 1);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goToReasonSlide(activeReasonIndex - 1);
  }
}

function initializeGallery() {
  buildGalleryThumbnails();
  goToPhotoSlide(0, false);

  elements.galleryPrev.addEventListener("click", () => goToPhotoSlide(activePhotoIndex - 1, true));
  elements.galleryNext.addEventListener("click", () => goToPhotoSlide(activePhotoIndex + 1, true));
  elements.photoTrack.addEventListener("scroll", handlePhotoTrackScroll, { passive: true });
  elements.photoTrack.addEventListener("keydown", handlePhotoTrackKeydown);
}

function buildGalleryThumbnails() {
  const fragment = document.createDocumentFragment();

  photoSlides.forEach((slide, index) => {
    const button = document.createElement("button");
    const thumbnail = slide.querySelector("img").cloneNode(false);

    button.type = "button";
    button.className = "thumbnail-button";
    button.setAttribute("aria-label", `Show photo ${index + 1}`);
    button.appendChild(thumbnail);
    button.addEventListener("click", () => goToPhotoSlide(index, true));
    fragment.appendChild(button);
  });

  elements.galleryThumbs.appendChild(fragment);
}

function goToPhotoSlide(index, smooth) {
  activePhotoIndex = clamp(index, 0, photoSlides.length - 1);
  photoScrollTargetIndex = activePhotoIndex;
  photoScrollLockUntil = smooth && !prefersReducedMotion.matches ? Date.now() + 380 : 0;
  scrollTrackToSlide(elements.photoTrack, photoSlides[activePhotoIndex], smooth);
  updateGalleryUI();
}

function handlePhotoTrackScroll() {
  if (Date.now() < photoScrollLockUntil) {
    activePhotoIndex = photoScrollTargetIndex;
    updateGalleryUI();
    return;
  }

  activePhotoIndex = getClosestSlideIndex(elements.photoTrack, photoSlides);
  updateGalleryUI();
}

function handlePhotoTrackKeydown(event) {
  if (event.key === "ArrowRight") {
    event.preventDefault();
    goToPhotoSlide(activePhotoIndex + 1, true);
  }

  if (event.key === "ArrowLeft") {
    event.preventDefault();
    goToPhotoSlide(activePhotoIndex - 1, true);
  }
}

function updateGalleryUI() {
  const thumbnailButtons = Array.from(elements.galleryThumbs.querySelectorAll(".thumbnail-button"));
  const activeSlide = photoSlides[activePhotoIndex];
  const caption = activeSlide.querySelector("figcaption");

  elements.galleryPrev.disabled = activePhotoIndex <= 0;
  elements.galleryNext.disabled = activePhotoIndex >= photoSlides.length - 1;
  elements.galleryCaption.textContent = caption ? caption.textContent : "";

  thumbnailButtons.forEach((button, index) => {
    button.setAttribute("aria-current", String(index === activePhotoIndex));
  });
}

function initializeLightbox() {
  if (
    !elements.lightboxOverlay ||
    !elements.lightboxImage ||
    !elements.lightboxCaption ||
    !elements.lightboxClose ||
    !elements.lightboxPrev ||
    !elements.lightboxNext
  ) {
    return;
  }

  photoSlides.forEach((slide, index) => {
    const caption = slide.querySelector("figcaption")?.textContent?.trim() || `Photo ${index + 1}`;

    slide.setAttribute("role", "button");
    slide.setAttribute("tabindex", "0");
    slide.setAttribute("aria-label", `Open photo larger: ${caption}`);

    slide.addEventListener("click", () => openLightbox(index));
    slide.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openLightbox(index);
      }
    });
  });

  elements.lightboxClose.addEventListener("click", closeLightbox);
  elements.lightboxPrev.addEventListener("click", () => openLightbox(currentLightboxIndex - 1));
  elements.lightboxNext.addEventListener("click", () => openLightbox(currentLightboxIndex + 1));
  elements.lightboxOverlay.addEventListener("click", (event) => {
    if (event.target === elements.lightboxOverlay) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", handleLightboxKeydown);
}

function openLightbox(index) {
  currentLightboxIndex = clamp(index, 0, photoSlides.length - 1);

  const activeSlide = photoSlides[currentLightboxIndex];
  const image = activeSlide.querySelector("img");
  const caption = activeSlide.querySelector("figcaption")?.textContent?.trim() || image.alt;

  elements.lightboxImage.src = image.currentSrc || image.src;
  elements.lightboxImage.alt = image.alt;
  elements.lightboxCaption.textContent = caption;
  elements.lightboxOverlay.hidden = false;
  body.classList.add("has-modal");
  updateLightboxControls();
  elements.lightboxClose.focus();
}

function closeLightbox() {
  if (!elements.lightboxOverlay || elements.lightboxOverlay.hidden) {
    return;
  }

  elements.lightboxOverlay.hidden = true;
  body.classList.remove("has-modal");
}

function updateLightboxControls() {
  elements.lightboxPrev.disabled = currentLightboxIndex <= 0;
  elements.lightboxNext.disabled = currentLightboxIndex >= photoSlides.length - 1;
}

function handleLightboxKeydown(event) {
  if (!elements.lightboxOverlay || elements.lightboxOverlay.hidden) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    closeLightbox();
  }

  if (event.key === "ArrowLeft" && currentLightboxIndex > 0) {
    event.preventDefault();
    openLightbox(currentLightboxIndex - 1);
  }

  if (event.key === "ArrowRight" && currentLightboxIndex < photoSlides.length - 1) {
    event.preventDefault();
    openLightbox(currentLightboxIndex + 1);
  }
}

function scrollTrackToSlide(track, slide, smooth) {
  const behavior = smooth && !prefersReducedMotion.matches ? "smooth" : "auto";
  track.scrollTo({
    left: slide.offsetLeft,
    behavior
  });
}

function getClosestSlideIndex(track, slides) {
  const trackLeft = track.scrollLeft;
  let bestIndex = 0;
  let bestDistance = Number.POSITIVE_INFINITY;

  slides.forEach((slide, index) => {
    const distance = Math.abs(slide.offsetLeft - trackLeft);

    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function initializeMessages() {
  elements.messageForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = elements.messageName.value.trim();
    const message = elements.messageText.value.trim();

    if (!name || !message) {
      showToast("Please fill in both message fields.");
      return;
    }

    const entry = {
      id:
        window.crypto && typeof window.crypto.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.slice(0, 40),
      message: message.slice(0, 280),
      createdAt: new Date().toISOString()
    };

    state.messages.unshift(entry);
    persistState();
    renderMessages();
    elements.messageForm.reset();
    showToast("Your message was saved.");
    safeTrack("message_saved");
  });
}

function renderMessages() {
  elements.messageList.innerHTML = "";

  if (!state.messages.length) {
    elements.messageEmpty.hidden = false;
    return;
  }

  elements.messageEmpty.hidden = true;

  state.messages.forEach((entry) => {
    const item = document.createElement("li");
    const meta = document.createElement("div");
    const strong = document.createElement("strong");
    const date = document.createElement("span");
    const deleteButton = document.createElement("button");
    const message = document.createElement("p");

    item.className = "message-item";
    meta.className = "message-meta";
    date.className = "message-date";
    deleteButton.className = "delete-button";
    deleteButton.type = "button";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", () => deleteMessage(entry.id));

    strong.textContent = entry.name;
    date.textContent = new Date(entry.createdAt).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric"
    });

    message.textContent = entry.message;

    meta.appendChild(strong);
    meta.appendChild(date);
    meta.appendChild(deleteButton);
    item.appendChild(meta);
    item.appendChild(message);
    elements.messageList.appendChild(item);
  });
}

function deleteMessage(messageId) {
  state.messages = state.messages.filter((entry) => entry.id !== messageId);
  persistState();
  renderMessages();
  showToast("Message removed.");
  safeTrack("message_deleted");
}

function initializeEmailShare() {
  elements.emailShareButton.addEventListener("click", () => {
    const pageUrl =
      window.location.protocol === "file:"
        ? "[Paste your page link here]"
        : window.location.href;

    const subject = encodeURIComponent(siteConfig.emailShare.subject);
    const bodyText = `${siteConfig.emailShare.body}\n${pageUrl}`;
    const bodyValue = encodeURIComponent(bodyText);
    window.location.href = `mailto:?subject=${subject}&body=${bodyValue}`;
    showToast("Opening your email app.");
    safeTrack("email_share");
  });
}

function initializeVideoEmbed() {
  if (!elements.videoPlaceholder || !elements.videoFrame || !elements.videoFrameWrap) {
    return;
  }

  const embedUrl = siteConfig.video.embedUrl.trim();

  if (!embedUrl) {
    return;
  }

  if (!/^https?:\/\//i.test(embedUrl)) {
    elements.videoPlaceholder.textContent =
      "The video link needs to start with http:// or https://.";
    return;
  }

  elements.videoFrame.src = embedUrl;
  elements.videoFrame.title = siteConfig.video.title;
  elements.videoPlaceholder.hidden = true;
  elements.videoFrameWrap.hidden = false;
}

function initializeRevealObserver() {
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!("IntersectionObserver" in window) || prefersReducedMotion.matches) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.16
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

function initializeButtonBursts() {
  burstTargets.forEach((button) => {
    button.addEventListener("click", () => {
      if (prefersReducedMotion.matches) {
        return;
      }

      launchParticleBurstFromElement(button);
    });
  });
}

function initializeAmbientEffects() {
  updateCursorMode();
  createFloatingHearts();

  window.addEventListener("pointermove", handlePointerMove, { passive: true });
  window.addEventListener("scroll", applyParallax, { passive: true });
  window.addEventListener("click", handleWindowHeartBurst);
}

function handleMotionPreferenceChange() {
  if (prefersReducedMotion.matches || !state.effectsEnabled) {
    elements.floatingHearts.innerHTML = "";
    root.style.setProperty("--parallax-x", "0px");
    root.style.setProperty("--parallax-y", "0px");
  } else {
    createFloatingHearts();
  }

  updateCursorMode();
}

function updateCursorMode() {
  const enableFancyCursor = finePointer.matches && !prefersReducedMotion.matches && state.effectsEnabled;
  body.classList.toggle("cursor-fancy", enableFancyCursor);
}

function handlePointerMove(event) {
  if (body.classList.contains("cursor-fancy")) {
    elements.heartCursor.style.left = `${event.clientX}px`;
    elements.heartCursor.style.top = `${event.clientY}px`;
  }

  if (prefersReducedMotion.matches || !state.effectsEnabled) {
    return;
  }

  parallaxX = (event.clientX / window.innerWidth - 0.5) * 14;
  parallaxY = (event.clientY / window.innerHeight - 0.5) * 10;
  applyParallax();
}

function applyParallax() {
  if (prefersReducedMotion.matches || !state.effectsEnabled) {
    return;
  }

  const scrollShift = clamp(window.scrollY * -0.03, -18, 18);
  root.style.setProperty("--parallax-x", `${parallaxX}px`);
  root.style.setProperty("--parallax-y", `${parallaxY + scrollShift}px`);
}

function createFloatingHearts() {
  elements.floatingHearts.innerHTML = "";

  if (prefersReducedMotion.matches || !state.effectsEnabled) {
    return;
  }

  for (let index = 0; index < 18; index += 1) {
    const heart = document.createElement("span");

    heart.className = "floating-heart";
    heart.textContent = "❤";
    heart.style.setProperty("--left", `${Math.random() * 100}%`);
    heart.style.setProperty("--size", `${10 + Math.random() * 18}px`);
    heart.style.setProperty("--duration", `${14 + Math.random() * 16}s`);
    heart.style.setProperty("--delay", `${-Math.random() * 20}s`);
    heart.style.setProperty("--drift", `${10 + Math.random() * 30}px`);
    elements.floatingHearts.appendChild(heart);
  }
}

function handleWindowHeartBurst(event) {
  if (prefersReducedMotion.matches || !state.effectsEnabled) {
    return;
  }

  if (event.target.closest("input, textarea, .thumbnail-button")) {
    return;
  }

  launchHeartBurst(event.clientX, event.clientY, 5);
}

function launchHeartBurst(x, y, count) {
  for (let index = 0; index < count; index += 1) {
    const heart = document.createElement("span");
    const angle = (Math.PI * 2 * index) / count;
    const distance = 18 + Math.random() * 22;
    const jitterX = (Math.random() - 0.5) * 8;
    const jitterY = (Math.random() - 0.5) * 8;

    heart.className = "click-heart";
    heart.textContent = "❤";
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    heart.style.setProperty("--x", `${Math.cos(angle) * distance + jitterX}px`);
    heart.style.setProperty("--y", `${Math.sin(angle) * distance + jitterY}px`);

    body.appendChild(heart);

    window.setTimeout(() => {
      heart.remove();
    }, 860);
  }
}

function launchParticleBurstFromElement(element) {
  const rect = element.getBoundingClientRect();
  launchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
}

function launchParticleBurst(x, y, count) {
  const colors = ["#ff4f86", "#ff9cbc", "#ffffff", "#ffcbdc", "#ff7fa6"];

  for (let index = 0; index < count; index += 1) {
    const particle = document.createElement("span");
    const angle = Math.random() * Math.PI * 2;
    const distance = 18 + Math.random() * 44;

    particle.className = "particle";
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.setProperty("--x", `${Math.cos(angle) * distance}px`);
    particle.style.setProperty("--y", `${Math.sin(angle) * distance}px`);
    particle.style.setProperty("--size", `${6 + Math.random() * 6}px`);
    particle.style.setProperty("--color", colors[index % colors.length]);
    elements.confettiLayer.appendChild(particle);

    window.setTimeout(() => {
      particle.remove();
    }, 900);
  }
}

function launchConfetti({ count, originX }) {
  const colors = ["#ff4f86", "#ff7fa6", "#ffc1d8", "#ffffff", "#ffddec", "#f49ab8"];

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("span");
    const size = 6 + Math.random() * 9;
    const drift = -110 + Math.random() * 220;
    const fall = 2.4 + Math.random() * 2.8;
    const spread = (Math.random() - 0.5) * 36;

    piece.className = "confetti";
    piece.style.left = `${clamp(originX + spread, 0, 100)}vw`;
    piece.style.setProperty("--size", `${size}px`);
    piece.style.setProperty("--drift", `${drift}px`);
    piece.style.setProperty("--fall", `${fall}s`);
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    elements.confettiLayer.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, fall * 1000 + 160);
  }
}

function initializeAccessGates() {
  elements.unlockDateLabel.textContent =
    `Unlocks on ${unlockDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}`;

  if (!Number.isFinite(unlockDate.getTime()) || Date.now() >= unlockDate.getTime()) {
    elements.lockOverlay.hidden = true;
    initializePasswordGate();
    updateLockState();
    return;
  }

  elements.lockOverlay.hidden = false;
  updateLockState();
  renderCountdown();
  countdownTimer = window.setInterval(renderCountdown, 1000);
}

function renderCountdown() {
  const remainingMilliseconds = unlockDate.getTime() - Date.now();

  if (remainingMilliseconds <= 0) {
    if (countdownTimer) {
      window.clearInterval(countdownTimer);
      countdownTimer = null;
    }

    elements.lockOverlay.hidden = true;
    initializePasswordGate();
    updateLockState();
    showToast("The page is now unlocked.");
    safeTrack("date_gate_unlocked");
    return;
  }

  const totalSeconds = Math.floor(remainingMilliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  elements.cdDays.textContent = formatTwoDigits(days);
  elements.cdHours.textContent = formatTwoDigits(hours);
  elements.cdMinutes.textContent = formatTwoDigits(minutes);
  elements.cdSeconds.textContent = formatTwoDigits(seconds);
}

function initializePasswordGate() {
  if (!siteConfig.passwordGate.enabled) {
    elements.passwordOverlay.hidden = true;
    updateLockState();
    return;
  }

  elements.passwordHintText.textContent = siteConfig.passwordGate.hint || "Enter the password to continue.";

  if (isPasswordRemembered()) {
    elements.passwordOverlay.hidden = true;
    updateLockState();
    return;
  }

  elements.passwordOverlay.hidden = false;
  updateLockState();
  elements.passwordForm.addEventListener("submit", handlePasswordSubmit);
  window.setTimeout(() => {
    elements.passwordInput.focus();
  }, 60);
}

function handlePasswordSubmit(event) {
  event.preventDefault();
  const enteredPassword = elements.passwordInput.value.trim();

  if (enteredPassword === siteConfig.passwordGate.password) {
    if (siteConfig.passwordGate.rememberUnlock) {
      try {
        window.localStorage.setItem(PASSWORD_UNLOCK_KEY, "true");
      } catch (error) {
        return undefined;
      }
    }

    elements.passwordFeedback.textContent = "Unlocked.";
    elements.passwordOverlay.hidden = true;
    updateLockState();
    showToast("Private gate unlocked.");
    safeTrack("password_gate_unlocked");
    return;
  }

  elements.passwordFeedback.textContent = "That password did not match. Try again.";
  showToast("Password did not match.");
}

function isPasswordRemembered() {
  if (!siteConfig.passwordGate.rememberUnlock) {
    return false;
  }

  try {
    return window.localStorage.getItem(PASSWORD_UNLOCK_KEY) === "true";
  } catch (error) {
    return false;
  }
}

function updateLockState() {
  const shouldLock = !elements.lockOverlay.hidden || !elements.passwordOverlay.hidden;
  body.classList.toggle("is-locked", shouldLock);
}
