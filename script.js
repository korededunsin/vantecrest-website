document.addEventListener('DOMContentLoaded', function () {

  // ---- Year in footer ----
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---- Sidebar ----
  var menuToggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('sidebarOverlay');
  var closeBtn = document.getElementById('sidebarClose');

  function openSidebar() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-open');
    sidebar.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('no-scroll');
  }
  function closeSidebar() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-open');
    sidebar.setAttribute('aria-hidden', 'true');
    menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('no-scroll');
  }

  if (menuToggle) menuToggle.addEventListener('click', openSidebar);
  if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
  if (overlay) overlay.addEventListener('click', closeSidebar);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSidebar();
  });

  var sidebarLinks = sidebar ? sidebar.querySelectorAll('a') : [];
  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', closeSidebar);
  });

  // ---- Sticky header shadow on scroll ----
  var header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', function () {
      if (window.scrollY > 8) {
        header.style.boxShadow = '0 1px 0 rgba(27,29,25,0.06)';
      } else {
        header.style.boxShadow = 'none';
      }
    });
  }

  // ---- Contact form ----
  // Sends to info@vantecrest.com via FormSubmit (no custom backend required).
  // NOTE: the first submission after this goes live triggers a one-time
  // confirmation email to info@vantecrest.com from FormSubmit — that link
  // must be clicked once to activate delivery for all future submissions.
  var CONTACT_EMAIL = 'info@vantecrest.com';
  var contactForm = document.getElementById('contactForm');
  var formSuccess = document.getElementById('formSuccess');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      var submitBtn = contactForm.querySelector('button[type="submit"]');
      var originalLabel = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';
      }

      var data = new FormData(contactForm);
      data.append('_subject', 'New enquiry from the Vantecrest website');
      data.append('_captcha', 'false');

      fetch('https://formsubmit.co/ajax/' + CONTACT_EMAIL, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: data
      })
        .then(function (response) {
          if (!response.ok) throw new Error('Submission failed');
          contactForm.style.display = 'none';
          if (formSuccess) formSuccess.classList.add('is-visible');
        })
        .catch(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
          }
          alert('Something went wrong sending your message. Please email ' + CONTACT_EMAIL + ' directly.');
        });
    });
  }

  // ---- FAQ accordion ----
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      faqItems.forEach(function (other) {
        other.classList.remove('is-open');
        var q = other.querySelector('.faq-question');
        var a = other.querySelector('.faq-answer');
        if (q) q.setAttribute('aria-expanded', 'false');
        if (a) a.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ---- Newsletter form (front-end only) ----
  var newsletterForm = document.getElementById('newsletterForm');
  var newsletterNote = document.getElementById('newsletterNote');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (newsletterNote) newsletterNote.textContent = "Thanks — you're subscribed.";
      newsletterForm.reset();
    });
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Scroll-triggered reveals ----
  var revealEls = document.querySelectorAll('.reveal, .reveal-image');
  if (revealEls.length) {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach(function (el) { el.classList.add('in-view'); });
    } else {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  }

  // ---- Subtle parallax on layered/decorative images ----
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !prefersReducedMotion) {
    var ticking = false;
    function updateParallax() {
      var viewportH = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var factor = parseFloat(el.getAttribute('data-parallax')) || 0.1;
        var centerOffset = (rect.top + rect.height / 2) - viewportH / 2;
        el.style.transform = 'translateY(' + (centerOffset * -factor * 0.15) + 'px)';
      });
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    }, { passive: true });
    updateParallax();
  }

  // ---- Generic horizontal scroller (Approach) ----
  document.querySelectorAll('.scroll-btn[data-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var track = document.getElementById(btn.getAttribute('data-target'));
      if (!track) return;
      var dir = parseInt(btn.getAttribute('data-dir'), 10) || 1;
      var step = track.clientWidth * 0.7;
      track.scrollBy({ left: dir * step, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  // ---- Business Challenge — contained carousel with counter ----
  var challengeTrack = document.getElementById('challengeTrack');
  var challengePrev = document.getElementById('challengePrev');
  var challengeNext = document.getElementById('challengeNext');
  var challengeCurrent = document.getElementById('challengeCurrent');
  if (challengeTrack && challengeCurrent) {
    var challengeItems = challengeTrack.querySelectorAll('.challenge-item');
    var totalChallenges = challengeItems.length;

    function updateChallengeState() {
      var itemWidth = challengeItems[0] ? challengeItems[0].getBoundingClientRect().width + 24 : 1;
      var index = Math.round(challengeTrack.scrollLeft / itemWidth);
      index = Math.max(0, Math.min(totalChallenges - 1, index));
      challengeCurrent.textContent = String(index + 1).padStart(2, '0');

      var maxScroll = challengeTrack.scrollWidth - challengeTrack.clientWidth;
      if (challengePrev) challengePrev.classList.toggle('is-disabled', challengeTrack.scrollLeft <= 4);
      if (challengeNext) challengeNext.classList.toggle('is-disabled', challengeTrack.scrollLeft >= maxScroll - 4);
    }

    function scrollChallengeBy(dir) {
      var itemWidth = challengeItems[0] ? challengeItems[0].getBoundingClientRect().width + 24 : 300;
      challengeTrack.scrollBy({ left: dir * itemWidth, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }

    if (challengePrev) challengePrev.addEventListener('click', function () { scrollChallengeBy(-1); });
    if (challengeNext) challengeNext.addEventListener('click', function () { scrollChallengeBy(1); });

    var challengeTicking = false;
    challengeTrack.addEventListener('scroll', function () {
      if (!challengeTicking) {
        window.requestAnimationFrame(function () { updateChallengeState(); challengeTicking = false; });
        challengeTicking = true;
      }
    }, { passive: true });
    updateChallengeState();
  }

  // ---- Approach progress bar ----
  var approachTrack = document.getElementById('approachTrack');
  var approachProgress = document.getElementById('approachProgress');
  if (approachTrack && approachProgress) {
    function updateApproachProgress() {
      var max = approachTrack.scrollWidth - approachTrack.clientWidth;
      var ratio = max > 0 ? approachTrack.scrollLeft / max : 0;
      var pct = Math.min(100, Math.max(16, ratio * 100 + 16));
      approachProgress.style.width = pct + '%';
    }
    approachTrack.addEventListener('scroll', updateApproachProgress, { passive: true });
    updateApproachProgress();
  }

  // ---- Services editorial selector (desktop hover/click; CSS handles mobile stack) ----
  var serviceButtons = document.querySelectorAll('.service-nav-item');
  var serviceImage = document.getElementById('serviceImage');
  var serviceCaption = document.getElementById('serviceCaption');
  var serviceVisual = document.querySelector('.service-visual');
  if (serviceButtons.length && serviceImage && serviceCaption) {
    function activateService(btn) {
      serviceButtons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      var newImage = btn.getAttribute('data-image');
      var newCaption = btn.getAttribute('data-caption');
      if (serviceVisual) serviceVisual.classList.add('is-fading');
      setTimeout(function () {
        serviceImage.src = newImage;
        serviceCaption.textContent = newCaption;
        if (serviceVisual) serviceVisual.classList.remove('is-fading');
      }, prefersReducedMotion ? 0 : 150);
    }

    serviceButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { activateService(btn); });
      btn.addEventListener('mouseenter', function () {
        if (window.innerWidth >= 900) activateService(btn);
      });
    });
  }

  // ---- Industries — static image, text selector only ----
  var industryButtons = document.querySelectorAll('.industry-nav-item');
  if (industryButtons.length) {
    industryButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        industryButtons.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
      });
    });
  }

  // ---- Case study carousel ----
  var caseCarousel = document.getElementById('caseCarousel');
  if (caseCarousel) {
    var caseSlides = caseCarousel.querySelectorAll('.case-slide');
    var caseDots = document.querySelectorAll('#caseDots .case-dot');
    var caseIndex = 0;

    function goToCase(index) {
      caseIndex = (index + caseSlides.length) % caseSlides.length;
      caseSlides.forEach(function (slide, i) { slide.classList.toggle('is-active', i === caseIndex); });
      caseDots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === caseIndex); });
    }

    var prevBtn = document.getElementById('casePrev');
    var nextBtn = document.getElementById('caseNext');
    if (prevBtn) prevBtn.addEventListener('click', function () { goToCase(caseIndex - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goToCase(caseIndex + 1); });
    caseDots.forEach(function (dot, i) {
      dot.addEventListener('click', function () { goToCase(i); });
    });

    caseCarousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') goToCase(caseIndex - 1);
      if (e.key === 'ArrowRight') goToCase(caseIndex + 1);
    });

    var touchStartX = null;
    caseCarousel.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });
    caseCarousel.addEventListener('touchend', function (e) {
      if (touchStartX === null) return;
      var delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) goToCase(caseIndex + (delta < 0 ? 1 : -1));
      touchStartX = null;
    }, { passive: true });
  }

});
