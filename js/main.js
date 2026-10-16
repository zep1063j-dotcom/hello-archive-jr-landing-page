/*
 * Hello Archive jr 랜딩페이지 스크립트 (Vanilla JS, 의존성 없음)
 * 설정값은 js/config.js 에서만 관리합니다.
 */
(function () {
  'use strict';

  var CFG = Object.assign({
    GOOGLE_FORM_URL: '',
    FORM_SOURCE_FIELD: '',
    GA4_MEASUREMENT_ID: '',
    SITE_VARIANT: 'hello_archive_jr',
    OPERATOR_NAME: '',
    CONTACT_EMAIL: '',
    PRIVACY_POLICY_URL: ''
  }, window.HELLO_ARCHIVE_JR_CONFIG || {});

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var hasIO = 'IntersectionObserver' in window;

  /* ------------------------------------------------------------
   * 분석 (GA4) — 측정 ID가 없으면 아무것도 전송하지 않습니다.
   * ---------------------------------------------------------- */
  var analyticsOn = false;
  (function initAnalytics() {
    var id = String(CFG.GA4_MEASUREMENT_ID || '').trim();
    if (!id) return;
    if (!/^G-[A-Z0-9]{4,}$/.test(id)) {
      console.warn('[Hello Archive jr] GA4_MEASUREMENT_ID 형식이 올바르지 않아 분석을 사용하지 않습니다.');
      return;
    }
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', id, { site_variant: CFG.SITE_VARIANT }); // page_view 자동 수집
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(id);
    document.head.appendChild(s);
    analyticsOn = true;
  })();

  function track(name, params) {
    if (!analyticsOn || typeof window.gtag !== 'function') return;
    window.gtag('event', name, Object.assign({ site_variant: CFG.SITE_VARIANT }, params || {}));
  }

  /* ------------------------------------------------------------
   * 사전 신청 CTA — Google Forms 연결
   * ---------------------------------------------------------- */
  var formUrl = (function () {
    var raw = String(CFG.GOOGLE_FORM_URL || '').trim();
    if (!raw) return '';
    if (!/^https:\/\/(docs\.google\.com\/forms\/|forms\.gle\/)/.test(raw)) {
      console.warn('[Hello Archive jr] GOOGLE_FORM_URL 은 Google Forms 주소(https://docs.google.com/forms/... 또는 https://forms.gle/...)여야 합니다.');
      return '';
    }
    try {
      var u = new URL(raw);
      var field = String(CFG.FORM_SOURCE_FIELD || '').trim();
      if (/^entry\.\d+$/.test(field) && u.hostname === 'docs.google.com') {
        var q = new URLSearchParams(location.search);
        var src = q.get('utm_source') || 'direct';
        var med = q.get('utm_medium');
        u.searchParams.set('usp', 'pp_url');
        u.searchParams.set(field, med ? src + ' / ' + med : src);
      }
      return u.toString();
    } catch (e) { return ''; }
  })();
  var formReady = !!formUrl;
  document.documentElement.setAttribute('data-form', formReady ? 'ready' : 'pending');

  var dialog = $('#prep-dialog');
  function openPrepDialog() {
    if (!dialog) return;
    var dev = $('#prep-dev');
    if (dev && /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname)) dev.hidden = false;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  if (dialog) {
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
  }

  $$('[data-cta]').forEach(function (el) {
    var where = el.getAttribute('data-cta');
    if (formReady) {
      el.setAttribute('href', formUrl);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    }
    el.addEventListener('click', function (e) {
      var evt = where === 'hero' ? 'hero_cta_click' : where === 'final' ? 'final_cta_click' : 'cta_click';
      track(evt, { cta_location: where });
      if (formReady) {
        track('form_link_click', { cta_location: where }); // 이동 클릭일 뿐, 신청 완료가 아닙니다.
      } else {
        e.preventDefault();
        openPrepDialog();
      }
    });
  });

  $$('[data-cta-status]').forEach(function (el) {
    el.textContent = formReady
      ? '버튼을 누르면 Google 설문(폼) 페이지가 새 창으로 열립니다.'
      : '사전 신청 폼을 준비 중입니다. 곧 열릴 예정이에요.';
  });

  /* ------------------------------------------------------------
   * 푸터: 운영자 정보 / 연도
   * ---------------------------------------------------------- */
  (function footer() {
    var year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());
    var box = $('#footer-links');
    if (!box) return;
    function addLink(text, href, ext) {
      var a = document.createElement('a');
      a.textContent = text;
      a.href = href;
      if (ext) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
      box.appendChild(a);
    }
    if (CFG.OPERATOR_NAME) {
      var s = document.createElement('span');
      s.textContent = '운영: ' + CFG.OPERATOR_NAME + ' ';
      box.appendChild(s);
    }
    if (CFG.CONTACT_EMAIL && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(CFG.CONTACT_EMAIL)) addLink('문의 ' + CFG.CONTACT_EMAIL, 'mailto:' + CFG.CONTACT_EMAIL, false);
    if (CFG.PRIVACY_POLICY_URL && /^https:\/\//.test(CFG.PRIVACY_POLICY_URL)) addLink('개인정보 처리 안내', CFG.PRIVACY_POLICY_URL, true);
  })();

  /* ------------------------------------------------------------
   * 헤더 스크롤 상태
   * ---------------------------------------------------------- */
  (function header() {
    var h = $('.site-header');
    if (!h) return;
    var ticking = false;
    function update() { h.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ------------------------------------------------------------
   * 스크롤 등장
   * ---------------------------------------------------------- */
  (function reveal() {
    var els = $$('.reveal');
    if (!hasIO || reduceMotion.matches) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ------------------------------------------------------------
   * 접근 가능한 탭 (role=tablist) — 공통
   * ---------------------------------------------------------- */
  function initTabs(root, onChange) {
    var tabs = $$('[role="tab"]', root);
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    function select(i, focus, user) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        if (panels[k]) panels[k].hidden = !on;
      });
      if (focus) tabs[i].focus();
      if (onChange) onChange(i, tabs[i], !!user);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false, true); });
      t.addEventListener('keydown', function (e) {
        var n = tabs.length, k = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') k = (i + 1) % n;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') k = (i - 1 + n) % n;
        else if (e.key === 'Home') k = 0;
        else if (e.key === 'End') k = n - 1;
        if (k !== null) { e.preventDefault(); select(k, true, true); }
      });
    });
    select(0, false, false);
    return { select: select };
  }

  /* ------------------------------------------------------------
   * 성장 프로젝트: 1개월 / 3개월 / 1년
   * ---------------------------------------------------------- */
  (function projects() {
    var root = $('[data-tabs-id="projects"]');
    if (!root) return;
    var cells = $$('#proj-strip i');
    var caption = $('#proj-caption');
    initTabs(root, function (i, tab, user) {
      var span = parseInt(tab.getAttribute('data-span'), 10) || 1;
      cells.forEach(function (c, k) { c.classList.toggle('is-on', k < span); });
      if (caption) caption.textContent = tab.getAttribute('data-caption') || '';
      if (user) track('growth_project_select', { project: tab.getAttribute('data-key') });
    });

    var sec = $('#projects');
    if (sec && hasIO) {
      var seen = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { track('growth_projects_view'); seen.disconnect(); }
      }, { threshold: 0.35 });
      seen.observe(sec);
    }
  })();

  /* ------------------------------------------------------------
   * 나이별 답변 / 결과물 형태 탭
   * ---------------------------------------------------------- */
  (function simpleTabs() {
    var age = $('[data-tabs-id="timeline"]');
    if (age) initTabs(age);
    var book = $('[data-tabs-id="book"]');
    if (book) initTabs(book);
  })();

  /* ------------------------------------------------------------
   * How it works: 단계별 누적 시각화
   * ---------------------------------------------------------- */
  (function how() {
    var list = $('#how-steps');
    var stage = $('#how-stage');
    if (!list || !stage) return;
    var btns = $$('.step', list);
    var parts = $$('[data-from]', stage);
    var timer = null;
    var cur = 1;

    function set(n) {
      cur = n;
      btns.forEach(function (b) {
        var on = parseInt(b.getAttribute('data-step'), 10) === n;
        b.classList.toggle('is-active', on);
        if (on) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      parts.forEach(function (p) {
        p.classList.toggle('is-on', n >= parseInt(p.getAttribute('data-from'), 10));
      });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function play() {
      if (reduceMotion.matches || timer) return;
      timer = setInterval(function () { set(cur >= 4 ? 1 : cur + 1); }, 3200);
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () { stop(); set(parseInt(b.getAttribute('data-step'), 10)); });
    });
    set(1);

    if (hasIO) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) play(); else stop();
      }, { threshold: 0.4 }).observe(list);
    }
  })();

  /* ------------------------------------------------------------
   * 기록 체험 데모 (저장·전송 없음)
   * ---------------------------------------------------------- */
  (function demo() {
    var form = $('#demo-form');
    if (!form) return;
    var qEl = $('#demo-question');
    var text = $('#demo-text');
    var count = $('#demo-count');
    var status = $('#demo-status');
    var photoBtn = $('#demo-photo-btn');
    var photo = $('#demo-photo');
    var dots = $$('#demo-dots li');
    var prog = $('#demo-progress');
    var dateEl = $('#demo-date');

    var samples = [
      { q: '요즘 가장 행복한 순간은 언제야?', a: '요즘 우리 아이는 학교가 끝난 뒤 친구들과 자전거를 타는 시간을 가장 좋아한다.' },
      { q: '요즘 가장 배우고 싶은 것은?', a: '피아노로 좋아하는 만화 주제곡을 직접 치고 싶다고 했다.' },
      { q: '가장 친한 친구는 누구야?', a: '짝꿍이랑 제일 친하대요. 쉬는 시간마다 같이 그림을 그린다고 해요.' },
      { q: '미래의 나에게 전하고 싶은 말은?', a: '지금처럼 웃으면서 살았으면 좋겠어. 그리고 공룡 좋아하는 거 잊지 마!' }
    ];
    var idx = 0;
    var edited = false;
    var saved = 2;

    try {
      dateEl.textContent = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date());
    } catch (e) { /* 기본 문구 유지 */ }

    function updateCount() { count.textContent = text.value.length + '/' + text.maxLength; }
    function say(msg) { status.textContent = msg; }
    function paintProgress(pop) {
      dots.forEach(function (d, k) { d.classList.toggle('on', k < saved); });
      if (pop && dots[saved - 1]) {
        dots[saved - 1].classList.add('pop');
        setTimeout(function () { dots[saved - 1] && dots[saved - 1].classList.remove('pop'); }, 450);
      }
      prog.textContent = saved + ' / ' + dots.length;
    }
    function nextQuestion() {
      idx = (idx + 1) % samples.length;
      qEl.textContent = samples[idx].q;
      text.value = samples[idx].a;
      edited = false;
      updateCount();
    }

    text.addEventListener('input', function () { edited = true; updateCount(); });
    $('#demo-next-q').addEventListener('click', function () {
      nextQuestion();
      say('다른 질문을 가져왔어요. 마음에 드는 질문을 골라 적으면 돼요.');
    });
    $('#demo-skip').addEventListener('click', function () {
      nextQuestion();
      say('괜찮아요. 이번 주는 비워 두고, 다음 질문부터 이어가면 됩니다.');
    });
    photoBtn.addEventListener('click', function () {
      var on = photo.hidden;
      photo.hidden = !on;
      photoBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      photoBtn.textContent = on ? '− 사진 빼기' : '＋ 사진 첨부 (선택)';
      say(on ? '예시 사진이 붙었어요. 사진은 언제나 선택 사항이에요.' : '사진 없이도 기록은 충분해요.');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!text.value.trim()) { say('한 줄만 적어 보세요. 아주 짧아도 괜찮아요.'); text.focus(); return; }
      if (saved < dots.length) {
        saved += 1;
        paintProgress(true);
        say(saved === dots.length
          ? '체험용 데모예요(저장되지 않음). 실제라면 이번 달의 미니 챕터가 완성되는 순간이에요!'
          : '체험용 데모예요(저장되지 않음). 실제라면 이번 달 기록이 ' + saved + '개 쌓였을 거예요.');
      } else {
        say('체험용 데모예요(저장되지 않음). 이번 달 미니 챕터는 이미 완성된 예시예요.');
      }
    });
    updateCount();
    paintProgress(false);
  })();

  /* ------------------------------------------------------------
   * 하드커버 기록집 플립북
   * ---------------------------------------------------------- */
  (function flipbook() {
    var flip = $('#flip');
    if (!flip) return;
    var leaves = $$('.leaf', flip);
    var prev = $('#flip-prev');
    var next = $('#flip-next');
    var caption = $('#flip-caption');
    var dotsBox = $('#flip-dots');
    var titles = ['표지', '차례', '질문과 답변', '사진과 함께한 기록', '부모의 편지', '연간 성장 챕터'];
    var cur = 0;
    // 앞쪽 페이지가 위에 쌓이도록 z-index 지정 (표지가 맨 위)
    leaves.forEach(function (l, k) { l.style.zIndex = String(leaves.length - k); });

    var dotBtns = titles.map(function (t, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', (i + 1) + '쪽 · ' + t);
      b.addEventListener('click', function () { go(i, true); });
      dotsBox.appendChild(b);
      return b;
    });

    function go(i, announce) {
      cur = Math.max(0, Math.min(leaves.length - 1, i));
      leaves.forEach(function (l, k) { l.classList.toggle('is-flipped', k < cur); });
      prev.disabled = cur === 0;
      next.disabled = cur === leaves.length - 1;
      dotBtns.forEach(function (b, k) { if (k === cur) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      caption.textContent = (cur + 1) + ' / ' + leaves.length + ' · ' + titles[cur];
      if (announce) track('book_page_view', { page: titles[cur] });
    }
    prev.addEventListener('click', function () { go(cur - 1, true); });
    next.addEventListener('click', function () { go(cur + 1, true); });
    flip.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1, true); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1, true); }
    });
    var sx = null;
    var swiped = false;
    flip.addEventListener('pointerdown', function (e) { sx = e.clientX; swiped = false; });
    flip.addEventListener('pointerup', function (e) {
      if (sx === null) return;
      var dx = e.clientX - sx;
      sx = null;
      if (Math.abs(dx) > 40) { swiped = true; go(dx < 0 ? cur + 1 : cur - 1, true); }
    });
    // 스와이프 직후 이어서 발생하는 click 이 페이지를 한 번 더 넘기지 않도록 무시
    flip.addEventListener('click', function (e) {
      if (swiped) { swiped = false; return; }
      var r = flip.getBoundingClientRect();
      go(e.clientX - r.left > r.width / 2 ? cur + 1 : cur - 1, true);
    });
    go(0, false);
  })();

  /* ------------------------------------------------------------
   * FAQ 아코디언
   * ---------------------------------------------------------- */
  (function faq() {
    $$('.acc-btn').forEach(function (btn) {
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', open ? 'false' : 'true');
        panel.classList.toggle('is-open', !open);
      });
    });
  })();
})();
