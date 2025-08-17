// Habdometer - Professional Gauge Visualizer
// Enhanced with multiple gauge types, query string support, and fullscreen functionality

document.addEventListener('DOMContentLoaded', function() {
    // Parse query string parameters on page load
    parseQueryString();
    
    // Initialize the application
    initializeApp();
});

function parseQueryString() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Set values from query string if they exist
    if (urlParams.has('value')) {
        const value = parseInt(urlParams.get('value'));
        if (!isNaN(value)) {
            document.getElementById('gaugeValue').value = value;
            document.getElementById('gaugeSlider').value = value;
        }
    }
    
    if (urlParams.has('name')) {
        document.getElementById('gaugeName').value = decodeURIComponent(urlParams.get('name'));
    }
    
    if (urlParams.has('min')) {
        const min = parseInt(urlParams.get('min'));
        if (!isNaN(min)) {
            document.getElementById('minValue').value = min;
        }
    }
    
    if (urlParams.has('max')) {
        const max = parseInt(urlParams.get('max'));
        if (!isNaN(max)) {
            document.getElementById('maxValue').value = max;
        }
    }
    
    if (urlParams.has('units')) {
        document.getElementById('units').value = decodeURIComponent(urlParams.get('units'));
    }
    
    if (urlParams.has('type')) {
        document.getElementById('gaugeType').value = urlParams.get('type');
    }
    
    if (urlParams.has('bg')) {
        const bg = decodeURIComponent(urlParams.get('bg'));
        document.getElementById('backgroundColor').value = bg;
        document.getElementById('backgroundColorText').value = bg;
        document.body.style.background = bg;
    }
    
    if (urlParams.has('size')) {
        const size = parseInt(urlParams.get('size'));
        if (!isNaN(size) && size >= 200 && size <= 800) {
            document.getElementById('gaugeSize').value = size;
            document.getElementById('gaugeSizeDisplay').textContent = size + 'px';
        }
    }
    
    // Check for direct fullscreen mode
    if (urlParams.has('fullscreen') && urlParams.get('fullscreen') === 'true') {
        // Delay fullscreen activation to allow page to load
        setTimeout(() => {
            toggleFullscreen();
        }, 500);
    }
}

