(function () {
  'use strict';

  // ------------------------------------------------------------------
  // 1. SOURCE GEOMETRY — the logo's own SVG coordinate system is the
  //    single source of truth. viewBox = 0 0 1601 1483.
  //
  //    The aperture IS the large main logo path itself — used directly
  //    as the mask hole, no derived/smoothed inner shape.
  // ------------------------------------------------------------------

  var MAIN_LOGO_PATH =
    'M32.7638 165.048C81.8128 47.4298 182.805 1.34597 289.533 5.22363C395.041 9.05707 505.737 61.7909 576.01 142.437L496.236 223.703C461.429 198.055 420.006 171.373 376.525 157.544C331.426 143.201 283.712 142.582 238.99 171.606L238.988 171.608C196.992 198.9 185.8 245.363 195.727 287.507C205.62 329.51 236.67 368.192 280.385 380.543H280.386C327.094 393.726 385.555 388.32 443.591 379.841C502.131 371.288 560.197 359.63 607.824 359.361L607.823 359.36C744.759 358.644 872.66 416.69 959.895 520.73V520.731C968.381 530.912 985.187 553.024 1000.98 575.336C1008.86 586.48 1016.46 597.623 1022.61 607.307C1028.82 617.081 1033.36 625.064 1035.35 630.02C1035.93 631.518 1036.02 632.614 1035.96 633.294C1035.89 633.951 1035.69 634.174 1035.65 634.218C1035.62 634.25 1035.46 634.409 1034.93 634.453C1034.35 634.5 1033.34 634.398 1031.88 633.752L1031.84 633.734L1031.8 633.718L1031.49 633.574C1030.7 633.182 1029.42 632.372 1027.59 631.001C1025.57 629.496 1023.17 627.523 1020.43 625.175C1014.95 620.47 1008.4 614.489 1001.36 608.145C987.519 595.67 971.584 581.602 959.669 574.928H959.67C828.641 501.069 659.653 520.168 548.471 620.668L548.468 620.671C543.416 625.246 531.263 638.474 516.09 655.606C500.815 672.854 482.241 694.331 464.208 715.634C446.18 736.932 428.665 758.088 415.522 774.685C408.956 782.976 403.443 790.176 399.493 795.707C397.523 798.466 395.896 800.874 394.71 802.828C394.119 803.803 393.599 804.728 393.193 805.569C392.831 806.318 392.382 807.355 392.198 808.454L391.96 809.886L392.525 811.223L397.959 824.081L398.401 825.126L399.251 825.878C523.433 935.795 642.283 1059.22 828.829 1037.17C906.931 1027.97 986.833 980.767 1020.1 924.345C1036.85 895.937 1042 864.719 1028.34 834.97C1014.78 805.43 983.186 778.461 928.973 757.175H928.972C818.522 713.775 712.117 726.61 600.546 730.755L600.52 730.756L600.494 730.757C598.474 730.853 595.515 731.203 593.007 731.424C590.271 731.665 587.608 731.809 585.328 731.646C584.452 731.584 583.737 731.481 583.162 731.361C700.524 685.549 803.22 657.76 928.126 688.45C981.004 701.466 1047.59 736.361 1111.77 777.449C1175.84 818.469 1237.05 865.361 1279.08 901.965L1279.08 901.97C1445 1046.07 1562.28 1260.17 1595.02 1478.14H1217.82C1206.29 1346.57 1039.84 1297.74 957.071 1404.19L957.07 1404.19C953.471 1408.82 949.61 1415.62 945.69 1422.94C941.66 1430.46 937.588 1438.49 933.247 1446.39C928.94 1454.23 924.609 1461.48 920.344 1467.04C916.231 1472.41 912.748 1475.44 910.033 1476.5L641.921 1474.72C516.914 1131.11 302.038 813.623 39.2872 560.821L33.0519 554.843C27.9177 549.876 21.7502 545.835 14.4659 544.129C15.6783 539.587 18.2282 536.859 21.5577 535.036C26.3255 532.426 33.1931 531.414 41.6407 531.381C50.0258 531.348 59.0543 532.253 68.0372 532.904C76.7438 533.535 85.5913 533.947 92.6749 532.581L102.495 530.688L95.088 523.968C-4.55392 433.583 -17.7398 286.083 32.7628 165.049L32.7638 165.048Z';

  var TRIANGLE_PATH =
    'M381.942 1107.9C453.998 1222.65 511.527 1347.64 549.798 1477.97H292.731L381.942 1107.9Z';

  // Mathematical center of the 1601x1483 viewBox — every aperture scale
  // animates around this exact point, never an arbitrary offset.
  var CENTER = { x: 800.5, y: 741.5 };

  // (800.5, 741.5) — the viewBox's geometric center — turns out to fall
  // in an EMPTY gap of this specific path (a diagonal ribbon with a hollow
  // coil), not on its filled material. Scaling around a point outside the
  // fill just balloons the shape off to one side instead of making it
  // swallow the screen, which is exactly the "cream logo floating in
  // frame" bug this was built to fix. (877, 710) is a point verified via
  // isPointInFill to sit solidly inside the fill (30-unit margin in every
  // direction), close to the ideal center. The whole shape is statically
  // translated so THIS point — not the empty bbox center — lands exactly
  // on CENTER, so growing/shrinking it is symmetric and huge scales
  // genuinely cover the full viewport with no visible cream border.
  var INTERIOR_PIVOT = { x: 877, y: 710 };
  var RECENTER = { dx: CENTER.x - INTERIOR_PIVOT.x, dy: CENTER.y - INTERIOR_PIVOT.y };

  // ------------------------------------------------------------------
  // 2. INIT — wire geometry into the DOM
  // ------------------------------------------------------------------

  var apertureGroup, apertureSvg;
  var isAnimating = false;

  function init() {
    document.getElementById('aperture-path').setAttribute('d', MAIN_LOGO_PATH);
    document.getElementById('big-logo-clip-path').setAttribute('d', MAIN_LOGO_PATH);
    document.getElementById('aperture-recenter').setAttribute(
      'transform', 'translate(' + RECENTER.dx + ',' + RECENTER.dy + ')'
    );

    document.getElementById('debug-main-outline').setAttribute('d', MAIN_LOGO_PATH);
    document.getElementById('debug-main-outline').setAttribute(
      'transform', 'translate(' + RECENTER.dx + ',' + RECENTER.dy + ')'
    );
    document.getElementById('debug-triangle-outline').setAttribute('d', TRIANGLE_PATH);
    document.getElementById('debug-triangle-outline').setAttribute(
      'transform', 'translate(' + RECENTER.dx + ',' + RECENTER.dy + ')'
    );

    apertureGroup = document.getElementById('aperture-group');
    apertureSvg = document.getElementById('mask-svg');

    setupDebugMode();
    setupNav();
  }

  function setupDebugMode() {
    var params = new URLSearchParams(window.location.search);
    var on = params.get('debug') === '1';
    document.getElementById('debug-layer').setAttribute('data-on', String(on));
    document.getElementById('debug-legend').setAttribute('data-on', String(on));
    if (on) {
      // Show the overlay + a mid-size aperture at rest so the geometry
      // can be inspected without triggering a transition.
      apertureSvg.setAttribute('data-visible', 'true');
      gsap.set('#aperture-group', { scale: 1, svgOrigin: CENTER.x + ' ' + CENTER.y });
    }
  }

  // ------------------------------------------------------------------
  // 3. TRANSITION TIMELINE
  // ------------------------------------------------------------------

  // HUGE clears the viewport entirely (verified empirically: no cream
  // visible anywhere, full page revealed) now that the shape scales
  // around INTERIOR_PIVOT instead of the empty bbox-center gap. TINY
  // collapses to a barely perceptible point rather than a recognizable
  // small logo.
  var SCALE_HUGE = 22;
  var SCALE_TINY = 0.02;

  function runTransition(targetPage) {
    if (isAnimating) return;
    var current = document.querySelector('.page[data-active="true"]');
    var next = document.getElementById('page-' + targetPage);
    if (!next || next === current) return;

    isAnimating = true;

    var tl = gsap.timeline({
      onComplete: function () {
        apertureSvg.setAttribute('data-visible', 'false');
        isAnimating = false;
      }
    });

    // Phase B: overlay snaps on instantly, aperture starts huge.
    tl.set(apertureSvg, { attr: { 'data-visible': 'true' } });
    tl.set(apertureGroup, { scale: SCALE_HUGE, svgOrigin: CENTER.x + ' ' + CENTER.y });

    // Zoom OUT: huge -> tiny, centered. Page underneath never moves.
    tl.to(apertureGroup, {
      scale: SCALE_TINY,
      duration: 1.5,
      ease: 'power3.inOut'
    });

    // Phase C: aperture is stationary + tiny -> instant content swap.
    tl.add(function () {
      current.setAttribute('data-active', 'false');
      next.setAttribute('data-active', 'true');
    });

    // Phase D: zoom IN: tiny -> huge, revealing the new page.
    tl.to(apertureGroup, {
      scale: SCALE_HUGE,
      duration: 1.6,
      ease: 'power3.inOut'
    });

    // Phase E: overlay removed instantly at onComplete (no fade).
  }

  function setupNav() {
    document.querySelectorAll('.nav-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        runTransition(btn.getAttribute('data-target'));
      });
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
