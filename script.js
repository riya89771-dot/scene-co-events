// Details modal: cards open it instead of jumping straight to the form
(function () {
  document.querySelectorAll('.event__link').forEach(function (a) { a.removeAttribute('data-pick'); });
})();
(function () {
  var form = document.getElementById('form');
  var date = document.getElementById('date');
  var time = document.getElementById('time');
  var note = document.getElementById('note');
  var pick = document.getElementById('pick');

  // No past dates
  var d = new Date();
  var iso = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  date.min = iso;

  // Venue availability: 5pm–11pm, every 30 minutes
  for (var h = 17; h <= 22; h++) {
    [0, 30].forEach(function (m) {
      if (h === 22 && m === 30) return;
      var v = String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
      var hr12 = h > 12 ? h - 12 : h;
      var o = document.createElement('option');
      o.value = v;
      o.textContent = hr12 + ':' + String(m).padStart(2, '0') + ' pm';
      time.appendChild(o);
    });
  }

  // Remember which event/venue the guest chose
  var selected = '';
  document.querySelectorAll('[data-pick]').forEach(function (a) {
    a.addEventListener('click', function () {
      selected = a.getAttribute('data-pick');
      pick.textContent = 'Selected: ' + selected;
      pick.hidden = false;
      note.hidden = true;
      setTimeout(function () { document.getElementById('name').focus({ preventScroll: true }); }, 400);
    });
  });

  function setErr(input, msg) {
    var f = input.closest('.field');
    document.getElementById(input.id + '-err').textContent = msg;
    f.classList.toggle('invalid', !!msg);
    if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    return !msg;
  }

  function validate() {
    var name = document.getElementById('name');
    var ok = true, first = null;
    function check(input, msg) { if (!setErr(input, msg)) { ok = false; first = first || input; } }
    check(name, name.value.trim().length < 2 ? 'Please enter your name or contact details.' : '');
    check(date, !date.value ? 'Please choose a date.' : date.value < iso ? 'Please choose today or a future date.' : '');
    check(time, !time.value ? 'Please select a time.' : '');
    if (first) first.focus();
    return ok;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    note.hidden = true;
    if (!validate()) return;
    note.textContent = 'Thank you, ' + document.getElementById('name').value.trim() +
      '. Your request for ' + date.value + ' at ' + time.options[time.selectedIndex].text +
      (selected ? ' (' + selected + ')' : '') +
      ' has been received. This is not a confirmed reservation — our team will contact you to confirm availability.';
    note.hidden = false;
    note.focus();
  });

  [document.getElementById('name'), date, time].forEach(function (i) {
    i.addEventListener('input', function () { if (i.value) setErr(i, ''); });
  });
})();

(function(){
  var chips=document.querySelectorAll('.chip'), rows=document.querySelectorAll('.event');
  chips.forEach(function(c){c.addEventListener('click',function(){
    var f=c.getAttribute('data-filter');
    chips.forEach(function(x){var on=x===c;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on);});
    rows.forEach(function(r){r.hidden=!(f==='all'||r.getAttribute('data-cat')===f);});
  });});
})();


(function(){
  var chips=document.querySelectorAll('[data-vfilter]'), cards=document.querySelectorAll('.vgrid .feature');
  chips.forEach(function(c){c.addEventListener('click',function(){
    var f=c.getAttribute('data-vfilter');
    chips.forEach(function(x){var on=x===c;x.classList.toggle('is-on',on);x.setAttribute('aria-pressed',on);});
    cards.forEach(function(r){r.hidden=!(f==='all'||r.getAttribute('data-vcat')===f);});
  });});
})();


