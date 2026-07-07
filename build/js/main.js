gsap.registerPlugin(ScrollTrigger, SplitText);

document.addEventListener('DOMContentLoaded', () => {

  const checkEditMode = document.querySelector('.bx-panel-toggle-on') ?? null;

  /**
   * Прелоадер + якорь + инициализация Lenis
   */
  // Блокируем браузерное восстановление скролла до того как браузер успеет прыгнуть к якорю
  if (history.scrollRestoration) {
    history.scrollRestoration = 'manual';
  }

  (function () {

    // Длительность анимации закрытия мобильного меню в миллисекундах
    const MENU_CLOSE_DURATION = 400;

    // Конфигурация прелоадера
    const PRELOADER_CONFIG = {
      mode: 'overlay',
      assets: {
        logoWhiteSrc: './images/logo/logo.svg',
        logoCyanSrc: './images/logo/logo-red.svg',
      },
      logoWidth: 472,
      logoHeight: 60,
      safetyTimeoutMs: 8000,
      overlayHideDelayMs: 600,
    };

    // Инициализация Lenis и привязка к GSAP ticker
    const lenis = new Lenis();
    window.lenis = lenis;

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Плавный скролл к целевому элементу через Lenis
    function scrollToTarget(target) {
      lenis.scrollTo(target, {
        offset: -60,
        duration: 1.5,
      });
    }

    // Возвращает промис который резолвится когда прелоадер скрыт
    // Используем MutationObserver чтобы отследить удаление класса preloader--active
    function waitForPreloader() {
      return new Promise((resolve) => {
        if (!document.documentElement.classList.contains('preloader--active')) {
          resolve();
          return;
        }

        const observer = new MutationObserver(() => {
          if (!document.documentElement.classList.contains('preloader--active')) {
            observer.disconnect();
            resolve();
          }
        });

        observer.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['class'],
        });
      });
    }

    // Обработчик кликов по якорным ссылкам
    // capture: true позволяет перехватить событие раньше stopPropagation в меню
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;

      // Не мешаем Fancybox — пропускаем ссылки с data-fancybox
      if (link.hasAttribute('data-fancybox')) return;

      const href = link.getAttribute('href');
      if (!href || !href.includes('#')) return;

      const hash = href.split('#')[1];
      if (!hash) return;

      // Ищем элемент на текущей странице
      // Если его нет — браузер сам перейдёт на нужную страницу
      // После загрузки сработает обработчик load ниже
      const target = document.getElementById(hash);
      if (!target) return;

      e.preventDefault();
      history.pushState(null, null, `#${hash}`);

      const isMenuOpen = document.documentElement.classList.contains('menu--open');

      if (isMenuOpen) {
        // Останавливаем Lenis пока меню закрывается анимацией
        lenis.stop();
        setTimeout(() => {
          lenis.start();
          scrollToTarget(target);
        }, MENU_CLOSE_DURATION);
      } else {
        scrollToTarget(target);
      }

    }, true);

    // При загрузке страницы с якорем в URL
    // Сначала сбрасываем позицию чтобы браузер не прыгал сам
    // Потом ждём конца прелоадера и плавно скроллим
    window.addEventListener('load', () => {
      const hash = window.location.hash.slice(1);
      if (!hash) return;

      const target = document.getElementById(hash);
      if (!target) return;

      window.scrollTo(0, 0);

      waitForPreloader().then(() => scrollToTarget(target));
    });

    // Инициализация прелоадера
    const preloaderEl = document.querySelector('.preloader');
    if (!preloaderEl) return;

    // Блокируем скролл страницы пока прелоадер активен
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('preloader--active');

    // Страховочный таймер на случай если что-то пошло не так
    // Принудительно скрывает прелоадер через safetyTimeoutMs миллисекунд
    const safetyTimer = setTimeout(() => {
      if (preloaderEl.style.display !== 'none') {
        preloaderEl.style.display = 'none';
        restoreScroll();
      }
    }, PRELOADER_CONFIG.safetyTimeoutMs);

    function restoreScroll() {
      document.body.classList.remove('no-scroll');
    }

    function clearSafety() {
      try { clearTimeout(safetyTimer); } catch (e) { }
    }

    const canvas = document.getElementById('logo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Настраиваем canvas с учётом плотности пикселей экрана
    function initCanvas() {
      const { logoWidth, logoHeight } = PRELOADER_CONFIG;
      const dpr = window.devicePixelRatio || 1;

      canvas.width = logoWidth * dpr;
      canvas.height = logoHeight * dpr;

      if (ctx.setTransform) ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);

      return { logoWidth, logoHeight };
    }

    // Скрываем прелоадер с анимацией схлопывания
    // После завершения анимации удаляем класс preloader--active с html
    function hidePreloader() {
      gsap.set(canvas, { opacity: 0 });

      gsap.to(preloaderEl, {
        scaleY: 0,
        duration: 0.7,
        ease: 'power2.inOut',
        transformOrigin: 'top center',
        onComplete() {
          preloaderEl.style.display = 'none';
          restoreScroll();
          clearSafety();
          document.documentElement.classList.remove('preloader--active');
        },
      });

      gsap.to(canvas, {
        scaleY: 2,
        duration: 0.7,
        ease: 'power2.inOut',
        transformOrigin: 'bottom center',
      });
    }

    // Режим overlay — два логотипа с анимацией заливки снизу вверх
    function startOverlayPreloader() {
      const { logoWidth, logoHeight } = initCanvas();
      let fillHeight = 0;

      const logoWhite = new Image();
      const logoCyan = new Image();
      let loadedCount = 0;

      function draw() {
        ctx.clearRect(0, 0, logoWidth, logoHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(logoWhite, 0, 0, logoWidth, logoHeight);
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = '#DC2340';
        ctx.fillRect(0, logoHeight - fillHeight, logoWidth, fillHeight);
        ctx.globalCompositeOperation = 'source-over';
      }

      function onImageLoaded() {
        loadedCount++;
        if (loadedCount === 2) startAnimation();
      }

      logoWhite.onload = logoWhite.onerror = onImageLoaded;
      logoCyan.onload = logoCyan.onerror = onImageLoaded;
      logoWhite.src = PRELOADER_CONFIG.assets.logoWhiteSrc;
      logoCyan.src = PRELOADER_CONFIG.assets.logoCyanSrc;

      function startAnimation() {
        draw();

        const progress = { val: 0 };

        // Быстрый старт до 30%
        gsap.to(progress, {
          val: 30,
          duration: 0.4,
          ease: 'power2.out',
          onUpdate() {
            fillHeight = (progress.val / 100) * logoHeight;
            draw();
          },
        });

        // Медленное движение до 85% пока грузится страница
        gsap.to(progress, {
          val: 85,
          duration: 2.5,
          ease: 'power1.out',
          delay: 0.4,
          onUpdate() {
            fillHeight = (progress.val / 100) * logoHeight;
            draw();
          },
        });

        // После полной загрузки страницы добиваем до 100% и скрываем
        window.addEventListener('load', function onLoad() {
          window.removeEventListener('load', onLoad);
          gsap.killTweensOf(progress);

          gsap.to(progress, {
            val: 100,
            duration: 0.4,
            ease: 'power2.out',
            onUpdate() {
              fillHeight = (progress.val / 100) * logoHeight;
              draw();
            },
            onComplete() {
              setTimeout(hidePreloader, PRELOADER_CONFIG.overlayHideDelayMs);
            },
          });
        });
      }
    }

    // Режим singleLogo — одно лого без заливки, скрывается после загрузки
    function startSingleLogoPreloader() {
      const { logoWidth, logoHeight } = initCanvas();
      const logo = new Image();

      function showAndWait() {
        window.addEventListener('load', function onLoad() {
          window.removeEventListener('load', onLoad);
          hidePreloader();
        });
      }

      logo.onload = () => {
        ctx.clearRect(0, 0, logoWidth, logoHeight);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(logo, 0, 0, logoWidth, logoHeight);

        gsap.fromTo(canvas,
          { opacity: 0.2, scaleY: 0.98 },
          { opacity: 1, scaleY: 1, duration: 0.4, ease: 'power2.out' }
        );

        showAndWait();
      };

      logo.onerror = showAndWait;
      logo.src = PRELOADER_CONFIG.assets.logoWhiteSrc;
    }

    // Запускаем нужный режим прелоадера
    if (PRELOADER_CONFIG.mode === 'singleLogo') {
      startSingleLogoPreloader();
    } else {
      startOverlayPreloader();
    }

  })();

  /**
   * Управляет поведением хэдера.
   */
  (function () {
    const html = document.documentElement;
    const header = document.getElementById('header');
    const footer = document.getElementById('footer');
    const firstHeight = 10;

    let startScrollTop = null; // Первоначальная позиция до начала скролла
    let fixedClassTimeout = null; // Таймер остановки скролла

    const scrollPosition = () => window.pageYOffset || html.scrollTop;

    const footerObserver = new IntersectionObserver(([entry]) => {
      html.classList.toggle('footer-show', entry.isIntersecting);
    });
    footerObserver.observe(footer);

    if (startScrollTop === null) {
      startScrollTop = scrollPosition();
    }

    window.addEventListener('scroll', () => {

      clearTimeout(fixedClassTimeout);

      fixedClassTimeout = setTimeout(() => {
        const currentScroll = scrollPosition();

        if (currentScroll > startScrollTop && currentScroll > firstHeight) {
          if (!html.classList.contains('header-fixed')) {
            html.classList.add('header-fixed');
          }
        } else {
          if (html.classList.contains('header-fixed')) {
            html.classList.remove('header-fixed');
          }
        }

        startScrollTop = null;
      }, 0);
    });
  })();

  /**
   * Функция управления поведением меню-каталога.
   */
  (function () {
    const catalogBtn = document.getElementById('catalog-btn');
    const catalogMenu = document.getElementById('catalog-menu');

    if (!catalogBtn || !catalogMenu) return;

    const openMenu = () => {
      catalogBtn.classList.add('catalog-btn--open');
      document.documentElement.classList.add('catalog-menu--open');
      lenis.stop();
    };

    const closeMenu = () => {
      catalogBtn.classList.remove('catalog-btn--open');
      document.documentElement.classList.remove('catalog-menu--open');
      lenis.start();
      document.dispatchEvent(new CustomEvent('menu:close'));
    };

    const toggleMenu = (e) => {
      e.preventDefault();
      const isMenuOpen = document.documentElement.classList.contains('catalog-menu--open');

      if (isMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    catalogBtn.addEventListener('click', toggleMenu);

    window.addEventListener('keydown', (e) => {
      if (e.key === "Escape" && document.documentElement.classList.contains('catalog-menu--open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', (event) => {
      const isMenuOpen = document.documentElement.classList.contains('catalog-menu--open');
      const clickInsideMenu = catalogMenu.contains(event.target);
      const clickOnButton = catalogBtn.contains(event.target);

      // Проверяем, кликнули ли по ссылке внутри menu__list
      const clickOnMenuLink = catalogMenu.contains(event.target) && event.target.tagName === 'A';

      if (isMenuOpen && !clickInsideMenu && !clickOnButton) {
        closeMenu();
      }

      // Дополнительно: закрываем меню при клике по ссылке внутри меню
      if (isMenuOpen && clickOnMenuLink) {
        closeMenu();
      }
    });
  })();

  /**
   * Функция управления поведением меню-бургера.
   */
  (function () {
    const burgerBtn = document.getElementById('burger-btn');
    const burgerMenu = document.getElementById('burger-menu');

    const openMenu = () => {
      burgerBtn.classList.add('burger-btn--open');
      document.documentElement.classList.add('burger-menu--open');
      lenis.stop();
    };

    const closeMenu = () => {
      burgerBtn.classList.remove('burger-btn--open');
      document.documentElement.classList.remove('burger-menu--open');
      lenis.start();
      document.dispatchEvent(new CustomEvent('menu:close'));
    };

    const toggleMenu = (e) => {
      e.preventDefault();
      const isMenuOpen = document.documentElement.classList.contains('burger-menu--open');

      if (isMenuOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    };

    burgerBtn.addEventListener('click', toggleMenu);

    window.addEventListener('keydown', (e) => {
      if (e.key === "Escape" && document.documentElement.classList.contains('burger-menu--open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', (event) => {
      const isMenuOpen = document.documentElement.classList.contains('burger-menu--open');
      const clickInsideMenu = burgerMenu.contains(event.target);
      const clickOnButton = burgerBtn.contains(event.target);

      // Проверяем, кликнули ли по ссылке внутри menu__list
      const clickOnMenuLink = burgerMenu.contains(event.target) && event.target.tagName === 'A';

      if (isMenuOpen && !clickInsideMenu && !clickOnButton) {
        closeMenu();
      }

      // Дополнительно: закрываем меню при клике по ссылке внутри меню
      if (isMenuOpen && clickOnMenuLink) {
        closeMenu();
      }
    });
  })();

  /**
   * Функция для фикс. кнопки связи
   */
  (function () {
    const social = document.querySelector('.social');

    if (!social) return;

    const btn = document.querySelector('.social__item-btn');

    btn.addEventListener('mouseenter', () => {
      social.classList.add('active');
    })

    social.addEventListener('mouseleave', () => {
      social.classList.remove('active');
    })
  })();

  /**
   * Функция для присвоения класса filled для заполненных форм
   */
  (function () {

    const form = document.querySelector('form');

    if (form) {
      const inputElements = document.querySelectorAll('.form-input');
      const searchElements = document.querySelectorAll('.form-search');
      const textareaElements = document.querySelectorAll('.form-textarea');
      const className = 'filled';

      inputElements.forEach(element => {
        element.addEventListener('input', function () {
          if (this.value.trim() !== '') {
            element.classList.add(className);
          } else {
            element.classList.remove(className);
          }
        });
      });

      searchElements.forEach(element => {
        element.addEventListener('input', function () {
          if (this.value.trim() !== '') {
            element.classList.add(className);
          } else {
            element.classList.remove(className);
          }
        });
      });

      textareaElements.forEach(element => {
        element.addEventListener('input', function () {
          if (this.value.trim() !== '') {
            element.classList.add(className);
          } else {
            element.classList.remove(className);
          }
        });
      });
    }

  })();

  /**
   * Функция аккордиона
   */
  (function accordionFunc() {
    const accordionContainers = document.querySelectorAll('.accordion-items');
    if (!accordionContainers.length) return;

    // Один глобальный обработчик для закрытия при клике вне аккордеона
    document.addEventListener('click', (e) => {
      accordionContainers.forEach(container => {
        const items = container.querySelectorAll('.accordion-item');
        const activeClass = 'accordion-item--active';
        items.forEach(item => {
          if (!e.composedPath().includes(item)) {
            item.classList.remove(activeClass);
            container.classList.remove('activated');
          }
        });
      });
      ScrollTrigger.update();
    });

    // Один глобальный обработчик Escape для всех аккордеонов
    window.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      accordionContainers.forEach(container => {
        container.querySelectorAll('.accordion-item').forEach(item => {
          item.classList.remove('accordion-item--active');
        });
        container.classList.remove('activated');
      });
      ScrollTrigger.update();
    });

    accordionContainers.forEach(accordionContainer => {
      const accordionItems = accordionContainer.querySelectorAll('.accordion-item');
      const activeClass = 'accordion-item--active';

      // Закрытие при Escape
      accordionItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();

          // Закрываем другие открытые элементы
          accordionItems.forEach(i => {
            if (i !== item) i.classList.remove(activeClass);
          });

          // Переключаем текущий
          item.classList.toggle(activeClass);

          // Управляем классом контейнера
          if (item.classList.contains(activeClass)) {
            accordionContainer.classList.add('activated');
          } else {
            accordionContainer.classList.remove('activated');
          }

          ScrollTrigger.update();
        });
      });
    });

  })();

  /**
   * Функция меню
   */
  (function () {
    const menu = document.querySelector('.menu--js');
    const items = menu.querySelectorAll('.menu__left-item');
    const panels = menu.querySelectorAll('.menu__items');

    items.forEach(item => {
      item.addEventListener('mouseenter', () => {
        const target = item.dataset.target;
        console.log(target);
        items.forEach(i => i.classList.remove('is-active'));
        panels.forEach(p => p.classList.remove('is-active'));

        item.classList.add('is-active');
        document.querySelector(`[data-panel="${target}"]`).classList.add('is-active');
      });
    });
  })();

  /**
   * Функция смены класса для hero
   */
  (function () {
    // Все элементы hero__svg (может быть несколько)
    const svgEls = document.querySelectorAll('.hero__svg');
    if (!svgEls.length) return;

    // Все возможные темы — нужны чтобы корректно очищать классы
    const allThemes = ['class-blue', 'class-purple'];

    // ЯВНОЕ СООТВЕТСТВИЕ: индекс = номер слайда (realIndex)
    // Слайд 0 → blue, слайд 1 → purple, слайд 2 → blue, слайд 3 → purple, слайд 4 → blue
    const slideThemes = ['class-blue', 'class-purple', 'class-blue', 'class-purple', 'class-blue'];

    // Тема по умолчанию, если для слайда не задана
    const FALLBACK = 'class-blue';

    // Применяем тему ко ВСЕМ svg по индексу слайда
    function applyTheme(realIndex) {
      const theme = slideThemes[realIndex] ?? FALLBACK;

      svgEls.forEach((svgEl) => {
        svgEl.classList.remove(...allThemes);
        svgEl.classList.add(theme);
      });
    }

    // Ждём инициализации Swiper
    function initSync() {
      const swiperEl = document.querySelector('.hero__slider');

      if (!swiperEl || !swiperEl.swiper) {
        setTimeout(initSync, 50);
        return;
      }

      const swiper = swiperEl.swiper;

      // Ставим тему для стартового слайда на всех svg
      applyTheme(swiper.realIndex);

      // Меняем тему при каждой смене слайда (автоплей + свайп)
      swiper.on('slideChange', () => {
        applyTheme(swiper.realIndex);
      });
    }

    initSync();
  })();

  /**
   * Функция для смены картинки для карточек товаров
   */
  (function () {
    const cards = document.querySelectorAll('[data-gallery]');
    if (!cards.length) return;

    cards.forEach((card) => {
      const cover = card.querySelector('.card__item-cover');
      const imgs = card.querySelectorAll('.card__item-img');
      const dotsEl = card.querySelector('.card__item-dots');

      if (!cover || imgs.length <= 1) return; // нечего листать

      const total = imgs.length;
      let current = 0;

      // Генерируем полоски-индикаторы (даже если скрыты)
      if (dotsEl) {
        imgs.forEach((_, i) => {
          const dot = document.createElement('span');
          dot.className = 'card__item-dot' + (i === 0 ? ' is-active' : '');
          dotsEl.appendChild(dot);
        });
      }
      const dots = dotsEl ? dotsEl.querySelectorAll('.card__item-dot') : [];

      // Показать картинку по индексу (с зацикливанием по кругу)
      function show(index) {
        // Безопасный modulo: -1 -> последняя, total -> первая
        index = ((index % total) + total) % total;

        if (index === current) return;

        imgs[current].classList.remove('is-active');
        imgs[index].classList.add('is-active');

        if (dots.length) {
          dots[current]?.classList.remove('is-active');
          dots[index]?.classList.add('is-active');
        }

        current = index;
      }

      // ДЕСКТОП: переключение по зонам наведения
      const isTouch = window.matchMedia('(hover: none)').matches;

      if (!isTouch) {
        cover.addEventListener('mousemove', (e) => {
          const rect = cover.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const zone = Math.floor((x / rect.width) * total);
          // на десктопе зоны НЕ зацикливаем — ограничиваем краями
          show(Math.min(Math.max(zone, 0), total - 1));
        });

        let leaveTimer;
        cover.addEventListener('mouseleave', () => {
          leaveTimer = setTimeout(() => show(0), 1000);
        });
        cover.addEventListener('mouseenter', () => clearTimeout(leaveTimer));
      }

      // МОБИЛА: бесконечный свайп по картинке
      // Слушаем горизонтальный жест и не отдаём его внешнему Swiper.
      let startX = 0;
      let startY = 0;
      let tracking = false;

      cover.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      }, { passive: true });

      // Глушим ГОРИЗОНТАЛЬНЫЙ жест для внешнего Swiper, вертикаль пропускаем (скролл страницы)
      cover.addEventListener('touchmove', (e) => {
        if (!tracking) return;
        const dx = Math.abs(e.touches[0].clientX - startX);
        const dy = Math.abs(e.touches[0].clientY - startY);
        if (dx > dy) e.stopPropagation();
      }, { passive: true });

      cover.addEventListener('touchend', (e) => {
        if (!tracking) return;
        tracking = false;

        const diffX = e.changedTouches[0].clientX - startX;
        const diffY = e.changedTouches[0].clientY - startY;

        // Игнорируем вертикальные и мелкие движения
        if (Math.abs(diffX) < 30 || Math.abs(diffX) < Math.abs(diffY)) return;

        // Бесконечность: show() сам завернёт по кругу
        if (diffX < 0) show(current + 1); // влево → вперёд (с последней на первую)
        else show(current - 1);           // вправо → назад (с первой на последнюю)
      }, { passive: true });
    });
  })();

  /**
   * Функция для кнопок контроля внутри карточки
   */
  (function () {
    document.addEventListener('click', (e) => {
      // Ищем кнопку — сработает даже при клике по вложенным элементам (иконка, span)
      const btn = e.target.closest('.card__item-control--btn');
      if (!btn) return;

      // toggle сам добавит класс, если его нет, и уберёт, если есть
      btn.classList.toggle('is-active');
    });
  })();

  /**
   * Инициализация слайдера
   */
  (function swiperWrapper() {

    if (!document.querySelector('.swiper')) return;

    const globalImpulseOptions = {
      // Максимальный интервал между кликами в мс который считается быстрым
      fastClickDelay: 200,

      // Насколько сильно каждый быстрый клик увеличивает импульс
      // Формула: impulse += (fastClickDelay - delta) * accelerationFactor
      accelerationFactor: 0.23,

      // Коэффициент затухания импульса (0-1), теряет 15% каждые 40мс
      friction: 0.85,

      // Верхняя граница импульса, итоговый шаг = 1 + round(impulse)
      maxExtraSteps: 2,

      // Как часто пересчитывается затухание в мс, ~2-3 кадра при 60fps
      decayInterval: 40,
    };

    const slidersConfig = [
      {
        sliderSelector: '.novelty__slider',
        prevSelector: '.novelty-button-prev',
        nextSelector: '.novelty-button-next',
        highlight: false,
        swiperOptions: {
          slidesPerGroup: 1,
          slidesPerView: 2,
          spaceBetween: 8,
          speed: 500,
          grabCursor: true,
          loop: false,
          touchRatio: 1.6,
          resistance: true,
          resistanceRatio: 0.4,
          centeredSlides: false,
          centeredSlidesBounds: true,
          simulateTouch: true,
          direction: 'horizontal',
          touchStartPreventDefault: true,
          touchMoveStopPropagation: true,
          threshold: 8,
          touchAngle: 25,
          watchOverflow: true,
          noSwipingClass: 'swiper-no-swiping',
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          freeMode: {
            enabled: true,
            momentum: true,
            momentumRatio: 0.85,
            momentumVelocityRatio: 1,
            momentumBounce: false,
            sticky: true,
          },
          mousewheel: {
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          },
          navigation: false,
          breakpoints: {
            601: {
              slidesPerGroup: 1,
              slidesPerView: 4,
              spaceBetween: 20,
            },
            835: {
              slidesPerGroup: 1,
              slidesPerView: 6,
              spaceBetween: 20,
            },
          },
        },
      },
      {
        sliderSelector: '.topsellers__slider',
        prevSelector: '.topsellers-button-prev',
        nextSelector: '.topsellers-button-next',
        highlight: false,
        swiperOptions: {
          slidesPerGroup: 1,
          slidesPerView: 2,
          spaceBetween: 8,
          speed: 500,
          grabCursor: true,
          loop: false,
          touchRatio: 1.6,
          resistance: true,
          resistanceRatio: 0.4,
          centeredSlides: false,
          centeredSlidesBounds: true,
          simulateTouch: true,
          direction: 'horizontal',
          touchStartPreventDefault: true,
          touchMoveStopPropagation: true,
          threshold: 8,
          touchAngle: 25,
          watchOverflow: true,
          noSwipingClass: 'swiper-no-swiping',
          pagination: {
            el: '.swiper-pagination',
            clickable: true,
          },
          freeMode: {
            enabled: true,
            momentum: true,
            momentumRatio: 0.85,
            momentumVelocityRatio: 1,
            momentumBounce: false,
            sticky: true,
          },
          mousewheel: {
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          },
          navigation: false,
          breakpoints: {
            601: {
              slidesPerGroup: 1,
              slidesPerView: 4,
              spaceBetween: 20,
            },
            835: {
              slidesPerGroup: 1,
              slidesPerView: 6,
              spaceBetween: 20,
            },
          },
        },
      },
      {
        sliderSelector: '.facts__slider',
        prevSelector: '.facts-button-prev',
        nextSelector: '.facts-button-next',
        highlight: false,
        swiperOptions: {
          slidesPerGroup: 1,
          slidesPerView: 1,
          spaceBetween: 0,
          speed: 500,
          grabCursor: true,
          loop: true,
          touchRatio: 1.6,
          resistance: true,
          resistanceRatio: 0.4,
          centeredSlides: false,
          centeredSlidesBounds: true,
          simulateTouch: true,
          direction: 'horizontal',
          touchStartPreventDefault: true,
          touchMoveStopPropagation: true,
          threshold: 8,
          touchAngle: 25,
          watchOverflow: true,
          pagination: {
            el: '.facts-swiper-pagination',
            clickable: true,
          },
          freeMode: false,
          mousewheel: {
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          },
          navigation: false,
        },
      },
      {
        sliderSelector: '.hero__slider',
        highlight: false,
        swiperOptions: {
          slidesPerGroup: 1,
          slidesPerView: 1,
          spaceBetween: 100,
          speed: 1000,
          grabCursor: true,
          loop: true,
          touchRatio: 1.6,
          resistance: true,
          resistanceRatio: 0.4,
          centeredSlides: false,
          centeredSlidesBounds: true,
          simulateTouch: true,
          direction: 'horizontal',
          touchStartPreventDefault: true,
          touchMoveStopPropagation: true,
          threshold: 8,
          touchAngle: 25,
          watchOverflow: true,
          freeMode: false,
          autoplay: {
            delay: 5000,
            disableOnInteraction: false,
          },
          mousewheel: {
            forceToAxis: true,
            sensitivity: 1,
            releaseOnEdges: true,
          },
          navigation: false,
          breakpoints: {
            600: {
              slidesPerGroup: 1,
              slidesPerView: 1,
              spaceBetween: 240,
            },
          }
        },
      },
    ];


    // Инициализируем каждый слайдер из конфига
    slidersConfig.forEach(({ sliderSelector, prevSelector, nextSelector, highlight, swiperOptions }) => {

      if (!document.querySelector(sliderSelector)) return;

      // Ищем кнопки только если селекторы заданы в конфиге
      // Если prevSelector/nextSelector не указаны - слайдер без кнопок навигации
      const prevEl = prevSelector ? document.querySelector(prevSelector) : null;
      const nextEl = nextSelector ? document.querySelector(nextSelector) : null;

      // ищем highlight-элементы только если в конфиге явно указано highlight: true
      // если false или не указано - передаём null и createHighlight вернёт заглушку
      const fromEl = highlight ? document.querySelector(`${sliderSelector} .slider-highlight--from`) : null;
      const toEl = highlight ? document.querySelector(`${sliderSelector} .slider-highlight--to`) : null;

      const swiper = new Swiper(sliderSelector, swiperOptions);

      // Управление пагинацией через кастомный флаг hidePagination в брейкпоинтах
      initPaginationBreakpoint(swiper);

      // highlight создаём всегда - если элементов нет, вернётся заглушка
      // edgeTracker и navigation получат корректный объект в любом случае
      const highlightInstance = createHighlight(swiper, fromEl, toEl);

      // EdgeTracker подключаем только если slidesPerView больше 1 хотя бы
      // в одном брейкпоинте или в базовых настройках - иначе смысла нет
      const needsEdgeTracker = shouldUseEdgeTracker(swiperOptions);
      const edgeTracker = needsEdgeTracker
        ? createEdgeTracker(swiper, highlightInstance)
        : createEdgeTrackerStub();

      // Навигацию подключаем только если обе кнопки реально найдены в DOM
      if (prevEl || nextEl) {
        createNavigation(swiper, prevEl, nextEl, highlightInstance, edgeTracker);
      }
    });


    // Проверяет нужен ли edgeTracker для данного слайдера.
    // Смотрим на базовый slidesPerView и на все брейкпоинты -
    // если хоть где-то больше 1 (и не 'auto') то tracker нужен
    function shouldUseEdgeTracker(swiperOptions) {
      const base = swiperOptions.slidesPerView;
      if (typeof base === 'number' && base > 1) return true;

      const breakpoints = swiperOptions.breakpoints ?? {};
      return Object.values(breakpoints).some(bp => {
        return typeof bp.slidesPerView === 'number' && bp.slidesPerView > 1;
      });
    }


    // Заглушка edgeTracker для слайдеров где он не нужен (slidesPerView = 1).
    // Возвращает тот же API что и настоящий edgeTracker - navigation не знает разницы
    function createEdgeTrackerStub() {
      return {
        handleEdgeNext: () => false,
        handleEdgePrev: () => false,
        clearVirtual: () => { },
        getVirtualIndex: () => null,
      };
    }


    // Управление видимостью пагинации через кастомный флаг hidePagination.
    // Swiper не умеет включать/выключать пагинацию через breakpoints нативно,
    // поэтому слушаем событие breakpoint и управляем display вручную
    function initPaginationBreakpoint(swiper) {
      const paginationEl = swiper.pagination?.el;
      if (!paginationEl) return;

      function applyVisibility() {
        // currentBreakpointParams содержит параметры активного брейкпоинта
        const params = swiper.currentBreakpointParams ?? {};
        paginationEl.style.display = params.hidePagination === true ? 'none' : '';
      }

      swiper.on('breakpoint', applyVisibility);

      // Проверяем сразу после инициализации - брейкпоинт уже мог сработать
      applyVisibility();
    }


    // Highlight - анимированный фон резинка между слайдами.
    // Если элементов --from и --to нет в DOM - возвращаем заглушку.
    // Заглушка имеет тот же API поэтому edgeTracker работает без изменений
    function createHighlight(swiper, fromEl, toEl) {

      // Нет элементов - возвращаем заглушку с рабочим getGeometry
      // edgeTracker использует getGeometry для расчётов даже без визуала
      if (!fromEl || !toEl) {
        return {
          animateTo: () => { },
          snapInstant: () => { },
          getGeometry: (index) => {
            const slide = swiper.slides[index];
            if (!slide) return null;
            return {
              x: slide.offsetLeft + (swiper.translate ?? 0),
              width: slide.offsetWidth,
            };
          },
          getCurrentX: () => 0,
          getCurrentW: () => 0,
        };
      }

      const DURATION = 320;
      const EASE_OUT = 'cubic-bezier(0.4, 0, 0.2, 1)';
      const EASE_SNAP = 'cubic-bezier(0.34, 1.4, 0.64, 1)';

      let currentX = 0;
      let currentWidth = 0;
      let rafId = null;

      function getGeometry(index) {
        const slide = swiper.slides[index];
        if (!slide) return null;
        return {
          x: slide.offsetLeft + (swiper.translate ?? 0),
          width: slide.offsetWidth,
        };
      }

      function setInstant(el, x, width, visible) {
        el.style.transition = 'none';
        el.style.transform = `translateX(${x}px)`;
        el.style.width = `${width}px`;
        el.classList.toggle('is-visible', visible);
      }

      function setAnimated(el, x, width, duration, easing, visible) {
        el.style.transition = [
          `transform ${duration}ms ${easing}`,
          `width ${duration}ms ${easing}`,
          `opacity ${duration * 0.6}ms ease`,
        ].join(', ');
        el.style.transform = `translateX(${x}px)`;
        el.style.width = `${width}px`;
        el.classList.toggle('is-visible', visible);
      }

      function animateTo(toX, toWidth, dir) {
        if (rafId) cancelAnimationFrame(rafId);

        const fromX = currentX;
        const fromWidth = currentWidth;
        const collapseX = dir === 'next' ? fromX + fromWidth : fromX;
        const startX = dir === 'next' ? toX : toX + toWidth;

        setInstant(fromEl, fromX, fromWidth, true);
        setInstant(toEl, startX, 0, true);

        // Двойной RAF гарантирует что стили шага 1 применены до старта анимации
        rafId = requestAnimationFrame(() => {
          rafId = requestAnimationFrame(() => {
            rafId = null;
            setAnimated(fromEl, collapseX, 0, DURATION, EASE_OUT, false);
            setAnimated(toEl, toX, toWidth, DURATION, EASE_SNAP, true);
          });
        });

        // Фиксируем целевую геометрию сразу - не ждём конца анимации
        // Следующий вызов animateTo возьмёт правильную стартовую точку
        currentX = toX;
        currentWidth = toWidth;
      }

      function snapInstant(index) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        const geo = getGeometry(index);
        if (!geo) return;
        setInstant(fromEl, geo.x, geo.width, true);
        setInstant(toEl, geo.x, 0, false);
        currentX = geo.x;
        currentWidth = geo.width;
      }

      swiper.on('slideChange', () => {
        const curr = swiper.activeIndex;
        const prev = swiper.previousIndex ?? curr;
        const dir = curr >= prev ? 'next' : 'prev';
        const geo = getGeometry(curr);
        if (geo) animateTo(geo.x, geo.width, dir);
      });

      swiper.on('transitionEnd', () => {
        setInstant(fromEl, currentX, currentWidth, true);
        setInstant(toEl, currentX, 0, false);
      });

      swiper.on('setTranslate', () => {
        if (swiper.animating) return;
        const geo = getGeometry(swiper.activeIndex);
        if (!geo) return;
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
        setInstant(fromEl, geo.x, geo.width, true);
        setInstant(toEl, geo.x, 0, false);
        currentX = geo.x;
        currentWidth = geo.width;
      });

      swiper.on('resize', () => snapInstant(swiper.activeIndex));

      snapInstant(swiper.activeIndex ?? 0);

      return {
        animateTo,
        snapInstant,
        getGeometry,
        getCurrentX: () => currentX,
        getCurrentW: () => currentWidth,
      };
    }


    // EdgeTracker - виртуальный активный слайд когда wrapper упёрся в край.
    // Проблема: при slidesPerView > 1 последние слайды никогда не получают
    // swiper-slide-active потому что wrapper уже не может сдвинуться.
    // Решение: вручную двигаем виртуальный активный по оставшимся слайдам
    function createEdgeTracker(swiper, highlight) {

      const VIRTUAL_CLASS = 'is-virtual-active';
      const BEFORE_EDGE_CLASS = 'is-before-edge';

      let virtualIndex = null;

      function getVisibleIndices() {
        const containerWidth = swiper.width;
        const offset = Math.abs(swiper.translate ?? 0);
        const visible = [];
        swiper.slides.forEach((slide, i) => {
          const left = slide.offsetLeft;
          const right = left + slide.offsetWidth;
          if (right > offset && left < offset + containerWidth) visible.push(i);
        });
        return visible;
      }

      function clearBeforeEdge() {
        swiper.slides.forEach(s => s.classList.remove(BEFORE_EDGE_CLASS));
      }

      function markBeforeEdge() {
        clearBeforeEdge();
        swiper.slides.forEach(s => {
          if (s.classList.contains('swiper-slide-active')) {
            s.classList.add(BEFORE_EDGE_CLASS);
          }
        });
      }

      function clearVirtual() {
        swiper.slides.forEach(s => s.classList.remove(VIRTUAL_CLASS));
        clearBeforeEdge();
        virtualIndex = null;
      }

      function setVirtualActive(index, dir) {
        if (virtualIndex === null) markBeforeEdge();
        swiper.slides.forEach(s => s.classList.remove(VIRTUAL_CLASS));
        virtualIndex = index;
        swiper.slides[index]?.classList.add(VIRTUAL_CLASS);

        // highlight может быть заглушкой - вызываем в любом случае
        const geo = highlight.getGeometry(index);
        if (geo) highlight.animateTo(geo.x, geo.width, dir);
      }

      function handleEdgeNext() {
        if (!swiper.isEnd) return false;
        const visible = getVisibleIndices();
        if (!visible.length) return false;
        const lastVisible = visible[visible.length - 1];
        const current = virtualIndex ?? swiper.activeIndex;
        if (current >= lastVisible) return true;
        setVirtualActive(current + 1, 'next');
        return true;
      }

      function handleEdgePrev() {
        if (virtualIndex === null) return false;
        const current = virtualIndex;
        const realActive = swiper.activeIndex;
        if (current <= realActive) {
          clearVirtual();
          highlight.snapInstant(realActive);
          return false;
        }
        setVirtualActive(current - 1, 'prev');
        return true;
      }

      swiper.on('slideChange', () => {
        if (virtualIndex !== null) clearVirtual();
      });

      swiper.on('fromEdge', () => {
        clearVirtual();
      });

      return {
        handleEdgeNext,
        handleEdgePrev,
        clearVirtual,
        getVirtualIndex: () => virtualIndex,
      };
    }


    // Navigation - кнопки + импульс + disabled состояние.
    // Вызывается только если у слайдера есть обе кнопки навигации.
    // Получает edgeTracker который может быть настоящим или заглушкой
    function createNavigation(swiper, prevEl, nextEl, highlight, edgeTracker) {

      const {
        fastClickDelay = 200,
        accelerationFactor = 0.23,
        friction = 0.85,
        maxExtraSteps = 2,
        decayInterval = 40,
      } = globalImpulseOptions;

      let lastClickTime = 0;
      let lastDirection = null;
      let extraImpulse = 0;
      let decayTimer = null;

      function resetImpulse() {
        extraImpulse = 0;
        lastDirection = null;
        if (decayTimer) clearInterval(decayTimer);
        decayTimer = null;
      }

      function accumulateImpulse(direction) {
        const now = Date.now();
        const delta = now - lastClickTime;

        if (lastDirection !== null && lastDirection !== direction) {
          extraImpulse = 0;
        }

        extraImpulse = delta < fastClickDelay
          ? Math.min(extraImpulse + (fastClickDelay - delta) * accelerationFactor, maxExtraSteps)
          : 0;

        lastClickTime = now;
        lastDirection = direction;

        if (decayTimer) clearInterval(decayTimer);
        decayTimer = setInterval(() => {
          extraImpulse *= friction;
          if (extraImpulse < 0.2) {
            extraImpulse = 0;
            clearInterval(decayTimer);
            decayTimer = null;
          }
        }, decayInterval);
      }

      function getVisibleIndicesForNav() {
        const containerWidth = swiper.width;
        const offset = Math.abs(swiper.translate ?? 0);
        const visible = [];
        swiper.slides.forEach((slide, i) => {
          const left = slide.offsetLeft;
          const right = left + slide.offsetWidth;
          if (right > offset && left < offset + containerWidth) visible.push(i);
        });
        return visible;
      }

      function updateDisabled() {
        if (swiper.params.loop) return;

        const isStart = swiper.isBeginning && edgeTracker.getVirtualIndex() === null;

        let nextBlocked = false;
        if (swiper.isEnd) {
          const visible = getVisibleIndicesForNav();
          const lastVisible = visible[visible.length - 1] ?? swiper.activeIndex;
          const currentVirt = edgeTracker.getVirtualIndex() ?? swiper.activeIndex;
          nextBlocked = currentVirt >= lastVisible;
        }

        // disabled как свойство а не атрибут - клик всё равно доходит
        // до нашего обработчика даже когда кнопка визуально заблокирована
        if (prevEl) { prevEl.classList.toggle('swiper-button-disabled', isStart); prevEl.disabled = isStart; }
        if (nextEl) { nextEl.classList.toggle('swiper-button-disabled', nextBlocked); nextEl.disabled = nextBlocked; }
      }

      function handle(direction) {
        if (direction === 'next' && edgeTracker.handleEdgeNext()) {
          updateDisabled();
          return;
        }
        if (direction === 'prev' && edgeTracker.handleEdgePrev()) {
          updateDisabled();
          return;
        }

        accumulateImpulse(direction);
        const steps = 1 + Math.round(extraImpulse);

        // if (swiper.params.loop) {
        //   const total = swiper.slides.length - (swiper.loopedSlides ?? 0) * 2;
        //   const curr = swiper.realIndex;
        //   const target = direction === 'next'
        //     ? (curr + steps) % total
        //     : (curr - steps + total) % total;
        //   swiper.slideToLoop(target);
        // }
        if (swiper.params.loop) {
          if (direction === 'next') {
            swiper.slideNext();
          } else {
            swiper.slidePrev();
          }
          return;
        } else {
          const base = swiper.activeIndex;
          const target = direction === 'next'
            ? Math.min(base + steps, swiper.slides.length - 1)
            : Math.max(base - steps, 0);
          swiper.slideTo(target);
        }

        // if (nextEl) nextEl.addEventListener('click', (e) => {
        //   e.preventDefault();
        //   console.log('next clicked', swiper.realIndex);
        //   handle('next');
        // });

        // console.log('loopedSlides:', swiper.loopedSlides);
        // console.log('slides.length:', swiper.slides.length);

        updateDisabled();
      }

      if (nextEl) nextEl.addEventListener('click', (e) => { e.preventDefault(); handle('next'); });
      if (prevEl) prevEl.addEventListener('click', (e) => { e.preventDefault(); handle('prev'); });

      swiper.on('touchStart', resetImpulse);
      swiper.on('slideChange', updateDisabled);
      swiper.on('resize', updateDisabled);
      swiper.on('touchEnd', () => {
        const dir = swiper.swipeDirection;
        if (dir === 'next') edgeTracker.handleEdgeNext();
        else if (dir === 'prev') edgeTracker.handleEdgePrev();
        updateDisabled();
      });

      swiper.on('destroy', () => {
        if (decayTimer) clearInterval(decayTimer);
        decayTimer = null;
      });

      updateDisabled();
    }

    // Можно добавить этот код один раз, чтобы он следил за изменением высоты BODY и обновлял GSAP
    // const ro = new ResizeObserver(() => {
    //   ScrollTrigger.refresh();
    // });
    // ro.observe(document.body);

  })();

  /**
   * Инициализация Fancybox
   */
  Fancybox.bind('[data-fancybox]', {
    // Отключаем закрытие свайпом вниз
    dragToClose: false,
    closeExisting: true,
    // Отключаем жесты карусели (свайп влево/вправо)
    Carousel: {
      Panzoom: {
        // Отключаем pan (перетаскивание контента)
        panMode: 'mousemove',
        // или полностью:
        // touch: false,
      },
    },
    on: {
      init: () => lenis.stop(),
      destroy: () => lenis.start(),
    },
  });

  window.addEventListener('resize', function () { ScrollTrigger.update() });

  /**
   * УВЕДОМЛЕНИЕ О COOKIE                     
   *    
   * Показывает плашку если cookie COOKIE_ACCEPT ≠ '1'.            
   * checkCookies() вызывается из HTML при клике на кнопку.         
   */
  const cookieAccepted =
    ('; ' + document.cookie).split(`; COOKIE_ACCEPT=`).pop().split(';')[0] === '1';

  if (!cookieAccepted) {
    const cookiesNotify = document.getElementById('plate_cookie');
    if (cookiesNotify) {
      cookiesNotify.classList.add('plate--active');

      // cookiesNotify.style.opacity = '1';
      // cookiesNotify.style.visibility = 'visible';
      // cookiesNotify.style.pointerEvents = 'all';
    }
  }

});

/**
 * Принимает cookie и скрывает плашку уведомления.
 *
 * Устанавливает COOKIE_ACCEPT=1 сроком на 1 год.
 */
function checkCookies() {
  const expires = new Date(Date.now() + 86400e3 * 365).toUTCString();
  document.cookie = `COOKIE_ACCEPT=1;path=/;expires=${expires}`;

  const plate = document.getElementById('plate_cookie');
  if (!plate) return;
  plate.classList.remove('plate--active');

  // plate.style.opacity = '0';
  // plate.style.visibility = 'hidden';
  // plate.style.pointerEvents = 'none';

  setTimeout(() => plate.remove(), 5000);
}