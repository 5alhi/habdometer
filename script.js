// Habdometer - Professional Gauge Visualizer
// Enhanced with bigger needle, center gauge name, Arabic fonts, and warning system

// --- Global warning timer variables ---
let warningTimer = null;
let warningIntervalTimer = null;
let isWarningActive = false;

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
        const bgColor = '#' + urlParams.get('bg').replace('#', '');
        document.getElementById('backgroundColor').value = bgColor;
        document.getElementById('backgroundColorText').value = bgColor;
        document.body.style.background = bgColor;
    }

    if (urlParams.has('size')) {
        const size = parseInt(urlParams.get('size'));
        if (!isNaN(size) && size >= 200 && size <= 800) {
            document.getElementById('gaugeSize').value = size;
            updateGaugeSize(size);
        }
    }

    if (urlParams.has('warning')) {
        document.getElementById('warningText').value = decodeURIComponent(urlParams.get('warning'));
    }

    if (urlParams.has('threshold')) {
        const threshold = parseInt(urlParams.get('threshold'));
        if (!isNaN(threshold)) {
            document.getElementById('warningThreshold').value = threshold;
        }
    }

    // Check for fullscreen parameter
    if (urlParams.has('fullscreen') && urlParams.get('fullscreen') === 'true') {
        setTimeout(() => {
            toggleFullscreen();
        }, 500);
    }
}

function initializeApp() {
    // Get DOM elements
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
    const warningThreshold = document.getElementById('warningThreshold');
    const warningText = document.getElementById('warningText');
    const warningDuration = document.getElementById('warningDuration');
    const warningInterval = document.getElementById('warningInterval');

    // Event listeners for gauge updates
    gaugeValue.addEventListener('input', updateGauge);
    gaugeSlider.addEventListener('input', function() {
        gaugeValue.value = this.value;
        updateGauge();
    });
    gaugeName.addEventListener('input', updateGauge);
    gaugeType.addEventListener('change', updateGauge);
    minValue.addEventListener('input', updateGauge);
    maxValue.addEventListener('input', updateGauge);
    units.addEventListener('input', updateGauge);
    warningThreshold.addEventListener('input', updateGauge);
    warningText.addEventListener('input', updateGauge);
    warningDuration.addEventListener('input', updateGauge);
    warningInterval.addEventListener('input', updateGauge);

    // Size control
    gaugeSize.addEventListener('input', function() {
        const size = parseInt(this.value);
        updateGaugeSize(size);
        updateGauge();
    });

    // Background color controls
    backgroundColor.addEventListener('input', function() {
        backgroundColorText.value = this.value;
        document.body.style.background = this.value;
    });

    backgroundColorText.addEventListener('input', function() {
        if (this.value.match(/^#[0-9A-F]{6}$/i)) {
            backgroundColor.value = this.value;
            document.body.style.background = this.value;
        }
    });

    // Preset color buttons
    document.querySelectorAll('.preset-color').forEach(button => {
        button.addEventListener('click', function() {
            const color = this.dataset.color;
            backgroundColor.value = color;
            backgroundColorText.value = color;
            document.body.style.background = color;

            // Update active state
            document.querySelectorAll('.preset-color').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Quick preset buttons
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const preset = this.dataset.preset;
            applyPreset(preset);
        });
    });

    // Fullscreen functionality
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('exitFullscreenBtn').addEventListener('click', exitFullscreen);

    // URL generation
    document.getElementById('generateUrlBtn').addEventListener('click', generateUrl);
    document.getElementById('generateFullscreenUrlBtn').addEventListener('click', generateFullscreenUrl);
    document.getElementById('copyUrlBtn').addEventListener('click', copyUrl);

    // Escape key for fullscreen
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            exitFullscreen();
        }
    });

    // Initialize resize functionality
    initializeResize();

    // Initial gauge draw
    updateGauge();
}