(function () {
  var dlg = document.getElementById('modal');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  var last = null;
  var EXTRA = {
    Dining: ['Table service and a welcome drink on arrival', 'Smart-casual dress code', 'Dietary requirements catered for on request'],
    Concerts: ['Doors open 30 minutes before the start time', 'Full bar and food available all evening', 'Cloakroom and accessible viewing area'],
    Corporate: ['Wi-Fi, AV equipment and on-site event team', 'Catering packages from coffee breaks to full dinners', 'Private entrance and dedicated host'],
    Indoor: ['Climate-controlled with in-house sound and lighting', 'Catering and bar service available', 'Step-free access'],
    Outdoor: ['Weather-ready cover and heaters available', 'Catering and bar service available', 'Step-free access to the main area'],
    Food: ['Chef-led menus and bar service', 'Seated or standing formats', 'Dietary requirements catered for on request']
  };
  function text(el, sel) { var n = el.querySelector(sel); return n ? n.textContent.trim() : ''; }
  function open(card, isEvent) {
    var title = text(card, 'h3');
    var type = isEvent ? text(card, '.event__type') : text(card, '.eyebrow');
    var cat = isEvent ? card.getAttribute('data-cat') : card.getAttribute('data-vcat');
    var photo = card.querySelector('.photo');
    var pm = (photo.className.match(/photo--[\w-]+/) || [''])[0];
    var p = document.getElementById('m-photo');
    p.className = 'modal__photo photo ' + pm;
    p.setAttribute('aria-label', photo.getAttribute('aria-label') || title);
    document.getElementById('m-type').textContent = type;
    document.getElementById('m-title').textContent = title;
    var when = document.getElementById('m-when'), desc = document.getElementById('m-desc');
    var facts = document.getElementById('m-facts'); facts.innerHTML = '';
    var items = (EXTRA[cat] || EXTRA.Dining).slice();
    if (isEvent) {
      var ps = card.querySelectorAll('.event__info p');
      when.textContent = ps[0].textContent.trim(); when.hidden = false;
      desc.textContent = ps[1].textContent.trim() + '. Reserve early: popular nights fill up quickly.';
    } else {
      when.hidden = true;
      var d = text(card, '.feature__text > p:not(.eyebrow)');
      desc.textContent = d;
      var cap = d.match(/(?:up to |for )([\d,]+(?:\s*to\s*[\d,]+)?)/i);
      if (cap) items.unshift('Capacity: ' + cap[1].replace(/\s*to\s*/, '–') + ' guests');
    }
    items.forEach(function (t) { var li = document.createElement('li'); li.textContent = t; facts.appendChild(li); });
    var r = document.getElementById('m-reserve');
    r.setAttribute('data-pick', (isEvent ? '' : 'Venue: ') + title + (isEvent && when.textContent ? ' — ' + when.textContent.split(',')[1].trim().replace(/\s·.*/, '').replace(/^(\w{3})\w*/, '$1') : ''));
    r.textContent = isEvent ? 'Book This Event' : 'Reserve This Venue';
    last = document.activeElement;
    dlg.showModal();
    document.body.style.overflow = 'hidden';
    dlg.querySelector('.modal__box').scrollTop = 0;
  }
  function close() { dlg.close(); }
  dlg.addEventListener('close', function () { document.body.style.overflow = ''; if (last && last.focus) last.focus(); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
  document.getElementById('m-close').addEventListener('click', close);
  document.getElementById('m-dismiss').addEventListener('click', close);
  document.getElementById('m-reserve').addEventListener('click', function () { dlg.close(); });

  document.querySelectorAll('.event').forEach(function (c) {
    var link = c.querySelector('.event__link');
    link.setAttribute('role', 'button');
    link.setAttribute('aria-haspopup', 'dialog');
    link.addEventListener('click', function (e) { e.preventDefault(); open(c, true); });
    link.addEventListener('keydown', function (e) { if (e.key === ' ') { e.preventDefault(); open(c, true); } });
  });
  document.querySelectorAll('.vgrid .feature').forEach(function (c) {
    var btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'btn btn--ghost'; btn.textContent = 'Details';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.innerHTML = 'Details<span class="sr"> ' + text(c, 'h3') + '</span>';
    btn.addEventListener('click', function () { open(c, false); });
    var reserve = c.querySelector('.btn--gold');
    var row = document.createElement('div'); row.className = 'feature__actions';
    reserve.parentNode.insertBefore(row, reserve); row.appendChild(reserve); row.appendChild(btn);
    var ph = c.querySelector('.frame'); ph.style.cursor = 'pointer';
    ph.addEventListener('click', function () { open(c, false); });
  });
})();
