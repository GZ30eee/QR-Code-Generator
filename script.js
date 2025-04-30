// DOM Elements
const wrapper = document.querySelector(".wrapper");
const qrInput = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");
const qrImg = document.getElementById("qr-img");
const qrCanvas = document.getElementById("qr-canvas");
const loadingSpinner = document.getElementById("loading-spinner");
const foregroundColor = document.getElementById("foreground");
const backgroundColor = document.getElementById("background");
const errorLevel = document.getElementById("error-level");
const qrSize = document.getElementById("qr-size");
const themeToggle = document.getElementById("themeToggle");
const dotStyle = document.getElementById("dot-style");
const logoFile = document.getElementById("logo-file");
const logoPreview = document.getElementById("logo-preview");
const removeLogo = document.getElementById("remove-logo");
const generationMode = document.getElementById("generation-mode");
const exportPng = document.getElementById("export-png");
const exportSvg = document.getElementById("export-svg");
const exportPdf = document.getElementById("export-pdf");
const shareBtn = document.getElementById("share-btn");
const saveBtn = document.getElementById("save-btn");
const shareModal = document.getElementById("share-modal");
const closeModal = document.querySelector(".close-modal");
const shareUrl = document.getElementById("share-url");
const copyShareUrl = document.getElementById("copy-share-url");
const toast = document.getElementById("toast");
const toastClose = document.querySelector(".toast .close");
const tabs = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");
const collapsibleBtn = document.querySelector(".collapsible-btn");
const collapsibleContent = document.querySelector(".collapsible-content");
const historyList = document.getElementById("history-list");
const clearHistory = document.getElementById("clear-history");
const templateCards = document.querySelectorAll(".template-card");
const templateForms = document.getElementById("template-forms");
const templateFormElements = document.querySelectorAll(".template-form");
const templateGenerateButtons = document.querySelectorAll(".template-generate");
const templateCancelButtons = document.querySelectorAll(".template-cancel");
const togglePassword = document.getElementById("toggle-password");
const getCurrentLocation = document.getElementById("get-current-location");
const shareBtns = document.querySelectorAll(".share-btn");

// QR Scanner Elements
const reader = document.getElementById("reader");
const scanResult = document.getElementById("scan-result");
const scanActions = document.querySelector(".scan-actions");
const copyScan = document.getElementById("copy-scan");
const openScan = document.getElementById("open-scan");

// Variables
let preValue;
let logoImage = null;
let qrHistory = [];
let html5QrScanner = null;

// Initialize App
function initializeApp() {
  loadTheme();
  loadHistory();
  setupEventListeners();
  setupCollapsible();
  setupTabs();
  setupTemplates();
}

// Load Theme
function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.className = savedTheme + "-theme";
  themeToggle.innerHTML = savedTheme === "dark" ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
}

