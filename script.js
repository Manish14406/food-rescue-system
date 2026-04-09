const STORAGE_KEYS = {
  donations: "foodRescueDonations",
  deliveries: "foodRescueDeliveries"
};

const donationImageMap = {
  Hotel: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
  Restaurant: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  Event: "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=900&q=80",
  "NGO Kitchen": "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=900&q=80"
};

const recipientPartners = [
  { name: "Hope Foundation NGO", location: "Nehru Place, New Delhi" },
  { name: "Serving Humanity", location: "Jamia Nagar, New Delhi" },
  { name: "Community Relief Kitchen", location: "Lajpat Nagar, New Delhi" },
  { name: "Seva Trust", location: "Dwarka, New Delhi" }
];

const deliveryPartners = [
  "Rajesh Kumar",
  "Amit Singh",
  "Priya Verma",
  "Anjali Mehra"
];

const defaultDonations = [
  {
    id: "FD1",
    donor: "Grand Palace Hotel",
    donorType: "Hotel",
    foodType: "Mixed Cuisine (Indian & Continental)",
    description: "Leftover from wedding reception - Vegetarian biryani, dal makhani, paneer dishes, salads, and desserts.",
    quantityKg: 50,
    servings: 100,
    location: "Connaught Place, New Delhi",
    pickup: "10 Feb, 09:00 pm",
    bestBefore: "10 Feb, 11:00 pm",
    image: donationImageMap.Hotel,
    claimed: false,
    claimedBy: ""
  },
  {
    id: "FD2",
    donor: "Spice Garden Restaurant",
    donorType: "Restaurant",
    foodType: "North Indian Cuisine",
    description: "Fresh prepared food - Roti, rice, chicken curry, vegetable dishes.",
    quantityKg: 25,
    servings: 50,
    location: "Karol Bagh, New Delhi",
    pickup: "10 Feb, 10:00 pm",
    bestBefore: "11 Feb, 12:00 am",
    image: donationImageMap.Restaurant,
    claimed: false,
    claimedBy: ""
  },
  {
    id: "FD3",
    donor: "Royal Banquet Hall",
    donorType: "Event",
    foodType: "Traditional Indian",
    description: "Wedding ceremony food - Dal, sabzi, roti, rice, raita, and sweets.",
    quantityKg: 60,
    servings: 120,
    location: "Dwarka, New Delhi",
    pickup: "10 Feb, 11:00 pm",
    bestBefore: "11 Feb, 01:00 am",
    image: donationImageMap.Event,
    claimed: false,
    claimedBy: ""
  }
];

const defaultDeliveries = [
  {
    id: "D1",
    date: "10 Feb 2026, 8:45 pm",
    donor: "Taj Events & Catering",
    donorLocation: "Saket, New Delhi",
    recipient: "Hope Foundation NGO",
    recipientLocation: "Nehru Place, New Delhi",
    partner: "Rajesh Kumar",
    eta: "30 mins",
    stage: 3
  },
  {
    id: "D2",
    date: "10 Feb 2026, 9:00 pm",
    donor: "Grand Palace Hotel",
    donorLocation: "Connaught Place, New Delhi",
    recipient: "Serving Humanity",
    recipientLocation: "Jamia Nagar, New Delhi",
    partner: "Amit Singh",
    eta: "45 mins",
    stage: 3
  }
];

let donations = loadState(STORAGE_KEYS.donations, defaultDonations);
let deliveries = loadState(STORAGE_KEYS.deliveries, defaultDeliveries);

const elements = {
  donationForm: document.getElementById("donationForm"),
  formMessage: document.getElementById("formMessage"),
  donationsGrid: document.getElementById("donationsGrid"),
  searchInput: document.getElementById("searchInput"),
  donorFilter: document.getElementById("donorFilter"),
  resultsCount: document.getElementById("resultsCount"),
  trackingList: document.getElementById("trackingList"),
  metricDonations: document.getElementById("metricDonations"),
  metricMeals: document.getElementById("metricMeals"),
  metricDelivered: document.getElementById("metricDelivered"),
  floatingRequests: document.getElementById("floatingRequests"),
  navLinks: document.querySelectorAll(".nav-link")
};

