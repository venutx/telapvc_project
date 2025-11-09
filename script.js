// DOM Elements
const promotionsToggle = document.getElementById("promotionsToggle");
const promotionsContent = document.getElementById("promotionsContent");
const chevronIcon = document.getElementById("chevronIcon");
const tabs = document.querySelectorAll(".tab");
const tabIndicator = document.querySelector(".tab-indicator");
const postsContent = document.getElementById("postsContent");
const mediaContent = document.getElementById("mediaContent");
const filterButtons = document.querySelectorAll(".filter-button");

// State
let activeTab = "posts";
let activeFilter = "todos";
let promotionsVisible = true;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  setupEventListeners();
  updateTabDisplay();
});

// Event Listeners
function setupEventListeners() {
  // Promotions toggle
  promotionsToggle.addEventListener("click", togglePromotions);

  // Tab switching
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Filter buttons
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => switchFilter(button.dataset.filter));
  });
}

// Promotions functionality
function togglePromotions() {
  promotionsVisible = !promotionsVisible;

  if (promotionsVisible) {
    promotionsContent.classList.remove("collapsed");
    chevronIcon.classList.remove("rotated");
    promotionsContent.classList.add("animate-in");
  } else {
    promotionsContent.classList.add("collapsed");
    chevronIcon.classList.add("rotated");
  }
}

// Tab switching functionality
function switchTab(tab) {
  if (activeTab === tab) return;

  activeTab = tab;

  // Update active tab styles
  tabs.forEach((tabElement) => {
    tabElement.classList.remove("active");
  });

  const activeTabElement = document.querySelector(`[data-tab="${tab}"]`);
  activeTabElement.classList.add("active");

  // Update tab indicator
  if (tab === "posts") {
    tabIndicator.classList.remove("media");
  } else {
    tabIndicator.classList.add("media");
  }

  // Switch content with animation
  updateTabDisplay();
}

function updateTabDisplay() {
  if (activeTab === "posts") {
    postsContent.classList.remove("hidden");
    mediaContent.classList.add("hidden");
  } else {
    postsContent.classList.add("hidden");
    mediaContent.classList.remove("hidden");
  }
}

// Filter functionality
function switchFilter(filter) {
  if (activeFilter === filter) return;

  activeFilter = filter;

  // Update active filter styles
  filterButtons.forEach((button) => {
    button.classList.remove("active");
  });

  const activeFilterElement = document.querySelector(
    `[data-filter="${filter}"]`
  );
  activeFilterElement.classList.add("active");

  // Here you could add filtering logic for the media items
  // For now, all items are always visible
  console.log(`Filtering by: ${filter}`);
}

// Smooth animations for content switching
function addSmoothTransition(element) {
  element.style.transition = "all 0.3s ease-in-out";
}

// Add smooth transitions to all interactive elements
document.addEventListener("DOMContentLoaded", function () {
  const interactiveElements = [
    ...document.querySelectorAll(".subscription-button"),
    ...document.querySelectorAll(".tab"),
    ...document.querySelectorAll(".filter-button"),
    ...document.querySelectorAll(".media-item"),
  ];

  interactiveElements.forEach(addSmoothTransition);
});

// Optional: Add keyboard navigation
document.addEventListener("keydown", function (e) {
  if (e.key === "Tab") {
    // Let default tab behavior work
    return;
  }

  if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
    e.preventDefault();
    const newTab = activeTab === "posts" ? "media" : "posts";
    switchTab(newTab);
  }
});
