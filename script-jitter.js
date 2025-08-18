// Habdometer - Professional Gauge Visualizer
// Enhanced with bigger needle, center gauge name, Arabic fonts, and warning system

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
    
    // Warning timer variables
    let warningTimer = null;
    let warningIntervalTimer = null;
    let isWarningActive = false;
    
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
        warningOverlay.classList.remove('show');
        warningOverlay.classList.add('fade-out');
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

function drawAngularGauge(ctx, centerX, centerY, radius, percentage, value, name, units) {
    // Angular gauge spans 270 degrees (bottom arc)
    const startAngle = Math.PI * 0.75; // 135 degrees
    const endAngle = Math.PI * 2.25;   // 405 degrees (270 degree span)
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Draw outer decorative ring
    const outerGradient = ctx.createRadialGradient(centerX, centerY, radius + 15, centerX, centerY, radius + 25);
    outerGradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
    outerGradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.9)');
    outerGradient.addColorStop(1, 'rgba(100, 100, 100, 0.7)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 20, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = outerGradient;
    ctx.stroke();
    
    // Draw gauge face with texture
    const faceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    faceGradient.addColorStop(0, 'rgba(40, 40, 40, 0.9)');
    faceGradient.addColorStop(0.7, 'rgba(30, 30, 30, 0.95)');
    faceGradient.addColorStop(1, 'rgba(20, 20, 20, 1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = faceGradient;
    ctx.fill();
    
    // Draw background arc with inner shadow
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 12, startAngle, endAngle);
    ctx.lineWidth = 8;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.stroke();
    
    // Draw colored arc based on heat level with enhanced gradient
    const color = getHeatColor(percentage);
    const colorGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    colorGradient.addColorStop(0, lightenColor(color, 30));
    colorGradient.addColorStop(0.3, color);
    colorGradient.addColorStop(0.7, color);
    colorGradient.addColorStop(1, darkenColor(color, 20));
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 12, startAngle, currentAngle);
    ctx.lineWidth = 25;
    ctx.strokeStyle = colorGradient;
    ctx.stroke();
    
    // Draw highlight on colored arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 2, startAngle, currentAngle);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();
    
    // Draw detailed tick marks with numbers
    drawDetailedTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, 10);
    
    // Draw enhanced needle with bigger size
    drawEnhancedNeedle(ctx, centerX, centerY, radius - 35, currentAngle, radius);
    
    // Draw center hub with detailed design
    drawDetailedCenterHub(ctx, centerX, centerY, 25);
    
    // Draw gauge name in center
    drawCenterGaugeName(ctx, centerX, centerY, name, radius);
}

function drawSpeedometerGauge(ctx, centerX, centerY, radius, percentage, value, name, units) {
    // Speedometer spans 270 degrees
    const startAngle = Math.PI * 0.75; // 135 degrees
    const endAngle = Math.PI * 2.25;   // 405 degrees
    const totalAngle = endAngle - startAngle;
    const currentAngle = startAngle + (totalAngle * percentage);
    
    // Draw chrome outer rings
    drawChromeRings(ctx, centerX, centerY, radius);
    
    // Draw carbon fiber gauge face
    drawCarGaugeFace(ctx, centerX, centerY, radius);
    
    // Draw background arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, startAngle, endAngle);
    ctx.lineWidth = 12;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.stroke();
    
    // Draw colored arc with enhanced heat colors
    const color = getEnhancedHeatColor(percentage);
    const colorGradient = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
    colorGradient.addColorStop(0, lightenColor(color, 40));
    colorGradient.addColorStop(0.3, lightenColor(color, 20));
    colorGradient.addColorStop(0.7, color);
    colorGradient.addColorStop(1, darkenColor(color, 30));
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 15, startAngle, currentAngle);
    ctx.lineWidth = 30;
    ctx.strokeStyle = colorGradient;
    ctx.stroke();
    
    // Draw highlight on colored arc
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 5, startAngle, currentAngle);
    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.stroke();
    
    // Draw professional tick marks with numbers
    drawCarTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle);
    
    // Draw enhanced car-style needle (bigger)
    drawCarNeedle(ctx, centerX, centerY, radius - 25, currentAngle, radius);
    
    // Draw center hub with H logo
    drawCarCenterHub(ctx, centerX, centerY, 35);
    
    // Draw digital display
    drawDigitalDisplay(ctx, centerX, centerY + radius * 0.4, value, units);
    
    // Draw gauge name in center
    drawCenterGaugeName(ctx, centerX, centerY - 20, name, radius);
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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
    
    // Draw enhanced needle
    drawEnhancedNeedle(ctx, centerX, centerY, radius - 35, currentAngle, radius);
    
    // Draw center circle
    drawDetailedCenterHub(ctx, centerX, centerY, 20);
    
    // Draw gauge name in center
    drawCenterGaugeName(ctx, centerX, centerY, name, radius);
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
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
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
    
    // Draw enhanced needle
    drawEnhancedNeedle(ctx, centerX, centerY, radius - 35, currentAngle, radius);
    
    // Draw center circle
    drawDetailedCenterHub(ctx, centerX, centerY, 20);
    
    // Draw gauge name in center
    drawCenterGaugeName(ctx, centerX, centerY, name, radius);
}

