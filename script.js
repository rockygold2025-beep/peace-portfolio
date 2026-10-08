// Theme
const root = document.documentElement,
  btns = [...document.querySelectorAll(".sw button")];
function setTheme(t) {
  root.dataset.theme = t;
  btns.forEach((b) => b.setAttribute("aria-pressed", b.dataset.t === t));
  try {
    localStorage.setItem("pt", t);
  } catch (e) {}
  draw && draw();
}
btns.forEach((b) => (b.onclick = () => setTheme(b.dataset.t)));
let saved = null;
try {
  saved = localStorage.getItem("pt");
} catch (e) {}
document.getElementById("yr").textContent = new Date().getFullYear();

// Photos: pick an image to preview. For a permanent photo, set PHOTO to your image URL.
const PHOTO = "";
const ph = document.getElementById("photo");
function setPhoto(u) {
  ph.style.backgroundImage = 'url("' + u + '")';
  ph.classList.add("has");
}
if (PHOTO) setPhoto(PHOTO);
ph.querySelector("input").onchange = (e) => {
  const f = e.target.files[0];
  if (f) setPhoto(URL.createObjectURL(f));
};

// Reveal charts when scrolled into view
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    }),
  { threshold: 0.3 },
);
document.querySelectorAll("#skl").forEach((el) => io.observe(el));

// Hero: scattered points settle into a rising trend
const cv = document.getElementById("cv"),
  cx = cv.getContext("2d");
const N = 26,
  P = [];
let W,
  H,
  t0,
  raf,
  still = matchMedia("(prefers-reduced-motion:reduce)").matches;
const css = (n) => getComputedStyle(root).getPropertyValue(n).trim();
function seed() {
  P.length = 0;
  for (let i = 0; i < N; i++) {
    const k = i / (N - 1);
    P.push({
      sx: Math.random(),
      sy: Math.random(),
      k,
      j: (Math.random() - 0.5) * 0.1,
      d: i * 35,
    });
  }
}
function size() {
  const r = cv.getBoundingClientRect(),
    d = devicePixelRatio || 1;
  W = r.width;
  H = r.height;
  cv.width = W * d;
  cv.height = H * d;
  cx.setTransform(d, 0, 0, d, 0, 0);
}
const ease = (x) => 1 - Math.pow(1 - x, 3);
function frame(now) {
  draw(now - t0);
  raf = requestAnimationFrame(frame);
  if (now - t0 > 4200) {
    cancelAnimationFrame(raf);
  }
}
function draw(el) {
  if (el == null) el = 9999;
  if (still) el = 9999;
  cx.clearRect(0, 0, W, H);
  const a = css("--a"),
    b = css("--b"),
    ln = css("--line"),
    m = 22;
  cx.strokeStyle = ln;
  cx.lineWidth = 1;
  for (let i = 0; i < 4; i++) {
    const y = m + ((H - 2 * m) * i) / 3;
    cx.beginPath();
    cx.moveTo(m, y);
    cx.lineTo(W - m, y);
    cx.stroke();
  }
  P.forEach((p) => {
    const q = ease(Math.min(1, Math.max(0, (el - 600 - p.d) / 1500)));
    const tx = m + p.k * (W - 2 * m),
      ty = H - m - (0.12 + 0.7 * Math.pow(p.k, 1.1) + p.j) * (H - 2 * m);
    const wob = (1 - q) * Math.sin(el / 500 + p.sx * 9) * 6;
    const x = (m + p.sx * (W - 2 * m)) * (1 - q) + tx * q,
      y = (m + p.sy * (H - 2 * m)) * (1 - q) + ty * q + wob;
    cx.globalAlpha = 0.35 + 0.55 * q;
    cx.fillStyle = q > 0.98 && p.k > 0.8 ? b : a;
    cx.beginPath();
    cx.arc(x, y, 4 + q * 2, 0, 7);
    cx.fill();
    p.x = x;
    p.y = y;
  });
  cx.globalAlpha = 1;
  const lq = ease(Math.min(1, Math.max(0, (el - 2600) / 1400)));
  if (lq > 0) {
    cx.strokeStyle = b;
    cx.lineWidth = 2.5;
    cx.lineCap = "round";
    cx.beginPath();
    const x0 = m,
      x1 = m + lq * (W - 2 * m);
    for (let x = x0; x <= x1; x += 4) {
      const k = (x - m) / (W - 2 * m),
        y = H - m - (0.12 + 0.7 * Math.pow(k, 1.1)) * (H - 2 * m);
      x === x0 ? cx.moveTo(x, y) : cx.lineTo(x, y);
    }
    cx.stroke();
  }
}
function play() {
  cancelAnimationFrame(raf);
  seed();
  size();
  t0 = performance.now();
  still ? draw() : (raf = requestAnimationFrame(frame));
}
addEventListener("resize", () => {
  size();
  draw();
});
document.getElementById("replay").onclick = () => {
  still = false;
  play();
};
setTheme(
  saved && ["fog", "moss", "dusk", "tide"].includes(saved)
    ? saved
    : matchMedia("(prefers-color-scheme:dark)").matches
      ? "dusk"
      : "fog",
);
play();