function updateGauge() {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const value = parseFloat(document.getElementById('gaugeValue').value);
    const name = document.getElementById('gaugeName').value;
    const type = document.getElementById('gaugeType').value;
    const min = parseFloat(document.getElementById('minValue').value);
    const max = parseFloat(document.getElementById('maxValue').value);
    const units = document.getElementById('units').value;
    const threshold = parseFloat(document.getElementById('warningThreshold').value);
    const warningMsg = document.getElementById('warningText').value;

    // Update slider and input max values
    document.getElementById('gaugeSlider').max = max;
    document.getElementById('gaugeValue').max = max;

    // Calculate percentage based on range
    const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw gauge based on type
    switch(type) {
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
            drawLinearGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
        case 'speedometer':
            drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
    }

    // Update display values
    document.getElementById('currentValueDisplay').textContent = value + units;
    document.getElementById('gaugeTitleDisplay').textContent = name;

    // Check for warning condition with timed display
    const warningOverlay = document.getElementById('warningOverlay');
    const warningMessage = document.getElementById('warningMessage');
    const duration = parseInt(document.getElementById('warningDuration').value) * 1000; // Convert to milliseconds
    const interval = parseInt(document.getElementById('warningInterval').value) * 1000; // Convert to milliseconds

    if (value > threshold) {
        warningMessage.textContent = warningMsg;
        // Start warning cycle if not already active
        if (!isWarningActive) {
            isWarningActive = true;
            showTimedWarning(warningOverlay, duration, interval);
        }
    } else {
        // Clear warning timers and hide warning
        isWarningActive = false;
        clearTimeout(warningTimer);
        clearTimeout(warningIntervalTimer);
        warningOverlay.style.display = 'none';
    }

    // Update fullscreen canvas if active
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    if (fullscreenOverlay.classList.contains('active')) {
        updateFullscreenGauge();
    }

    // Continuous animation for jitter effect when over threshold
    if (value > threshold) {
        if (!window.jitterAnimationActive) {
            window.jitterAnimationActive = true;
            startJitterAnimation();
        }
    } else {
        window.jitterAnimationActive = false;
    }
}

// Timed warning system (script-old.js style)
function showTimedWarning(warningElement, duration, interval) {
    warningElement.style.display = 'flex';
    warningTimer = setTimeout(() => {
        warningElement.style.display = 'none';
        if (isWarningActive) {
            warningIntervalTimer = setTimeout(() => {
                if (isWarningActive) {
                    showTimedWarning(warningElement, duration, interval);
                }
            }, interval - duration);
        }
    }, duration);
}

// --- Gauge drawing and helper functions remain unchanged ---
// ...all your gauge drawing functions (drawAngularGauge, drawSpeedometerGauge, drawSemicircleGauge, drawQuarterGauge, drawLinearGauge, drawChromeRings, drawCarGaugeFace, drawCarTickMarks, drawCarNeedle, drawCarCenterHub, drawDigitalDisplay, drawCenterGaugeName, drawEnhancedNeedle, drawDetailedCenterHub, drawDetailedTickMarks, drawTickMarks, getHeatColor, getEnhancedHeatColor, lightenColor, darkenColor)...
// (These are already present in your file and do not need to be changed for the warning fix.)

function updateGaugeSize(size) {
    const canvas = document.getElementById('gaugeCanvas');
    const wrapper = document.getElementById('gaugeWrapper');

    canvas.width = size;
    canvas.height = size;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    document.getElementById('gaugeSizeDisplay').textContent = size + 'px';
}

function applyPreset(preset) {
    const presets = {
        temperature: {
            name: 'Temperature',
            units: '°C',
            min: 0,
            max: 100,
            value: 25,
            type: 'angular'
        },
        speed: {
            name: 'Speed',
            units: 'km/h',
            min: 0,
            max: 200,
            value: 80,
            type: 'speedometer'
        },
        pressure: {
            name: 'Pressure',
            units: 'PSI',
            min: 0,
            max: 100,
            value: 45,
            type: 'semicircle'
        },
        battery: {
            name: 'Battery',
            units: '%',
            min: 0,
            max: 100,
            value: 75,
            type: 'linear'
        }
    };

    const config = presets[preset];
    if (config) {
        document.getElementById('gaugeName').value = config.name;
        document.getElementById('units').value = config.units;
        document.getElementById('minValue').value = config.min;
        document.getElementById('maxValue').value = config.max;
        document.getElementById('gaugeValue').value = config.value;
        document.getElementById('gaugeSlider').value = config.value;
        document.getElementById('gaugeType').value = config.type;
        updateGauge();
    }
}

function toggleFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    overlay.classList.add('active');
    updateFullscreenGauge();
}

function exitFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    overlay.classList.remove('active');
}

function updateFullscreenGauge() {
    const canvas = document.getElementById('fullscreenCanvas');
    const ctx = canvas.getContext('2d');
    const value = parseFloat(document.getElementById('gaugeValue').value);
    const name = document.getElementById('gaugeName').value;
    const type = document.getElementById('gaugeType').value;
    const min = parseFloat(document.getElementById('minValue').value);
    const max = parseFloat(document.getElementById('maxValue').value);
    const units = document.getElementById('units').value;
    const threshold = parseFloat(document.getElementById('warningThreshold').value);
    const warningMsg = document.getElementById('warningText').value;

    // Calculate optimal size for fullscreen (85% of screen)
    const screenSize = Math.min(window.innerWidth, window.innerHeight);
    const canvasSize = Math.round(screenSize * 0.85);

    canvas.width = canvasSize;
    canvas.height = canvasSize;
    canvas.style.width = canvasSize + 'px';
    canvas.style.height = canvasSize + 'px';

    const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw gauge based on type
    switch(type) {
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
            drawLinearGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
        case 'speedometer':
            drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
    }

    // Check for warning condition in fullscreen with timed display
    const fullscreenWarningOverlay = document.getElementById('fullscreenWarningOverlay');
    const fullscreenWarningMessage = document.getElementById('fullscreenWarningMessage');
    const duration = parseInt(document.getElementById('warningDuration').value) * 1000;
    const interval = parseInt(document.getElementById('warningInterval').value) * 1000;

    if (value > threshold) {
        fullscreenWarningMessage.textContent = warningMsg;
        // Use the same warning cycle for fullscreen
        if (!isWarningActive) {
            isWarningActive = true;
            showTimedWarning(fullscreenWarningOverlay, duration, interval);
        }
    } else {
        // Clear warning timers and hide warning
        isWarningActive = false;
        clearTimeout(warningTimer);
        clearTimeout(warningIntervalTimer);
        fullscreenWarningOverlay.style.display = 'none';
    }
}

function generateUrl() {
    const baseUrl = window.location.origin + window.location.pathname;
    const params = new URLSearchParams();

    const value = document.getElementById('gaugeValue').value;
    const name = document.getElementById('gaugeName').value;
    const type = document.getElementById('gaugeType').value;
    const min = document.getElementById('minValue').value;
    const max = document.getElementById('maxValue').value;
    const units = document.getElementById('units').value;
    const size = document.getElementById('gaugeSize').value;
    const bg = document.getElementById('backgroundColor').value;
    const warning = document.getElementById('warningText').value;
    const threshold = document.getElementById('warningThreshold').value;

    // Only add parameters that differ from defaults
    if (value !== '50') params.set('value', value);
    if (name !== 'هبدوميتر') params.set('name', encodeURIComponent(name));
    if (type !== 'angular') params.set('type', type);
    if (min !== '0') params.set('min', min);
    if (max !== '120') params.set('max', max);
    if (units !== '°H') params.set('units', encodeURIComponent(units));
    if (size !== '400') params.set('size', size);
    if (bg !== '#1a1a1a') params.set('bg', bg.replace('#', ''));
    if (warning !== 'WARNING: EXTREME HABDOLOGY DETECTED') params.set('warning', encodeURIComponent(warning));
    if (threshold !== '100') params.set('threshold', threshold);

    const url = baseUrl + (params.toString() ? '?' + params.toString() : '');

    document.getElementById('generatedUrl').value = url;
    document.getElementById('urlDisplay').classList.add('show');
}