// Load History
function loadHistory() {
  const savedHistory = localStorage.getItem("qrHistory");
  if (savedHistory) {
    qrHistory = JSON.parse(savedHistory);
    updateHistoryDisplay();
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Color Preview
  foregroundColor.addEventListener("input", updateColorPreview);
  backgroundColor.addEventListener("input", updateColorPreview);
  
  // Logo Upload
  logoFile.addEventListener("change", handleLogoUpload);
  removeLogo.addEventListener("click", removeLogoImage);
  
  // Generate QR Code
  generateBtn.addEventListener("click", generateQRCode);
  
  // Clear Input
  clearBtn.addEventListener("click", clearQRCode);
  
  // Download QR Code
  downloadBtn.addEventListener("click", downloadQRCode);
  
  // Copy Input Text
  copyBtn.addEventListener("click", copyInputText);
  
  // Export Options
  exportPng.addEventListener("click", () => exportQRCode("png"));
  exportSvg.addEventListener("click", () => exportQRCode("svg"));
  exportPdf.addEventListener("click", () => exportQRCode("pdf"));
  
  // Share QR Code
  shareBtn.addEventListener("click", openShareModal);
  closeModal.addEventListener("click", closeShareModal);
  copyShareUrl.addEventListener("click", copyShareLink);
  
  // Save to History
  saveBtn.addEventListener("click", saveToHistory);
  
  // Clear History
  clearHistory.addEventListener("click", clearAllHistory);
  
  // Theme Toggle
  themeToggle.addEventListener("click", toggleTheme);
  
  // Input Enter Key
  qrInput.addEventListener("keyup", handleInputKeyup);
  
  // Toast Close
  toastClose.addEventListener("click", () => toast.classList.remove("active"));
  
  // Toggle Password Visibility
  if (togglePassword) {
    togglePassword.addEventListener("click", togglePasswordVisibility);
  }
  
  // Get Current Location
  if (getCurrentLocation) {
    getCurrentLocation.addEventListener("click", fetchCurrentLocation);
  }
  
  // Share Buttons
  shareBtns.forEach(btn => {
    btn.addEventListener("click", () => shareToSocialMedia(btn.dataset.platform));
  });
  
  // Copy Scan Result
  copyScan.addEventListener("click", copyScanResult);
  
  // Open Scan Result
  openScan.addEventListener("click", openScanResult);
}

// Setup Collapsible
function setupCollapsible() {
  collapsibleBtn.addEventListener("click", () => {
    collapsibleBtn.classList.toggle("active");
    if (collapsibleContent.classList.contains("show")) {
      collapsibleContent.classList.remove("show");
    } else {
      collapsibleContent.classList.add("show");
    }
  });
}

// Setup Tabs
function setupTabs() {
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Remove active class from all tabs and contents
      tabs.forEach(t => t.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));
      
      // Add active class to clicked tab and corresponding content
      tab.classList.add("active");
      const tabId = tab.dataset.tab + "-tab";
      document.getElementById(tabId).classList.add("active");
      
      // Initialize scanner if scan tab is active
      if (tab.dataset.tab === "scan" && !html5QrScanner) {
        initQRScanner();
      }
    });
  });
}

// Setup Templates
function setupTemplates() {
  // Template Card Click
  templateCards.forEach(card => {
    card.addEventListener("click", () => {
      const templateType = card.dataset.template;
      openTemplateForm(templateType);
    });
  });
  
  // Template Generate Buttons
  templateGenerateButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const form = btn.closest(".template-form");
      const templateType = form.id.replace("-form", "");
      generateFromTemplate(templateType);
    });
  });
  
  // Template Cancel Buttons
  templateCancelButtons.forEach(btn => {
    btn.addEventListener("click", closeTemplateForm);
  });
}

// Update Color Preview
function updateColorPreview() {
  const preview = document.querySelector(".qr-code");
  preview.style.borderColor = foregroundColor.value;
  preview.style.backgroundColor = backgroundColor.value;
}

// Handle Logo Upload
function handleLogoUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  if (!file.type.match("image.*")) {
    showToast("Error", "Please select an image file", "error");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    logoImage = new Image();
    logoImage.src = e.target.result;
    logoImage.onload = function() {
      logoPreview.innerHTML = `<img src="${e.target.result}" alt="Logo">`;
      removeLogo.style.display = "block";
    };
  };
  reader.readAsDataURL(file);
}

// Remove Logo Image
function removeLogoImage() {
  logoImage = null;
  logoPreview.innerHTML = "";
  logoFile.value = "";
  removeLogo.style.display = "none";
}

// Generate QR Code
function generateQRCode() {
  let qrValue = qrInput.value.trim();
  if (!qrValue) {
    showToast("Error", "Please enter text or URL", "error");
    return;
  }
  
  if (preValue === qrValue) return;
  preValue = qrValue;
  
  document.querySelector(".qr-code").classList.add("loading");
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  
  const size = qrSize.value;
  const mode = generationMode.value;
  
  if (mode === "offline") {
    generateOfflineQR(qrValue, size);
  } else {
    generateOnlineQR(qrValue, size);
  }
}

