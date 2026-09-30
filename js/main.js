/* ============================================================================
   Xoshimov Omadbek — Portfolio
   ----------------------------------------------------------------------------
   Vanilla JS, no build step. Everything degrades gracefully:
     · GSAP / ScrollTrigger  → richer reveal + scrub animations
     · Lenis                 → inertial smooth scrolling
     · neither               → IntersectionObserver + native scroll

   Load order is guaranteed by `defer` in index.html.
   ========================================================================== */

(function () {
  "use strict";

  /* ---------------------------------------------------------------- utils */
  var qs = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var qsa = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  var html = document.documentElement;
  // Tell the inline <head> failsafe that we are alive, so it does not strip
  // the `js` class and flash every not-yet-revealed section into view.
  html.setAttribute("data-js-live", "");

  var mqReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  var mqHoverFine = window.matchMedia("(hover: hover) and (pointer: fine)");

  var reduced = function () { return mqReduce.matches; };
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  var hasGsap = typeof window.gsap !== "undefined";
  var hasST = hasGsap && typeof window.ScrollTrigger !== "undefined";
  var hasLenis = typeof window.Lenis !== "undefined";

  if (hasGsap && hasST) html.classList.add("gsap-motion");

  /* ======================================================================
     1 · THEME  — default from the OS, persisted once the user chooses
     ====================================================================== */
  (function theme() {
    var toggle = qs("#themeToggle");
    var meta = qs("#themeColor") || qs('meta[name="theme-color"]');
    var mqLight = window.matchMedia("(prefers-color-scheme: light)");

    function current() {
      return html.getAttribute("data-theme") === "light" ? "light" : "dark";
    }

    function apply(mode) {
      html.setAttribute("data-theme", mode);
      if (toggle) {
        var light = mode === "light";
        toggle.setAttribute("aria-pressed", String(light));
        toggle.setAttribute(
          "aria-label",
          light ? "Switch to dark theme" : "Switch to light theme"
        );
      }
      if (meta) meta.setAttribute("content", light ? "#f6f6fa" : "#07070b");
    }

    apply(current());

    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = current() === "light" ? "dark" : "light";
        try { localStorage.setItem("theme", next); } catch (e) {}
        apply(next);
      });
    }

    // Follow the OS only while the visitor has not made an explicit choice.
    var onSystem = function (e) {
      var saved = null;
      try { saved = localStorage.getItem("theme"); } catch (err) {}
      if (!saved) apply(e.matches ? "light" : "dark");
    };
    if (mqLight.addEventListener) mqLight.addEventListener("change", onSystem);
    else if (mqLight.addListener) mqLight.addListener(onSystem);
  })();

  /* ======================================================================
     2 · PRELOADER  — real asset progress, hard timeout as a safety net
     ====================================================================== */
  (function preloader() {
    var el = qs("#preloader");
    var bar = qs("#preloaderBar");
    var pct = qs("#preloaderPct");
    if (!el) return;

    var target = 0;
    var shown = 0;
    var start = performance.now();
    var settled = false;
    var MIN_MS = 900;
    var MAX_MS = 5200;

    function setTarget(v) { target = Math.max(target, Math.min(100, v)); }

    function frame() {
      shown = lerp(shown, target, 0.075);
      if (target - shown < 0.4) shown = target;
      if (bar) bar.style.width = shown.toFixed(2) + "%";
      if (pct) pct.textContent = Math.round(shown);
      if (shown < 100) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    function finish() {
      if (settled) return;
      settled = true;
      setTarget(100);
      var wait = Math.max(0, MIN_MS - (performance.now() - start));
      setTimeout(function () {
        el.classList.add("is-done");
        // let the curtains finish travelling before removing from the tree
        setTimeout(function () {
          el.classList.add("is-gone");
          html.classList.remove("preloader-lock");
        }, reduced() ? 60 : 1050);
      }, wait);
    }

    var pending = 2;

    function step() {
      pending -= 1;
      setTarget((2 - pending) * 50);
      if (pending <= 0) finish();
    }

    var img = qs(".portrait");
    if (img) {
      if (img.complete) step();
      else {
        img.addEventListener("load", step, { once: true });
        img.addEventListener("error", step, { once: true });
      }
    } else {
      step();
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(step).catch(step);
    } else {
      step();
    }

    setTimeout(finish, MAX_MS);
  })();

  /* ======================================================================
     3 · SMOOTH SCROLL  (Lenis when present)
     ====================================================================== */
  var scrollTo = function (target) {
    var navH = parseInt(
      getComputedStyle(html).getPropertyValue("--nav-h") || "74",
      10
    );
    if (lenis) {
      lenis.scrollTo(target, { offset: -(navH + 8), duration: 1.1 });
    } else {
      var top =
        target.getBoundingClientRect().top +
        window.pageYOffset -
        navH -
        8;
      window.scrollTo({
        top: top,
        behavior: reduced() ? "auto" : "smooth"
      });
    }
  };

  var lenis = null;
  if (hasLenis && !reduced()) {
    try {
      lenis = new window.Lenis({
        duration: 1.05,
        easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.6
      });
    } catch (e) {
      lenis = null;
    }
  }

  if (lenis) {
    if (hasGsap) {
      if (hasST) lenis.on("scroll", window.ScrollTrigger.update);
      window.gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
      window.gsap.ticker.lagSmoothing(0);
    } else {
      var loop = function (t) { lenis.raf(t); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  /* Intercept in-page anchors so Lenis keeps control of the easing. */
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href");
    if (!id || id === "#") return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeDrawer();
    scrollTo(target);
    // keep keyboard users with the new context
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
    if (history.replaceState) history.replaceState(null, "", id);
  });

  /* ======================================================================
     4 · CUSTOM CURSOR
     ====================================================================== */
  (function cursor() {
    var el = qs("#cursor");
    if (!el || !mqHoverFine.matches || reduced()) { if (el) el.remove(); return; }

    var dot = qs(".cursor__dot", el);
    var ring = qs(".cursor__ring", el);
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    var dx = mx, dy = my;
    var live = false;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      if (!live) {
        live = true;
        rx = dx = mx; ry = dy = my;
        el.classList.add("is-live");
      }
    }, { passive: true });

    document.addEventListener("mouseleave", function () { el.classList.remove("is-live"); });
    document.addEventListener("mouseenter", function () { el.classList.add("is-live"); });

    var HOVER = "a, button, input, textarea, select, [data-tilt], .marquee__item";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(HOVER)) el.classList.add("is-hover");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(HOVER)) el.classList.remove("is-hover");
    });
    document.addEventListener("mousedown", function () { el.classList.add("is-down"); });
    document.addEventListener("mouseup", function () { el.classList.remove("is-down"); });

    (function loop() {
      dx = lerp(dx, mx, 0.42);
      dy = lerp(dy, my, 0.42);
      rx = lerp(rx, mx, 0.16);
      ry = lerp(ry, my, 0.16);
      if (dot) dot.style.transform = "translate3d(" + dx + "px," + dy + "px,0) translate(-50%,-50%)";
      if (ring) ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
  })();

  /* ======================================================================
     5 · NAVIGATION
     ====================================================================== */
  var nav = qs("#nav");
  var progressBar = qs("#scrollProgress span");
  var pill = qs("#navPill");
  var navLinks = qsa(".nav__link");
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  function movePill() {
    if (!pill) return;
    var active = qs(".nav__link.is-active");
    if (!active) { pill.style.opacity = "0"; return; }
    pill.style.opacity = "1";
    pill.style.width = active.offsetWidth + "px";
    pill.style.setProperty("--px", active.offsetLeft + "px");
  }

  function onScrollFrame() {
    if (nav) {
      nav.classList.toggle("is-stuck", window.pageYOffset > 24);
    }

    // document progress
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var p = max > 0 ? clamp(window.pageYOffset / max, 0, 1) : 0;
    if (progressBar) progressBar.style.width = (p * 100).toFixed(2) + "%";

    // active section — the last one whose top has passed the nav line
    var line = window.pageYOffset + (nav ? nav.offsetHeight : 74) + 40;
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= line) current = sections[i];
    }
    if (current && current.id !== activeId) {
      activeId = current.id;
      navLinks.forEach(function (l) {
        l.classList.toggle("is-active", l.getAttribute("href") === "#" + current.id);
      });
      movePill();
    }

    // timeline rule — fills as the block crosses the viewport
    var tl = qs("[data-timeline]");
    if (tl) {
      var r = tl.getBoundingClientRect();
      var prog = clamp((window.innerHeight * 0.75 - r.top) / (r.height || 1), 0, 1);
      tl.style.setProperty("--tl", prog.toFixed(4));
    }

    ticking = false;
  }

  var activeId = null;
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScrollFrame); }
  }, { passive: true });
  window.addEventListener("resize", function () { movePill(); onScrollFrame(); }, { passive: true });

  // hide the bar when scrolling down, bring it back on the way up
  if (nav && !reduced()) {
    var lastY = window.pageYOffset;
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset;
      var dy = y - lastY;
      if (Math.abs(dy) > 6) {
        if (y > 260 && dy > 0) nav.classList.add("is-hidden");
        else nav.classList.remove("is-hidden");
        lastY = y;
      }
    }, { passive: true });
  }

  /* ======================================================================
     6 · MOBILE DRAWER
     ====================================================================== */
  var drawer = qs("#mobileMenu");
  var burger = qs("#navToggle");

  function openDrawer() {
    if (!drawer || !burger) return;
    drawer.hidden = false;
    // next frame so the transition has a starting state to animate from
    requestAnimationFrame(function () { drawer.classList.add("is-open"); });
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Close menu");
    if (lenis) lenis.stop();
    document.body.style.overflow = "hidden";
  }

  function closeDrawer() {
    if (!drawer || !burger || drawer.hidden) return;
    drawer.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Open menu");
    document.body.style.overflow = "";
    if (lenis) lenis.start();
    setTimeout(function () { drawer.hidden = true; }, 400);
  }

  if (drawer) {
    qsa(".drawer__nav a").forEach(function (a, i) {
      a.style.setProperty("--i", i);
    });
  }
  if (burger) {
    burger.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) closeDrawer();
      else openDrawer();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeDrawer();
  });

  /* ======================================================================
     7 · REVEAL ON SCROLL
     ====================================================================== */
  (function reveals() {
    var items = qsa(".reveal");
    if (!items.length) return;

    // Safety net: if anything is still hidden after 2.5s and is on screen,
    // show it. Content must never be trapped invisible.
    function forceSweep() {
      items.forEach(function (el) {
        if (el.classList.contains("is-in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("is-in");
      });
    }
    setTimeout(forceSweep, 2500);
    window.addEventListener("load", forceSweep);

    if (hasST) {
      window.ScrollTrigger.batch(items, {
        start: "top 88%",
        once: true,
        onEnter: function (batch) {
          if (window.gsap) {
            window.gsap.to(batch, {
              opacity: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.08,
              ease: "power3.out",
              overwrite: true
            });
            batch.forEach(function (el) { el.classList.add("is-in"); });
          }
        }
      });
      window.ScrollTrigger.refresh();
      return;
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var sibs = Array.prototype.indexOf.call(el.parentNode.children, el);
        el.style.transitionDelay = Math.min(sibs, 6) * 70 + "ms";
        el.classList.add("is-in");
        io.unobserve(el);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    items.forEach(function (el) { io.observe(el); });
  })();

  /* ======================================================================
     8 · HERO — split text, typewriter, tilt, parallax, spotlight
     ====================================================================== */
  (function hero() {
    var title = qs("#heroTitle") || qs(".hero__title");

    /* word-level split with an overflow mask for the reveal ------------- */
    if (title) {
      qsa("[data-split]", title).forEach(function (host) {
        var words = host.textContent.trim().split(/\s+/);
        host.textContent = "";
        words.forEach(function (w, i) {
          var wrap = document.createElement("span");
          wrap.className = "w";
          var inner = document.createElement("i");
          inner.textContent = w;
          wrap.appendChild(inner);
          host.appendChild(wrap);
          if (i < words.length - 1) host.appendChild(document.createTextNode(" "));
        });
      });
    }

    /* typewriter ------------------------------------------------------- */
    var out = qs("#typewriterOut");
    if (out && !reduced()) {
      var WORDS = ["Frontend Engineer", "Backend Developer", "Problem Solver"];
      var wi = 0, ci = 0, deleting = false;
      var tick = function () {
        var word = WORDS[wi];
        ci += deleting ? -1 : 1;
        out.textContent = word.slice(0, ci);
        var wait = deleting ? 42 : 68;
        if (!deleting && ci === word.length) { deleting = true; wait = 1700; }
        else if (deleting && ci === 0) { deleting = false; wi = (wi + 1) % WORDS.length; wait = 320; }
        setTimeout(tick, wait);
      };
      setTimeout(tick, 1200);
    }

    /* tilt + layered parallax ------------------------------------------ */
    var stage = qs("#heroStage");
    if (stage) {
      qsa("[data-depth]", stage).forEach(function (el) {
        var d = parseFloat(el.getAttribute("data-depth")) || 0;
        el.style.setProperty("--depth", String(d / 26));
      });

      var tx = 0, ty = 0, cx = 0, cy = 0, running = false;

      function render() {
        cx = lerp(cx, tx, 0.08);
        cy = lerp(cy, ty, 0.08);
        stage.style.transform =
          "perspective(1100px) rotateX(" + (-cy * 5).toFixed(3) + "deg) rotateY(" +
          (cx * 6).toFixed(3) + "deg)";
        stage.style.setProperty("--px", (cx * 22).toFixed(2) + "px");
        stage.style.setProperty("--py", (cy * 16).toFixed(2) + "px");
        if (Math.abs(cx - tx) > 0.001 || Math.abs(cy - ty) > 0.001) {
          requestAnimationFrame(render);
        } else {
          running = false;
        }
      }

      function kick() {
        if (!running) { running = true; requestAnimationFrame(render); }
      }

      if (mqHoverFine.matches && !reduced()) {
        window.addEventListener("mousemove", function (e) {
          var r = stage.getBoundingClientRect();
          tx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          ty = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          kick();
        }, { passive: true });
      }

      /* gyroscope parallax on phones (iOS asks for permission on tap) -- */
      function onTilt(e) {
        if (e.gamma == null || e.beta == null) return;
        tx = clamp(e.gamma / 32, -1, 1);
        ty = clamp((e.beta - 45) / 40, -1, 1);
        kick();
      }

      if (window.DeviceOrientationEvent && !mqHoverFine.matches && !reduced()) {
        var needsPermission =
          typeof DeviceOrientationEvent.requestPermission === "function";
        if (needsPermission) {
          var arm = function () {
            DeviceOrientationEvent.requestPermission().then(function (res) {
              if (res === "granted") {
                window.addEventListener("deviceorientation", onTilt);
              }
            }).catch(function () {});
          };
          window.addEventListener("touchstart", arm, { once: true, passive: true });
        } else {
          window.addEventListener("deviceorientation", onTilt);
        }
      }
    }

    /* cursor spotlight -------------------------------------------------- */
    var spot = qs("#heroSpotlight");
    var hero = qs("#hero");
    if (spot && hero && mqHoverFine.matches && !reduced()) {
      hero.addEventListener("mousemove", function (e) {
        var r = hero.getBoundingClientRect();
        spot.style.setProperty("--mx", (e.clientX - r.left) + "px");
        spot.style.setProperty("--my", (e.clientY - r.top) + "px");
      }, { passive: true });
    }

    /* headline + eyebrow entrance -------------------------------------- */
    if (title) {
      if (reduced()) {
        title.classList.add("is-in");
      } else {
        var lead = qsa(".hero .reveal");
        var run = function () {
          title.classList.add("is-in");
          qsa("[data-split]", title).forEach(function (host, li) {
            var words = qsa(".w > i", host);
            words.forEach(function (w, wi2) {
              w.style.transitionDelay = li * 130 + wi2 * 62 + "ms";
            });
          });
          lead.forEach(function (el, i) {
            el.style.transitionDelay = 380 + i * 90 + "ms";
            el.classList.add("is-in");
          });
        };
        if (document.readyState === "complete") setTimeout(run, 120);
        else window.addEventListener("load", function () { setTimeout(run, 120); });
      }
    }
  })();

  /* ======================================================================
     9 · MAGNETIC BUTTONS
     ====================================================================== */
  (function magnetic() {
    if (!mqHoverFine.matches || reduced()) return;
    qsa("[data-magnetic]").forEach(function (el) {
      var raf = null, x = 0, y = 0, tx = 0, ty = 0;

      function render() {
        x = lerp(x, tx, 0.18);
        y = lerp(y, ty, 0.18);
        el.style.transform = "translate3d(" + x.toFixed(2) + "px," + y.toFixed(2) + "px,0)";
        if (Math.abs(x - tx) > 0.05 || Math.abs(y - ty) > 0.05) raf = requestAnimationFrame(render);
        else { el.style.transform = ""; raf = null; }
      }
      function kick() { if (!raf) raf = requestAnimationFrame(render); }

      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.22;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.3;
        kick();
      });
      el.addEventListener("mouseleave", function () { tx = 0; ty = 0; kick(); });
    });
  })();

  /* ======================================================================
     10 · 3D TILT CARDS
     ====================================================================== */
  (function tilt() {
    if (!mqHoverFine.matches || reduced()) return;
    qsa("[data-tilt]").forEach(function (el) {
      var raf = null, rx = 0, ry = 0, trx = 0, try_ = 0, active = false;

      function render() {
        rx = lerp(rx, trx, 0.12);
        ry = lerp(ry, try_, 0.12);
        el.style.transform =
          "perspective(900px) rotateX(" + rx.toFixed(3) + "deg) rotateY(" +
          ry.toFixed(3) + "deg) translate3d(0,-5px,0)";
        if (active || Math.abs(rx - trx) > 0.02 || Math.abs(ry - try_) > 0.02) {
          raf = requestAnimationFrame(render);
        } else {
          el.style.transform = "";
          raf = null;
        }
      }
      function kick() { if (!raf) raf = requestAnimationFrame(render); }

      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        trx = -py * 7;
        try_ = px * 9;
        kick();
      });
      el.addEventListener("mouseenter", function () { active = true; kick(); });
      el.addEventListener("mouseleave", function () {
        active = false; trx = 0; try_ = 0; kick();
      });
    });
  })();

  /* ======================================================================
     11 · COUNTERS
     ====================================================================== */
  (function counters() {
    var list = qsa("[data-count]");
    if (!list.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute("data-count")) || 0;
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduced()) { el.textContent = target + suffix; return; }
      var dur = 1500;
      var t0 = performance.now();
      var step = function (now) {
        var p = clamp((now - t0) / dur, 0, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }

    // Reduced motion means no count-up, so the final value is known up front.
    // Settle everything now instead of waiting for a scroll that may never come.
    if (reduced() || !("IntersectionObserver" in window)) { list.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    list.forEach(function (el) { io.observe(el); });
  })();

  /* ======================================================================
     12 · PROGRESS RINGS
     ====================================================================== */
  (function rings() {
    var list = qsa("[data-ring]");
    if (!list.length) return;

    function run(box) {
      var bar = qs(".ring__bar", box);
      var num = qs(".ring__num", box);
      if (!bar) return;
      var value = parseFloat(bar.getAttribute("data-value")) || 0;
      var circ = 2 * Math.PI * 52;
      bar.style.setProperty("--circ", circ.toFixed(2));
      bar.style.strokeDasharray = circ.toFixed(2);
      bar.style.strokeDashoffset = circ.toFixed(2);

      requestAnimationFrame(function () {
        bar.style.strokeDashoffset = (circ * (1 - value / 100)).toFixed(2);
      });

      if (num && !reduced()) {
        var t0 = performance.now();
        var step = function (now) {
          var p = clamp((now - t0) / 1400, 0, 1);
          num.textContent = Math.round(value * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      } else if (num) {
        num.textContent = value;
      }
    }

    if (reduced() || !("IntersectionObserver" in window)) { list.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        run(en.target);
        io.unobserve(en.target);
      });
    }, { threshold: 0.4 });
    list.forEach(function (el) { io.observe(el); });
  })();

  /* ======================================================================
     13 · MARQUEES — clone once, derive duration from the measured width
     ====================================================================== */
  qsa("[data-marquee]").forEach(function (marquee) {
    var track = qs(".marquee__track", marquee);
    if (!track) return;

    // one exact copy → translateX(-50%) loops seamlessly
    var html = track.innerHTML;
    track.insertAdjacentHTML("beforeend", html);

    var size = function () {
      var speed = parseFloat(marquee.getAttribute("data-speed")) || 40;
      var width = track.scrollWidth / 2 || 1;
      track.style.setProperty("--marquee-duration", (width / speed).toFixed(1) + "s");
    };
    size();
    window.addEventListener("resize", size, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  });

  /* ======================================================================
     14 · TESTIMONIALS — scroll-snap carousel with autoplay
     ====================================================================== */
  (function quotes() {
    var root = qs("#quotes");
    if (!root) return;
    var viewport = qs(".quotes__viewport", root);
    var track = qs(".quotes__track", root);
    var slides = qsa("[data-quote]", root);
    var dotsWrap = qs("#quoteDots");
    var prev = qs("#quotePrev");
    var next = qs("#quoteNext");
    if (!viewport || !track || slides.length < 2) return;

    var index = 0;
    var timer = null;
    var delay = parseInt(root.getAttribute("data-autoplay"), 10) || 4200;

    // dots
    var dots = slides.map(function (_, i) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "quotes__dot" + (i === 0 ? " is-active" : "");
      b.setAttribute("role", "tab");
      b.setAttribute("aria-label", "Testimonial " + (i + 1));
      b.setAttribute("aria-selected", String(i === 0));
      b.tabIndex = i === 0 ? 0 : -1;
      b.addEventListener("click", function () { go(i, true); });
      if (dotsWrap) dotsWrap.appendChild(b);
      return b;
    });

    // Arrow-key navigation, as role="tab" requires. Home/End jump to the ends.
    if (dotsWrap) {
      dotsWrap.addEventListener("keydown", function (e) {
        var n = slides.length, next = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (index + 1) % n;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (index - 1 + n) % n;
        else if (e.key === "Home") next = 0;
        else if (e.key === "End") next = n - 1;
        else return;
        e.preventDefault();
        go(next, true);
        // Follow focus to the new dot, so repeated arrows keep working.
        if (dots[index]) dots[index].focus();
      });
    }

    function setActive(i) {
      dots.forEach(function (d, di) {
        d.classList.toggle("is-active", di === i);
        d.setAttribute("aria-selected", String(di === i));
        // Roving tabindex: only the selected tab is in the tab order, which is
        // what role="tab" requires. Arrow keys are handled below.
        d.tabIndex = di === i ? 0 : -1;
      });
    }

    function maxScroll() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    // offsetLeft is measured from the nearest *positioned* ancestor (.quotes),
    // not from the track, so subtract the viewport's own offset to get the
    // coordinate scrollLeft actually counts.
    function slideX(el) {
      return el.offsetLeft - viewport.offsetLeft;
    }

    function go(i, user) {
      index = (i + slides.length) % slides.length;
      // Align the slide to the leading edge rather than centring it. Centring
      // is unreliable here: near the last slide the requested offset clamps to
      // maxScroll, so the dots and the scroll position would disagree.
      var left = Math.min(Math.max(slideX(slides[index]), 0), maxScroll());
      viewport.scrollTo({
        left: left,
        behavior: reduced() || !user ? "auto" : "smooth"
      });
      setActive(index);
      if (user) restart();
    }

    function start() {
      if (reduced()) return;
      stop();
      timer = setInterval(function () { go(index + 1); }, delay);
    }
    function stop() { if (timer) clearInterval(timer); timer = null; }
    function restart() { stop(); start(); }

    if (prev) prev.addEventListener("click", function () { go(index - 1, true); });
    if (next) next.addEventListener("click", function () { go(index + 1, true); });

    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", start);
    root.addEventListener("focusin", stop);
    root.addEventListener("focusout", start);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });

    // keep the dots in sync with manual swipes / scrollbar drags
    var sync = function () {
      var x = viewport.scrollLeft;
      var best = 0, bestDist = Infinity;
      slides.forEach(function (s, i) {
        var d = Math.abs(slideX(s) - x);
        if (d < bestDist) { bestDist = d; best = i; }
      });
      if (best !== index) { index = best; setActive(index); }
    };
    viewport.addEventListener("scroll", function () {
      if (viewport._raf) return;
      viewport._raf = requestAnimationFrame(function () {
        viewport._raf = null;
        sync();
      });
    }, { passive: true });

    start();
  })();

  /* ======================================================================
     15 · PROJECT MODAL
     ====================================================================== */
  (function modal() {
    var dlg = qs("#projectModal");
    if (!dlg || typeof dlg.showModal !== "function") {
      // No native <dialog>: hide the triggers rather than ship a dead button.
      qsa("[data-open-project]").forEach(function (b) { b.remove(); });
      return;
    }

    var DATA = {
      nexus: {
        eyebrow: "Full-stack · E-commerce",
        title: "Nexus Commerce",
        meta: "Next.js 14 · Node.js · PostgreSQL 15 · Docker Compose · 2024 — present",
        text: "A multi-vendor storefront where three separate catalogues share one checkout. The hard part was not the UI: it was keeping inventory, payouts and order state consistent while several vendors edited the same product at the same time. Solved with a normalised schema, row-level locking around the stock decrement, and an outbox pattern that publishes order events to the payment provider exactly once.",
        did: [
          "Designed the PostgreSQL schema — 22 tables, 3NF, with indexes chosen from real query plans rather than guesses.",
          "Built the storefront in Next.js with server components and incremental static regeneration for product pages.",
          "Wrote a Node.js ordering service handling idempotency keys so a double-tap never creates two orders.",
          "Containerised the whole stack so a new developer runs docker compose up and has a working environment in 90 seconds."
        ],
        tags: ["Next.js", "Node.js", "PostgreSQL", "Docker", "Prisma", "Redis"],
        img: "assets/projects/01-nexus-commerce.svg",
        alt: "Nexus Commerce admin dashboard with sales charts and order tables"
      },
      taskflow: {
        eyebrow: "Backend · REST API",
        title: "TaskFlow API",
        meta: "Node.js · Express · Redis · Zod · Docker · 2024",
        text: "A production REST service for a task tracker, built to survive real traffic and real users. Every request is schema-validated before it reaches a handler, every list endpoint is cursor-paginated so deep pages stay fast, and every mutating route requires a valid access token. Shipped with OpenAPI docs and a container image under 90 MB.",
        did: [
          "JWT authentication with refresh-token rotation and reuse detection.",
          "Zod schemas on every request body and query string — invalid input never reaches business logic.",
          "Cursor pagination plus a Redis-backed sliding-window rate limiter.",
          "Docker Compose stack (api, postgres, redis) with healthchecks and automatic migrations on boot.",
          "OpenAPI 3.1 documentation generated from the same schemas that validate the input."
        ],
        tags: ["Node.js", "Express", "Redis", "Zod", "Docker", "Vitest"],
        img: "assets/projects/02-taskflow-api.svg",
        alt: "TaskFlow API editor window with a JSON response and Docker container status"
      },
      analytics: {
        eyebrow: "Frontend · Data visualisation",
        title: "Analytics Studio",
        meta: "React · TypeScript · D3 · TanStack Query · 2023 — 2024",
        text: "A reporting interface sitting on top of a Postgres read replica. The constraint was 100k-row tables that stay scrollable on a mid-range laptop over a slow connection, so rows are virtualised, aggregation happens in the database rather than the browser, and every chart has a table fallback that a screen reader can actually read.",
        did: [
          "Virtualised data grid holding 100k+ rows at 60 fps with windowed rendering.",
          "Server-side aggregation and caching, so the client never downloads raw data to filter it.",
          "D3 visualisations wrapped as accessible components with keyboard-navigable tables.",
          "Design tokens shared between React components and the exported PDF report."
        ],
        tags: ["React", "TypeScript", "D3", "TanStack Query", "Vite"],
        img: "assets/projects/03-analytics-studio.svg",
        alt: "Analytics Studio dashboard with conversion donut chart and funnel bars"
      },
      uzmarket: {
        eyebrow: "Automation · Telegram",
        title: "UzMarket Bot",
        meta: "Node.js · Telegram Bot API · PostgreSQL · Redis · 2023",
        text: "A sales funnel that lives entirely inside Telegram. The bot walks a customer from greeting to payment with a dialogue state machine that survives a restart, then hands the transaction to Click or Payme and reconciles the callback against the order row it created on the way in.",
        did: [
          "State machine persisted in Redis, so a mid-checkout restart does not lose the session.",
          "Inline keyboard catalogue with pagination that fits Telegram's 100-callback limit.",
          "Click and Payme payment handoff with server-side reconciliation of provider callbacks.",
          "Admin panel with order search, stock sync and per-user purchase history.",
          "Postgres order pipeline with idempotent state transitions — no duplicate orders, ever."
        ],
        tags: ["Node.js", "Telegram Bot API", "PostgreSQL", "Redis"],
        img: "assets/projects/04-uzmarket-bot.svg",
        alt: "UzMarket Telegram bot conversation with product cards and payment methods"
      },
      nova: {
        eyebrow: "CMS · Publishing platform",
        title: "Nova Studio CMS",
        meta: "Next.js · Prisma · PostgreSQL · Cloudflare · 2023",
        text: "A headless CMS for a small studio that wanted to publish without asking me for help. Editors work in a draft/review flow, and publishing triggers incremental static regeneration so the public site reflects the change in seconds without a redeploy.",
        did: [
          "Draft / in-review / published workflow with role-based permissions.",
          "Incremental static regeneration on publish — new content live in under five seconds.",
          "Image handling on a CDN edge with automatic format negotiation and responsive variants.",
          "Editorial calendar view so the studio can see what is scheduled before it goes out."
        ],
        tags: ["Next.js", "Prisma", "PostgreSQL", "Cloudflare"],
        img: "assets/projects/05-novastudio-cms.svg",
        alt: "Nova Studio CMS content grid with publish status chips"
      },
      clinic: {
        eyebrow: "Mobile · Booking service",
        title: "ClinicFlow",
        meta: "FastAPI · PostgreSQL · Redis · Docker · 2022 — 2023",
        text: "Appointment booking for a clinic, where the only unacceptable bug is a double booking. Slots are held with an atomic conditional insert inside a database transaction, so two patients tapping the same time slot cannot both win it. Reminders go out over SMS and Telegram from a background worker.",
        did: [
          "Atomic slot reservation — a unique constraint plus a transaction makes double booking impossible.",
          "FastAPI backend with automatic OpenAPI docs and Pydantic request validation.",
          "Redis-backed reminder queue so a slow SMS provider never blocks a booking request.",
          "Docker image and CI pipeline that runs migrations and integration tests on every push."
        ],
        tags: ["FastAPI", "PostgreSQL", "Redis", "Docker"],
        img: "assets/projects/06-clinicflow.svg",
        alt: "ClinicFlow mobile booking screens with doctor list and available time slots"
      }
    };

    var img = qs("#modalImg");
    var eyebrow = qs("#modalEyebrow");
    var title = qs("#modalTitle");
    var meta = qs("#modalMeta");
    var text = qs("#modalText");
    var list = qs("#modalList");
    var tags = qs("#modalTags");
    var links = qs("#modalLinks");
    var close = qs("#modalClose");

    function fill(key) {
      var d = DATA[key];
      if (!d) return;
      img.src = d.img;
      img.alt = d.alt;
      eyebrow.textContent = d.eyebrow;
      title.textContent = d.title;
      meta.textContent = d.meta;
      text.textContent = d.text;

      list.innerHTML = "";
      d.did.forEach(function (item) {
        var li = document.createElement("li");
        li.innerHTML =
          '<svg class="icon" aria-hidden="true"><use href="#i-check"></use></svg>';
        li.appendChild(document.createTextNode(item));
        list.appendChild(li);
      });

      tags.innerHTML = "";
      d.tags.forEach(function (t) {
        var s = document.createElement("span");
        s.className = "tag";
        s.textContent = t;
        tags.appendChild(s);
      });

      links.innerHTML = "";
      var a = document.createElement("a");
      a.className = "btn btn--primary";
      a.href = "[GITHUB_REPO_URL]";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML =
        '<svg class="icon" aria-hidden="true"><use href="#i-github"></use></svg> View source';
      links.appendChild(a);
    }

    qsa("[data-open-project]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        fill(btn.getAttribute("data-open-project"));
        dlg.showModal();
        if (lenis) lenis.stop();
        var sc = qs(".modal__scroll", dlg);
        if (sc) sc.scrollTop = 0;
      });
    });

    if (close) close.addEventListener("click", function () { dlg.close(); });

    dlg.addEventListener("close", function () {
      if (lenis) lenis.start();
    });

    // click on the backdrop area closes
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
  })();

  /* ======================================================================
     16 · CONTACT FORM
     ====================================================================== */
  (function form() {
    var f = qs("#contactForm");
    if (!f) return;
    var status = qs("#formStatus");
    var btn = qs("#submitBtn");

    var rules = {
      name: function (v) {
        return v.trim().length >= 2 ? "" : "Please tell me your name.";
      },
      email: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())
          ? ""
          : "That email address does not look right.";
      },
      message: function (v) {
        return v.trim().length >= 10
          ? ""
          : "A little more detail would help — 10 characters or more.";
      }
    };

    function setError(field, msg) {
      var wrap = field.closest(".field");
      var out = qs('[data-error-for="' + field.id + '"]', f);
      if (wrap) wrap.classList.toggle("is-invalid", !!msg);
      if (out) out.textContent = msg;
      if (msg) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }

    Object.keys(rules).forEach(function (id) {
      var el = qs("#" + id, f);
      if (!el) return;
      el.addEventListener("blur", function () { setError(el, rules[id](el.value)); });
      el.addEventListener("input", function () {
        if (el.closest(".field").classList.contains("is-invalid")) {
          setError(el, rules[id](el.value));
        }
      });
    });

    function say(msg, kind) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form__status" + (kind ? " is-" + kind : "");
    }

    f.addEventListener("submit", function (e) {
      e.preventDefault();

      var firstBad = null;
      Object.keys(rules).forEach(function (id) {
        var el = qs("#" + id, f);
        if (!el) return;
        var msg = rules[id](el.value);
        setError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (firstBad) { firstBad.focus(); return; }

      var action = f.getAttribute("action") || "";

      // The template ships with a placeholder endpoint — say so instead of failing silently.
      if (action.indexOf("[") !== -1) {
        say(
          "This form is not connected yet. Add your Formspree ID in index.html, or email me directly at omadbekxoshimov792@gmail.com.",
          "err"
        );
        return;
      }

      if (btn) btn.classList.add("is-busy");
      say("Sending…", "");

      fetch(action, {
        method: "POST",
        body: new FormData(f),
        headers: { Accept: "application/json" }
      })
        .then(function (r) {
          if (!r.ok) throw new Error("Request failed: " + r.status);
          f.reset();
          say("Thanks — your message is on its way. I usually reply within a day.", "ok");
        })
        .catch(function () {
          say(
            "Something went wrong sending that. Please email me at omadbekxoshimov792@gmail.com instead.",
            "err"
          );
        })
        .then(function () {
          if (btn) btn.classList.remove("is-busy");
        });
    });
  })();

  /* ======================================================================
     17 · MISC
     ====================================================================== */
  (function misc() {
    var y = qs("#year");
    if (y) y.textContent = String(new Date().getFullYear());

    // ?sent=1 after a Formspree redirect fallback
    if (/[?&]sent=1/.test(window.location.search)) {
      var s = qs("#formStatus");
      if (s) {
        s.textContent = "Thanks — your message is on its way.";
        s.className = "form__status is-ok";
      }
    }

    onScrollFrame();
    movePill();
  })();
})();
