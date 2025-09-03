document.addEventListener('DOMContentLoaded', function () {
  // --- 1. Utility Module ---
  const Utils = (function () {
    const toastNotification = document.getElementById('toast-notification');

    function getTodayDateString() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    function showToast(message, type = 'success', duration = 3000) {
      toastNotification.textContent = message;
      toastNotification.className = 'toast show';

      if (type === 'error') {
        toastNotification.style.backgroundColor = 'var(--delete-button-bg)';
      } else {
        toastNotification.style.backgroundColor = 'var(--toast-bg)';
      }

      setTimeout(() => {
        toastNotification.classList.remove('show');
        toastNotification.style.backgroundColor = '';
      }, duration);
    }

    function getFromLocalStorage(key, defaultValue = null) {
      const item = localStorage.getItem(key);
      try {
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        console.error(`Error parsing data from localStorage for key "${key}":`, e);
        return defaultValue;
      }
    }

    function saveToLocalStorage(key, data) {
      localStorage.setItem(key, JSON.stringify(data));
    }

    return {
      getTodayDateString,
      showToast,
      getFromLocalStorage,
      saveToLocalStorage
    };
  })();

  // --- 2. Navigation Module ---
  const Navigation = (function () {
    const navLinks = document.getElementById('main-nav-list').querySelectorAll('a');
    const sections = document.querySelectorAll('.dashboard-section');
    const appMainContent = document.getElementById('app-main-content');

    function showSection(id) {
      sections.forEach(section => section.classList.remove('active-section'));
      const targetSection = document.getElementById(id);
      if (targetSection) {
        targetSection.classList.add('active-section');
        appMainContent.scrollTop = 0;
      } else {
        console.warn(`Section with ID "${id}" not found.`);
      }
    }

    function setActiveNavLink(id) {
      navLinks.forEach(link => link.parentElement.classList.remove('active'));
      const activeLink = document.querySelector(`.app-sidebar nav ul li a[href="#${id}"]`);
      if (activeLink) {
        activeLink.parentElement.classList.add('active');
      }
    }

    function init() {
      navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          showSection(targetId);
          setActiveNavLink(targetId);
        });
      });
      showSection('dashboard');
      setActiveNavLink('dashboard');
    }

    return { init, showSection, setActiveNavLink };
  })();

  // --- 3. Theme Module ---
  const Theme = (function () {
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;

    function applySavedTheme() {
      const savedTheme = Utils.getFromLocalStorage('theme');
      if (savedTheme === 'dark-theme') {
        body.classList.add('dark-theme');
        themeSwitcher.querySelector('i').classList.replace('fa-moon', 'fa-sun');
      }
    }

    function toggleTheme() {
      body.classList.toggle('dark-theme');
      const isDark = body.classList.contains('dark-theme');
      Utils.saveToLocalStorage('theme', isDark ? 'dark-theme' : '');

      const icon = themeSwitcher.querySelector('i');
      icon.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
    }

    function init() {
      applySavedTheme();
      themeSwitcher.addEventListener('click', toggleTheme);
    }

    return { init };
  })();

  // --- 4. Dashboard Metrics Module ---
  const Metrics = (function () {
    const stepsElement = document.getElementById('steps-count');
    const waterElement = document.getElementById('water-intake');
    const stepsProgress = document.getElementById('steps-progress');
    const waterProgress = document.getElementById('water-progress');
    const addButtons = document.querySelectorAll('.add-button');

    const STEPS_GOAL = 10000;
    const WATER_GOAL = 2.5;

    let currentSteps = Utils.getFromLocalStorage('currentSteps', 0);
    let currentWater = Utils.getFromLocalStorage('currentWater', 0.0);

    function updateDisplay() {
      stepsElement.textContent = currentSteps.toLocaleString();
      const stepsPercentage = Math.min(100, (currentSteps / STEPS_GOAL) * 100);
      stepsProgress.style.width = `${stepsPercentage}%`;
      stepsProgress.style.backgroundColor = stepsPercentage >= 100 ? 'var(--primary-dark)' : 'var(--secondary-color)';
      stepsElement.nextElementSibling.textContent = currentSteps >= STEPS_GOAL ? "Goal Achieved!" : `Goal: ${STEPS_GOAL.toLocaleString()} steps`;

      waterElement.textContent = `${currentWater.toFixed(1)} L`;
      const waterPercentage = Math.min(100, (currentWater / WATER_GOAL) * 100);
      waterProgress.style.width = `${waterPercentage}%`;
      waterProgress.style.backgroundColor = waterPercentage >= 100 ? 'var(--primary-dark)' : 'var(--secondary-color)';
      waterElement.nextElementSibling.textContent = currentWater >= WATER_GOAL ? "Goal Achieved!" : `Goal: ${WATER_GOAL.toFixed(1)} L`;

      Utils.saveToLocalStorage('currentSteps', currentSteps);
      Utils.saveToLocalStorage('currentWater', currentWater);
    }

    function handleAddButtonClick(event) {
      const button = event.target.closest('.add-button');
      if (!button) return;

      const type = button.dataset.type;
      if (type === 'steps') {
        currentSteps += 100;
        Utils.showToast('+100 Steps Added!');
      } else if (type === 'water') {
        currentWater += 0.2;
        Utils.showToast('+0.2 L Water Added!');
      }
      updateDisplay();
    }

    function simulateBackgroundProgress() {
      currentSteps += Math.floor(Math.random() * 5) + 1;
      currentWater += Math.random() * 0.01;
      updateDisplay();
    }

    function init() {
      updateDisplay();
      setInterval(simulateBackgroundProgress, 5000);
      addButtons.forEach(button => button.addEventListener('click', handleAddButtonClick));
    }

    return { init, updateDisplay };
  })();

  // --- 5. Content Display Module ---
  const ContentDisplay = (function () {
    const currentDateDisplay = document.getElementById('current-date');
    const healthTipContent = document.getElementById('health-tip-content');

    const healthTips = [
      "Drink at least 8 glasses of water a day.",
      "Aim for 30 minutes of moderate exercise daily.",
      "Eat a variety of fruits and vegetables.",
      "Get 7-9 hours of quality sleep each night.",
      "Practice mindfulness for mental well-being.",
      "Limit processed foods and sugary drinks.",
      "Stretch regularly to improve flexibility.",
      "Walk whenever you can instead of driving.",
      "Find a hobby that helps you relax and de-stress.",
      "Prioritize whole grains in your diet."
    ];

    function updateDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      currentDateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
    }

    function updateHealthTip() {
      const todayDate = Utils.getTodayDateString();
      let tipIndex = Utils.getFromLocalStorage('dailyTipIndex');
      let lastTipDate = Utils.getFromLocalStorage('lastTipDate');

      if (lastTipDate !== todayDate || tipIndex === null) {
        tipIndex = Math.floor(Math.random() * healthTips.length);
        Utils.saveToLocalStorage('dailyTipIndex', tipIndex);
        Utils.saveToLocalStorage('lastTipDate', todayDate);
      }
      healthTipContent.textContent = healthTips[tipIndex];
    }

    function init() {
      updateDate();
      updateHealthTip();
    }

    return { init };
  })();

  // --- You can continue with Tracker & Timer modules here ---

  // --- Initialize All Modules ---
  Navigation.init();
  Theme.init();
  Metrics.init();
  ContentDisplay.init();
  // Tracker.init(); // uncomment when added
  // Timer.init();   // uncomment when added
});