// Generate QR Code using Online API
function generateOnlineQR(qrValue, size) {
  const fgColor = foregroundColor.value.substring(1);
  const bgColor = backgroundColor.value.substring(1);
  const level = errorLevel.value;
  
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrValue)}&color=${fgColor}&bgcolor=${bgColor}&ecc=${level}`;
  
  qrImg.onload = () => {
    wrapper.classList.add("active");
    document.querySelector(".qr-code").classList.remove("loading");
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate QR Code";
    
    // If logo is present, add it to the QR code
    if (logoImage) {
      addLogoToQR();
    }
  };
  
  qrImg.onerror = () => {
    showToast("Error", "Failed to generate QR code. Please try again.", "error");
    document.querySelector(".qr-code").classList.remove("loading");
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate QR Code";
  };
}

// Generate QR Code Offline (using qrcode-generator library)
function generateOfflineQR(qrValue, size) {
  try {
    const typeNumber = 0; // Auto-detect
    const errorCorrectionLevel = errorLevel.value;
    const qr = qrcode(typeNumber, errorCorrectionLevel);
    qr.addData(qrValue);
    qr.make();
    
    const cellSize = Math.floor(size / qr.getModuleCount());
    const margin = 4;
    
    // Create QR code as SVG
    const svgString = qr.createSvgTag({
      cellSize: cellSize,
      margin: margin,
      scalable: true,
      color: foregroundColor.value,
      background: backgroundColor.value
    });
    
    // Convert SVG to image
    const svg = new Blob([svgString], {type: 'image/svg+xml'});
    const url = URL.createObjectURL(svg);
    
    qrImg.src = url;
    qrImg.onload = () => {
      wrapper.classList.add("active");
      document.querySelector(".qr-code").classList.remove("loading");
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate QR Code";
      
      // If logo is present, add it to the QR code
      if (logoImage) {
        addLogoToQR();
      }
    };
  } catch (error) {
    showToast("Error", "Failed to generate QR code offline. Please try again.", "error");
    document.querySelector(".qr-code").classList.remove("loading");
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate QR Code";
  }
}

// Add Logo to QR Code
function addLogoToQR() {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const qrWidth = qrImg.width;
  const qrHeight = qrImg.height;
  
  canvas.width = qrWidth;
  canvas.height = qrHeight;
  
  // Draw QR code on canvas
  ctx.drawImage(qrImg, 0, 0, qrWidth, qrHeight);
  
  // Calculate logo size (25% of QR code)
  const logoSize = Math.min(qrWidth, qrHeight) * 0.25;
  const logoX = (qrWidth - logoSize) / 2;
  const logoY = (qrHeight - logoSize) / 2;
  
  // Draw white background for logo
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(logoX, logoY, logoSize, logoSize);
  
  // Draw logo
  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize);
  
  // Update QR code image
  qrImg.src = canvas.toDataURL();
}

// Clear QR Code
function clearQRCode() {
  qrInput.value = "";
  wrapper.classList.remove("active");
  preValue = "";
  qrImg.src = "";
  updateColorPreview();
}

// Download QR Code
function downloadQRCode() {
  if (!qrImg.src) {
    showToast("Error", "Generate a QR code first", "error");
    return;
  }
  
  const link = document.createElement("a");
  
  // If we have a logo or using offline generation, we need to use canvas
  if (logoImage || generationMode.value === "offline") {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = qrImg.width;
    canvas.height = qrImg.height;
    ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);
    link.href = canvas.toDataURL();
  } else {
    link.href = qrImg.src;
  }
  
  link.download = `qr-code-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showToast("Success", "QR code downloaded successfully", "success");
}

