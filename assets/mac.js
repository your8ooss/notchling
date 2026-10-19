/* Анимация панели в превью Mac. data-mode: auto (сама листает вкладки), live (по наведению и клику), still (одна вкладка). */
(function () {
  var TABS = [
    { id: 'sessions', img: 'assets/shot-sessions.png', glow: 'work', x: .054 },
    { id: 'office', img: 'assets/shot-office.png', glow: 'done', x: .109 },
    { id: 'notes', img: 'assets/shot-notes.png', glow: '', x: .167 },
    { id: 'awake', img: 'assets/shot-awake.png', glow: '', x: .224 },
  ];
  var WALL = '<svg class="wall" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient></defs>' +
    '<circle cx="118" cy="34" r="9" fill="#fff" opacity=".85"/><circle cx="118" cy="34" r="22" fill="#fff" opacity=".12"/>' +
    '<path d="M0 70 L22 48 L40 62 L64 36 L90 64 L112 50 L136 66 L160 46 L160 100 L0 100Z" fill="#3b3f73" opacity=".7"/>' +
    '<path d="M0 82 L26 62 L50 78 L78 56 L104 80 L132 62 L160 78 L160 100 L0 100Z" fill="#262a55" opacity=".85"/>' +
    '<path d="M0 92 L30 80 L60 90 L96 76 L130 90 L160 82 L160 100 L0 100Z" fill="#151833"/></svg>';

  function build(el) {
    var mode = el.dataset.mode || 'auto', start = parseInt(el.dataset.tab || '0', 10);
    el.classList.add('mac');
    el.innerHTML = '<div class="lid"><div class="screen">' + WALL +
      '<div class="menubar"><span>&#63743; &nbsp;Finder &nbsp; Файл &nbsp; Правка</span><span><i></i><i></i><i></i></span></div>' +
      '<div class="hw"></div><div class="eyes"><b></b><b></b></div>' +
      '<div class="panel">' + TABS.map(function (t, i) { return '<img src="' + t.img + '" alt="" class="' + (i === start ? 'on' : '') + '">'; }).join('') + '</div>' +
      ((mode === 'live' || mode === 'hybrid') ? TABS.map(function (t, i) { return '<div class="hit" data-ti="' + i + '" style="left:' + (30 + 40 * t.x - 2.7).toFixed(2) + '%"></div>'; }).join('') : '') +
      '<div class="dock">' + '<i></i>'.repeat(9) + '</div></div></div><div class="base"></div>';
    var imgs = el.querySelectorAll('.panel img'), cur = start, timer;
    function show(i) {
      cur = i;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === i); });
      el.dataset.glow = TABS[i].glow;
      el.dispatchEvent(new CustomEvent('tab', { detail: TABS[i].id }));
    }
    function open(v) { el.classList.toggle('open', v); if (!v) el.dataset.glow = ''; else el.dataset.glow = TABS[cur].glow; }
    el._mac = { show: show, open: open };
    if (mode === 'still') { open(true); return; }
    if (mode === 'live' || mode === 'hybrid') {
      var hw = el.querySelector('.hw'), screen = el.querySelector('.screen'), hideT;
      function enter() { clearTimeout(hideT); el._touched = true; clearTimeout(el._auto); open(true); }
      function leave() { hideT = setTimeout(function () { open(false); }, 500); }
      hw.addEventListener('mouseenter', enter); el.querySelector('.panel').addEventListener('mouseenter', enter);
      hw.addEventListener('mouseleave', leave); el.querySelector('.panel').addEventListener('mouseleave', leave);
      el.querySelectorAll('.hit').forEach(function (h) {
        h.addEventListener('mouseenter', enter);
        h.addEventListener('click', function () { show(parseInt(h.dataset.ti, 10)); enter(); });
      });
      if (mode === 'hybrid') { autoRun(); }
      return;
    }
    // auto: раскрыть, пролистать вкладки, свернуть, повторить
    function autoRun() {
      var timer, i = 0;
      function loop() {
        if (el._touched) return;
        i = 0;
        el.dataset.glow = 'wait'; open(false);
        timer = el._auto = setTimeout(function () {
          if (el._touched) return;
          open(true); show(0);
          (function next() {
            timer = el._auto = setTimeout(function () {
              if (el._touched) return;
              i++;
              if (i < TABS.length) { show(i); next(); }
              else { open(false); timer = el._auto = setTimeout(loop, 2200); }
            }, 3200);
          })();
        }, 1800);
      }
      var io2 = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting && !el._run) { el._run = true; loop(); } else if (!e.isIntersecting) { clearTimeout(timer); el._run = false; } }); }, { threshold: .3 });
      io2.observe(el);
    }
    autoRun();
  }
  document.querySelectorAll('[data-mac]').forEach(build);
  window.MacDemo = { TABS: TABS };
})();
