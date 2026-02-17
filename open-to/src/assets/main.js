import './style.css';

// DOM Elements
const photoInput = document.getElementById('photoInput');
const photoButton = document.getElementById('photoButton');
const textInput = document.getElementById('textInput');
const frameColorPicker = document.getElementById('frameColorPicker');
const frameColorInput = document.getElementById('frameColorInput');
const textColorPicker = document.getElementById('textColorPicker');
const textColorInput = document.getElementById('textColorInput');
const preview = document.getElementById('preview');
const svgImage = document.getElementById('svgImage');
const circularText = document.getElementById('circularText');
const gradientStart = document.getElementById('gradientStart');
const gradientEnd = document.getElementById('gradientEnd');
const gradientEndPicker = document.getElementById('gradientEndPicker');
const gradientEndInput = document.getElementById('gradientEndInput');
const downloadBtn = document.getElementById('downloadBtn');


// Handle photo upload
photoInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (event) => {
      svgImage.src = event.target.result;
      downloadBtn.disabled = false;
    };
    reader.readAsDataURL(file);
  }
});

// Handle photo button click
photoButton.addEventListener('click', () => {
  photoInput.click();
});

// Handle text input changes
textInput.addEventListener('input', updateSVG);

// Unified color sync function
function setupColorSync(picker, input, updateCallback) {
  // Sync picker to input
  picker.addEventListener('input', (e) => {
    input.value = e.target.value.toUpperCase();
    updateCallback();
  });

  // Sync input to picker (real-time)
  input.addEventListener('input', (e) => {
    const color = e.target.value.trim();
    // Validate HEX color format
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      picker.value = color;
      updateCallback();
    }
  });

  // Validate and fix on blur
  input.addEventListener('blur', (e) => {
    let color = e.target.value.trim();
    // Add # if missing
    if (color && !color.startsWith('#')) {
      color = '#' + color;
    }
    // Validate and fix format
    if (/^#[0-9A-F]{6}$/i.test(color)) {
      input.value = color.toUpperCase();
      picker.value = color;
      updateCallback();
    } else {
      // Reset to picker value if invalid
      input.value = picker.value.toUpperCase();
    }
  });
}

// Setup color syncing for both color inputs
setupColorSync(frameColorPicker, frameColorInput, updateSVG);
setupColorSync(textColorPicker, textColorInput, updateSVG);
setupColorSync(gradientEndPicker, gradientEndInput, updateSVG);

// Update SVG function
function updateSVG() {
  // Update text content
  const text = textInput.value.trim() || '#OpenToWorld';
  circularText.textContent = text;

  // Update text color
  circularText.style.fill = textColorPicker.value;

  gradientStart.setAttribute('stop-color', frameColorPicker.value);
  gradientEnd.setAttribute('stop-color', gradientEndPicker.value);

  centerTextOnPath();
}

// Function to center text on the circular path and adjust frame thickness
function centerTextOnPath() {
  // Get the text path element
  const textPath = circularText;
  const path = document.getElementById('textPath');
  const gradientRing = document.getElementById('gradientRing');  
  const pathLength = path.getTotalLength();
  
  /* global requestAnimationFrame */
  requestAnimationFrame(() => {
    const textElement = textPath.parentElement;
    const textLength = textElement.getComputedTextLength();
    
    const textLengthPercent = (textLength / pathLength) * 100;
    let centeredOffset = 20 - (textLengthPercent / 2);

    if (centeredOffset < 0) {
      centeredOffset = 0; // Prevent negative offset
    } else if (centeredOffset > 30) {
      centeredOffset = 30; // Cap maximum offset to avoid overflow
    }

    
    // Apply the centered offset
    textPath.setAttribute('startOffset', `${centeredOffset}%`);
    
    const maxTextLength = 400;
    
    // Adjust gradient y1 coordinate based on text length
    // Base coordinates (for reference):
    // x1="243.75" y1="325" x2="292.5" y2="246.25"
    
    // Calculate gradient spread factor based on text length
    // Normalized to 0-1 range
    const gradientSpreadFactor = Math.min(textLength / maxTextLength, 1);
    
    // Adjust only y1 based on text length
    // Short text: y1 = 375 (higher)
    // Long text: y1 = 325 (lower)
    const MIN_Y1 = 315;
    const MAX_Y1 = 375;
    
    // Inverse relationship: shorter text = higher y1, longer text = lower y1
    const y1 = MAX_Y1 - (gradientSpreadFactor * (MAX_Y1 - MIN_Y1));
    
    // Apply gradient coordinates
    gradientRing.setAttribute('y1', y1.toFixed(2));
  });
}

// Apply anchor text from URL (e.g. /open-to#SayHi → #SayHi)
if (window.location.hash) {
  const hashText = '#' + decodeURIComponent(window.location.hash.slice(1));
  textInput.value = hashText;
}

// Update SVG initially
updateSVG();

// Handle download - Convert SVG to PNG
downloadBtn.addEventListener('click', () => {
  /* global XMLSerializer */
  const svgData = new XMLSerializer().serializeToString(preview);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const img = new Image();
  
  canvas.width = 400;
  canvas.height = 400;
  
  img.onload = () => {
    ctx.drawImage(img, 0, 0);
    const link = document.createElement('a');
    link.download = 'custom-frame.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
  
  /* global btoa */
  img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
});