// Export QR Code in different formats
function exportQRCode(format) {
  if (!qrImg.src) {
    showToast("Error", "Generate a QR code first", "error");
    return;
  }
  
  if (format === "png") {
    downloadQRCode();
  } else if (format === "svg") {
    // Create SVG from QR code
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = qrImg.width;
    canvas.height = qrImg.height;
    ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);
    
    // Convert to SVG using a simple method
    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}">
      <image href="${canvas.toDataURL()}" width="${canvas.width}" height="${canvas.height}"/>
    </svg>`;
    
    const blob = new Blob([svgString], {type: "image/svg+xml"});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-code-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast("Success", "QR code exported as SVG", "success");
  } else if (format === "pdf") {
    // Simple PDF creation using canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = qrImg.width;
    canvas.height = qrImg.height;
    ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);
    
    // Create a simple PDF
    const pdfContent = `
      %PDF-1.4
      1 0 obj
      <<
        /Type /Catalog
        /Pages 2 0 R
      >>
      endobj
      2 0 obj
      <<
        /Type /Pages
        /Kids [3 0 R]
        /Count 1
      >>
      endobj
      3 0 obj
      <<
        /Type /Page
        /Parent 2 0 R
        /Resources <<
          /XObject <<
            /Img1 4 0 R
          >>
        >>
        /MediaBox [0 0 ${canvas.width} ${canvas.height}]
        /Contents 5 0 R
      >>
      endobj
      4 0 obj
      <<
        /Type /XObject
        /Subtype /Image
        /Width ${canvas.width}
        /Height ${canvas.height}
        /ColorSpace /DeviceRGB
        /BitsPerComponent 8
        /Filter /DCTDecode
        /Length ${canvas.toDataURL("image/jpeg").length}
      >>
      stream
      ${atob(canvas.toDataURL("image/jpeg").split(",")[1])}
      endstream
      endobj
      5 0 obj
      <<
        /Length 58
      >>
      stream
        q
        ${canvas.width} 0 0 ${canvas.height} 0 0 cm
        /Img1 Do
        Q
      endstream
      endobj
      xref
      0 6
      0000000000 65535 f
      0000000010 00000 n
      0000000060 00000 n
      0000000120 00000 n
      0000000280 00000 n
      0000000600 00000 n
      trailer
      <<
        /Size 6
        /Root 1 0 R
      >>
      startxref
      700
      %%EOF
    `;
    
    const blob = new Blob([pdfContent], {type: "application/pdf"});
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `qr-code-${Date.now()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast("Success", "QR code exported as PDF", "success");
  }
}

// Copy Input Text
function copyInputText() {
  if (!qrInput.value.trim()) {
    showToast("Error", "Nothing to copy", "error");
    return;
  }
  
  navigator.clipboard.writeText(qrInput.value.trim()).then(() => {
    copyBtn.innerHTML = '<i class="bx bx-check"></i>';
    showToast("Success", "Text copied to clipboard", "success");
    
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="bx bx-copy"></i>';
    }, 2000);
  });
}

// Open Share Modal
function openShareModal() {
  if (!qrImg.src) {
    showToast("Error", "Generate a QR code first", "error");
    return;
  }
  
  // Create a temporary canvas to get data URL
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = qrImg.width;
  canvas.height = qrImg.height;
  ctx.drawImage(qrImg, 0, 0, canvas.width, canvas.height);
  
  // Set share URL (in a real app, this would be a server URL)
  shareUrl.value = canvas.toDataURL();
  
  shareModal.style.display = "block";
}

// Close Share Modal
function closeShareModal() {
  shareModal.style.display = "none";
}

// Copy Share Link
function copyShareLink() {
  navigator.clipboard.writeText(shareUrl.value).then(() => {
    showToast("Success", "Share link copied to clipboard", "success");
  });
}

// Share to Social Media
function shareToSocialMedia(platform) {
  if (!qrImg.src) return;
  
  const text = encodeURIComponent("Check out my QR code generated with QR Code Master Pro!");
  const url = encodeURIComponent(shareUrl.value);
  
  let shareUrl;
  
  switch (platform) {
    case "facebook":
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
      break;
    case "twitter":
      shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
      break;
    case "linkedin":
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
      break;
    case "whatsapp":
      shareUrl = `https://api.whatsapp.com/send?text=${text} ${url}`;
      break;
    case "telegram":
      shareUrl = `https://t.me/share/url?url=${url}&text=${text}`;
      break;
    case "email":
      shareUrl = `mailto:?subject=QR Code&body=${text} ${url}`;
      break;
  }
  
  window.open(shareUrl, "_blank");
  closeShareModal();
}

