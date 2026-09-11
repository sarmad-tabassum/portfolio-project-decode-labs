(function () {
  "use strict";
  var $ = function (s, c) {
    return (c || document).querySelector(s);
  };
  var $$ = function (s, c) {
    return [].slice.call((c || document).querySelectorAll(s));
  };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(pointer: fine)").matches;

  /* ---------- 1 · PRELOADER ---------- */
  var loader = $(".loader"),
    pct = $("#ldPct"),
    bar = $("#ldBar"),
    v = 0;
  if (reduced || !loader) {
    finishLoad();
  } else {
    var tick = setInterval(function () {
      v = Math.min(100, v + 6 + Math.random() * 12);
      pct.textContent = Math.floor(v);
      bar.style.width = v + "%";
      if (v >= 100) {
        clearInterval(tick);
        setTimeout(finishLoad, 220);
      }
    }, 55);
  }
  function finishLoad() {
    if (loader) loader.classList.add("done");
    document.body.classList.add("loaded");
    setTimeout(function () {
      if (loader) loader.remove();
    }, 1100);
  }

  /* ---------- 2 · SCROLL: progress + header + portrait parallax ---------- */
  var pbar = $("#pbar"),
    hdr = $("#hdr"),
    heroImg = $("#heroImg"),
    raf = false;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    pbar.style.transform = "scaleX(" + (max ? h.scrollTop / max : 0) + ")";
    hdr.classList.toggle("solid", h.scrollTop > 30);
    if (!reduced && heroImg) {
      var y = Math.min(h.scrollTop, 900);
      heroImg.style.transform = "translateY(" + y * 0.16 + "px) scale(1.02)";
    }
    raf = false;
  }
  addEventListener(
    "scroll",
    function () {
      if (!raf) {
        raf = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );

  /* ---------- 3 · MOBILE MENU ---------- */
  var burger = $("#burger"),
    menu = $("#menu");
  burger.addEventListener("click", function () {
    var open = menu.classList.toggle("open");
    burger.classList.toggle("x", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("lock", open);
  });
  $$("a", menu).forEach(function (a) {
    a.addEventListener("click", function () {
      menu.classList.remove("open");
      burger.classList.remove("x");
      burger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("lock");
    });
  });

  /* ---------- 4 · CUSTOM CURSOR (desktop) ---------- */
  if (fine && !reduced) {
    document.documentElement.classList.add("cursor-on");
    var dot = $(".cursor"),
      ring = $(".cursor-ring"),
      lab = $("#curLab");
    var mx = -100,
      my = -100,
      rx = -100,
      ry = -100;
    addEventListener(
      "mousemove",
      function (e) {
        mx = e.clientX;
        my = e.clientY;
      },
      { passive: true },
    );
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform =
        "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
      ring.style.transform =
        "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(loop);
    })();
    $$("a, button, label, input").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        ring.classList.add("hov");
      });
      el.addEventListener("mouseleave", function () {
        ring.classList.remove("hov");
      });
    });
    $$("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        lab.textContent = el.dataset.cursor;
        ring.classList.add("lab");
      });
      el.addEventListener("mouseleave", function () {
        ring.classList.remove("lab");
      });
    });
  }

  /* ---------- 5 · REVEAL ON SCROLL ---------- */
  var rvEls = $$(".rv");
  if (reduced || !("IntersectionObserver" in window))
    rvEls.forEach(function (e) {
      e.classList.add("in");
    });
  else {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14 },
    );
    rvEls.forEach(function (e) {
      io.observe(e);
    });
  }

  /* ---------- 6 · SCROLL-SPY ---------- */
  var spyLinks = {};
  $$(".nav__links a[data-spy]").forEach(function (a) {
    spyLinks[a.dataset.spy] = a;
  });
  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          var a = spyLinks[e.target.id];
          if (!a) return;
          if (e.isIntersecting) {
            Object.keys(spyLinks).forEach(function (k) {
              spyLinks[k].classList.remove("on");
            });
            a.classList.add("on");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    Object.keys(spyLinks).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- 7 · WORK: accordion + hover preview ---------- */
  var items = $$(".work__item");
  items.forEach(function (li) {
    var btn = $(".work__row", li);
    btn.addEventListener("click", function () {
      var wasOpen = li.classList.contains("open");
      items.forEach(function (i) {
        i.classList.remove("open");
        $(".work__row", i).setAttribute("aria-expanded", "false");
      });
      if (!wasOpen) {
        li.classList.add("open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });
  if (fine && !reduced && items.length) {
    var prev = $(".work__preview"),
      pimg = $("#prevImg");
    var px = 0,
      py = 0,
      tx = 0,
      ty = 0;
    addEventListener(
      "mousemove",
      function (e) {
        tx = e.clientX + 28;
        ty = e.clientY - 100;
      },
      { passive: true },
    );
    (function ploop() {
      px += (tx - px) * 0.1;
      py += (ty - py) * 0.1;
      prev.style.transform =
        "translate(" +
        px +
        "px," +
        py +
        "px) rotate(-3deg) scale(" +
        (prev.classList.contains("on") ? 1 : 0.85) +
        ")";
      requestAnimationFrame(ploop);
    })();
    items.forEach(function (li) {
      li.addEventListener("mouseenter", function () {
        pimg.src = li.dataset.img;
        prev.classList.add("on");
      });
      li.addEventListener("mouseleave", function () {
        prev.classList.remove("on");
      });
      var im = new Image();
      im.src = li.dataset.img; /* preload */
    });
  }

  /* ---------- 8 · STANDARDS CHECKLIST (localStorage) ---------- */
  var ckCard = $("#ckCard"),
    ckFill = $("#ckFill"),
    ckCount = $("#ckCount"),
    ckMeter = $("#ckMeter");
  if (ckCard) {
    var boxes = $$('input[type="checkbox"]', ckCard),
      KEY = "st-p01-";
    var store = {
      get: function (k) {
        try {
          return localStorage.getItem(k);
        } catch (e) {
          return null;
        }
      },
      set: function (k, val) {
        try {
          localStorage.setItem(k, val);
        } catch (e) {}
      },
      del: function (k) {
        try {
          localStorage.removeItem(k);
        } catch (e) {}
      },
    };
    function sync() {
      var done = boxes.filter(function (b) {
        return b.checked;
      }).length;
      ckFill.style.width = (done / boxes.length) * 100 + "%";
      ckCount.textContent = done + " / " + boxes.length;
      ckMeter.setAttribute("aria-valuenow", done);
      ckCard.classList.toggle("done", done === boxes.length);
    }
    boxes.forEach(function (b) {
      if (store.get(KEY + b.name) === "1") b.checked = true;
      b.addEventListener("change", function () {
        store.set(KEY + b.name, b.checked ? "1" : "0");
        sync();
      });
    });
    $("#ckReset").addEventListener("click", function () {
      boxes.forEach(function (b) {
        b.checked = false;
        store.del(KEY + b.name);
      });
      sync();
    });
    sync();
  }

  /* ---------- 9 · COPY EMAIL ---------- */
  var copyBtn = $("#copyMail"),
    EMAIL = "sarmadplaying@gmail.com";
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      function done() {
        copyBtn.textContent = "Copied ✓";
        copyBtn.classList.add("ok");
        setTimeout(function () {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("ok");
        }, 1800);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(EMAIL).then(done, done);
      } else {
        var t = document.createElement("textarea");
        t.value = EMAIL;
        document.body.appendChild(t);
        t.select();
        try {
          document.execCommand("copy");
        } catch (e) {}
        document.body.removeChild(t);
        done();
      }
    });
  }

  /* ---------- 10 · KARACHI CLOCK ---------- */
  var clock = $("#clock");
  function setClock() {
    try {
      clock.textContent =
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Karachi",
        }).format(new Date()) + " PKT";
    } catch (e) {
      clock.textContent = "PKT";
    }
  }
  setClock();
  setInterval(setClock, 30000);

  onScroll();
})();
