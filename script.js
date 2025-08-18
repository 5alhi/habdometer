// Habdometer - Professional Gauge Visualizer
// Clean version with proper angular gauge and enhanced speedometer

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
    const wrapper = document.getElementById('gaugeWrapper');
    
    // Update canvas dimensions
    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    
    // Update wrapper dimensions to match
    wrapper.style.width = size + 'px';
    wrapper.style.height = size + 'px';
    
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
        if (container) container.classList.remove('fullscreen-mode');
    } else {
        // Enter fullscreen
        overlay.classList.add('active');
        if (container) container.classList.add('fullscreen-mode');
        
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
    // Angular gauge - arc around the bottom (like a speedometer but smaller arc)
    const startAngle = Math.PI * 0.75; // Start at bottom left
    const endAngle = Math.PI * 2.25;   // End at bottom right
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Draw outer decorative ring
    const outerGradient = ctx.createRadialGradient(centerX, centerY, radius + 15, centerX, centerY, radius + 25);
    outerGradient.addColorStop(0, '#e0e0e0');
    outerGradient.addColorStop(0.5, '#c0c0c0');
    outerGradient.addColorStop(1, '#a0a0a0');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI, true);
    ctx.fillStyle = outerGradient;
    ctx.fill();
    
    // Draw gauge face with texture
    const faceGradient = ctx.createRadialGradient(centerX - 20, centerY - 20, 0, centerX, centerY, radius);
    faceGradient.addColorStop(0, '#f8f8f8');
    faceGradient.addColorStop(0.7, '#e8e8e8');
    faceGradient.addColorStop(1, '#d0d0d0');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.fillStyle = faceGradient;
    ctx.fill();
    
    // Draw background arc with gradient
    const bgGradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    bgGradient.addColorStop(0, '#f0f0f0');
    bgGradient.addColorStop(0.5, '#e8e8e8');
    bgGradient.addColorStop(1, '#f0f0f0');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.lineWidth = 25;
    ctx.strokeStyle = bgGradient;
    ctx.stroke();
    
    // Draw inner shadow on background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 12, startAngle, endAngle);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.stroke();
    
    // Draw colored arc based on heat level with enhanced gradient
    const color = getHeatColor(percentage);
    const colorGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    colorGradient.addColorStop(0, lightenColor(color, 30));
    colorGradient.addColorStop(0.3, color);
    colorGradient.addColorStop(0.7, color);
    colorGradient.addColorStop(1, darkenColor(color, 20));
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, currentAngle);
    ctx.lineWidth = 25;
    ctx.strokeStyle = colorGradient;
    ctx.stroke();
    
    // Draw highlight on colored arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, startAngle, currentAngle);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();
    
    // Draw detailed tick marks with numbers
    drawDetailedTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, 10);
    
    // Draw enhanced needle with 3D effect
    drawEnhancedNeedle(ctx, centerX, centerY, radius - 35, currentAngle);
    
    // Draw center hub with detailed design
    drawDetailedCenterHub(ctx, centerX, centerY, 25);
    
    // Draw enhanced text with styling
    drawEnhancedGaugeText(ctx, centerX, centerY + 60, value, units, name);
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
    
    // Draw tick marks
    drawTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, 6);
    
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
    
    // Draw tick marks
    drawTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, 4);
    
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
    
    // Draw outer chrome ring
    drawChromeRing(ctx, centerX, centerY, radius + 20, radius + 35);
    
    // Draw main gauge facefunction drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units) {
    // Enhanced speedometer with better visibility and proportional needle
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Calculate proportional needle length based on gauge size
    const needleLength = radius * 0.75; // 75% of radius for better proportion
    const needleWidth = Math.max(4, radius * 0.02); // Proportional width, minimum 4px
    
    // Draw multiple chrome rings for depth
    drawChromeRings(ctx, centerX, centerY, radius);
    
    // Draw carbon fiber gauge face
    drawCarGaugeFace(ctx, centerX, centerY, radius);
    
    // Draw background arc with enhanced styling
    const bgGradient = ctx.createLinearGradient(centerX - radius, centerY, centerX + radius, centerY);
    bgGradient.addColorStop(0, '#1a1a1a');
    bgGradient.addColorStop(0.5, '#0a0a0a');
    bgGradient.addColorStop(1, '#1a1a1a');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, startAngle, endAngle);
    ctx.lineWidth = 30;
    ctx.strokeStyle = bgGradient;
    ctx.stroke();
    
    // Draw inner shadow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 25, startAngle, endAngle);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.stroke();
    
    // Draw colored arc with enhanced heat level colors
    const color = getEnhancedHeatColor(percentage);
    const colorGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    colorGradient.addColorStop(0, lightenColor(color, 40));
    colorGradient.addColorStop(0.2, lightenColor(color, 20));
    colorGradient.addColorStop(0.5, color);
    colorGradient.addColorStop(0.8, darkenColor(color, 20));
    colorGradient.addColorStop(1, darkenColor(color, 40));
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, startAngle, currentAngle);
    ctx.lineWidth = 30;
    ctx.strokeStyle = colorGradient;
    ctx.stroke();
    
    // Draw highlight on colored arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 5, startAngle, currentAngle);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();
    
    // Draw enhanced tick marks with better visibility
    drawEnhancedSpeedometerTicks(ctx, centerX, centerY, radius, startAngle, endAngle);
    
    // Draw enhanced needle with better proportions
    drawEnhancedSpeedometerNeedle(ctx, centerX, centerY, needleLength, needleWidth, currentAngle);
    
    // Draw enhanced center hub
    drawEnhancedCenterHub(ctx, centerX, centerY, Math.max(20, radius * 0.08));
    
    // Draw digital display
    drawDigitalDisplay(ctx, centerX, centerY + radius * 0.3, value, units);
    
    // Draw gauge name with enhanced styling
    drawCarStyleText(ctx, centerX, centerY + radius + 50, '', '', name);
