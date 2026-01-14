window.addEventListener("DOMContentLoaded", () => {
  const fmt = (n) => new Intl.NumberFormat("ru-RU").format(n);

  // ДЕМО офферы (замени на свои + партнерские ссылки)
  const offers = [
    {
      name: "МФО Партнер #1",
      logo: "P1",
      rate: "от 0% в день",
      sumMin: 1000,
      sumMax: 30000,
      daysMin: 1,
      daysMax: 21,
      time: "Решение: 5–15 минут",
      note: "Первый займ может быть под 0% при соблюдении условий партнера.",
      link: "#"
    },
    {
      name: "МФО Партнер #2",
      logo: "P2",
      rate: "от 0.8% в день",
      sumMin: 3000,
      sumMax: 50000,
      daysMin: 5,
      daysMax: 30,
      time: "Выдача: в день обращения",
      note: "Условия зависит от анкеты и решения кредитора.",
      link: "#"
    },
    {
      name: "МФО Партнер #3",
      logo: "P3",
      rate: "от 0.5% в день",
      sumMin: 2000,
      sumMax: 100000,
      daysMin: 7,
      daysMax: 30,
      time: "Онлайн 24/7",
      note: "Проверяйте ПСК и условия договора на сайте партнёра.",
      link: "#"
    }
  ];

  const $ = (id) => document.getElementById(id);

  const amount = $("amount");
  const days = $("days");
  const amountInput = $("amountInput");
  const daysInput = $("daysInput");

  const offersGrid = $("offersGrid");
  const applyFilters = $("applyFilters");
  const countOut = $("countOut");
  const overpayOut = $("overpayOut");
  const year = $("year");

  if (year) year.textContent = new Date().getFullYear();

  // Текущие значения фильтров (ВАЖНО: сумма может быть любой, даже если ползунок крупными шагами)
  let currentAmount = 25000;
  let currentDays = 14;

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  // Используем ТОЛЬКО для того, чтобы бегунок выглядел «адекватно»,
  // когда пользователь ввёл сумму вручную (например 2800 при шаге ползунка 500).
  function snapToStep(value, step) {
    if (!step || step <= 0) return value;
    return Math.round(value / step) * step;
  }

  function calcOverpay(sum, d) {
    // Просто ориентир для UI (не обещание и не оферта)
    // До 14 дней и 50000₽ — 0% переплата
    if (d <= 14 && sum <= 50000) {
      return 0;
    }
    // Иначе 1% в день
    const daily = 0.01;
    return Math.round(sum * daily * d);
  }

  function render(list) {
    if (!offersGrid) return;

    offersGrid.innerHTML = list
      .map(
        (o) => `
      <article class="offer">
        <div class="offer__top">
          <div class="offer__logo">
            <div class="logo">${o.logo}</div>
            <div>
              <div class="offer__name">${o.name}</div>
              <div class="muted" style="font-size:12px;margin-top:2px">${o.time}</div>
            </div>
          </div>
          <div class="tag">${o.rate}</div>
        </div>

        <div class="kpis">
          <div class="kpi"><span>Сумма</span><strong>${fmt(o.sumMin)} – ${fmt(o.sumMax)} ₽</strong></div>
          <div class="kpi"><span>Срок</span><strong>${o.daysMin} – ${o.daysMax} дней</strong></div>
        </div>

        <div class="offer__note">${o.note}</div>

        <a class="btn btn--primary btn--full" href="${o.link}" target="_blank" rel="nofollow noopener">
          Оформить заявку
        </a>
      </article>
    `
      )
      .join("");
  }

  function apply() {
    const a = currentAmount;
    const d = currentDays;

    // Обновляем значения в капсулах (они показывают реальную сумму/срок)
    if (amountInput) amountInput.value = String(a);
    if (daysInput) daysInput.value = String(d);

    const filtered = offers.filter(
      (o) => a >= o.sumMin && a <= o.sumMax && d >= o.daysMin && d <= o.daysMax
    );

    if (countOut) countOut.textContent = String(filtered.length);
    if (overpayOut)
      overpayOut.textContent = filtered.length ? `${fmt(calcOverpay(a, d))} ₽` : "—";

    render(filtered.length ? filtered : offers);
  }

  // --- ИНИЦИАЛИЗАЦИЯ ---
  // Берём стартовые значения из DOM (если вдруг ты поменяешь их в HTML)
  if (amount) currentAmount = parseInt(amount.value, 10) || currentAmount;
  if (days) currentDays = parseInt(days.value, 10) || currentDays;
  if (amountInput && amountInput.value) currentAmount = parseInt(amountInput.value, 10) || currentAmount;
  if (daysInput && daysInput.value) currentDays = parseInt(daysInput.value, 10) || currentDays;

  // Подгоняем бегунки под стартовые значения
  if (amount) amount.value = String(snapToStep(currentAmount, parseInt(amount.step, 10) || 1));
  if (days) days.value = String(currentDays);

  render(offers);
  apply();

  // --- ПОЛЗУНКИ -> ЗНАЧЕНИЯ ---
  if (amount) {
    amount.addEventListener("input", () => {
      currentAmount = parseInt(amount.value, 10) || currentAmount;
      apply();
    });
  }

  if (days) {
    days.addEventListener("input", () => {
      currentDays = parseInt(days.value, 10) || currentDays;
      apply();
    });
  }

  // --- ВВОД В КАПСУЛАХ -> ЗНАЧЕНИЯ ---
  if (amountInput) {
    // При клике на поле — выделяем текст, но не очищаем
    amountInput.addEventListener("focus", () => {
      amountInput.select();
    });

    amountInput.addEventListener("blur", () => {
      let v = amountInput.value.trim();
      if (v === "" || v === "-") {
        amountInput.value = String(currentAmount);
        amount.value = String(currentAmount);
        return;
      }
      
      let num = parseInt(v, 10);
      if (Number.isNaN(num)) {
        amountInput.value = String(currentAmount);
        amount.value = String(currentAmount);
        return;
      }

      const min = parseInt(amount.min, 10);
      const max = parseInt(amount.max, 10);
      const step = parseInt(amount.step, 10) || 500;

      // Округляем к ближайшему шагу (от 250 и выше вверх, ниже 250 вниз)
      const remainder = num % step;
      if (remainder >= step / 2) {
        num = Math.ceil(num / step) * step;
      } else {
        num = Math.floor(num / step) * step;
      }
      
      // Ограничиваем диапазоном
      num = clamp(num, min, max);
      
      // Обновляем оба поля одинаково
      amountInput.value = String(num);
      amount.value = String(num);
      
      currentAmount = num;
      apply();
    });
  }

  if (daysInput) {
    daysInput.addEventListener("input", () => {
      let v = parseInt(daysInput.value, 10);
      if (Number.isNaN(v)) return;

      const min = days ? parseInt(days.min, 10) : 0;
      const max = days ? parseInt(days.max, 10) : Number.MAX_SAFE_INTEGER;

      v = clamp(v, min, max);
      currentDays = v;

      if (days) days.value = String(v);

      apply();
    });
  }

  if (applyFilters) {
    applyFilters.addEventListener("click", () => {
      document.getElementById("offers")?.scrollIntoView({ behavior: "smooth" });
      apply();
    });
  }
});

// Закрываем все FAQ при переходе по якорю #faq
function closeAllFaq() {
  document.querySelectorAll("#faq details").forEach((d) => {
    d.removeAttribute("open");
  });
}

window.addEventListener("hashchange", () => {
  if (location.hash === "#faq") {
    closeAllFaq();
  }
});

// Если страница сразу открылась с #faq в адресе
if (location.hash === "#faq") {
  closeAllFaq();
}