function loadState(key, fallback) {
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveState() {
  try {
    window.localStorage.setItem(STORAGE_KEYS.donations, JSON.stringify(donations));
    window.localStorage.setItem(STORAGE_KEYS.deliveries, JSON.stringify(deliveries));
  } catch (error) {
    // Ignore storage failures and keep the UI functional.
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const formatter = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return formatter.format(date).replace(",", "").toLowerCase();
}

function getFilteredDonations() {
  const query = elements.searchInput ? elements.searchInput.value.trim().toLowerCase() : "";
  const filter = elements.donorFilter ? elements.donorFilter.value : "All";

  return donations.filter((donation) => {
    const matchesFilter = filter === "All" || donation.donorType === filter;
    const haystack = [
      donation.donor,
      donation.foodType,
      donation.description,
      donation.location
    ].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesFilter && matchesQuery;
  });
}

function renderDonations() {
  if (!elements.donationsGrid || !elements.resultsCount) {
    return;
  }

  const filtered = getFilteredDonations();
  elements.resultsCount.textContent = String(filtered.length);

  if (!filtered.length) {
    elements.donationsGrid.innerHTML = `
      <article class="donation-card">
        <div class="donation-card-body">
          <h3>No donations found</h3>
          <p>Try a different donor filter or search term to see available food donations.</p>
        </div>
      </article>
    `;
    return;
  }

  elements.donationsGrid.innerHTML = filtered
    .map((donation) => `
      <article class="donation-card">
        <div class="donation-card-image">
          <img src="${escapeHtml(donation.image)}" alt="${escapeHtml(donation.donor)} donation">
        </div>
        <div class="donation-card-body">
          <div class="donation-card-top">
            <h3>${escapeHtml(donation.donor)}</h3>
            <span class="status-badge${donation.claimed ? " claimed" : ""}">
              ${donation.claimed ? "Claimed" : "Available"}
            </span>
          </div>
          <span class="donor-badge">${escapeHtml(donation.donorType)}</span>

          <div class="donation-meta">
            <div class="meta-row"><strong>${escapeHtml(donation.foodType)}</strong></div>
            <div class="meta-row">${escapeHtml(donation.description)}</div>
            <div class="meta-row">${donation.quantityKg} kg &middot; ${donation.servings} servings</div>
            <div class="meta-row">${escapeHtml(donation.location)}</div>
            <div class="meta-row">Pickup: ${escapeHtml(donation.pickup)}</div>
          </div>

          <div class="freshness-box">Best before: ${escapeHtml(donation.bestBefore)}</div>

          <button
            class="button button-submit claim-button"
            type="button"
            data-claim-id="${escapeHtml(donation.id)}"
            ${donation.claimed ? "disabled" : ""}
          >
            ${donation.claimed ? `Claimed by ${escapeHtml(donation.claimedBy)}` : "Claim This Donation"}
          </button>
        </div>
      </article>
    `)
    .join("");
}

function getStageLabel(stage) {
  if (stage >= 3) {
    return "Delivered";
  }
  if (stage === 2) {
    return "In Transit";
  }
  if (stage === 1) {
    return "Picked Up";
  }
  return "Pending";
}

function getStatusPanel(delivery) {
  if (delivery.stage >= 3) {
    return `
      <div class="status-panel success">
        <h4>Successfully Delivered!</h4>
        <p>The donation reached the recipient and was marked complete.</p>
      </div>
    `;
  }

  return `
    <div class="status-panel info">
      <h4>Estimated Time</h4>
      <p>${escapeHtml(delivery.eta)}</p>
    </div>
  `;
}

function renderTracking() {
  if (!elements.trackingList) {
    return;
  }

  elements.trackingList.innerHTML = deliveries
    .map((delivery) => `
      <article class="tracking-card">
        <div class="tracking-card-header">
          <div>
            <h3>Delivery #${escapeHtml(delivery.id)}</h3>
            <p>${escapeHtml(delivery.date)}</p>
          </div>
          <span class="delivery-pill">${getStageLabel(delivery.stage)}</span>
        </div>
        <div class="tracking-card-body">
          <div class="tracking-progress">
            ${["Pending", "Picked Up", "In Transit", "Delivered"]
              .map((label, index) => `
                <div class="progress-step${index <= delivery.stage ? " active" : ""}">
                  <div class="progress-icon">${index + 1}</div>
                  <div class="progress-label">${label}</div>
                </div>
              `)
              .join("")}
          </div>

          <div class="tracking-columns">
            <div class="tracking-panel">
              <h4>From (Donor)</h4>
              <p><strong>${escapeHtml(delivery.donor)}</strong>${escapeHtml(delivery.donorLocation)}</p>
            </div>
            <div class="tracking-panel">
              <h4>Delivery Partner</h4>
              <p><strong>${escapeHtml(delivery.partner)}</strong>Verified Driver</p>
            </div>
            <div class="tracking-panel">
              <h4>To (Recipient)</h4>
              <p><strong>${escapeHtml(delivery.recipient)}</strong>${escapeHtml(delivery.recipientLocation)}</p>
            </div>
            ${getStatusPanel(delivery)}
          </div>
        </div>
      </article>
    `)
    .join("");
}

function updateMetrics() {
  const activeDonations = donations.filter((donation) => !donation.claimed).length;
  const totalMeals = donations.reduce((sum, donation) => sum + donation.servings, 0);
  const deliveredCount = deliveries.filter((delivery) => delivery.stage >= 3).length;

  if (elements.metricDonations) {
    elements.metricDonations.textContent = String(activeDonations);
  }

  if (elements.metricMeals) {
    elements.metricMeals.textContent = String(totalMeals);
  }

  if (elements.metricDelivered) {
    elements.metricDelivered.textContent = String(deliveredCount);
  }

  if (elements.floatingRequests) {
    elements.floatingRequests.textContent = `${Math.max(activeDonations * 2, 2)} nearby NGOs`;
  }
}

function showFormMessage(message) {
  if (elements.formMessage) {
    elements.formMessage.textContent = message;
  }
}

function handleDonationSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.donationForm);
  const donorType = formData.get("donorType");
  const donor = String(formData.get("organizationName")).trim();
  const foodType = String(formData.get("foodType")).trim();
  const description = String(formData.get("foodDescription")).trim();
  const quantityKg = Number(formData.get("quantityKg"));
  const servings = Number(formData.get("servings"));
  const location = String(formData.get("area")).trim();
  const pickup = formatDateTime(formData.get("pickupTime"));
  const bestBefore = formatDateTime(formData.get("bestBefore"));

  const newDonation = {
    id: `FD${Date.now()}`,
    donor,
    donorType,
    foodType,
    description,
    quantityKg,
    servings,
    location,
    pickup,
    bestBefore,
    image: donationImageMap[donorType] || donationImageMap.Event,
    claimed: false,
    claimedBy: ""
  };

  donations.unshift(newDonation);
  saveState();
  elements.donationForm.reset();
  showFormMessage(`${donor} donation added successfully. It is now visible in the Get Food section.`);
  renderDonations();
  updateMetrics();
}