// ===== Live dashboards (sample data) =====
const NS = "http://www.w3.org/2000/svg",
  $ = (s, r = document) => r.querySelector(s);
function el(t, a, p) {
  const e = document.createElementNS(NS, t);
  for (const k in a) e.setAttribute(k, a[k]);
  if (p) p.appendChild(e);
  return e;
}
function shell(b) {
  b.innerHTML =
    '<div class="kpis"></div><div class="ctl"></div><div class="cw"></div><div class="tip"></div><p class="note">Sample data, for demonstration.</p>';
}
function kp(b, a) {
  $(".kpis", b).innerHTML = a
    .map(
      (x) =>
        '<div class="kpi"><b>' + x[1] + "</b><small>" + x[0] + "</small></div>",
    )
    .join("");
}
function tip(b, n, h) {
  const t = $(".tip", b),
    mv = (e) => {
      const r = b.getBoundingClientRect();
      t.innerHTML = h;
      t.style.opacity = 1;
      t.style.left =
        Math.max(0, Math.min(e.clientX - r.left + 12, r.width - 150)) + "px";
      t.style.top = e.clientY - r.top + 14 + "px";
    };
  ["pointerenter", "pointermove", "pointerdown"].forEach((v) =>
    n.addEventListener(v, mv),
  );
  n.addEventListener("pointerleave", () => (t.style.opacity = 0));
}
function chips(b, o, on, cb) {
  const c = $(".ctl", b);
  o.forEach((x) => {
    const e = document.createElement("button");
    e.className = "chip";
    e.textContent = x;
    e.onclick = () => cb(x);
    c.appendChild(e);
  });
  return () =>
    [...c.children].forEach((e) =>
      e.setAttribute("aria-pressed", on(e.textContent)),
    );
}

function sales(b) {
  shell(b);
  let cat = "All";
  const D = [
    ["Laptops", "Electronics", 482],
    ["Phones", "Electronics", 366],
    ["Headphones", "Electronics", 174],
    ["Office chairs", "Furniture", 238],
    ["Desks", "Furniture", 205],
    ["Shelves", "Furniture", 96],
    ["Notebooks", "Stationery", 82],
    ["Pens", "Stationery", 41],
  ];
  const mark = chips(
    b,
    ["All", "Electronics", "Furniture", "Stationery"],
    (x) => x === cat,
    (x) => {
      cat = x;
      r();
    },
  );
  function r() {
    mark();
    const d = D.filter((x) => cat === "All" || x[1] === cat).sort(
        (p, q) => q[2] - p[2],
      ),
      tot = d.reduce((s, x) => s + x[2], 0),
      avg = tot / d.length;
    kp(b, [
      ["Revenue", "\u20a6" + tot + "k"],
      ["Top product share", Math.round((d[0][2] / tot) * 100) + "%"],
      ["Below average", d.filter((x) => x[2] < avg).length + " of " + d.length],
    ]);
    const w = $(".cw", b);
    w.innerHTML = "";
    const s = el("svg", { viewBox: "0 0 600 " + (d.length * 34 + 6) }, w);
    d.forEach((x, i) => {
      const y = i * 34 + 4,
        u = x[2] < avg;
      el("text", { x: 0, y: y + 16 }, s).textContent = x[0];
      const bar = el(
        "rect",
        {
          x: 110,
          y,
          width: (x[2] / d[0][2]) * 400,
          height: 22,
          rx: 4,
          class: "hb",
          fill: u ? "var(--b)" : "var(--a)",
          style: "animation-delay:" + i * 60 + "ms",
        },
        s,
      );
      el(
        "text",
        { x: 116 + (x[2] / d[0][2]) * 400, y: y + 16 },
        s,
      ).textContent = "\u20a6" + x[2] + "k";
      tip(
        b,
        bar,
        x[0] +
          ": \u20a6" +
          x[2] +
          "k (" +
          Math.round((x[2] / tot) * 100) +
          "%)",
      );
    });
  }
  r();
}