// Save to History
function saveToHistory() {
  if (!qrImg.src) {
    showToast("Error", "Generate a QR code first", "error");
    return;
  }
  
  const historyItem = {
    id: Date.now(),
    data: qrInput.value,
    image: qrImg.src,
    date: new Date().toLocaleString(),
    settings: {
      foreground: foregroundColor.value,
      background: backgroundColor.value,
      errorLevel: errorLevel.value,
      size: qrSize.value
    }
  };
  
  qrHistory.unshift(historyItem);
  
  // Limit history to 20 items
  if (qrHistory.length > 20) {
    qrHistory.pop();
  }
  
  // Save to localStorage
  localStorage.setItem("qrHistory", JSON.stringify(qrHistory));
  
  // Update history display
  updateHistoryDisplay();
  
  showToast("Success", "QR code saved to history", "success");
}

// Update History Display
function updateHistoryDisplay() {
  historyList.innerHTML = "";
  
  if (qrHistory.length === 0) {
    historyList.innerHTML = '<p class="empty-history">No QR codes in history yet</p>';
    return;
  }
  
  qrHistory.forEach(item => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";
    historyItem.innerHTML = `
      <img src="${item.image}" alt="QR Code" class="history-item-img">
      <div class="history-item-content">
        <div class="history-item-title">${truncateText(item.data, 30)}</div>
        <div class="history-item-date">${item.date}</div>
      </div>
      <div class="history-item-actions">
        <button class="history-load" data-id="${item.id}"><i class="bx bx-refresh"></i></button>
        <button class="history-delete" data-id="${item.id}"><i class="bx bx-trash"></i></button>
      </div>
    `;
    
    historyList.appendChild(historyItem);
  });
  
  // Add event listeners to history items
  document.querySelectorAll(".history-load").forEach(btn => {
    btn.addEventListener("click", (e) => {
      loadFromHistory(e.currentTarget.dataset.id);
    });
  });
  
  document.querySelectorAll(".history-delete").forEach(btn => {
    btn.addEventListener("click", (e) => {
      deleteFromHistory(e.currentTarget.dataset.id);
    });
  });
  
  // Make history items clickable
  document.querySelectorAll(".history-item").forEach(item => {
    item.addEventListener("click", (e) => {
      if (!e.target.closest(".history-item-actions")) {
        const id = item.querySelector(".history-load").dataset.id;
        loadFromHistory(id);
      }
    });
  });
}

// Load QR Code from History
function loadFromHistory(id) {
  const item = qrHistory.find(item => item.id == id);
  if (!item) return;
  
  // Switch to generate tab
  tabs.forEach(tab => tab.classList.remove("active"));
  tabContents.forEach(content => content.classList.remove("active"));
  document.querySelector('[data-tab="generate"]').classList.add("active");
  document.getElementById("generate-tab").classList.add("active");
  
  // Load data
  qrInput.value = item.data;
  foregroundColor.value = item.settings.foreground;
  backgroundColor.value = item.settings.background;
  errorLevel.value = item.settings.errorLevel;
  qrSize.value = item.settings.size;
  
  // Generate QR code
  generateQRCode();
  
  showToast("Success", "QR code loaded from history", "success");
}

// Delete from History
function deleteFromHistory(id) {
  qrHistory = qrHistory.filter(item => item.id != id);
  localStorage.setItem("qrHistory", JSON.stringify(qrHistory));
  updateHistoryDisplay();
  
  showToast("Success", "QR code removed from history", "success");
}

// Clear All History
function clearAllHistory() {
  if (confirm("Are you sure you want to clear all history?")) {
    qrHistory = [];
    localStorage.setItem("qrHistory", JSON.stringify(qrHistory));
    updateHistoryDisplay();
    
    showToast("Success", "History cleared successfully", "success");
  }
}

// Toggle Theme
function toggleTheme() {
  const currentTheme = document.body.className.includes("dark") ? "dark" : "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  
  document.body.className = newTheme + "-theme";
  localStorage.setItem("theme", newTheme);
  themeToggle.innerHTML = newTheme === "dark" ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
}

// Handle Input Keyup
function handleInputKeyup(e) {
  if (!qrInput.value.trim()) {
    wrapper.classList.remove("active");
    preValue = "";
  }
  if (e.key === "Enter") {
    generateBtn.click();
  }
}

