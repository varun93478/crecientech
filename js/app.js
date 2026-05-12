

$(document).ready(function () {
    //Owl
    $('.hero-slider').owlCarousel({
        loop: true,
        margin: 0,
        items: 1,
        dots: false,
        navText: ['PREV', 'NEXT'],
        smartSpeed: 1000,
        autoplay: true,
        autoplayTimeout: 7000,
        responsive: {
            0: {
                nav: false,
            },
            768: {
                nav: true,
            }
        }
    })

    $('#projects-slider').owlCarousel({
        loop: true,
        nav: false,
        items: 2,
        dots: true,
        smartSpeed: 600,
        center: true,
        autoplay: true,
        autoplayTimeout: 4000,
        responsive: {
            0: {
                items: 1
            },
            768: {
                items: 2,
                margin: 8,
            }
        }
    })

    $('.reviews-slider').owlCarousel({
        loop: true,
        nav: false,
        dots: true,
        smartSpeed: 900,
        items: 1,
        margin: 24,
        autoplay: true,
        autoplayTimeout: 4000,
    })

    function ensureContactForm() {
        var container = $('footer .col-lg-6.col-md-12');
        if (!container.length) return;
        container.find('.crmWebToEntityForm').remove();
        if (container.find('.contact-form').length) return;
        var html = '' +
            '<div id="contact-form-wrapper" style="max-width: 600px;">' +
            '<h2 class="font-mont">Contact Us</h2>' +
            '<form class="contact-form" novalidate>' +
            '<div class="mb-3"><label for="contact-name" class="form-label">Name</label><input type="text" id="contact-name" name="name" class="form-control" required aria-required="true"></div>' +
            '<div class="mb-3"><label for="contact-email" class="form-label">Email</label><input type="email" id="contact-email" name="email" class="form-control" required aria-required="true" inputmode="email" autocomplete="email"></div>' +
            '<div class="mb-3"><label for="contact-subject" class="form-label">Subject</label><input type="text" id="contact-subject" name="subject" class="form-control" required aria-required="true"></div>' +
            '<div class="mb-3"><label for="contact-message" class="form-label">Message</label><textarea id="contact-message" name="message" class="form-control" rows="5" required aria-required="true"></textarea></div>' +
            '<button type="submit" class="btn btn-primary">Submit</button>' +
            '<div class="mt-2 contact-status" role="status" aria-live="polite"></div>' +
            '</form>' +
            '</div>';
        container.append(html);
    }

    function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }

    function showFieldError($field, message) {
        var id = $field.attr('id');
        var $feedback = $('#' + id + '-error');
        $field.addClass('is-invalid').attr('aria-invalid', 'true');
        if ($feedback.length) { $feedback.text(message); }
    }

    function clearFieldError($field) {
        var id = $field.attr('id');
        var $feedback = $('#' + id + '-error');
        $field.removeClass('is-invalid').removeAttr('aria-invalid');
        if ($feedback.length) { $feedback.text(''); }
    }

    function bindContactForm() {
        $('.contact-form').each(function () {
            var form = $(this);
            var status = form.find('.contact-status');
            var btn = form.find('button[type="submit"]');
            btn.on('click', function(){ status.removeClass('text-danger text-success').text(''); });
            form.on('submit', function (e) {
                e.preventDefault();
                status.removeClass('text-danger text-success').text('');
                var $name = form.find('#contact-name');
                var $email = form.find('#contact-email');
                var $subject = form.find('#contact-subject');
                var $message = form.find('#contact-message');
                var name = ($name.val() || '').trim();
                var email = ($email.val() || '').trim();
                var subject = ($subject.val() || '').trim();
                var message = ($message.val() || '').trim();

                var firstInvalid = null;
                [$name, $email, $subject, $message].forEach(clearFieldError);
                if (!name || name.length < 2) { showFieldError($name, 'Please enter your name.'); firstInvalid = firstInvalid || $name; }
                if (!email || !isValidEmail(email)) { showFieldError($email, 'Please enter a valid email address.'); firstInvalid = firstInvalid || $email; }
                if (!subject) { showFieldError($subject, 'Please enter a subject.'); firstInvalid = firstInvalid || $subject; }
                if (!message || message.length < 5) { showFieldError($message, 'Please enter a message (min 5 characters).'); firstInvalid = firstInvalid || $message; }
                if (firstInvalid) { status.addClass('text-danger').text('Please correct the highlighted fields.'); firstInvalid.focus(); return; }
                btn.prop('disabled', true).attr('aria-busy', 'true');
                fetch('https://formsubmit.co/ajax/varun.j@crecientech.com', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ name: name, email: email, subject: subject, message: message })
                }).then(function (r) {
                    if (!r.ok) throw new Error('fail');
                    return r.json();
                }).then(function () {
                    var path = (window.location && window.location.pathname) || '';
                    status.removeClass('text-danger contact-status-error contact-status-success').addClass('d-none');
                    status.text('');
                    form[0].reset();
                    if (window.bootstrap && document.getElementById('contactSuccessModal')) {
                        var modal = new bootstrap.Modal(document.getElementById('contactSuccessModal'));
                        modal.show();
                    }
                }).catch(function () {
                    status.removeClass('contact-status-success').addClass('text-danger');
                    status.text('Submission failed. Please try again later.');
                }).finally(function () {
                    btn.prop('disabled', false).attr('aria-busy', 'false');
                });
            });

            form.on('input', 'input, textarea', function(){ clearFieldError($(this)); });
        });
    }

    ensureContactForm();
    bindContactForm();

    function getPlaceholderData(label) {
        var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" role="img" aria-label="'+(label||'Image unavailable')+'"><rect width="24" height="24" rx="4" fill="#e9ecef"/><path d="M4 16l4-4 3 3 4-5 5 6v2H4z" fill="#adb5bd"/><circle cx="9" cy="8" r="2" fill="#adb5bd"/></svg>';
        return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }

    $('img').on('error', function () {
        var el = this;
        el.onerror = null;
        var label = el.alt && el.alt.length ? el.alt + ' (unavailable)' : 'Image unavailable';
        el.src = getPlaceholderData(label);
        el.alt = label;
        el.setAttribute('aria-label', label);
        el.classList.add('img-placeholder');
    });
});
