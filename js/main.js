(() => {
  "use strict";

  const cfg = window.UMBRA || {};
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* ---------------- content ---------------- */

  const ticker = $("#tickerTrack");
  if (ticker) {
    const half = (cfg.marquee || [])
      .map((w, i) => `<span class="tk${i % 2 ? " ghost" : ""}">${w}<i>✳</i></span>`)
      .join("");
    ticker.innerHTML = half + half;
  }

  const workList = $("#workList");
  (cfg.works || []).forEach((w, i) => {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "work-row";
    row.dataset.index = String(i);
    row.dataset.cursor = "OPEN";
    row.innerHTML =
      `<span class="w-index mono">${w.index}</span>` +
      `<span class="w-main"><span class="w-title">${w.title}</span><span class="w-cn">${w.cn}</span></span>` +
      `<span class="w-meta mono">${w.role}<br>${w.year}</span>` +
      `<span class="w-arrow" aria-hidden="true">↗</span>`;
    workList.appendChild(row);
  });

  const approachGrid = $("#approachGrid");
  (cfg.approach || []).forEach((a) => {
    const el = document.createElement("div");
    el.className = "ap-item reveal";
    el.innerHTML =
      `<span class="ap-num">${a.num}</span>` +
      `<div class="ap-body"><h3 class="ap-title">${a.title}</h3><p class="ap-cn">${a.cn}</p></div>`;
    approachGrid.appendChild(el);
  });

  const logList = $("#logList");
  (cfg.log || []).forEach((l) => {
    const row = document.createElement("div");
    row.className = "log-row reveal";
    row.innerHTML =
      `<span class="log-when mono"><i class="log-dot"></i>${l.when}</span>` +
      `<div><h3 class="log-title">${l.title}</h3><p class="log-desc">${l.desc}</p></div>` +
      `<span class="log-status mono">${l.status}</span>`;
    logList.appendChild(row);
  });

  $$("[data-split]").forEach((el) => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = "";
    el.classList.add("split");
    words.forEach((word, i) => {
      const wrap = document.createElement("span");
      wrap.className = "w";
      const inner = document.createElement("span");
      inner.style.setProperty("--i", String(i));
      inner.textContent = word;
      wrap.appendChild(inner);
      el.appendChild(wrap);
    });
  });

  /* ---------------- loader ---------------- */

  const loader = $("#loader");
  const loaderCount = $("#loaderCount");
  const loaderBar = $("#loaderBar");

  function boot() {
    document.body.classList.remove("is-loading");
    document.body.classList.add("is-ready");
    window.setTimeout(() => { if (loader) loader.style.display = "none"; }, reduce ? 0 : 1250);
  }

  if (reduce || !loaderCount || !loaderBar) {
    boot();
  } else {
    const duration = 1250;
    const started = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - started) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      loaderCount.textContent = String(Math.round(eased * 100)).padStart(2, "0");
      loaderBar.style.width = `${eased * 100}%`;
      if (p < 1) requestAnimationFrame(step);
      else window.setTimeout(boot, 180);
    };
    requestAnimationFrame(step);
  }

  /* ---------------- reveal ---------------- */

  const revealTargets = $$(".reveal, .split");
  if (reduce) {
    revealTargets.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealTargets.forEach((el) => io.observe(el));
  }

  /* ---------------- header + progress ---------------- */

  const head = $("#head");
  const progressBar = $("#progressBar");
  let lastY = window.scrollY;
  let scrollQueued = false;

  function onScroll() {
    const y = window.scrollY;
    const vh = window.innerHeight;
    if (head) {
      head.classList.toggle("is-solid", y > vh * 0.5);
      if (Math.abs(y - lastY) > 8) {
        head.classList.toggle("is-hidden", y > lastY && y > vh * 0.9);
        lastY = y;
      }
    }
    if (progressBar) {
      const max = document.documentElement.scrollHeight - vh;
      progressBar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
    }
    scrollQueued = false;
  }

  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(onScroll);
  }, { passive: true });
  onScroll();

  /* ---------------- nav scramble ---------------- */

  const glyphs = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#/—+*";
  $$(".scramble").forEach((el) => {
    const original = el.textContent;
    let timer = null;
    el.addEventListener("pointerenter", () => {
      if (reduce || timer) return;
      let frame = 0;
      const total = 14;
      timer = window.setInterval(() => {
        frame += 1;
        el.textContent = original
          .split("")
          .map((ch) => (ch === " " ? " " : Math.random() < frame / total ? ch : glyphs[(Math.random() * glyphs.length) | 0]))
          .join("");
        if (frame >= total) {
          window.clearInterval(timer);
          timer = null;
          el.textContent = original;
        }
      }, 30);
    });
  });

  /* ---------------- menu ---------------- */

  const menu = $("#menu");
  const menuBtn = $("#menuBtn");

  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.classList.toggle("is-open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("is-locked", open);
  }

  if (menuBtn) {
    menuBtn.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
    $$(".menu-nav a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("is-open")) setMenu(false);
    });
  }
  /* ---------------- work dialog ---------------- */

  const dialog = $("#workDialog");
  const wdMesh = $("#wdMesh");
  const wdIndex = $("#wdIndex");
  const wdTitle = $("#wdTitle");
  const wdCn = $("#wdCn");
  const wdDesc = $("#wdDesc");
  const wdMeta = $("#wdMeta");

  function openWork(i) {
    const w = (cfg.works || [])[i];
    if (!w || !dialog) return;
    if (wdMesh) wdMesh.className = `mesh mesh--${w.variant}`;
    if (wdIndex) wdIndex.textContent = `${w.index} / ${w.year}`;
    if (wdTitle) wdTitle.textContent = w.title;
    if (wdCn) wdCn.textContent = w.cn;
    if (wdDesc) wdDesc.textContent = w.desc;
    if (wdMeta) {
      wdMeta.innerHTML =
        `<div><dt>YEAR</dt><dd>${w.year}</dd></div>` +
        `<div><dt>DISCIPLINE</dt><dd>${w.role}</dd></div>` +
        `<div><dt>TAGS</dt><dd>${w.tags.join(" · ")}</dd></div>` +
        `<div><dt>STATUS</dt><dd>Visual study</dd></div>`;
    }
    document.body.classList.add("is-locked");
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  function closeWork() {
    if (!dialog) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    document.body.classList.remove("is-locked");
  }

  if (workList) {
    workList.addEventListener("click", (e) => {
      const row = e.target.closest(".work-row");
      if (row) openWork(Number(row.dataset.index));
    });
  }
  const wdClose = $("#wdClose");
  if (wdClose) wdClose.addEventListener("click", closeWork);
  if (dialog) {
    dialog.addEventListener("click", (e) => { if (e.target === dialog) closeWork(); });
    dialog.addEventListener("close", () => document.body.classList.remove("is-locked"));
  }

  /* ---------------- pointer + floating preview ---------------- */

  const pointer = {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
    fx: window.innerWidth / 2,
    fy: window.innerHeight / 2,
    moved: false
  };

  window.addEventListener("pointermove", (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    if (!pointer.moved) {
      pointer.fx = e.clientX;
      pointer.fy = e.clientY;
      pointer.moved = true;
    }
  }, { passive: true });

  const float = $("#workFloat");
  const wfMesh = $("#wfMesh");
  const wfLabel = $("#wfLabel");
  const wfIndex = $("#wfIndex");

  if (workList && float && fine && !reduce) {
    workList.addEventListener("pointerover", (e) => {
      const row = e.target.closest(".work-row");
      if (!row) return;
      const w = (cfg.works || [])[Number(row.dataset.index)];
      if (!w) return;
      if (wfMesh) wfMesh.className = `mesh mesh--${w.variant}`;
      if (wfLabel) wfLabel.textContent = w.title;
      if (wfIndex) wfIndex.textContent = w.index;
      float.classList.add("is-on");
    });
    workList.addEventListener("pointerleave", () => float.classList.remove("is-on"));
    window.addEventListener("scroll", () => float.classList.remove("is-on"), { passive: true });
  }

  /* ---------------- cursor ---------------- */

  const cursor = $("#cursor");
  const cursorLabel = $("#cursorLabel");

  if (cursor && fine && !reduce) {
    root.classList.add("has-cursor");
    let cx = pointer.x;
    let cy = pointer.y;

    document.addEventListener("pointermove", (e) => {
      const hit = e.target.closest ? e.target.closest("[data-cursor]") : null;
      if (hit) {
        if (cursorLabel) cursorLabel.textContent = hit.dataset.cursor || "";
        cursor.classList.add("is-label");
      } else {
        cursor.classList.remove("is-label");
        if (cursorLabel) cursorLabel.textContent = "";
      }
    }, { passive: true });

    document.addEventListener("mouseleave", () => cursor.classList.remove("is-visible"));

    const loop = () => {
      cx += (pointer.x - cx) * 0.22;
      cy += (pointer.y - cy) * 0.22;
      if (pointer.moved) cursor.classList.add("is-visible");
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      if (float && float.classList.contains("is-on")) {
        pointer.fx += (pointer.x - pointer.fx) * 0.14;
        pointer.fy += (pointer.y - pointer.fy) * 0.14;
        float.style.transform = `translate3d(${pointer.fx}px,${pointer.fy}px,0) translate(-50%,-50%)`;
      }
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  /* ---------------- footer button ---------------- */

  const toTop = $("#toTop");
  if (toTop) {
    if (fine && !reduce) {
      toTop.addEventListener("pointermove", (e) => {
        const r = toTop.getBoundingClientRect();
        const dx = (e.clientX - (r.left + r.width / 2)) * 0.16;
        const dy = (e.clientY - (r.top + r.height / 2)) * 0.16;
        toTop.style.transform = `translate(${dx}px,${dy}px)`;
      });
      toTop.addEventListener("pointerleave", () => { toTop.style.transform = ""; });
    }
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------------- hero shader ---------------- */

  function initGL() {
    const canvas = $("#gl");
    if (!canvas) return;
    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: "low-power"
    });
    if (!gl) {
      root.classList.add("no-gl");
      return;
    }

    const vs = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;
    const fs = `
      precision highp float;
      uniform vec2 uRes;
      uniform float uTime;
      uniform vec2 uMouse;

      float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p){
        float v = 0.0;
        float a = 0.5;
        for(int i = 0; i < 5; i++){
          v += a * noise(p);
          p *= 2.03;
          a *= 0.5;
        }
        return v;
      }

      void main(){
        vec2 p = (gl_FragCoord.xy - 0.5 * uRes.xy) / uRes.y;
        float t = uTime * 0.055;

        vec2 q = vec2(
          fbm(p * 1.3 + vec2(0.0, t)),
          fbm(p * 1.3 + vec2(5.2, -t))
        );
        vec2 r = vec2(
          fbm(p * 1.3 + 2.0 * q + vec2(1.7, 9.2) + t * 0.7),
          fbm(p * 1.3 + 2.0 * q + vec2(8.3, 2.8) - t * 0.5)
        );
        float f = fbm(p * 1.15 + 2.3 * r);

        vec3 col = vec3(0.028, 0.030, 0.034);
        vec3 silver = vec3(0.30, 0.31, 0.34);
        vec3 lime = vec3(0.64, 0.90, 0.10);

        float band = smoothstep(0.34, 0.86, f);
        col = mix(col, silver * 0.5, band * 0.5);

        float filament = smoothstep(0.70, 0.97, f);
        float depth = smoothstep(0.05, 0.85, gl_FragCoord.y / uRes.y);
        col = mix(col, lime, filament * 0.30 * (0.35 + 0.65 * depth));

        float d = length(p - uMouse);
        col += lime * 0.05 * smoothstep(0.6, 0.0, d);

        col *= 1.0 - 0.55 * pow(length(p * vec2(0.85, 1.15)), 1.7);

        float g = hash(gl_FragCoord.xy + fract(uTime) * 137.0);
        col += (g - 0.5) * 0.032;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn("UMBRA shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const v = compile(gl.VERTEX_SHADER, vs);
    const f = compile(gl.FRAGMENT_SHADER, fs);
    if (!v || !f) { root.classList.add("no-gl"); return; }

    const prog = gl.createProgram();
    gl.attachShader(prog, v);
    gl.attachShader(prog, f);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("UMBRA program:", gl.getProgramInfoLog(prog));
      root.classList.add("no-gl");
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    canvas.addEventListener("pointermove", (e) => {
      const r = canvas.getBoundingClientRect();
      if (!r.height) return;
      mouse.tx = (e.clientX - r.left - r.width / 2) / r.height;
      mouse.ty = -(e.clientY - r.top - r.height / 2) / r.height;
    }, { passive: true });

    function resize() {
      const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    }

    function draw(now) {
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, now);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    if (reduce) {
      resize();
      draw(16.0);
      return;
    }

    let raf = 0;
    let running = false;
    let last = performance.now();
    let time = 0;

    function frame(now) {
      time += Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(time);
      if (running) raf = requestAnimationFrame(frame);
    }

    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      } else {
        cancelAnimationFrame(raf);
      }
    }

    const io = new IntersectionObserver(([entry]) => {
      setRunning(entry.isIntersecting && !document.hidden);
    }, { threshold: 0 });
    io.observe(canvas);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) setRunning(false);
      else {
        const r = canvas.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) setRunning(true);
      }
    });
  }

  initGL();
})();