function generateFullscreenUrl() {
    generateUrl();
    const currentUrl = document.getElementById('generatedUrl').value;
    const separator = currentUrl.includes('?') ? '&' : '?';
    const fullscreenUrl = currentUrl + separator + 'fullscreen=true';

    document.getElementById('generatedUrl').value = fullscreenUrl;
    document.getElementById('urlDisplay').classList.add('show');
}

function copyUrl() {
    const urlInput = document.getElementById('generatedUrl');
    urlInput.select();
    urlInput.setSelectionRange(0, 99999);

    navigator.clipboard.writeText(urlInput.value).then(() => {
        const copyBtn = document.getElementById('copyUrlBtn');
        copyBtn.textContent = 'Copied!';
        copyBtn.classList.add('copied');

        setTimeout(() => {
            copyBtn.textContent = 'Copy';
            copyBtn.classList.remove('copied');
        }, 2000);
    });
}

function initializeResize() {
    const wrapper = document.getElementById('gaugeWrapper');
    const canvas = document.getElementById('gaugeCanvas');
    const handles = document.querySelectorAll('.resize-handle');

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    handles.forEach(handle => {
        handle.addEventListener('mousedown', function(e) {
            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            startWidth = parseInt(canvas.style.width) || canvas.width;
            startHeight = parseInt(canvas.style.height) || canvas.height;

            e.preventDefault();

            document.addEventListener('mousemove', handleResize);
            document.addEventListener('mouseup', stopResize);
        });
    });

    function handleResize(e) {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const delta = Math.max(deltaX, deltaY);

        let newSize = Math.max(200, Math.min(800, startWidth + delta));

        updateGaugeSize(newSize);
        document.getElementById('gaugeSize').value = newSize;
        updateGauge();
    }

    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', handleResize);
        document.removeEventListener('mouseup', stopResize);
    }
}

// Window resize handler for fullscreen
window.addEventListener('resize', function() {
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    if (fullscreenOverlay.classList.contains('active')) {
        updateFullscreenGauge();
    }
});

// Separate jitter animation that doesn't interfere with warnings
function startJitterAnimation() {
    function animateJitter() {
        if (!window.jitterAnimationActive) return;

        const currentValue = parseFloat(document.getElementById('gaugeValue').value);
        const threshold = parseFloat(document.getElementById('warningThreshold').value);

        if (currentValue <= threshold) {
            window.jitterAnimationActive = false;
            return;
        }

        // Only redraw the gauge canvas without triggering warning logic
        redrawGaugeOnly();

        setTimeout(animateJitter, 50); // 20 FPS
    }
    animateJitter();
}

// Redraw only the gauge without affecting warning system
function redrawGaugeOnly() {
    const canvas = document.getElementById('gaugeCanvas');
    const ctx = canvas.getContext('2d');
    const value = parseFloat(document.getElementById('gaugeValue').value);
    const name = document.getElementById('gaugeName').value;
    const type = document.getElementById('gaugeType').value;
    const min = parseFloat(document.getElementById('minValue').value);
    const max = parseFloat(document.getElementById('maxValue').value);
    const units = document.getElementById('units').value;

    const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw gauge based on type (jitter will be applied in needle functions)
    switch(type) {
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
            drawLinearGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
        case 'speedometer':
            drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
    }

    // Also update fullscreen if active
    const fullscreenOverlay = document.getElementById('fullscreenOverlay');
    if (fullscreenOverlay.classList.contains('active')) {
        redrawFullscreenGaugeOnly();
    }
}

// Redraw fullscreen gauge without affecting warning system
function redrawFullscreenGaugeOnly() {
    const canvas = document.getElementById('fullscreenCanvas');
    const ctx = canvas.getContext('2d');
    const value = parseFloat(document.getElementById('gaugeValue').value);
    const name = document.getElementById('gaugeName').value;
    const type = document.getElementById('gaugeType').value;
    const min = parseFloat(document.getElementById('minValue').value);
    const max = parseFloat(document.getElementById('maxValue').value);
    const units = document.getElementById('units').value;

    const percentage = Math.max(0, Math.min(1, (value - min) / (max - min)));

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 40;

    // Draw gauge based on type
    switch(type) {
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
            drawLinearGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
        case 'speedometer':
            drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units);
            break;
    }
}