function getEnhancedHeatColor(percentage) {
    // Enhanced heat level colors with better visibility
    if (percentage <= 0.25) {
        // Green to light green (0-25%)
        const ratio = percentage / 0.25;
        return `rgb(${Math.round(34 + ratio * 100)}, ${Math.round(197 + ratio * 58)}, ${Math.round(94 - ratio * 30)})`;
    } else if (percentage <= 0.5) {
        // Light green to yellow (25-50%)
        const ratio = (percentage - 0.25) / 0.25;
        return `rgb(${Math.round(134 + ratio * 121)}, ${Math.round(255)}, ${Math.round(64 + ratio * 191)})`;
    } else if (percentage <= 0.75) {
        // Yellow to orange (50-75%)
        const ratio = (percentage - 0.5) / 0.25;
        return `rgb(${Math.round(255)}, ${Math.round(255 - ratio * 100)}, ${Math.round(255 - ratio * 255)})`;
    } else {
        // Orange to bright red (75-100%)
        const ratio = (percentage - 0.75) / 0.25;
        return `rgb(${Math.round(255)}, ${Math.round(155 - ratio * 155)}, ${Math.round(0)})`;
    }
}

function drawEnhancedSpeedometerNeedle(ctx, centerX, centerY, length, width, angle) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    
    // Needle shadow for depth
    ctx.save();
    ctx.translate(3, 3);
    ctx.beginPath();
    ctx.moveTo(-width * 2, -width);
    ctx.lineTo(length * 0.8, -width * 0.5);
    ctx.lineTo(length, 0);
    ctx.lineTo(length * 0.8, width * 0.5);
    ctx.lineTo(-width * 2, width);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.restore();
    
    // Main needle body with metallic gradient
    const needleGradient = ctx.createLinearGradient(0, -width, 0, width);
    needleGradient.addColorStop(0, '#ff6666');
    needleGradient.addColorStop(0.2, '#ff3333');
    needleGradient.addColorStop(0.5, '#cc0000');
    needleGradient.addColorStop(0.8, '#990000');
    needleGradient.addColorStop(1, '#660000');
    
    ctx.beginPath();
    ctx.moveTo(-width * 2, -width);
    ctx.lineTo(length * 0.8, -width * 0.5);
    ctx.lineTo(length, 0);
    ctx.lineTo(length * 0.8, width * 0.5);
    ctx.lineTo(-width * 2, width);
    ctx.closePath();
    ctx.fillStyle = needleGradient;
    ctx.fill();
    
    // Needle highlight for 3D effect
    ctx.beginPath();
    ctx.moveTo(-width * 2, -width * 0.3);
    ctx.lineTo(length * 0.8, -width * 0.2);
    ctx.lineTo(length * 0.9, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Needle tip with glow effect
    ctx.beginPath();
    ctx.arc(length, 0, width * 0.8, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Glow effect around tip
    ctx.beginPath();
    ctx.arc(length, 0, width * 1.2, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    ctx.restore();
}

function drawEnhancedSpeedometerTicks(ctx, centerX, centerY, radius, startAngle, endAngle) {
    const totalAngle = endAngle - startAngle;
    const majorTicks = 10;
    const minorTicks = 50;
    
    // Major ticks with enhanced visibility
    for (let i = 0; i <= majorTicks; i++) {
        const angle = startAngle + (totalAngle * i / majorTicks);
        const value = Math.round((i / majorTicks) * 100);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Major tick with gradient and glow
        const tickGradient = ctx.createLinearGradient(0, -2, 0, 2);
        tickGradient.addColorStop(0, '#ffffff');
        tickGradient.addColorStop(0.5, '#cccccc');
        tickGradient.addColorStop(1, '#999999');
        
        ctx.beginPath();
        ctx.moveTo(radius - 40, 0);
        ctx.lineTo(radius - 15, 0);
        ctx.lineWidth = 4;
        ctx.strokeStyle = tickGradient;
        ctx.stroke();
        
        // Tick glow
        ctx.beginPath();
        ctx.moveTo(radius - 40, 0);
        ctx.lineTo(radius - 15, 0);
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
        
        // Numbers with enhanced styling
        if (i % 2 === 0) {
            ctx.save();
            ctx.translate(radius - 55, 0);
            ctx.rotate(-angle);
            
            // Number shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, 1, 1);
            
            // Main number with gradient
            const textGradient = ctx.createLinearGradient(0, -8, 0, 8);
            textGradient.addColorStop(0, '#ffffff');
            textGradient.addColorStop(1, '#cccccc');
            ctx.fillStyle = textGradient;
            ctx.fillText(value, 0, 0);
            
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    // Minor ticks with subtle styling
    for (let i = 0; i <= minorTicks; i++) {
        if (i % 5 !== 0) {
            const angle = startAngle + (totalAngle * i / minorTicks);
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(radius - 25, 0);
            ctx.lineTo(radius - 15, 0);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.stroke();
            
            ctx.restore();
        }
    }
}
    
    // Major ticks with numbers
    for (let i = 0; i <= majorTicks; i++) {
        const angle = startAngle + (totalAngle * i / majorTicks);
        const value = Math.round((i / majorTicks) * 100);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Major tick with gradient
        const tickGradient = ctx.createLinearGradient(0, -3, 0, 3);
        tickGradient.addColorStop(0, '#666666');
        tickGradient.addColorStop(0.5, '#333333');
        tickGradient.addColorStop(1, '#666666');
        
        ctx.beginPath();
        ctx.moveTo(radius - 30, 0);
        ctx.lineTo(radius - 10, 0);
        ctx.lineWidth = 3;
        ctx.strokeStyle = tickGradient;
        ctx.stroke();
        
        // Number with shadow
        if (i % 2 === 0) { // Show every other number to avoid crowding
            ctx.save();
            ctx.translate(radius - 45, 0);
            ctx.rotate(-angle);
            
            // Text shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(value, 1, 1);
            
            // Main text
            ctx.fillStyle = '#333333';
            ctx.fillText(value, 0, 0);
            
            ctx.restore();
        }
        
        ctx.restore();
    }
    
    // Minor ticks
    for (let i = 0; i <= minorTicks; i++) {
        if (i % 5 !== 0) { // Skip major tick positions
            const angle = startAngle + (totalAngle * i / minorTicks);
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(radius - 20, 0);
            ctx.lineTo(radius - 10, 0);
            ctx.lineWidth = 1;
            ctx.strokeStyle = '#999999';
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

function drawEnhancedNeedle(ctx, centerX, centerY, length, angle) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    
    // Needle shadow
    ctx.save();
    ctx.translate(2, 2);
    ctx.beginPath();
    ctx.moveTo(-15, -3);
    ctx.lineTo(length, -1);
    ctx.lineTo(length, 1);
    ctx.lineTo(-15, 3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    ctx.restore();
    
    // Main needle with metallic gradient
    const needleGradient = ctx.createLinearGradient(0, -3, 0, 3);
    needleGradient.addColorStop(0, '#ff4444');
    needleGradient.addColorStop(0.3, '#cc0000');
    needleGradient.addColorStop(0.7, '#990000');
    needleGradient.addColorStop(1, '#660000');
    
    ctx.beginPath();
    ctx.moveTo(-15, -3);
    ctx.lineTo(length - 10, -2);
    ctx.lineTo(length, -1);
    ctx.lineTo(length, 1);
    ctx.lineTo(length - 10, 2);
    ctx.lineTo(-15, 3);
    ctx.closePath();
    ctx.fillStyle = needleGradient;
    ctx.fill();
    
    // Needle highlight
    ctx.beginPath();
    ctx.moveTo(-15, -1);
    ctx.lineTo(length - 10, -0.5);
    ctx.lineTo(length - 5, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Needle tip
    ctx.beginPath();
    ctx.arc(length, 0, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cc0000';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    ctx.restore();
}

function drawDetailedCenterHub(ctx, centerX, centerY, radius) {
    // Hub shadow
    ctx.beginPath();
    ctx.arc(centerX + 2, centerY + 2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
    
    // Main hub with metallic gradient
    const hubGradient = ctx.createRadialGradient(centerX - 5, centerY - 5, 0, centerX, centerY, radius);
    hubGradient.addColorStop(0, '#ffffff');
    hubGradient.addColorStop(0.3, '#e0e0e0');
    hubGradient.addColorStop(0.7, '#c0c0c0');
    hubGradient.addColorStop(1, '#a0a0a0');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Hub border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 8, 0, 2 * Math.PI);
    ctx.fillStyle = '#333333';
    ctx.fill();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(centerX, centerY, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
}

function drawEnhancedGaugeText(ctx, x, y, value, units, name) {
    // Value with enhanced styling
    ctx.save();
    
    // Text shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.font = 'bold 28px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(value + units, x + 2, y + 2);
    
    // Main text with gradient
    const textGradient = ctx.createLinearGradient(x, y - 15, x, y + 15);
    textGradient.addColorStop(0, '#333333');
    textGradient.addColorStop(0.5, '#000000');
    textGradient.addColorStop(1, '#333333');
    
    ctx.fillStyle = textGradient;
    ctx.font = 'bold 28px Inter';
    ctx.fillText(value + units, x, y);
    
    // Name with styling
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.font = '16px Inter';
    ctx.fillText(name, x + 1, y + 26);
    
    ctx.fillStyle = '#666666';
    ctx.fillText(name, x, y + 25);
    
    ctx.restore();
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

// Car odometer specific functions
function drawChromeRing(ctx, centerX, centerY, innerRadius, outerRadius) {
    const gradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    gradient.addColorStop(0, '#f0f0f0');
    gradient.addColorStop(0.2, '#d0d0d0');
    gradient.addColorStop(0.5, '#b0b0b0');
    gradient.addColorStop(0.8, '#909090');
    gradient.addColorStop(1, '#707070');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Chrome highlights
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX - 3, centerY - 3, outerRadius - i * 2, Math.PI * 0.2, Math.PI * 0.8);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 - i * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawCarGaugeFace(ctx, centerX, centerY, radius) {
    // Main face with carbon fiber texture
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, '#2c2c2c');
    gradient.addColorStop(0.7, '#1a1a1a');
    gradient.addColorStop(1, '#0a0a0a');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Carbon fiber pattern
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * (radius - 30);
        const y1 = centerY + Math.sin(angle) * (radius - 30);
        const x2 = centerX + Math.cos(angle) * (radius - 15);
        const y2 = centerY + Math.sin(angle) * (radius - 15);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

function drawDetailedCarTicks(ctx, centerX, centerY, radius, startAngle, endAngle, min, max) {
    const totalAngle = endAngle - startAngle;
    const majorTicks = 12;
    const minorTicks = 60;
    
    // Major ticks with numbers
    for (let i = 0; i <= majorTicks; i++) {
        const angle = startAngle + (totalAngle * i / majorTicks);
        const value = min + ((max - min) * i / majorTicks);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Major tick with gradient
        const tickGradient = ctx.createLinearGradient(0, -2, 0, 2);
        tickGradient.addColorStop(0, '#ffffff');
        tickGradient.addColorStop(1, '#cccccc');
        
        ctx.beginPath();
        ctx.moveTo(radius - 35, 0);
        ctx.lineTo(radius - 15, 0);
        ctx.lineWidth = 4;
        ctx.strokeStyle = tickGradient;
        ctx.stroke();
        
        // Number with glow effect
        ctx.save();
        ctx.translate(radius - 50, 0);
        ctx.rotate(-angle);
        
        // Glow
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 3;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(value), 0, 0);
        
        ctx.restore();
        ctx.restore();
    }
    
    // Minor ticks
    for (let i = 0; i <= minorTicks; i++) {
        if (i % 5 !== 0) {
            const angle = startAngle + (totalAngle * i / minorTicks);
            
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(angle);
            
            ctx.beginPath();
            ctx.moveTo(radius - 25, 0);
            ctx.lineTo(radius - 15, 0);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

function drawCarStyleNeedle(ctx, centerX, centerY, length, angle) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    
    // Needle shadow
    ctx.save();
    ctx.translate(3, 3);
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(length, -1);
    ctx.lineTo(length, 1);
    ctx.lineTo(-20, 4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.restore();
    
    // Main needle with metallic finish
    const needleGradient = ctx.createLinearGradient(0, -4, 0, 4);
    needleGradient.addColorStop(0, '#ff6666');
    needleGradient.addColorStop(0.3, '#ff0000');
    needleGradient.addColorStop(0.7, '#cc0000');
    needleGradient.addColorStop(1, '#990000');
    
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(length - 15, -2);
    ctx.lineTo(length, -1);
    ctx.lineTo(length, 1);
    ctx.lineTo(length - 15, 2);
    ctx.lineTo(-20, 4);
    ctx.closePath();
    ctx.fillStyle = needleGradient;
    ctx.fill();
    
    // Needle highlights
    ctx.beginPath();
    ctx.moveTo(-20, -2);
    ctx.lineTo(length - 15, -1);
    ctx.lineTo(length - 5, 0);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Needle tip with glow
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(length, 0, 4, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    ctx.restore();
}

function drawCarCenterHub(ctx, centerX, centerY, radius) {
    // Hub shadow
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY + 3, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    
    // Main hub with chrome finish
    const hubGradient = ctx.createRadialGradient(centerX - 8, centerY - 8, 0, centerX, centerY, radius);
    hubGradient.addColorStop(0, '#ffffff');
    hubGradient.addColorStop(0.2, '#f0f0f0');
    hubGradient.addColorStop(0.5, '#d0d0d0');
    hubGradient.addColorStop(0.8, '#a0a0a0');
    hubGradient.addColorStop(1, '#707070');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Chrome ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = '#555555';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Logo area
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 12, 0, 2 * Math.PI);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
    
    // Brand initial "H"
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', centerX, centerY);
}

function drawDigitalDisplay(ctx, centerX, centerY, value, units) {
    const displayWidth = 80;
    const displayHeight = 25;
    
    // Display background
    ctx.fillStyle = '#000000';
    ctx.fillRect(centerX - displayWidth/2, centerY - displayHeight/2, displayWidth, displayHeight);
    
    // Display border
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - displayWidth/2, centerY - displayHeight/2, displayWidth, displayHeight);
    
    // Digital text with glow
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 3;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(value + units, centerX, centerY);
    
    // Reset shadow
    ctx.shadowBlur = 0;
}

function drawCarStyleText(ctx, x, y, value, units, name) {
    if (name !== '') {
        // Name with chrome effect
        const nameGradient = ctx.createLinearGradient(x, y + 15, x, y + 35);
        nameGradient.addColorStop(0, '#cccccc');
        nameGradient.addColorStop(0.5, '#999999');
        nameGradient.addColorStop(1, '#666666');
        
        ctx.fillStyle = nameGradient;
        ctx.font = 'bold 18px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(name.toUpperCase(), x, y + 25);
    }
}

function createGradient(ctx, centerX, centerY, radius, color1, color2) {
    const gradient = ctx.createRadialGradient(centerX - radius/3, centerY - radius/3, 0, centerX, centerY, radius);
    gradient.addColorStop(0, color1);
    gradient.addColorStop(1, color2);
    return gradient;
}

function lightenColor(color, percent) {
    // Convert RGB string to hex if needed
    if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    
    const newR = Math.min(255, Math.round(r + (255 - r) * percent / 100));
    const newG = Math.min(255, Math.round(g + (255 - g) * percent / 100));
    const newB = Math.min(255, Math.round(b + (255 - b) * percent / 100));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex, percent) {
    // Handle RGB color format
    if (hex.startsWith('rgb')) {
        const matches = hex.match(/\d+/g);
        const r = parseInt(matches[0]);
        const g = parseInt(matches[1]);
        const b = parseInt(matches[2]);
        hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    const newR = Math.max(0, Math.round(r * (100 - percent) / 100));
    const newG = Math.max(0, Math.round(g * (100 - percent) / 100));
    const newB = Math.max(0, Math.round(b * (100 - percent) / 100));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
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
        
        // Use the larger delta to maintain square aspect ratio
        const delta = Math.max(deltaX, deltaY);
        
        let newSize = Math.max(200, Math.min(800, startWidth + delta));
        
        const canvas = document.getElementById('gaugeCanvas');
        const wrapper = document.getElementById('gaugeWrapper');
        const sizeSlider = document.getElementById('gaugeSize');
        
        // Update both canvas and wrapper dimensions
        canvas.width = newSize;
        canvas.height = newSize;
        canvas.style.width = newSize + 'px';
        canvas.style.height = newSize + 'px';
        
        wrapper.style.width = newSize + 'px';
        wrapper.style.height = newSize + 'px';
        
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


function toggleFullscreen() {
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    const fullscreenCanvas = document.getElementById('fullscreenCanvas');
    
    if (fullscreenOverlay.style.display === 'flex') {
        // Exit fullscreen
        fullscreenOverlay.style.display = 'none';
    } else {
        // Enter fullscreen - expand gauge to fill screen
        fullscreenOverlay.style.display = 'flex';
        
        // Calculate optimal size for fullscreen (85% of smaller dimension)
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const maxSize = Math.min(screenWidth, screenHeight) * 0.85;
        
        // Set canvas to optimal fullscreen size
        fullscreenCanvas.width = maxSize;
        fullscreenCanvas.height = maxSize;
        fullscreenCanvas.style.width = maxSize + 'px';
        fullscreenCanvas.style.height = maxSize + 'px';
        
        // Update the fullscreen gauge
        updateGauge();
    }
}

function exitFullscreen() {
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    fullscreenOverlay.style.display = 'none';
}

// Enhanced center hub function
function drawEnhancedCenterHub(ctx, centerX, centerY, radius) {
    // Hub shadow for depth
    ctx.beginPath();
    ctx.arc(centerX + 3, centerY + 3, radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    
    // Main hub with enhanced metallic gradient
    const hubGradient = ctx.createRadialGradient(centerX - radius * 0.3, centerY - radius * 0.3, 0, centerX, centerY, radius);
    hubGradient.addColorStop(0, '#ffffff');
    hubGradient.addColorStop(0.2, '#f0f0f0');
    hubGradient.addColorStop(0.5, '#d0d0d0');
    hubGradient.addColorStop(0.8, '#b0b0b0');
    hubGradient.addColorStop(1, '#909090');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Hub border with gradient
    const borderGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    borderGradient.addColorStop(0, '#666666');
    borderGradient.addColorStop(0.5, '#333333');
    borderGradient.addColorStop(1, '#666666');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = borderGradient;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Inner circle with depth
    const innerRadius = radius * 0.6;
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
    innerGradient.addColorStop(0, '#444444');
    innerGradient.addColorStop(0.7, '#222222');
    innerGradient.addColorStop(1, '#000000');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Center logo/brand mark
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(12, radius * 0.4)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('H', centerX, centerY);
    
    // Logo shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText('H', centerX + 1, centerY + 1);
    
    // Logo highlight
    ctx.fillStyle = '#ffffff';
    ctx.fillText('H', centerX, centerY);
}