function drawLinearGauge(ctx, centerX, centerY, radius, percentage, value, name, units) {
    const barWidth = radius * 1.5;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;
    
    // Draw background bar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    
    // Draw colored bar
    const color = getHeatColor(percentage);
    ctx.fillStyle = color;
    ctx.fillRect(barX, barY, barWidth * percentage, barHeight);
    
    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(barX, barY, barWidth, barHeight);
    
    // Draw gauge name in center
    drawCenterGaugeName(ctx, centerX, centerY, name, radius);
}

// Enhanced helper functions

function drawChromeRings(ctx, centerX, centerY, radius) {
    // Outer chrome ring
    const outerGradient = ctx.createRadialGradient(centerX, centerY, radius + 20, centerX, centerY, radius + 35);
    outerGradient.addColorStop(0, 'rgba(220, 220, 220, 0.9)');
    outerGradient.addColorStop(0.3, 'rgba(180, 180, 180, 1)');
    outerGradient.addColorStop(0.7, 'rgba(140, 140, 140, 1)');
    outerGradient.addColorStop(1, 'rgba(100, 100, 100, 0.8)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 30, 0, 2 * Math.PI);
    ctx.lineWidth = 15;
    ctx.strokeStyle = outerGradient;
    ctx.stroke();
    
    // Inner chrome ring
    const innerGradient = ctx.createRadialGradient(centerX, centerY, radius + 5, centerX, centerY, radius + 15);
    innerGradient.addColorStop(0, 'rgba(200, 200, 200, 0.8)');
    innerGradient.addColorStop(0.5, 'rgba(160, 160, 160, 0.9)');
    innerGradient.addColorStop(1, 'rgba(120, 120, 120, 0.7)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 10, 0, 2 * Math.PI);
    ctx.lineWidth = 10;
    ctx.strokeStyle = innerGradient;
    ctx.stroke();
}

function drawCarGaugeFace(ctx, centerX, centerY, radius) {
    // Carbon fiber texture background
    const faceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    faceGradient.addColorStop(0, 'rgba(45, 45, 45, 0.95)');
    faceGradient.addColorStop(0.3, 'rgba(35, 35, 35, 0.98)');
    faceGradient.addColorStop(0.7, 'rgba(25, 25, 25, 1)');
    faceGradient.addColorStop(1, 'rgba(15, 15, 15, 1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = faceGradient;
    ctx.fill();
    
    // Add carbon fiber pattern
    ctx.strokeStyle = 'rgba(60, 60, 60, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * (radius * 0.3);
        const y1 = centerY + Math.sin(angle) * (radius * 0.3);
        const x2 = centerX + Math.cos(angle) * (radius * 0.9);
        const y2 = centerY + Math.sin(angle) * (radius * 0.9);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

function drawCarTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle) {
    const totalAngle = endAngle - startAngle;
    const majorTicks = 12;
    const minorTicks = 60;
    
    // Draw minor tick marks
    for (let i = 0; i <= minorTicks; i++) {
        const angle = startAngle + (totalAngle * i / minorTicks);
        const innerRadius = radius - 25;
        const outerRadius = radius - 15;
        
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.6)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Draw major tick marks with numbers
    for (let i = 0; i <= majorTicks; i++) {
        const angle = startAngle + (totalAngle * i / majorTicks);
        const innerRadius = radius - 35;
        const outerRadius = radius - 10;
        const textRadius = radius - 50;
        
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        
        // Draw tick mark with glow
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Add glow effect
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 6;
        ctx.stroke();
        
        // Draw numbers
        const textX = centerX + Math.cos(angle) * textRadius;
        const textY = centerY + Math.sin(angle) * textRadius;
        const number = Math.round((i / majorTicks) * 120);
        
        ctx.save();
        ctx.translate(textX, textY);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = 'bold 14px Inter';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(number.toString(), 0, 0);
        ctx.restore();
    }
}

function drawCarNeedle(ctx, centerX, centerY, length, angle, gaugeRadius) {
    // Calculate needle size proportional to gauge
    const needleWidth = Math.max(8, gaugeRadius * 0.02);
    const needleLength = length;
    
    // Add jitter effect if over warning threshold
    let jitteredAngle = angle;
    const currentValue = parseFloat(document.getElementById('gaugeValue').value);
    const threshold = parseFloat(document.getElementById('warningThreshold').value);
    
    if (currentValue > threshold) {
        const overThreshold = currentValue - threshold;
        const maxValue = parseFloat(document.getElementById('maxValue').value);
        const jitterIntensity = Math.min(overThreshold / (maxValue - threshold), 1) * 0.1; // Max 0.1 radians
        const jitterOffset = (Math.random() - 0.5) * jitterIntensity;
        jitteredAngle = angle + jitterOffset;
    }
    
    const tipX = centerX + Math.cos(jitteredAngle) * needleLength;
    const tipY = centerY + Math.sin(jitteredAngle) * needleLength;
    
    // Draw needle shadow
    ctx.save();
    ctx.translate(2, 2);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = needleWidth + 2;
    ctx.stroke();
    ctx.restore();
    
    // Draw main needle with gradient
    const needleGradient = ctx.createLinearGradient(
        centerX, centerY,
        tipX, tipY
    );
    needleGradient.addColorStop(0, 'rgba(220, 50, 50, 1)');
    needleGradient.addColorStop(0.3, 'rgba(200, 30, 30, 1)');
    needleGradient.addColorStop(0.7, 'rgba(180, 20, 20, 1)');
    needleGradient.addColorStop(1, 'rgba(160, 10, 10, 1)');
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = needleGradient;
    ctx.lineWidth = needleWidth;
    ctx.stroke();
    
    // Draw needle highlight
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = needleWidth * 0.3;
    ctx.stroke();
    
    // Draw glowing tip
    ctx.beginPath();
    ctx.arc(tipX, tipY, needleWidth * 0.8, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fill();
    
    // Add red glow around tip
    ctx.beginPath();
    ctx.arc(tipX, tipY, needleWidth * 1.2, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(220, 50, 50, 0.3)';
    ctx.fill();
}

function drawCarCenterHub(ctx, centerX, centerY, radius) {
    // Draw outer hub ring
    const hubGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    hubGradient.addColorStop(0, 'rgba(180, 180, 180, 1)');
    hubGradient.addColorStop(0.3, 'rgba(140, 140, 140, 1)');
    hubGradient.addColorStop(0.7, 'rgba(100, 100, 100, 1)');
    hubGradient.addColorStop(1, 'rgba(60, 60, 60, 1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = hubGradient;
    ctx.fill();
    
    // Draw inner hub
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.7);
    innerGradient.addColorStop(0, 'rgba(200, 200, 200, 1)');
    innerGradient.addColorStop(1, 'rgba(120, 120, 120, 1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.7, 0, 2 * Math.PI);
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Draw H logo
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${radius * 0.8}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.fillText('H', centerX, centerY);
    
    // Draw hub border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawDigitalDisplay(ctx, centerX, centerY, value, units) {
    const displayWidth = 80;
    const displayHeight = 25;
    const displayX = centerX - displayWidth / 2;
    const displayY = centerY - displayHeight / 2;
    
    // Draw display background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(displayX, displayY, displayWidth, displayHeight);
    
    // Draw display border
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.8)';
    ctx.lineWidth = 2;
    ctx.strokeRect(displayX, displayY, displayWidth, displayHeight);
    
    // Draw digital text with green glow
    ctx.fillStyle = 'rgba(0, 255, 0, 0.9)';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 255, 0, 0.8)';
    ctx.shadowBlur = 5;
    ctx.fillText(`${Math.round(value)}%`, centerX, centerY);
}

function drawCenterGaugeName(ctx, centerX, centerY, name, radius) {
    // Determine if text is Arabic
    const isArabic = /[\u0600-\u06FF]/.test(name);
    
    // Calculate font size proportional to gauge size
    const baseFontSize = Math.max(12, radius * 0.08);
    const fontSize = Math.min(baseFontSize, 24);
    
    // Set font family based on text type
    const fontFamily = isArabic ? 
        "'Tajawal', 'Cairo', 'Amiri', sans-serif" : 
        "'Inter', sans-serif";
    
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Add text shadow for better visibility
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    // Draw the gauge name in center
    ctx.fillText(name, centerX, centerY + 10);
    ctx.restore();
}

function drawEnhancedNeedle(ctx, centerX, centerY, length, angle, gaugeRadius) {
    // Calculate needle size proportional to gauge
    const needleWidth = Math.max(6, gaugeRadius * 0.015);
    const needleLength = length;
    
    // Add jitter effect if over warning threshold
    let jitteredAngle = angle;
    const currentValue = parseFloat(document.getElementById('gaugeValue').value);
    const threshold = parseFloat(document.getElementById('warningThreshold').value);
    
    if (currentValue > threshold) {
        const overThreshold = currentValue - threshold;
        const maxValue = parseFloat(document.getElementById('maxValue').value);
        const jitterIntensity = Math.min(overThreshold / (maxValue - threshold), 1) * 0.1; // Max 0.1 radians
        const jitterOffset = (Math.random() - 0.5) * jitterIntensity;
        jitteredAngle = angle + jitterOffset;
    }
    
    const tipX = centerX + Math.cos(jitteredAngle) * needleLength;
    const tipY = centerY + Math.sin(jitteredAngle) * needleLength;
    
    // Draw needle shadow
    ctx.save();
    ctx.translate(1, 1);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.lineWidth = needleWidth + 1;
    ctx.stroke();
    ctx.restore();
    
    // Draw main needle
    const needleGradient = ctx.createLinearGradient(
        centerX, centerY,
        tipX, tipY
    );
    needleGradient.addColorStop(0, 'rgba(200, 40, 40, 1)');
    needleGradient.addColorStop(0.5, 'rgba(180, 30, 30, 1)');
    needleGradient.addColorStop(1, 'rgba(160, 20, 20, 1)');
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = needleGradient;
    ctx.lineWidth = needleWidth;
    ctx.stroke();
    
    // Draw needle highlight
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(tipX, tipY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = needleWidth * 0.3;
    ctx.stroke();
    
    // Draw tip
    ctx.beginPath();
    ctx.arc(tipX, tipY, needleWidth * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
}

function drawDetailedCenterHub(ctx, centerX, centerY, radius) {
    // Draw outer ring
    const outerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    outerGradient.addColorStop(0, 'rgba(160, 160, 160, 1)');
    outerGradient.addColorStop(0.7, 'rgba(120, 120, 120, 1)');
    outerGradient.addColorStop(1, 'rgba(80, 80, 80, 1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = outerGradient;
    ctx.fill();
    
    // Draw inner circle
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 0.6);
    innerGradient.addColorStop(0, 'rgba(180, 180, 180, 1)');
    innerGradient.addColorStop(1, 'rgba(100, 100, 100, 1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.6, 0, 2 * Math.PI);
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Draw border
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
}

function drawDetailedTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, majorTicks) {
    const totalAngle = endAngle - startAngle;
    const minorTicks = majorTicks * 5;
    
    // Draw minor tick marks
    for (let i = 0; i <= minorTicks; i++) {
        const angle = startAngle + (totalAngle * i / minorTicks);
        const innerRadius = radius - 20;
        const outerRadius = radius - 10;
        
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    
    // Draw major tick marks
    for (let i = 0; i <= majorTicks; i++) {
        const angle = startAngle + (totalAngle * i / majorTicks);
        const innerRadius = radius - 25;
        const outerRadius = radius - 5;
        
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function drawTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, ticks) {
    const totalAngle = endAngle - startAngle;
    
    for (let i = 0; i <= ticks; i++) {
        const angle = startAngle + (totalAngle * i / ticks);
        const innerRadius = radius - 20;
        const outerRadius = radius - 10;
        
        const x1 = centerX + Math.cos(angle) * innerRadius;
        const y1 = centerY + Math.sin(angle) * innerRadius;
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
}

function getHeatColor(percentage) {
    // Enhanced heat color gradient
    if (percentage <= 0.33) {
        // Green to yellow
        const r = Math.round(percentage * 3 * 255);
        return `rgb(${r}, 255, 0)`;
    } else if (percentage <= 0.66) {
        // Yellow to orange
        const g = Math.round(255 - ((percentage - 0.33) * 3 * 128));
        return `rgb(255, ${g}, 0)`;
    } else {
        // Orange to red
        const g = Math.round(127 - ((percentage - 0.66) * 3 * 127));
        return `rgb(255, ${g}, 0)`;
    }
}

function getEnhancedHeatColor(percentage) {
    // More vibrant heat colors for speedometer
    if (percentage <= 0.25) {
        // Bright green
        return `rgb(0, 255, 100)`;
    } else if (percentage <= 0.5) {
        // Green to yellow
        const r = Math.round((percentage - 0.25) * 4 * 255);
        return `rgb(${r}, 255, 0)`;
    } else if (percentage <= 0.75) {
        // Yellow to orange
        const g = Math.round(255 - ((percentage - 0.5) * 4 * 100));
        return `rgb(255, ${g}, 0)`;
    } else {
        // Orange to bright red
        const g = Math.round(155 - ((percentage - 0.75) * 4 * 155));
        return `rgb(255, ${g}, 0)`;
    }
}

function lightenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return `rgb(${Math.min(255, R)}, ${Math.min(255, G)}, ${Math.min(255, B)})`;
}

function darkenColor(color, percent) {
    const num = parseInt(color.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return `rgb(${Math.max(0, R)}, ${Math.max(0, G)}, ${Math.max(0, B)})`;
}

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
        fullscreenWarningOverlay.classList.remove('show');
        fullscreenWarningOverlay.classList.add('fade-out');
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

// Timed warning system
function showTimedWarning(warningElement, duration, interval) {
    // Show warning with fade in
    warningElement.classList.remove('fade-out');
    warningElement.classList.add('show');
    
    // Set timer to hide warning after duration
    warningTimer = setTimeout(() => {
        warningElement.classList.remove('show');
        warningElement.classList.add('fade-out');
        
        // Set interval timer to show warning again
        if (isWarningActive) {
            warningIntervalTimer = setTimeout(() => {
                if (isWarningActive) {
                    showTimedWarning(warningElement, duration, interval);
                }
            }, interval - duration);
        }
    }, duration);
}

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