function createDeliveryFromDonation(donation) {
  const recipient = recipientPartners[deliveries.length % recipientPartners.length];
  const partner = deliveryPartners[deliveries.length % deliveryPartners.length];

  deliveries.unshift({
    id: `D${deliveries.length + 1}`,
    date: new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(new Date()).replace(",", ""),
    donor: donation.donor,
    donorLocation: donation.location,
    recipient: recipient.name,
    recipientLocation: recipient.location,
    partner,
    eta: `${20 + (deliveries.length % 4) * 10} mins`,
    stage: 2
  });

  saveState();
  return recipient;
}

function handleClaimClick(event) {
  const claimButton = event.target.closest("[data-claim-id]");
  if (!claimButton) {
    return;
  }

  const donation = donations.find((item) => item.id === claimButton.dataset.claimId);
  if (!donation || donation.claimed) {
    return;
  }

  donation.claimed = true;
  donation.claimedBy = createDeliveryFromDonation(donation).name;
  saveState();
  renderDonations();
  renderTracking();
  updateMetrics();
}

function advanceDeliveries() {
  let changed = false;

  deliveries = deliveries.map((delivery) => {
    if (delivery.stage >= 3) {
      return delivery;
    }

    changed = true;
    const nextStage = delivery.stage + 1;
    return {
      ...delivery,
      stage: nextStage,
      eta: nextStage >= 3 ? "Delivered" : nextStage === 2 ? "20 mins" : "45 mins"
    };
  });

  if (changed) {
    saveState();
    renderTracking();
    updateMetrics();
  }
}

function setActiveNav() {
  const currentPath = window.location.pathname.split("/").pop();
  const currentPage = !currentPath || currentPath === "index.html" ? "home.html" : currentPath;
  elements.navLinks.forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === currentPage);
  });
}

function bindEvents() {
  if (elements.donationForm) {
    elements.donationForm.addEventListener("submit", handleDonationSubmit);
  }

  if (elements.searchInput) {
    elements.searchInput.addEventListener("input", renderDonations);
  }

  if (elements.donorFilter) {
    elements.donorFilter.addEventListener("change", renderDonations);
  }

  if (elements.donationsGrid) {
    elements.donationsGrid.addEventListener("click", handleClaimClick);
  }
}

function init() {
  bindEvents();
  setActiveNav();
  renderDonations();
  renderTracking();
  updateMetrics();
  window.setInterval(advanceDeliveries, 12000);
}

init();