function initializeApp() {
    // Get all DOM elements
    const gaugeCanvas = document.getElementById('gaugeCanvas');
    const fullscreenCanvas = document.getElementById('fullscreenCanvas');
    const gaugeValue = document.getElementById('gaugeValue');
    const gaugeSlider = document.getElementById('gaugeSlider');
    const gaugeName = document.getElementById('gaugeName');
    const gaugeType = document.getElementById('gaugeType');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');
    const units = document.getElementById('units');
    const gaugeSize = document.getElementById('gaugeSize');
    const backgroundColor = document.getElementById('backgroundColor');
    const backgroundColorText = document.getElementById('backgroundColorText');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    const generateUrlBtn = document.getElementById('generateUrlBtn');
    const generateFullscreenUrlBtn = document.getElementById('generateFullscreenUrlBtn');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    
    // Sync number input and slider
    gaugeValue.addEventListener('input', function() {
        gaugeSlider.value = this.value;
        updateGauge();
    });
    
    gaugeSlider.addEventListener('input', function() {
        gaugeValue.value = this.value;
        updateGauge();
    });
    
    // Update gauge size display
    gaugeSize.addEventListener('input', function() {
        document.getElementById('gaugeSizeDisplay').textContent = this.value + 'px';
        updateGaugeSize();
    });
    
    // Sync color inputs
    backgroundColor.addEventListener('input', function() {
        backgroundColorText.value = this.value;
        updateBackground();
    });
    
    backgroundColorText.addEventListener('input', function() {
        if (this.value.match(/^#[0-9A-F]{6}$/i)) {
            backgroundColor.value = this.value;
            updateBackground();
        }
    });
    
    // Add event listeners for all controls
    [gaugeName, gaugeType, minValue, maxValue, units].forEach(element => {
        element.addEventListener('input', updateGauge);
    });
    
    // Preset color buttons
    document.querySelectorAll('.preset-color').forEach(button => {
        button.addEventListener('click', function() {
            const color = this.getAttribute('data-color');
            backgroundColor.value = color;
            backgroundColorText.value = color;
            updateBackground();
            
            // Update active state
            document.querySelectorAll('.preset-color').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Quick settings buttons
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const preset = this.getAttribute('data-preset');
            applyPreset(preset);
            
            // Update active state
            document.querySelectorAll('.quick-btn').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Fullscreen controls
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    exitFullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // URL generation controls
    generateUrlBtn.addEventListener('click', () => generateUrl(false));
    generateFullscreenUrlBtn.addEventListener('click', () => generateUrl(true));
    copyUrlBtn.addEventListener('click', copyUrlToClipboard);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
        if (e.key === 'Escape' && document.getElementById('fullscreenOverlay').classList.contains('active')) {
            toggleFullscreen();
        }
    });
    
    // Initialize resize functionality
    initializeResize();
    
    // Initial gauge render
    updateGauge();
}

function updateGauge() {
    const value = parseFloat(document.getElementById('gaugeValue').value);
    const name = document.getElementById('gaugeName').value;
    const type = document.getElementById('gaugeType').value;
    const min = parseFloat(document.getElementById('minValue').value);
    const max = parseFloat(document.getElementById('maxValue').value);
    const units = document.getElementById('units').value;
    
    // Update display values
    document.getElementById('currentValueDisplay').textContent = value + units;
    document.getElementById('gaugeTitleDisplay').textContent = name;
    document.getElementById('fullscreenValueDisplay').textContent = value + units;
    document.getElementById('fullscreenTitleDisplay').textContent = name;
    
    // Update slider range
    document.getElementById('gaugeSlider').min = min;
    document.getElementById('gaugeSlider').max = max;
    document.getElementById('gaugeValue').min = min;
    document.getElementById('gaugeValue').max = max;
    
    // Draw gauge on both canvases
    drawGauge('gaugeCanvas', type, value, min, max, name, units);
    drawGauge('fullscreenCanvas', type, value, min, max, name, units);
}

function updateGaugeSize() {
    const size = parseInt(document.getElementById('gaugeSize').value);
    const canvas = document.getElementById('gaugeCanvas');
    
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    updateGauge();
}

function updateBackground() {
    const color = document.getElementById('backgroundColor').value;
    document.body.style.background = color;
}

function applyPreset(preset) {
    const presets = {
        temperature: {
            name: 'Temperature',
            min: 0,
            max: 100,
            units: '°C',
            value: 25,
            type: 'semicircle'
        },
        speed: {
            name: 'Speed',
            min: 0,
            max: 200,
            units: 'km/h',
            value: 80,
            type: 'speedometer'
        },
        pressure: {
            name: 'Pressure',
            min: 0,
            max: 10,
            units: 'bar',
            value: 2.5,
            type: 'angular'
        },
        battery: {
            name: 'Battery',
            min: 0,
            max: 100,
            units: '%',
            value: 75,
            type: 'linear'
        }
    };
    
    const config = presets[preset];
    if (config) {
        document.getElementById('gaugeName').value = config.name;
        document.getElementById('minValue').value = config.min;
        document.getElementById('maxValue').value = config.max;
        document.getElementById('units').value = config.units;
        document.getElementById('gaugeValue').value = config.value;
        document.getElementById('gaugeSlider').value = config.value;
        document.getElementById('gaugeType').value = config.type;
        updateGauge();
    }
}

function toggleFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    const container = document.getElementById('mainContainer');
    
    if (overlay.classList.contains('active')) {
        // Exit fullscreen
        overlay.classList.remove('active');
        container.classList.remove('fullscreen-mode');
    } else {
        // Enter fullscreen
        overlay.classList.add('active');
        container.classList.add('fullscreen-mode');
        
        // Update fullscreen canvas size for optimal display
        const fullscreenCanvas = document.getElementById('fullscreenCanvas');
        const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.6);
        fullscreenCanvas.width = maxSize;
        fullscreenCanvas.height = maxSize;
        fullscreenCanvas.style.width = maxSize + 'px';
        fullscreenCanvas.style.height = maxSize + 'px';
        
        updateGauge();
    }
}

function drawGauge(canvasId, type, value, min, max, name, units) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate percentage
    const percentage = (value - min) / (max - min);
    
    switch (type) {
        case 'angular':
            drawAngularGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
        case 'semicircle':
            drawSemicircleGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
        case 'quarter':
            drawQuarterGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
        case 'linear':
            drawLinearGauge(ctx, canvas.width, canvas.height, percentage, value, name, units);
            break;
        case 'speedometer':
            drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units, min, max);
            break;
    }
}

