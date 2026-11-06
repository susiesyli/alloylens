// Guided walkthrough
(function () {
  const SEEN_KEY = "alloylens_tour_seen";

  // Refraction needs an SVG filter in backdrop-filter, which only Chromium
  // browsers support. Other browsers keep the frosted glass.
  if (/Chrome\//.test(navigator.userAgent)) {
    document.documentElement.classList.add("has-refraction");
  }

  const STEPS = [
    {
      title: "Find alloys that meet a target",
      intro:
        "This short tour shows how to choose variables, filter the plots, and export what you find.",
    },
    {
      element: "#panel-x",
      title: "Choose the columns",
      intro: "Pick the variables that run across the matrix.",
      position: "right",
    },
    {
      element: "#panel-y",
      title: "Choose the rows",
      intro: "Pick the variables that run down the matrix.",
      position: "right",
    },
    {
      element: "svg.bottom-slider",
      title: "Set a target range",
      intro:
        "Drag the handles along an axis. Alloys inside every range turn magenta. Double-click a slider to reset it.",
      position: "top",
    },
    {
      element: "svg.overlay",
      title: "Or draw a box",
      intro: "Drag across any plot to filter both of its variables at once.",
      position: "right",
    },
    {
      element: ".threshold",
      title: "Widen the search",
      intro:
        "If no alloy fits, the closest ones are recommended in yellow. This sets how far from your ranges to look.",
      position: "right",
    },
    {
      element: "#toggle-surrogate",
      title: "Compare with the model",
      intro: "Overlay curves predicted by the surrogate model.",
      position: "right",
    },
    {
      element: "#export",
      title: "Export your alloys",
      intro: "Download the selected alloys as a CSV file.",
      position: "right",
    },
    {
      element: "#tutorial-link",
      title: "Come back any time",
      intro: "Reopen this walkthrough from here.",
      position: "bottom",
    },
  ];

  function markSeen() {
    try {
      localStorage.setItem(SEEN_KEY, "true");
    } catch (err) {
      // storage can be blocked; the tour will just show again next visit
    }
  }

  function hasSeen() {
    try {
      return localStorage.getItem(SEEN_KEY) !== null;
    } catch (err) {
      return false;
    }
  }

  function scrollBehavior() {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    return calm ? "auto" : "smooth";
  }

  const MARGIN = 12; // keeps the panel off the window edge
  const GAP = 12; // space between the panel and its target
  const PADDING = 8; // space between the target and the spotlight

  let tour = null;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(value, max));
  }

  function buildTour() {
    const blocker = document.createElement("div");
    blocker.className = "tour-blocker";

    const spotlight = document.createElement("div");
    spotlight.className = "tour-spotlight";

    const panel = document.createElement("div");
    panel.className = "tour-panel";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "tour-title");
    panel.setAttribute("aria-describedby", "tour-text");
    panel.innerHTML = `
      <div class="tour-header">
        <h2 id="tour-title"></h2>
        <button type="button" class="tour-skip">Skip</button>
      </div>
      <p id="tour-text" aria-live="polite"></p>
      <div class="tour-progress"><span></span></div>
      <div class="tour-buttons">
        <button type="button" class="tour-btn tour-back">Back</button>
        <button type="button" class="tour-btn tour-next">Next</button>
      </div>`;

    document.body.append(blocker, spotlight, panel);
    return {
      blocker,
      spotlight,
      panel,
      title: panel.querySelector("#tour-title"),
      text: panel.querySelector("#tour-text"),
      bar: panel.querySelector(".tour-progress span"),
      back: panel.querySelector(".tour-back"),
      next: panel.querySelector(".tour-next"),
      skip: panel.querySelector(".tour-skip"),
    };
  }

  // The target's box, padded and clipped to the window
  function spotlightBox(target) {
    const r = target.getBoundingClientRect();
    const left = Math.max(r.left - PADDING, MARGIN);
    const top = Math.max(r.top - PADDING, MARGIN);
    const right = Math.min(r.right + PADDING, window.innerWidth - MARGIN);
    const bottom = Math.min(r.bottom + PADDING, window.innerHeight - MARGIN);
    return { left, top, right, bottom };
  }

  // Tries the step's side first, then any side with room for the panel
  function panelPosition(box, side, width, height) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!box) return [(vw - width) / 2, (vh - height) / 2];

    const spots = {
      right: [box.right + GAP, box.top],
      left: [box.left - GAP - width, box.top],
      top: [box.left, box.top - GAP - height],
      bottom: [box.left, box.bottom + GAP],
    };
    const fits = (name) => {
      const [x, y] = spots[name];
      return name === "left" || name === "right"
        ? x >= MARGIN && x + width <= vw - MARGIN
        : y >= MARGIN && y + height <= vh - MARGIN;
    };
    const best = [side, "bottom", "top", "right", "left"].find(fits);
    const [x, y] = best ? spots[best] : [MARGIN, vh - height - MARGIN];
    return [
      clamp(x, MARGIN, vw - width - MARGIN),
      clamp(y, MARGIN, vh - height - MARGIN),
    ];
  }

  function layout() {
    const { ui, steps, index } = tour;
    const step = steps[index];
    const target = step.element && document.querySelector(step.element);
    const box = target ? spotlightBox(target) : null;

    const { style } = ui.spotlight;
    style.left = `${box ? box.left : window.innerWidth / 2}px`;
    style.top = `${box ? box.top : window.innerHeight / 2}px`;
    style.width = `${box ? Math.max(box.right - box.left, 0) : 0}px`;
    style.height = `${box ? Math.max(box.bottom - box.top, 0) : 0}px`;

    const [x, y] = panelPosition(
      box,
      step.position,
      ui.panel.offsetWidth,
      ui.panel.offsetHeight,
    );
    ui.panel.style.left = `${x}px`;
    ui.panel.style.top = `${y}px`;
  }

  function bringIntoView(target) {
    const r = target.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.top >= MARGIN && r.bottom <= vh - MARGIN) return;
    target.scrollIntoView({
      block: r.height < vh - 2 * MARGIN ? "center" : "start",
      inline: "nearest",
      behavior: scrollBehavior(),
    });
  }

  function showStep(index) {
    tour.index = index;
    const { ui, steps } = tour;
    const step = steps[index];
    const last = index === steps.length - 1;

    ui.title.textContent = step.title;
    ui.text.textContent = step.intro;
    ui.bar.style.width = `${((index + 1) / steps.length) * 100}%`;
    ui.back.hidden = index === 0;
    ui.next.textContent = last ? "Done" : "Next";

    const target = step.element && document.querySelector(step.element);
    if (target) bringIntoView(target);
    layout();
    ui.next.focus({ preventScroll: true });
  }

  function goNext() {
    if (tour.index === tour.steps.length - 1) endTour();
    else showStep(tour.index + 1);
  }

  function goBack() {
    if (tour.index > 0) showStep(tour.index - 1);
  }

  function onKeydown(event) {
    if (event.key === "Escape") endTour();
    else if (event.key === "ArrowRight") goNext();
    else if (event.key === "ArrowLeft") goBack();
    else if (event.key === "Tab") {
      // keep keyboard focus inside the panel
      const { panel } = tour.ui;
      const buttons = [...panel.querySelectorAll("button:not([hidden])")];
      const at = buttons.indexOf(document.activeElement);
      const step = event.shiftKey ? -1 : 1;
      buttons[(at + step + buttons.length) % buttons.length].focus();
      event.preventDefault();
    }
  }

  function startTour() {
    if (tour) return;
    const steps = STEPS.filter(
      (step) => !step.element || document.querySelector(step.element),
    );
    const ui = buildTour();
    tour = { ui, steps, index: 0, returnFocus: document.activeElement };

    ui.next.addEventListener("click", goNext);
    ui.back.addEventListener("click", goBack);
    ui.skip.addEventListener("click", endTour);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("resize", layout);
    window.addEventListener("scroll", layout, { capture: true, passive: true });

    showStep(0);
  }

  function endTour() {
    const { ui, returnFocus } = tour;
    document.removeEventListener("keydown", onKeydown);
    window.removeEventListener("resize", layout);
    window.removeEventListener("scroll", layout, { capture: true });
    ui.blocker.remove();
    ui.spotlight.remove();
    ui.panel.remove();
    tour = null;

    markSeen();
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    returnFocus?.focus?.({ preventScroll: true });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("tutorial-link")?.addEventListener("click", (e) => {
      e.preventDefault();
      startTour();
    });
  });

  // Steps point at the plots, so the first visit waits until they're drawn
  document.addEventListener("alloylens:ready", () => {
    if (!hasSeen()) startTour();
  });
})();
