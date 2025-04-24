const wrapper = document.querySelector(".wrapper");
const qrInput = document.getElementById("qr-input");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const downloadBtn = document.getElementById("download-btn");
const qrImg = document.getElementById("qr-img");
const loadingSpinner = document.getElementById("loading-spinner");
const foregroundColor = document.getElementById("foreground");
const backgroundColor = document.getElementById("background");
const errorLevel = document.getElementById("error-level");

let preValue;

generateBtn.addEventListener("click", () => {
  let qrValue = qrInput.value.trim();
  if (!qrValue || preValue === qrValue) return;
  preValue = qrValue;
  
  // Show loading spinner
  document.querySelector(".qr-code").classList.add("loading");
  generateBtn.disabled = true;
  generateBtn.textContent = "Generating...";
  
  // Generate QR code with customization
  const fgColor = foregroundColor.value.substring(1); // Remove '#' from color value
  const bgColor = backgroundColor.value.substring(1);
  const level = errorLevel.value;
  
  qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrValue)}&color=${fgColor}&bgcolor=${bgColor}&ecc=${level}`;
  
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

qrInput.addEventListener("keyup", (e) => {
  if (!qrInput.value.trim()) {
    wrapper.classList.remove("active");
    preValue = "";
  }
  if (e.key === "Enter") {
    generateBtn.click();
  }
});
