/* ============================================================
 * FORM · INDEX — 交互
 * 内容在 config.js，这里负责渲染与动效。
 * ============================================================ */
(function () {
  "use strict";

  var CFG = window.FORM || {};
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(pointer: fine)").matches;

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  renderTicker();
  renderWork();
  renderStack();
  renderNow();

  initTheme();
  initClock();
  initHeader();
  initMenu();
  initReveal();
  initWorkPreview();
  initCopy();
  initCursor();
  initMagnetic();
  initToTop();

  /* ---------- 渲染 ---------- */
  function renderTicker() {
    var track = $("#tickerTrack");
    if (!track || !CFG.ticker) return;
    var half = CFG.ticker.map(function (t) {
      return '<span class="ticker-item">' + esc(t) + '</span><span class="ticker-dot"></span>';
    }).join("");
    track.innerHTML = half + half;
  }

  function renderWork() {
    var list = $("#workList");
    if (!list || !CFG.work) return;

    CFG.work.forEach(function (item, i) {
      var index = String(i + 1).padStart(2, "0");
      var tag = item.url ? "a" : "div";
      var attrs = item.url
        ? ' href="' + esc(item.url) + '" target="_blank" rel="noopener"'
        : ' aria-label="' + esc(item.title) + '（' + esc(item.note || "视觉实验") + '）"';

      var el = document.createElement(tag);
      el.className = "work-item" + (item.url ? "" : " is-private");
      el.setAttribute("data-variant", item.variant || "v4");
      el.setAttribute("data-initial", item.initial || item.title.charAt(0).toUpperCase());
      el.setAttribute("data-index", index);
      el.setAttribute("data-title", item.title);
      el.innerHTML =
        '<span class="wi-index">' + index + '</span>' +
        '<span class="wi-main">' +
          '<span class="wi-title">' + esc(item.title) +
            (item.note ? '<span class="wi-private">' + esc(item.note) + '</span>' : '') +
          '</span>' +
          '<span class="wi-desc">' + esc(item.desc) + '</span>' +
        '</span>' +
        '<span class="wi-tags">' + (item.tags || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join("") + '</span>' +
        '<span class="wi-year">' + esc(item.year) + '</span>' +
        '<span class="wi-arrow" aria-hidden="true">↗</span>';
      el.setAttribute("style", "--d:" + (i * 0.06) + "s");
      el.classList.add("reveal");
      if (item.url) el.setAttribute("href", item.url);
      if (item.url) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
      }
      list.appendChild(el);
    });
  }

  function renderStack() {
    var grid = $("#stackGrid");
    if (!grid || !CFG.stack) return;
    CFG.stack.forEach(function (group, i) {
      var el = document.createElement("article");
      el.className = "stack-card reveal";
      el.style.setProperty("--d", (i * 0.07) + "s");
      el.innerHTML =
        '<div class="stack-k"><span>' + esc(group.en) + '</span><span>' + String(i + 1).padStart(2, "0") + '</span></div>' +
        '<h3 class="stack-cn">' + esc(group.cn) + '</h3>' +
        '<ul class="stack-tags">' + group.items.map(function (t) { return '<li><span>' + esc(t) + '</span></li>'; }).join("") + '</ul>';
      grid.appendChild(el);
    });
  }

  function renderNow() {
    var list = $("#nowList");
    if (!list || !CFG.now) return;
    CFG.now.forEach(function (item) {
      var el = document.createElement("div");
      el.className = "now-item";
      el.innerHTML =
        '<span class="now-k">' + esc(item.k) + '</span>' +
        '<div><div class="now-t">' + esc(item.t) + '</div><div class="now-d">' + esc(item.d) + '</div></div>';
      list.appendChild(el);
    });
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    var root = document.documentElement;
    var btn = $("#themeBtn");
    if (!btn) return;

    function apply(theme) {
      root.setAttribute("data-theme", theme);
      root.style.colorScheme = theme;
      btn.setAttribute("aria-label", theme === "dark" ? "切换到浅色模式" : "切换到深色模式");
      var meta = $('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", theme === "dark" ? "#0c0c0b" : "#f2efe8");
      try { localStorage.setItem("form-theme", theme); } catch (e) {}
    }

    btn.addEventListener("click", function () {
      apply(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });

    apply(root.getAttribute("data-theme") || "light");
  }

  /* ---------- 时钟 ---------- */
  function initClock() {
    var clock = $("#clock");
    var yearEls = [$("#year"), $("#heroYear")];
    var timeFmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
    var yearFmt = new Intl.DateTimeFormat("en-GB", { year: "numeric" });

    function tick() {
      var now = new Date();
      if (clock) clock.textContent = timeFmt.format(now);
      yearEls.forEach(function (el) {
        if (el) el.textContent = el.id === "heroYear" ? "© " + yearFmt.format(now) : yearFmt.format(now);
      });
    }

    tick();
    window.setInterval(tick, 1000);
  }

  /* ---------- 顶栏 / 进度 / 导航高亮 ---------- */
  function initHeader() {
    var head = $("#siteHead");
    var progress = $("#progress");
    var navLinks = $$(".site-nav a");
    var ticking = false;

    function update() {
      var y = window.scrollY || window.pageYOffset;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (head) head.classList.toggle("is-scrolled", y > 16);
      if (progress) progress.style.transform = "scaleX(" + (max > 0 ? Math.min(1, y / max) : 0) + ")";
      ticking = false;
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    update();

    if (!("IntersectionObserver" in window) || !navLinks.length) return;
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("data-nav")] = a; });

    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.remove("is-active"); });
        var active = map[entry.target.id];
        if (active) active.classList.add("is-active");
      });
    }, { rootMargin: "-42% 0px -54% 0px", threshold: 0 });

    ["about", "work", "stack", "now", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) spy.observe(el);
    });
  }

  /* ---------- 移动菜单 ---------- */
  function initMenu() {
    var btn = $("#menuBtn");
    var menu = $("#mobileMenu");
    if (!btn || !menu) return;

    function setMenu(open, focusFirst) {
      menu.classList.toggle("is-open", open);
      document.body.classList.toggle("menu-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", open ? "关闭菜单" : "打开菜单");
      menu.setAttribute("aria-hidden", open ? "false" : "true");
      if (open && focusFirst) {
        var first = menu.querySelector("a");
        if (first) window.setTimeout(function () { first.focus(); }, 120);
      }
    }

    btn.addEventListener("click", function (e) {
      setMenu(!menu.classList.contains("is-open"), e.detail === 0);
    });

    $$("a", menu).forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("is-open")) {
        setMenu(false);
        btn.focus();
      }
    });
  }

  /* ---------- 滚动显现 ---------- */
  function initReveal() {
    var items = $$(".reveal");
    if (!("IntersectionObserver" in window) || reduced) {
      items.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -8% 0px" });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 作品悬浮预览 ---------- */
  function initWorkPreview() {
    var preview = $("#workPreview");
    var visual = $("#wpVisual");
    var indexEl = $("#wpIndex");
    var titleEl = $("#wpTitle");
    if (!preview || !visual || !fine) return;

    var items = $$(".work-item");

    function move(e) {
      var pad = 18;
      var w = preview.offsetWidth || 320;
      var h = preview.offsetHeight || 240;
      var x = e.clientX + 24;
      var y = e.clientY;
      if (x + w > window.innerWidth - pad) x = e.clientX - w - 24;
      x = Math.max(pad, Math.min(x, window.innerWidth - w - pad));
      y = Math.max(pad + h / 2, Math.min(y, window.innerHeight - h / 2 - pad));
      preview.style.left = x + "px";
      preview.style.top = y + "px";
    }

    items.forEach(function (item) {
      item.addEventListener("mouseenter", function (e) {
        visual.setAttribute("data-variant", item.getAttribute("data-variant") || "v4");
        visual.setAttribute("data-initial", item.getAttribute("data-initial") || "Q");
        indexEl.textContent = item.getAttribute("data-index") || "";
        titleEl.textContent = item.getAttribute("data-title") || "";
        preview.classList.add("is-on");
        move(e);
      });
      item.addEventListener("mousemove", move);
      item.addEventListener("mouseleave", function () {
        preview.classList.remove("is-on");
      });
    });
  }

  /* ---------- 复制邮箱 ---------- */
  function initCopy() {
    var toast = $("#toast");
    var timer = null;

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add("is-on");
      window.clearTimeout(timer);
      timer = window.setTimeout(function () { toast.classList.remove("is-on"); }, 2200);
    }

    function copy(text) {
      function done() { showToast("已复制 " + text); }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) { showToast(text); }
        document.body.removeChild(ta);
      }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, fallback);
      } else {
        fallback();
      }
    }

    $$("[data-mail]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        copy(btn.getAttribute("data-mail"));
      });
    });
  }

  /* ---------- 自定义光标 ---------- */
  function initCursor() {
    if (!fine || reduced) return;
    var dot = $(".cursor-dot");
    var ring = $(".cursor-ring");
    if (!dot || !ring) return;

    var mx = window.innerWidth / 2;
    var my = window.innerHeight / 2;
    var rx = mx;
    var ry = my;
    var shown = false;

    function render() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = "translate3d(" + mx + "px," + my + "px,0) translate(-50%,-50%)";
      ring.style.transform = "translate3d(" + rx + "px," + ry + "px,0) translate(-50%,-50%)";
      window.requestAnimationFrame(render);
    }

    window.addEventListener("mousemove", function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!shown) {
        shown = true;
        document.body.classList.add("has-cursor");
        window.requestAnimationFrame(render);
      }
    }, { passive: true });

    function bind(el) {
      el.addEventListener("mouseenter", function () { document.body.classList.add("cursor-hover"); });
      el.addEventListener("mouseleave", function () { document.body.classList.remove("cursor-hover"); });
    }

    $$("a, button, .work-item").forEach(bind);
  }

  /* ---------- 磁吸按钮 ---------- */
  function initMagnetic() {
    if (!fine || reduced) return;
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + (x * 0.16) + "px," + (y * 0.24) + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  /* ---------- 回到顶部 ---------- */
  function initToTop() {
    var btn = $("#toTop");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  }
})();