function drawAngularGauge(ctx, centerX, centerY, radius, percentage, value, name, units) {
    const startAngle = -Math.PI * 0.75;
    const endAngle = Math.PI * 0.75;
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#e0e0e0';
    ctx.stroke();
    
    // Draw colored arc based on heat level
    const color = getHeatColor(percentage);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.lineWidth = 20;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Draw needle
    drawNeedle(ctx, centerX, centerY, radius - 30, currentAngle);
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 15, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Draw text
    drawGaugeText(ctx, centerX, centerY + radius + 40, value, units, name);
}

function drawSemicircleGauge(ctx, centerX, centerY, radius, percentage, value, name, units) {
    const startAngle = Math.PI;
    const endAngle = 2 * Math.PI;
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 25;
    ctx.strokeStyle = '#e0e0e0';
    ctx.stroke();
    
    // Draw colored arc
    const color = getHeatColor(percentage);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.lineWidth = 25;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Draw needle
    drawNeedle(ctx, centerX, centerY, radius - 35, currentAngle);
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Draw text
    drawGaugeText(ctx, centerX, centerY + 50, value, units, name);
}

function drawQuarterGauge(ctx, centerX, centerY, radius, percentage, value, name, units) {
    const startAngle = Math.PI;
    const endAngle = Math.PI * 1.5;
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 30;
    ctx.strokeStyle = '#e0e0e0';
    ctx.stroke();
    
    // Draw colored arc
    const color = getHeatColor(percentage);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.lineWidth = 30;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Draw needle
    drawNeedle(ctx, centerX, centerY, radius - 40, currentAngle);
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Draw text
    drawGaugeText(ctx, centerX - 50, centerY + 50, value, units, name);
}

function drawLinearGauge(ctx, width, height, percentage, value, name, units) {
    const barWidth = width * 0.8;
    const barHeight = 40;
    const x = (width - barWidth) / 2;
    const y = height / 2 - barHeight / 2;
    
    // Draw background bar
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(x, y, barWidth, barHeight);
    
    // Draw colored bar
    const color = getHeatColor(percentage);
    ctx.fillStyle = color;
    ctx.fillRect(x, y, barWidth * percentage, barHeight);
    
    // Draw border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, barWidth, barHeight);
    
    // Draw text
    drawGaugeText(ctx, width / 2, y + barHeight + 60, value, units, name);
}

function drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units, min, max) {
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Draw outer ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#e0e0e0';
    ctx.stroke();
    
    // Draw colored arc
    const color = getHeatColor(percentage);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.lineWidth = 15;
    ctx.strokeStyle = color;
    ctx.stroke();
    
    // Draw tick marks
    drawTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, min, max);
    
    // Draw needle
    drawNeedle(ctx, centerX, centerY, radius - 20, currentAngle);
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#333';
    ctx.fill();
    
    // Draw text
    drawGaugeText(ctx, centerX, centerY + radius + 60, value, units, name);
}

function drawNeedle(ctx, centerX, centerY, length, angle) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    
    // Draw needle
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(length, 0);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#333';
    ctx.stroke();
    
    // Draw needle tip
    ctx.beginPath();
    ctx.arc(length, 0, 6, 0, 2 * Math.PI);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    
    ctx.restore();
}

function drawTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, min, max) {
    const totalAngle = endAngle - startAngle;
    const steps = 10;
    
    for (let i = 0; i <= steps; i++) {
        const angle = startAngle + (totalAngle * i / steps);
        const value = min + ((max - min) * i / steps);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Draw tick mark
        ctx.beginPath();
        ctx.moveTo(radius - 25, 0);
        ctx.lineTo(radius - 10, 0);
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#333';
        ctx.stroke();
        
        // Draw value label
        ctx.save();
        ctx.translate(radius - 35, 0);
        ctx.rotate(-angle);
        ctx.fillStyle = '#333';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(value), 0, 4);
        ctx.restore();
        
        ctx.restore();
    }
}

function drawGaugeText(ctx, x, y, value, units, name) {
    // Draw value
    ctx.fillStyle = '#333';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(value + units, x, y);
    
    // Draw name
    ctx.font = '16px Inter';
    ctx.fillStyle = '#666';
    ctx.fillText(name, x, y + 25);
}