// Initialize QR Scanner
function initQRScanner() {
  html5QrScanner = new Html5Qrcode("reader");
  
  const config = {
    fps: 10,
    qrbox: 250,
    aspectRatio: 1.0
  };
  
  html5QrScanner.start(
    { facingMode: "environment" },
    config,
    onScanSuccess
  ).catch(err => {
    console.error("Scanner failed to start:", err);
    showToast("Error", "Failed to start scanner. Please check camera permissions.", "error");
  });
}

// QR Scanner Success Callback
function onScanSuccess(decodedText) {
  scanResult.textContent = decodedText;
  scanActions.style.display = "flex";
  
  // Play success sound
  const audio = new Audio("https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-tone-2870.mp3");
  audio.play();
  
  showToast("Success", "QR code scanned successfully", "success");
}

// Copy Scan Result
function copyScanResult() {
  const result = scanResult.textContent;
  if (result === "No QR code scanned yet") return;
  
  navigator.clipboard.writeText(result).then(() => {
    showToast("Success", "Scan result copied to clipboard", "success");
  });
}

// Open Scan Result
function openScanResult() {
  const result = scanResult.textContent;
  if (result === "No QR code scanned yet") return;
  
  // Check if it's a URL
  if (result.match(/^https?:\/\//i)) {
    window.open(result, "_blank");
  } else {
    showToast("Info", "Scan result is not a valid URL", "info");
  }
}

// Open Template Form
function openTemplateForm(templateType) {
  templateForms.classList.add("show");
  templateFormElements.forEach(form => form.classList.remove("show"));
  document.getElementById(`${templateType}-form`).classList.add("show");
}

// Close Template Form
function closeTemplateForm() {
  templateForms.classList.remove("show");
}

// Generate QR Code from Template
function generateFromTemplate(templateType) {
  let qrData = "";
  
  switch (templateType) {
    case "url":
      const url = document.getElementById("url-input").value.trim();
      if (!url) {
        showToast("Error", "Please enter a URL", "error");
        return;
      }
      qrData = url.startsWith("http") ? url : `https://${url}`;
      break;
      
    case "email":
      const email = document.getElementById("email-address").value.trim();
      const subject = document.getElementById("email-subject").value.trim();
      const body = document.getElementById("email-body").value.trim();
      
      if (!email) {
        showToast("Error", "Please enter an email address", "error");
        return;
      }
      
      qrData = `mailto:${email}`;
      if (subject) qrData += `?subject=${encodeURIComponent(subject)}`;
      if (body) qrData += `${subject ? "&" : "?"}body=${encodeURIComponent(body)}`;
      break;
      
    case "wifi":
      const ssid = document.getElementById("wifi-ssid").value.trim();
      const password = document.getElementById("wifi-password").value.trim();
      const encryption = document.getElementById("wifi-encryption").value;
      const hidden = document.getElementById("wifi-hidden").checked;
      
      if (!ssid) {
        showToast("Error", "Please enter a network name", "error");
        return;
      }
      
      qrData = `WIFI:S:${ssid};T:${encryption};P:${password};H:${hidden ? "true" : "false"};;`;
      break;
      
    case "vcard":
      const name = document.getElementById("vcard-name").value.trim();
      const phone = document.getElementById("vcard-phone").value.trim();
      const vcardEmail = document.getElementById("vcard-email").value.trim();
      const company = document.getElementById("vcard-company").value.trim();
      const title = document.getElementById("vcard-title").value.trim();
      const address = document.getElementById("vcard-address").value.trim();
      const website = document.getElementById("vcard-website").value.trim();
      
      if (!name || !phone || !vcardEmail) {
        showToast("Error", "Please fill in the required fields", "error");
        return;
      }
      
      qrData = "BEGIN:VCARD\nVERSION:3.0\n";
      qrData += `N:${name};\nFN:${name}\n`;
      qrData += `TEL:${phone}\n`;
      qrData += `EMAIL:${vcardEmail}\n`;
      if (company) qrData += `ORG:${company}\n`;
      if (title) qrData += `TITLE:${title}\n`;
      if (address) qrData += `ADR:;;${address};;;\n`;
      if (website) qrData += `URL:${website}\n`;
      qrData += "END:VCARD";
      break;
      
    case "phone":
      const phoneNumber = document.getElementById("phone-number").value.trim();
      
      if (!phoneNumber) {
        showToast("Error", "Please enter a phone number", "error");
        return;
      }
      
      qrData = `tel:${phoneNumber}`;
      break;
      
    case "sms":
      const smsNumber = document.getElementById("sms-number").value.trim();
      const smsMessage = document.getElementById("sms-message").value.trim();
      
      if (!smsNumber) {
        showToast("Error", "Please enter a phone number", "error");
        return;
      }
      
      qrData = `sms:${smsNumber}`;
      if (smsMessage) qrData += `?body=${encodeURIComponent(smsMessage)}`;
      break;
      
    case "geo":
      const latitude = document.getElementById("geo-latitude").value.trim();
      const longitude = document.getElementById("geo-longitude").value.trim();
      
      if (!latitude || !longitude) {
        showToast("Error", "Please enter latitude and longitude", "error");
        return;
      }
      
      qrData = `geo:${latitude},${longitude}`;
      break;
      
    case "text":
      const text = document.getElementById("text-content").value.trim();
      
      if (!text) {
        showToast("Error", "Please enter some text", "error");
        return;
      }
      
      qrData = text;
      break;
  }
  
  // Close template form
  closeTemplateForm();
  
  // Set input value and generate QR code
  qrInput.value = qrData;
  generateQRCode();
}

// Toggle Password Visibility
function togglePasswordVisibility() {
  const passwordInput = document.getElementById("wifi-password");
  const icon = togglePassword.querySelector("i");
  
  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    icon.className = "bx bx-show";
  } else {
    passwordInput.type = "password";
    icon.className = "bx bx-hide";
  }
}

