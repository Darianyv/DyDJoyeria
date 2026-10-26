/* D&D Joyería · Interacciones del Inicio */
document.addEventListener('DOMContentLoaded', () => {

    /* ---- Menú hamburguesa ---- */
    const toggle = document.querySelector('.menu-toggle');
    const menu = document.getElementById('menu');
    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            const abierto = menu.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', abierto);
            toggle.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        });
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle.click();
        });
    }

    /* ---- Slider del banner principal ---- */
    const hero = document.querySelector('.hero');
    if (hero) {
        const slides = hero.querySelectorAll('.slide');
        const dotsBox = hero.querySelector('.slider-dots');
        let actual = 0, timer;

        const dots = [...slides].map((_, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.setAttribute('aria-label', 'Ir al banner ' + (i + 1));
            b.addEventListener('click', () => { mostrar(i); reiniciar(); });
            dotsBox.appendChild(b);
            return b;
        });

        function mostrar(i) {
            actual = (i + slides.length) % slides.length;
            slides.forEach((s, n) => s.classList.toggle('is-active', n === actual));
            dots.forEach((d, n) => d.setAttribute('aria-current', n === actual));
        }
        function reiniciar() {
            clearInterval(timer);
            if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
                timer = setInterval(() => mostrar(actual + 1), 6000);
            }
        }

        hero.querySelector('.prev').addEventListener('click', () => { mostrar(actual - 1); reiniciar(); });
        hero.querySelector('.next').addEventListener('click', () => { mostrar(actual + 1); reiniciar(); });
        hero.addEventListener('mouseenter', () => clearInterval(timer));
        hero.addEventListener('mouseleave', reiniciar);
        mostrar(0);
        reiniciar();
    }

    /* ---- Newsletter (aviso provisional, sin envío real) ---- */
    const form = document.querySelector('.newsletter-form');
    const msg = document.querySelector('.newsletter-msg');
    if (form && msg) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            msg.textContent = '¡Listo! Revisa tu correo para recibir tu 10% de descuento.';
            form.reset();
        });
    }
    /* ---- Filtro de precio (doble control) ---- */
    const pMin = document.getElementById('precio-min');
    const pMax = document.getElementById('precio-max');
    if (pMin && pMax) {
        const fmt = n => '$ ' + Number(n).toLocaleString('es-CO');
        const txtMin = document.getElementById('precio-min-txt');
        const txtMax = document.getElementById('precio-max-txt');
        const pintar = () => { txtMin.textContent = fmt(pMin.value); txtMax.textContent = fmt(pMax.value); };
        pMin.addEventListener('input', () => { if (+pMin.value > +pMax.value) pMin.value = pMax.value; pintar(); });
        pMax.addEventListener('input', () => { if (+pMax.value < +pMin.value) pMax.value = pMin.value; pintar(); });
        pintar();
    }

    /* ---- Formulario de contacto (aviso provisional, sin envío real) ---- */
    const formContacto = document.querySelector('.contact-form');
    const msgContacto = document.querySelector('.form-msg');
    if (formContacto && msgContacto) {
        formContacto.addEventListener('submit', e => {
            e.preventDefault();
            msgContacto.textContent = 'Mensaje enviado. Te responderemos lo antes posible.';
            formContacto.reset();
        });
    }
});