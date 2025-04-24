const wrapper = document.querySelector(".wrapper");
const qrInput = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const copyBtn = document.getElementById("copy-btn");
const qrImg = document.getElementById("qr-img");
const loadingSpinner = document.getElementById("loading-spinner");
const foregroundColor = document.getElementById("foreground");
const backgroundColor = document.getElementById("background");
const errorLevel = document.getElementById("error-level");
const qrSize = document.getElementById("qr-size");
const themeToggle = document.getElementById("themeToggle");

let preValue;

function initializeApp() {
  loadTheme();
  foregroundColor.addEventListener("input", updateColorPreview);
  backgroundColor.addEventListener("input", updateColorPreview);
}

function loadTheme() {
  const savedTheme = localStorage.getItem("theme") || "light";
  document.body.className = savedTheme + "-theme";
  themeToggle.innerHTML = savedTheme === "dark" ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
}

function updateColorPreview() {
  const preview = document.querySelector(".qr-code");
  preview.style.borderColor = foregroundColor.value;
  preview.style.backgroundColor = backgroundColor.value;
}

generateBtn.addEventListener("click", () => {
  let qrValue = qrInput.value.trim();
  if (!qrValue || preValue === qrValue) return;
  preValue = qrValue;

  document.querySelector(".qr-code").classList.add("loading");
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";

  const fgColor = foregroundColor.value.substring(1);
  const bgColor = backgroundColor.value.substring(1);
  const level = errorLevel.value;
  const size = qrSize.value;

  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(qrValue)}&color=${fgColor}&bgcolor=${bgColor}&ecc=${level}`;

  qrImg.onload = () => {
    wrapper.classList.add("active");
    document.querySelector(".qr-code").classList.remove("loading");
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate QR Code";
  };

  qrImg.onerror = () => {
    alert("Failed to generate QR code. Please try again.");
    document.querySelector(".qr-code").classList.remove("loading");
    generateBtn.disabled = false;
    generateBtn.textContent = "Generate QR Code";
  };
});

clearBtn.addEventListener("click", () => {
  qrInput.value = "";
  wrapper.classList.remove("active");
  preValue = "";
  qrImg.src = "";
  updateColorPreview();
});

downloadBtn.addEventListener("click", () => {
  if (!qrImg.src) return;
  const link = document.createElement("a");
  link.href = qrImg.src;
  link.download = `qr-code-${Date.now()}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

copyBtn.addEventListener("click", () => {
  if (!qrInput.value.trim()) return;
  navigator.clipboard.writeText(qrInput.value.trim()).then(() => {
    copyBtn.innerHTML = '<i class="bx bx-check"></i>';
    setTimeout(() => {
      copyBtn.innerHTML = '<i class="bx bx-copy"></i>';
    }, 2000);
  });
});

qrInput.addEventListener("keyup", (e) => {
  if (!qrInput.value.trim()) {
    wrapper.classList.remove("active");
    preValue = "";
  }
  if (e.key === "Enter") {
    generateBtn.click();
  }
});

themeToggle.addEventListener("click", () => {
  const newTheme = document.body.className.includes("light") ? "dark" : "light";
  document.body.className = newTheme + "-theme";
  localStorage.setItem("theme", newTheme);
  themeToggle.innerHTML = newTheme === "dark" ? '<i class="bx bx-sun"></i>' : '<i class="bx bx-moon"></i>';
});

initializeApp();