// Fetch Current Location
function fetchCurrentLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        document.getElementById("geo-latitude").value = position.coords.latitude;
        document.getElementById("geo-longitude").value = position.coords.longitude;
        showToast("Success", "Current location fetched successfully", "success");
      },
      (error) => {
        showToast("Error", "Failed to get current location: " + error.message, "error");
      }
    );
  } else {
    showToast("Error", "Geolocation is not supported by this browser", "error");
  }
}

// Show Toast Notification
function showToast(title, message, type = "success") {
  const toast = document.getElementById("toast");
  const progress = toast.querySelector(".progress");
  
  // Set toast icon and border color based on type
  const icon = toast.querySelector(".toast-content i");
  
  if (type === "success") {
    icon.className = "bx bx-check-circle";
    toast.style.borderLeftColor = "var(--success-color)";
    progress.style.setProperty("--progress-color", "var(--success-color)");
  } else if (type === "error") {
    icon.className = "bx bx-error-circle";
    toast.style.borderLeftColor = "var(--error-color)";
    progress.style.setProperty("--progress-color", "var(--error-color)");
  } else if (type === "info") {
    icon.className = "bx bx-info-circle";
    toast.style.borderLeftColor = "var(--primary-color)";
    progress.style.setProperty("--progress-color", "var(--primary-color)");
  } else if (type === "warning") {
    icon.className = "bx bx-error";
    toast.style.borderLeftColor = "var(--warning-color)";
    progress.style.setProperty("--progress-color", "var(--warning-color)");
  }
  
  // Set toast content
  toast.querySelector(".text-1").textContent = title;
  toast.querySelector(".text-2").textContent = message;
  
  // Show toast
  toast.classList.add("active");
  
  // Hide toast after 5 seconds
  setTimeout(() => {
    toast.classList.remove("active");
  }, 5000);
}

// Helper Functions
function truncateText(text, maxLength) {
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

// Initialize App
document.addEventListener("DOMContentLoaded", initializeApp);

// Clean up when leaving the page
window.addEventListener("beforeunload", () => {
  if (html5QrScanner) {
    html5QrScanner.stop().catch(err => console.error(err));
  }
});
