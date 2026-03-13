// Guided tour initializer using Intro.js
(function () {
  function elementExists(sel) {
    try {
      return document.querySelector(sel) !== null;
    } catch (e) {
      return false;
    }
  }

  function buildSteps() {
    const steps = [];
    if (elementExists("#top-nav")) {
      steps.push({
        element: "#top-nav",
        intro: "Top navigation — access the walkthrough anytime here.",
        position: "bottom",
      });
    }
    if (elementExists("#controls")) {
      steps.push({
        element: "#controls",
        intro: "Controls: select feature groups and modify options.",
        position: "right",
      });
    }
    if (elementExists("#panel-x")) {
      steps.push({
        element: "#panel-x",
        intro:
          "X-axis (columns): choose which variables appear across columns.",
        position: "right",
      });
    }
    if (elementExists("#panel-y")) {
      steps.push({
        element: "#panel-y",
        intro: "Y-axis (rows): choose which variables appear down the rows.",
        position: "right",
      });
    }
    if (elementExists("#export")) {
      steps.push({
        element: "#export",
        intro: "Export selected results using this button.",
        position: "bottom",
      });
    }
    if (elementExists("#toggle-surrogate")) {
      steps.push({
        element: "#toggle-surrogate",
        intro: "Toggle surrogate model curves on the plots.",
        position: "left",
      });
    }
    if (elementExists("#knn-delta")) {
      steps.push({
        element: "#knn-delta",
        intro: "Adjust the recommendation distance threshold with this slider.",
        position: "left",
      });
    }
    if (elementExists("#main")) {
      steps.push({
        element: "#main",
        intro: "Main plot area: the SPLOM and visualizations appear here.",
        position: "top",
      });
    }
    return steps;
  }

  function startTour() {
    const steps = buildSteps();
    if (!steps.length) return;

    const tour = introJs();
    tour.setOptions({
      steps: steps,
      exitOnOverlayClick: false,
      showProgress: true,
      showBullets: false,
      skipLabel: "Skip",
      doneLabel: "Done",
      nextLabel: "Next",
      prevLabel: "Back",
    });

    tour.onexit(function () {
      localStorage.setItem("alloylens_tour_seen", "true");
    });
    tour.oncomplete(function () {
      localStorage.setItem("alloylens_tour_seen", "true");
    });

    tour.start();
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Re-run tutorial when user clicks the top tutorial link
    const link = document.getElementById("tutorial-link");
    if (link) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        startTour();
      });
    }

    // Auto-start on first visit
    try {
      const seen = localStorage.getItem("alloylens_tour_seen");
      if (!seen) {
        // Give the page a bit of time to stabilize
        setTimeout(startTour, 600);
      }
    } catch (err) {
      // localStorage may be blocked; if so, still start the tour once
      setTimeout(startTour, 600);
    }
  });
})();
