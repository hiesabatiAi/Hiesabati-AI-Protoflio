/* ==========================================
   HIESABATI AI - Premium Web Logic Controller
   ========================================== */

document.addEventListener("DOMContentLoaded", () => {
  // STATE MANAGEMENT
  let currentLang = localStorage.getItem("hiesabati-lang") || "en";
  let currentTheme = localStorage.getItem("hiesabati-theme") || "dark";
  let isYearly = false;
  let activeTestimonial = 0;

  const langConfig = {
    en: { name: "English", flag: "https://flagcdn.com/w20/us.png", rtl: false },
    fr: { name: "Français", flag: "https://flagcdn.com/w20/fr.png", rtl: false },
    zh: { name: "中文", flag: "https://flagcdn.com/w20/cn.png", rtl: false },
    ur: { name: "اردو", flag: "https://flagcdn.com/w20/pk.png", rtl: true },
    ar: { name: "العربية", flag: "https://flagcdn.com/w20/sa.png", rtl: true }
  };

  const pricingValues = {
    plan1: { monthly: "$35", yearly: "$28" },
    plan2: { monthly: "$120", yearly: "$96" },
    plan3: { monthly: "$180", yearly: "$144" },
    plan4: { monthly: "Custom", yearly: "Custom" }
  };

  const genericReplies = {
    en: "🔍 *Analyzing business accounts database...* \n\nI can retrieve ledger items, audit invoice trails, and predict future margins. Please choose one of the quick prompts above for illustration!",
    fr: "🔍 *Analyse de la base de données...* \n\nJe peux récupérer des données, auditer des factures et prédire des marges. Essayez de cliquer sur la question ci-dessus !",
    zh: "🔍 *正在分析商业账目数据库...* \n\n我可以读取账簿明细、审计发票流水并预测利润。建议点击上方の预设快速问题，体验数据演示！",
    ur: "🔍 *کاروباری کھاتوں کے ڈیٹا بیس کا تجزیہ جاری ہے...* \n\nمیں ٹرانزیکشنز تلاش کر سکتا ہوں، انوائسز کا آڈٹ کر سکتا ہوں اور منافع کی پیشن گوئی کر سکتا ہے۔ براہ کرم لائیو ڈیمو کے لیے اوپر دیا گیا سوال منتخب کریں!",
    ar: "🔍 *جاري تحليل قاعدة بيانات الحسابات...* \n\nيمكنني استرجاع بنود الدفاتر، وتدقيق الفواتير، والتنبؤ بالهوامش المالية. جرب النقر فوق السؤال السريع المحدد أعلاه لمشاهدة عرض مباشر!"
  };

  // DOM SELECTORS
  const htmlEl = document.documentElement;
  const header = document.getElementById("header");
  const langTrigger = document.getElementById("lang-trigger");
  const langMenu = document.getElementById("lang-menu");
  const currentFlag = document.getElementById("current-flag");
  const currentLangName = document.getElementById("current-lang-name");
  const themeToggle = document.getElementById("theme-toggle");
  const mobileThemeToggle = document.getElementById("mobile-theme-toggle");

  // DRAWER / CHAT SELECTORS (declared early so setLanguage() can reference them)
  const fabBotBtn = document.getElementById("fab-bot-btn");
  const fabChatBtn = document.getElementById("fab-chat-btn");
  const drawer = document.getElementById("floating-chat-drawer");
  const closeDrawerBtn = document.getElementById("close-drawer-btn");
  const drawerMessages = document.getElementById("drawer-messages-container");
  const drawerInput = document.getElementById("drawer-chat-input");
  const drawerSend = document.getElementById("drawer-chat-send");
  const emptyStateView = document.getElementById("drawer-empty-state-view");

  const pricingMonthlyBtn = document.getElementById("pricing-monthly");
  const pricingYearlyBtn = document.getElementById("pricing-yearly");
  const price1El = document.getElementById("price-plan1");
  const price2El = document.getElementById("price-plan2");
  const price3El = document.getElementById("price-plan3");
  const price4El = document.getElementById("price-plan4");

  const testimonialText = document.getElementById("testimonial-text");
  const testimonialAuthor = document.getElementById("testimonial-author");
  const testimonialRole = document.getElementById("testimonial-role");
  const testimonialSavings = document.getElementById("testimonial-savings");
  const prevTestimonialBtn = document.getElementById("slider-prev");
  const nextTestimonialBtn = document.getElementById("slider-next");

  const faqItems = document.querySelectorAll(".faq-item");

  // INTERACTIVE SHOWCASE SELECTORS
  const showcaseNavItems = document.querySelectorAll(".showcase-nav-item");
  const showcaseDisplayImg = document.getElementById("showcase-display-img");

  // ==========================================
  // AUTOMATED DASHBOARD ANIMATOR SELECTORS
  // ==========================================
  const cashValEl = document.getElementById("overview-cash-val");
  const marginValEl = document.getElementById("overview-margin-val");
  const netRecEl = document.getElementById("overview-net-rec");

  const lblRevValEl = document.getElementById("lbl-rev-val");
  const lblExpValEl = document.getElementById("lbl-exp-val");
  const lblRecValEl = document.getElementById("lbl-rec-val");
  const lblPayValEl = document.getElementById("lbl-pay-val");

  const statCustEl = document.getElementById("stat-customers");
  const statRecEl = document.getElementById("stat-receivables");
  const statPayEl = document.getElementById("stat-payables");

  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const success = document.getElementById('contact-success');
      if (success) success.style.display = 'block';
      this.reset();
      setTimeout(() => { if (success) success.style.display = 'none'; }, 4000);
    });
  }

  const donutCash = document.getElementById("donut-cash");
  const donutCashPct = document.getElementById("donut-cash-pct");
  const donutRev = document.getElementById("donut-rev");
  const donutRevPct = document.getElementById("donut-rev-pct");
  const donutRec = document.getElementById("donut-rec");
  const donutRecPct = document.getElementById("donut-rec-pct");

  const barChartHeights = document.querySelectorAll(".bar-val-height");
  const txListContainer = document.getElementById("transactions-list-container");
  const liveIndicator = document.getElementById("db-live-indicator");

  // Sticky Scroll Header
  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });

  // MOBILE NAVIGATION
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileNavOverlay = document.getElementById("mobile-nav");

  const closeMobileNav = () => {
    if (!mobileMenuBtn || !mobileNavOverlay) return;
    mobileMenuBtn.classList.remove("active");
    mobileMenuBtn.setAttribute("aria-expanded", "false");
    mobileNavOverlay.classList.remove("active");
    mobileNavOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  const openMobileNav = () => {
    if (!mobileMenuBtn || !mobileNavOverlay) return;
    mobileMenuBtn.classList.add("active");
    mobileMenuBtn.setAttribute("aria-expanded", "true");
    mobileNavOverlay.classList.add("active");
    mobileNavOverlay.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  if (mobileMenuBtn && mobileNavOverlay) {
    mobileMenuBtn.addEventListener("click", () => {
      if (mobileNavOverlay.classList.contains("active")) {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    mobileNavOverlay.addEventListener("click", (e) => {
      if (e.target === mobileNavOverlay) closeMobileNav();
    });

    mobileNavOverlay.querySelectorAll("a").forEach(link => {
      link.addEventListener("click", closeMobileNav);
    });
  }

  // SCROLL REVEAL
  const revealElements = document.querySelectorAll(".reveal");
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealElements.forEach(el => revealObserver.observe(el));
  }

  // INITIALIZATION
  setTheme(currentTheme);
  setLanguage(currentLang);

  // THEME CONTROLLERS
  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  }

  if (mobileThemeToggle) {
    mobileThemeToggle.addEventListener("click", () => {
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      setTheme(newTheme);
    });
  }

  function setTheme(theme) {
    currentTheme = theme;
    localStorage.setItem("hiesabati-theme", theme);
    htmlEl.setAttribute("data-theme", theme);

    // Update desktop theme toggle icon
    if (themeToggle) {
      if (theme === "light") {
        themeToggle.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
          </svg>
        `;
      } else {
        themeToggle.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        `;
      }
    }

    // Update mobile theme toggle icon
    if (mobileThemeToggle) {
      const mobileIconContainer = mobileThemeToggle.querySelector(".mobile-theme-icon");
      if (mobileIconContainer) {
        if (theme === "light") {
          mobileIconContainer.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          `;
        } else {
          mobileIconContainer.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          `;
        }
      }
    }
  }

  // TRANSLATION ENGINE
  if (langTrigger) {
    langTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      langMenu.classList.toggle("active");
    });
  }

  document.addEventListener("click", () => {
    if (langMenu) {
      langMenu.classList.remove("active");
    }
  });

  document.querySelectorAll(".dropdown-item").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const selectedLang = e.currentTarget.getAttribute("data-lang");
      setLanguage(selectedLang);
    });
  });

  document.querySelectorAll(".mobile-lang-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const selectedLang = e.currentTarget.getAttribute("data-lang");
      setLanguage(selectedLang);
    });
  });

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("hiesabati-lang", lang);

    // Apply layout direction switches
    const isRtl = langConfig[lang].rtl;
    htmlEl.setAttribute("lang", lang);
    htmlEl.setAttribute("dir", isRtl ? "rtl" : "ltr");

    // Update Dropdown header Flag & name
    if (currentFlag) {
      currentFlag.src = langConfig[lang].flag;
      currentFlag.alt = `${langConfig[lang].name} Flag`;
    }
    if (currentLangName) {
      currentLangName.textContent = langConfig[lang].name;
    }

    // Update active class on mobile lang buttons
    document.querySelectorAll(".mobile-lang-btn").forEach(btn => {
      if (btn.getAttribute("data-lang") === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Standard DOM Translation Nodes loop
    document.querySelectorAll("[data-i18n]").forEach(node => {
      const key = node.getAttribute("data-i18n");
      if (translations[lang] && translations[lang][key]) {
        node.innerHTML = formatMarkdown(translations[lang][key]);
      }
    });

    // Inputs Placeholder translation
    document.querySelectorAll("[data-i18n-placeholder]").forEach(node => {
      const key = node.getAttribute("data-i18n-placeholder");
      if (translations[lang] && translations[lang][key]) {
        node.placeholder = translations[lang][key];
      }
    });



    // Render Testimonials & Pricing structures
    updateTestimonialUI();
    updatePricingUI();

    // Update chatbot UI translations dynamically
    if (typeof chatbotKnowledge !== 'undefined') {
      const kb = chatbotKnowledge[lang] || chatbotKnowledge["en"];
      const welcomeHeader = document.querySelector("#drawer-empty-state-view h3");
      if (welcomeHeader) welcomeHeader.textContent = kb.welcome;
      const welcomeDesc = document.querySelector("#drawer-empty-state-view p");
      if (welcomeDesc) welcomeDesc.textContent = kb.subtitle;
      if (drawerInput) drawerInput.placeholder = kb.placeholder;

      // Update suggestion chips
      const chipsGrid = document.querySelector(".suggestion-chips-grid");
      if (chipsGrid && kb.suggestions) {
        chipsGrid.innerHTML = kb.suggestions.map(s => `<button class="suggestion-chip">${s}</button>`).join("");
        // Re-attach event listeners to the new suggestion chips
        chipsGrid.querySelectorAll(".suggestion-chip").forEach(chip => {
          chip.addEventListener("click", () => {
            if (drawerInput) {
              drawerInput.value = chip.textContent;
              // Safe dispatch: handleDrawerChatSend may not be defined at init time
              if (typeof handleDrawerChatSend === "function") handleDrawerChatSend();
            }
          });
        });
      }
    }
  }

  function formatMarkdown(text) {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }



  // ONEPLATFORM SCREEN SHOWCASE SWITCHER
  if (showcaseDisplayImg) {
    showcaseNavItems.forEach(item => {
      item.addEventListener("click", () => {
        showcaseNavItems.forEach(nav => nav.classList.remove("active"));
        item.classList.add("active");

        const screenshotPath = item.getAttribute("data-screenshot");

        // Smooth fade transition
        showcaseDisplayImg.style.opacity = 0;
        setTimeout(() => {
          showcaseDisplayImg.src = screenshotPath;
          showcaseDisplayImg.style.opacity = 1;
        }, 200);
      });
    });
  }

  // ==========================================
  // AUTOMATED DASHBOARD ANIMATOR ENGINE
  // ==========================================
  let cashTarget = 240.5;
  let revTarget = 16.9;
  let expTarget = 3.8;
  let recTarget = 12.3;
  let payTarget = 36.4;
  let marginTarget = 13.1;
  let netRecTarget = -24.1;
  let custTarget = 3;

  // Run counting intro animation
  const animateDashboardIntro = () => {
    if (!cashValEl) return;
    // 1. Animate numerical text count ups
    animateValCount(cashValEl, 0, cashTarget, 1500, "$", "K");
    animateValCount(marginValEl, 0, marginTarget, 1500, "$", "M");
    animateValCount(netRecEl, 0, netRecTarget, 1500, "($", "M)");

    animateValCount(lblRevValEl, 0, revTarget, 1500, "$", "M");
    animateValCount(lblExpValEl, 0, expTarget, 1500, "$", "M");
    animateValCount(lblRecValEl, 0, recTarget, 1500, "$", "M");
    animateValCount(lblPayValEl, 0, payTarget, 1500, "$", "M");

    animateValCount(statCustEl, 0, custTarget, 1500, "", "");
    animateValCount(statRecEl, 0, recTarget, 1500, "$", "M");
    animateValCount(statPayEl, 0, payTarget, 1500, "$", "M");

    // 2. Animate Circular Donut chart strokes
    animateDonutStroke(donutCash, donutCashPct, 100, 1500);
    animateDonutStroke(donutRev, donutRevPct, 77, 1500);
    animateDonutStroke(donutRec, donutRecPct, 25, 1500);

    // 3. Animate Profit & Loss bar heights
    barChartHeights.forEach(bar => {
      const targetHeight = bar.getAttribute("data-height");
      setTimeout(() => {
        bar.style.height = `${targetHeight}%`;
      }, 300);
    });

    // 4. Populate Initial Transactions list
    setTimeout(() => {
      addTransactionToList("Sadat Dinar Group Payment", "July 10, 2026", 23000, true);
      setTimeout(() => {
        addTransactionToList("Qahir Production Invoicing", "July 08, 2026", 12400, true);
        setTimeout(() => {
          addTransactionToList("Google SaaS Subscription", "July 05, 2026", -2100, false);
          // Start the continuous automated loop
          startAutomatedStreamLoop();
        }, 300);
      }, 300);
    }, 600);
  };

  const animateValCount = (el, start, end, duration, prefix = "", suffix = "") => {
    let startTime = null;
    const isNegative = end < 0;
    const absoluteEnd = Math.abs(end);

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentVal = progress * absoluteEnd;

      el.textContent = isNegative
        ? `(${prefix}${currentVal.toFixed(1)}${suffix})`
        : `${prefix}${currentVal.toFixed(1)}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = isNegative
          ? `(${prefix}${absoluteEnd.toFixed(1)}${suffix})`
          : `${prefix}${absoluteEnd.toFixed(1)}${suffix}`;
      }
    };
    window.requestAnimationFrame(step);
  };

  const animateDonutStroke = (donutPath, pctTextEl, targetPct, duration) => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const currentPct = Math.round(progress * targetPct);

      donutPath.style.strokeDasharray = `${currentPct}, 100`;
      pctTextEl.textContent = `${currentPct}%`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  };

  const addTransactionToList = (title, date, amount, isPositive, animate = true) => {
    const txRow = document.createElement("div");
    txRow.className = `tx-row ${animate ? (isPositive ? 'highlight-flash' : 'highlight-flash-red') : ''}`;

    const formattedAmount = isPositive
      ? `+$${Math.abs(amount).toLocaleString()}`
      : `-$${Math.abs(amount).toLocaleString()}`;

    txRow.innerHTML = `
      <div class="tx-meta">
        <span class="tx-title">${title}</span>
        <span class="tx-date">${date}</span>
      </div>
      <span class="tx-amt ${isPositive ? 'positive' : 'negative'}">${formattedAmount}</span>
    `;

    txListContainer.insertBefore(txRow, txListContainer.firstChild);

    // Keep transaction lists at max 3 rows to avoid layout overflow
    if (txListContainer.children.length > 3) {
      txListContainer.lastChild.remove();
    }

    if (animate) {
      setTimeout(() => {
        txRow.classList.remove("highlight-flash");
        txRow.classList.remove("highlight-flash-red");
      }, 1500);
    }
  };

  // Continuous loop transaction streams list
  const mockTransactions = [
    { title: "Dubai Trade Group Payment", amt: 15000, isPos: true },
    { title: "AWS Cloud Infrastructure Billing", amt: -4500, isPos: false },
    { title: "Standard Chartered Bank Sync", amt: 6200, isPos: true },
    { title: "Staff Payroll Lifecycle Outflow", amt: -8900, isPos: false },
    { title: "VAT Sales Compliance Refund", amt: 11800, isPos: true },
    { title: "Quraishi Logistics Invoicing", amt: 27500, isPos: true }
  ];
  let mockIdx = 0;

  const startAutomatedStreamLoop = () => {
    setInterval(() => {
      const item = mockTransactions[mockIdx];
      mockIdx = (mockIdx + 1) % mockTransactions.length;

      // 1. Roll-in the new transaction row
      addTransactionToList(item.title, "Just now", item.amt, item.isPos, true);

      // 2. Adjust Cash position metric
      const deltaK = item.amt / 1000;
      cashTarget += deltaK;
      cashValEl.textContent = `$${cashTarget.toFixed(1)}K`;

      // 3. Briefly toggle live update status glow
      liveIndicator.style.color = "var(--brand-emerald)";
      setTimeout(() => {
        liveIndicator.style.color = "var(--brand-cyan)";
      }, 1500);

      // 4. Intermittently scale customers & receivables slightly
      if (item.isPos && Math.random() > 0.5) {
        custTarget += 1;
        recTarget += 0.015;
        statCustEl.textContent = custTarget;
        statRecEl.textContent = `$${recTarget.toFixed(1)}M`;

        donutRev.style.strokeDasharray = "81, 100";
        donutRevPct.textContent = "81%";
      }
    }, 4500); // Trigger transaction flow every 4.5 seconds
  };

  // Initialize intro dashboard trigger
  animateDashboardIntro();

  // ==========================================
  // PRICING PLANS
  // ==========================================
  if (pricingMonthlyBtn && pricingYearlyBtn) {
    pricingMonthlyBtn.addEventListener("click", () => setPricingTerm(false));
    pricingYearlyBtn.addEventListener("click", () => setPricingTerm(true));
  }

  function setPricingTerm(yearly) {
    isYearly = yearly;
    if (pricingMonthlyBtn) pricingMonthlyBtn.classList.toggle("active", !yearly);
    if (pricingYearlyBtn) pricingYearlyBtn.classList.toggle("active", yearly);
    updatePricingUI();
  }

  function updatePricingUI() {
    if (!price1El || !price2El || !price3El || !price4El) return;
    const term = isYearly ? "yearly" : "monthly";

    // Plan 4 check for localized word
    const plan4Val = translations[currentLang].plan4Price || "Custom";

    price1El.textContent = pricingValues.plan1[term];
    price2El.textContent = pricingValues.plan2[term];
    price3El.textContent = pricingValues.plan3[term];
    price4El.textContent = isYearly ? plan4Val : plan4Val;
  }

  // TESTIMONIAL CAROUSEL
  if (prevTestimonialBtn && nextTestimonialBtn) {
    prevTestimonialBtn.addEventListener("click", () => {
      activeTestimonial = (activeTestimonial - 1 + 3) % 3;
      updateTestimonialUI();
    });

    nextTestimonialBtn.addEventListener("click", () => {
      activeTestimonial = (activeTestimonial + 1) % 3;
      updateTestimonialUI();
    });
  }

  function updateTestimonialUI() {
    if (!testimonialText || !testimonialAuthor || !testimonialRole || !testimonialSavings) return;
    let quote = "";
    let author = "";
    let role = "";
    let savings = "";

    if (activeTestimonial === 0) {
      quote = translations[currentLang].testimony1Text;
      author = translations[currentLang].testimony1Author;
      role = translations[currentLang].testimony1Role;
      savings = (currentLang === "ar" || currentLang === "ur") ? "توفير $23,000 في الشهر الأول" : "$23,000 Saved First Month";
    } else if (activeTestimonial === 1) {
      quote = translations[currentLang].testimony2Text;
      author = translations[currentLang].testimony2Author;
      role = translations[currentLang].testimony2Role;
      savings = (currentLang === "ar" || currentLang === "ur") ? "توفير 12 ساعة أسبوعياً" : "12 Hours Saved Weekly";
    } else {
      quote = translations[currentLang].testimony3Text;
      author = translations[currentLang].testimony3Author;
      role = translations[currentLang].testimony3Role;
      savings = (currentLang === "ar" || currentLang === "ur") ? "توقعات أدق بـ 3 مرات" : "3x More Precise Projections";
    }

    testimonialText.innerHTML = formatMarkdown(quote);
    testimonialAuthor.textContent = author;
    testimonialRole.textContent = role;
    testimonialSavings.textContent = savings;
  }

  // FAQ ACCORDIONS
  faqItems.forEach(item => {
    const questionBtn = item.querySelector(".faq-question-btn");
    questionBtn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      faqItems.forEach(other => other.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });

  // ==========================================
  // ARIA - OFFICIAL AI SALES ASSISTANT
  // ==========================================
  // (drawer DOM selectors declared at top for setLanguage() access)
  const suggestionChips = document.querySelectorAll(".suggestion-chip");

  const toggleDrawer = () => {
    if (!drawer) return;
    const isActive = drawer.classList.contains("active");
    if (!isActive) {
      drawer.classList.add("active");
    } else {
      drawer.classList.remove("active");
    }
  };

  // Conversational State
  let userName = "";
  let lastTopicId = null;

  function handleDrawerChatSend() {
    if (!drawerInput || !drawerMessages) return;
    const text = drawerInput.value.trim();
    if (!text) return;
    drawerInput.value = "";

    // Hide empty state on first message
    if (emptyStateView) {
      emptyStateView.style.display = "none";
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append Sent message bubble
    const userWrapper = document.createElement("div");
    userWrapper.className = "msg-bubble user";
    userWrapper.innerHTML = `
      ${text}
      <span class="msg-timestamp">${timeStr}</span>
    `;
    drawerMessages.appendChild(userWrapper);
    drawerMessages.scrollTop = drawerMessages.scrollHeight;

    // Show typing indicator
    const typingWrapper = document.createElement("div");
    typingWrapper.className = "msg-bubble bot";
    typingWrapper.id = "drawer-typing";
    typingWrapper.innerHTML = `
      <div class="typing-indicator">
        <span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>
      </div>
    `;
    drawerMessages.appendChild(typingWrapper);
    drawerMessages.scrollTop = drawerMessages.scrollHeight;

    // Conversational Logic Engine
    setTimeout(() => {
      const typingEl = document.getElementById("drawer-typing");
      if (typingEl) typingEl.remove();

      const replyWrapper = document.createElement("div");
      replyWrapper.className = "msg-bubble bot";
      const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, "").trim();

      // AUTO-DETECT LANGUAGE based on text input (Arabic script detection)
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      const targetLang = hasArabic ? "ar" : (currentLang === "ar" ? "ar" : "en");
      
      const kb = (typeof chatbotKnowledge !== 'undefined') ? (chatbotKnowledge[targetLang] || chatbotKnowledge["en"]) : { qa: [], notAvailable: "Information not available." };

      let replyText = "";
      let matchedTopicId = null;

      // 1. Check for Name Introductions
      const namePatternsEn = [
        /my name is (.+)/i,
        /i am called (.+)/i,
        /i am (.+)/i,
        /call me (.+)/i
      ];
      const namePatternsAr = [
        /اسمي هو (.+)/,
        /اسمي (.+)/,
        /ادعى (.+)/,
        /نادني (.+)/,
        /أنا (.+)/
      ];

      let detectedName = "";
      if (targetLang === "ar") {
        for (const pattern of namePatternsAr) {
          const match = cleanText.match(pattern);
          if (match && match[1]) {
            detectedName = match[1].trim();
            break;
          }
        }
      } else {
        for (const pattern of namePatternsEn) {
          const match = cleanText.match(pattern);
          if (match && match[1]) {
            detectedName = match[1].trim();
            break;
          }
        }
      }

      if (detectedName) {
        userName = detectedName;
        if (targetLang === "ar") {
          replyText = `أهلاً بك يا **${userName}**! يسعدني جداً التعرف عليك. كيف يمكنني مساعدتك بخصوص منصة حساباتي اليوم؟`;
        } else {
          replyText = `Nice to meet you, **${userName}**! How can I assist you with Hiesabati AI today?`;
        }
      }
      // 2. Check if user asks for their own name
      else if (cleanText.includes("my name") || cleanText.includes("who am i") || cleanText.includes("ما اسمي") || cleanText.includes("من أنا")) {
        if (userName) {
          if (targetLang === "ar") {
            replyText = `اسمك هو **${userName}**! كيف يمكنني مساعدتك أكثر؟`;
          } else {
            replyText = `Your name is **${userName}**! How else can I help you today?`;
          }
        } else {
          if (targetLang === "ar") {
            replyText = "لم تخبرني باسمك بعد. ما هو اسمك الكريم؟";
          } else {
            replyText = "You haven't told me your name yet! What is your name?";
          }
        }
      }
      // 3. Keyword Scoring Match Engine
      else {
        let bestScore = 0;
        let bestMatch = null;

        // Loop over database
        kb.qa.forEach(item => {
          let score = 0;
          item.keywords.forEach(keyword => {
            if (cleanText.includes(keyword)) {
              score += 2; // Exact word match gets higher score
            } else {
              // Partial check for words
              const words = cleanText.split(/\s+/);
              words.forEach(w => {
                if (w.length > 3 && keyword.includes(w)) {
                  score += 0.5;
                }
              });
            }
          });
          
          if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
          }
        });

        // Context-aware follow-up matching
        if (bestScore === 0 && lastTopicId) {
          const isFollowUpPricing = ["pricing", "cost", "free", "trial", "plans"].some(w => cleanText.includes(w)) || 
                                    (targetLang === "ar" && ["سعر", "خطة", "مجاني", "بكم", "اشتراك"].some(w => cleanText.includes(w)));
          const isFollowUpSecure = ["safe", "privacy", "secure", "gdpr"].some(w => cleanText.includes(w)) || 
                                    (targetLang === "ar" && ["آمن", "خصوصية", "تشفير"].some(w => cleanText.includes(w)));

          if (isFollowUpPricing) {
            bestMatch = kb.qa.find(item => item.keywords.includes("pricing"));
            bestScore = 1;
          } else if (isFollowUpSecure) {
            bestMatch = kb.qa.find(item => item.keywords.includes("secure"));
            bestScore = 1;
          }
        }

        if (bestMatch && bestScore > 0) {
          replyText = bestMatch.answer;
          if (bestMatch.keywords.includes("pricing")) lastTopicId = "pricing";
          else if (bestMatch.keywords.includes("secure")) lastTopicId = "secure";
          else lastTopicId = "general";
        } else {
          replyText = kb.notAvailable;
        }
      }

      // Render response bubble
      replyWrapper.innerHTML = `
        ${formatMarkdown(replyText)}
        <span class="msg-timestamp">${timeStr}</span>
      `;

      drawerMessages.appendChild(replyWrapper);

      // ── Inline question chips re-rendered after every bot reply ──
      const kbForChips = (typeof chatbotKnowledge !== 'undefined')
        ? (chatbotKnowledge[targetLang] || chatbotKnowledge['en'])
        : null;

      if (kbForChips && kbForChips.suggestions && kbForChips.suggestions.length) {
        const chipsRow = document.createElement('div');
        chipsRow.className = 'inline-chips-row';

        kbForChips.suggestions.forEach(suggestion => {
          const chip = document.createElement('button');
          chip.className = 'inline-chip';
          chip.textContent = suggestion;
          chip.addEventListener('click', () => {
            if (drawerInput) {
              drawerInput.value = suggestion;
              handleDrawerChatSend();
            }
          });
          chipsRow.appendChild(chip);
        });

        drawerMessages.appendChild(chipsRow);
      }

      drawerMessages.scrollTop = drawerMessages.scrollHeight;
    }, 1000);
  }


  if (drawerSend) drawerSend.addEventListener("click", handleDrawerChatSend);
  if (drawerInput) {
    drawerInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleDrawerChatSend();
    });
  }

  if (fabBotBtn) fabBotBtn.addEventListener("click", toggleDrawer);
  if (fabChatBtn) fabChatBtn.addEventListener("click", toggleDrawer);
  if (closeDrawerBtn) closeDrawerBtn.addEventListener("click", () => drawer && drawer.classList.remove("active"));
});