function getHeatColor(percentage) {
    // Create smooth color transition from green to red
    if (percentage <= 0.5) {
        // Green to yellow
        const r = Math.round(255 * (percentage * 2));
        const g = 255;
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
    } else {
        // Yellow to red
        const r = 255;
        const g = Math.round(255 * (2 - percentage * 2));
        const b = 0;
        return `rgb(${r}, ${g}, ${b})`;
    }
}

function initializeResize() {
    const gaugeWrapper = document.getElementById('gaugeWrapper');
    const resizeHandles = document.querySelectorAll('.resize-handle');
    let isResizing = false;
    let startX, startY, startWidth, startHeight;
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            
            const canvas = document.getElementById('gaugeCanvas');
            startWidth = parseInt(canvas.style.width) || canvas.width;
            startHeight = parseInt(canvas.style.height) || canvas.height;
            
            e.preventDefault();
        });
    });
    
    document.addEventListener('mousemove', function(e) {
        if (!isResizing) return;
        
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const delta = Math.max(deltaX, deltaY);
        
        let newSize = Math.max(200, Math.min(800, startWidth + delta));
        
        const canvas = document.getElementById('gaugeCanvas');
        const sizeSlider = document.getElementById('gaugeSize');
        
        canvas.width = newSize;
        canvas.height = newSize;
        canvas.style.width = newSize + 'px';
        canvas.style.height = newSize + 'px';
        
        sizeSlider.value = newSize;
        document.getElementById('gaugeSizeDisplay').textContent = newSize + 'px';
        
        updateGauge();
    });
    
    document.addEventListener('mouseup', function() {
        isResizing = false;
    });
}

// URL generation functions
function generateUrl(includeFullscreen = false) {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();
    
    // Get current values
    const value = document.getElementById('gaugeValue').value;
    const name = document.getElementById('gaugeName').value;
    const min = document.getElementById('minValue').value;
    const max = document.getElementById('maxValue').value;
    const units = document.getElementById('units').value;
    const type = document.getElementById('gaugeType').value;
    const bg = document.getElementById('backgroundColor').value;
    const size = document.getElementById('gaugeSize').value;
    
    // Add parameters only if they differ from defaults
    if (value !== '50') params.set('value', value);
    if (name !== 'Habdometer') params.set('name', encodeURIComponent(name));
    if (min !== '0') params.set('min', min);
    if (max !== '100') params.set('max', max);
    if (units !== '%') params.set('units', encodeURIComponent(units));
    if (type !== 'angular') params.set('type', type);
    if (bg !== '#1a1a1a') params.set('bg', encodeURIComponent(bg));
    if (size !== '400') params.set('size', size);
    if (includeFullscreen) params.set('fullscreen', 'true');
    
    // Generate final URL
    const queryString = params.toString();
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
    
    // Display the URL
    const urlDisplay = document.getElementById('urlDisplay');
    const generatedUrl = document.getElementById('generatedUrl');
    
    generatedUrl.value = finalUrl;
    urlDisplay.style.display = 'flex';
    
    // Auto-select the URL for easy copying
    generatedUrl.select();
    generatedUrl.setSelectionRange(0, 99999); // For mobile devices
    
    return finalUrl;
}

function copyUrlToClipboard() {
    const generatedUrl = document.getElementById('generatedUrl');
    const copyBtn = document.getElementById('copyUrlBtn');
    
    try {
        // Select and copy the URL
        generatedUrl.select();
        generatedUrl.setSelectionRange(0, 99999);
        document.execCommand('copy');
        
        // Visual feedback
        copyBtn.classList.add('copied');
        
        // Reset button state after 2 seconds
        setTimeout(() => {
            copyBtn.classList.remove('copied');
        }, 2000);
        
        // Show success message (optional)
        console.log('URL copied to clipboard!');
        
    } catch (err) {
        console.error('Failed to copy URL: ', err);
        
        // Fallback: try the modern clipboard API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(generatedUrl.value).then(() => {
                copyBtn.classList.add('copied');
                setTimeout(() => {
                    copyBtn.classList.remove('copied');
                }, 2000);
            }).catch(err => {
                console.error('Clipboard API failed: ', err);
            });
        }
    }
}