function cust(b) {
  shell(b);
  let seed = 11;
  const rn = () => (seed = (seed * 16807) % 2147483647) / 2147483647,
    g = () => rn() + rn() + rn() - 1.5;
  const S = {
      Loyal: [16, 48, 3, 8, "var(--a)"],
      Occasional: [7, 30, 2.2, 7, "var(--b)"],
      "At risk": [2, 16, 1.4, 5, "var(--mute)"],
    },
    P = [];
  for (const k in S) {
    const s = S[k];
    for (let i = 0; i < 24; i++)
      P.push({
        k,
        x: Math.max(0.5, s[0] + g() * s[2] * 1.6),
        y: Math.max(3, s[1] + g() * s[3] * 1.6),
      });
  }
  const on = new Set(Object.keys(S));
  const mark = chips(
    b,
    Object.keys(S),
    (x) => on.has(x),
    (x) => {
      on.has(x) ? on.size > 1 && on.delete(x) : on.add(x);
      r();
    },
  );
  function r() {
    mark();
    const d = P.filter((p) => on.has(p.k)),
      m = (a) => d.reduce((s, p) => s + p[a], 0) / d.length;
    kp(b, [
      ["Customers shown", d.length],
      ["Avg orders / year", m("x").toFixed(1)],
      ["Avg spend", "\u20a6" + m("y").toFixed(0) + "k"],
    ]);
    const w = $(".cw", b);
    w.innerHTML = "";
    const s = el("svg", { viewBox: "0 0 600 270" }, w);
    for (let i = 0; i <= 3; i++) {
      const y = 10 + i * 70;
      el("line", { x1: 50, x2: 590, y1: y, y2: y, stroke: "var(--line)" }, s);
    }
    el("text", { x: 320, y: 268, "text-anchor": "middle" }, s).textContent =
      "Orders per year";
    el("text", { x: 0, y: 14 }, s).textContent = "Spend";
    d.forEach((p, i) => {
      const c = el(
        "circle",
        {
          cx: 50 + (p.x / 24) * 540,
          cy: 220 - (p.y / 70) * 210,
          r: 6,
          fill: S[p.k][4],
          "fill-opacity": 0.8,
          class: "dp",
          style: "animation-delay:" + i * 12 + "ms",
        },
        s,
      );
      tip(
        b,
        c,
        p.k + ": " + p.x.toFixed(0) + " orders, \u20a6" + p.y.toFixed(0) + "k",
      );
    });
  }
  r();
}

function biz(b) {
  shell(b);
  let n = 12;
  const M = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" "),
    V = [310, 295, 340, 360, 352, 410, 438, 421, 470, 505, 498, 560];
  const mark = chips(
    b,
    ["3M", "6M", "12M"],
    (x) => x === n + "M",
    (x) => {
      n = parseInt(x);
      r();
    },
  );
  function r() {
    mark();
    const v = V.slice(-n),
      m = M.slice(-n),
      mn = Math.min(...v) * 0.9,
      mx = Math.max(...v) * 1.05,
      sum = v.reduce((a, c) => a + c, 0),
      ch = (v[v.length - 1] / v[0] - 1) * 100;
    kp(b, [
      ["Revenue", "\u20a6" + (sum / 1000).toFixed(2) + "M"],
      ["Change over range", (ch >= 0 ? "+" : "") + ch.toFixed(0) + "%"],
      ["Best month", m[v.indexOf(Math.max(...v))]],
    ]);
    const w = $(".cw", b);
    w.innerHTML = "";
    const s = el("svg", { viewBox: "0 0 600 250" }, w),
      X = (i) => 40 + (i / (v.length - 1)) * 540,
      Y = (a) => 210 - ((a - mn) / (mx - mn)) * 190;
    for (let i = 0; i < 4; i++)
      el(
        "line",
        {
          x1: 40,
          x2: 580,
          y1: 20 + i * 63,
          y2: 20 + i * 63,
          stroke: "var(--line)",
        },
        s,
      );
    const pts = v.map((a, i) => X(i) + "," + Y(a));
    el(
      "path",
      {
        d: "M" + pts.join("L") + "L580,210L40,210Z",
        fill: "var(--a)",
        "fill-opacity": 0.12,
        class: "dp",
      },
      s,
    );
    el(
      "path",
      {
        d: "M" + pts.join("L"),
        class: "ln",
        pathLength: 1,
        "stroke-dasharray": 1,
        style: "animation:dr 1.2s ease both",
      },
      s,
    );
    v.forEach((a, i) => {
      el("text", { x: X(i), y: 236, "text-anchor": "middle" }, s).textContent =
        m[i];
      const c = el(
        "circle",
        { cx: X(i), cy: Y(a), r: 5, fill: "var(--b)", class: "dp" },
        s,
      );
      tip(b, c, m[i] + ": \u20a6" + a + "k");
    });
  }
  r();
}
document
  .querySelectorAll(".dash")
  .forEach((b) => ({ sales, cust, biz })[b.dataset.d](b));
