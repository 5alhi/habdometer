class Habdometer {
    constructor(canvasId, isFullscreen = false) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isFullscreen = isFullscreen;
        
        // Default values
        this.value = 50;
        this.minValue = 0;
        this.maxValue = 100;
        this.gaugeName = 'هبدوميتر';
        this.units = '%';
        this.backgroundColor = '#1a1a1a';
        this.gaugeType = 'angular';
        this.size = 400;
        
        // Animation properties
        this.animatedValue = 0;
        this.targetValue = 50;
        this.animationSpeed = 0.05;
        
        // Resize properties
        this.isResizing = false;
        this.resizeStartX = 0;
        this.resizeStartY = 0;
        this.resizeStartSize = 0;
        
        this.setupCanvas();
        this.animate();
    }
    
    setupCanvas() {
        // Set canvas size based on current size setting
        this.canvas.width = this.size;
        this.canvas.height = this.size;
        
        // Set up high DPI canvas
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = this.size * dpr;
        this.canvas.height = this.size * dpr;
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = this.size + 'px';
        this.canvas.style.height = this.size + 'px';
        
        // Calculate center and radius
        this.centerX = this.size / 2;
        this.centerY = this.size / 2;
        this.radius = Math.min(this.centerX, this.centerY) - 40;
    }
    
    getHeatColor(percentage) {
        // Enhanced heat map with more color variations
        if (percentage <= 20) {
            // Deep green to green
            const ratio = percentage / 20;
            const r = Math.round(ratio * 50);
            const g = Math.round(200 + ratio * 55);
            const b = Math.round(ratio * 50);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (percentage <= 40) {
            // Green to yellow-green
            const ratio = (percentage - 20) / 20;
            const r = Math.round(50 + ratio * 100);
            const g = 255;
            const b = Math.round(50 - ratio * 50);
            return `rgb(${r}, ${g}, ${b})`;
        } else if (percentage <= 60) {
            // Yellow-green to yellow
            const ratio = (percentage - 40) / 20;
            const r = Math.round(150 + ratio * 105);
            const g = 255;
            const b = 0;
            return `rgb(${r}, ${g}, ${b})`;
        } else if (percentage <= 80) {
            // Yellow to orange
            const ratio = (percentage - 60) / 20;
            const r = 255;
            const g = Math.round(255 - ratio * 100);
            const b = 0;
            return `rgb(${r}, ${g}, ${b})`;
        } else {
            // Orange to red
            const ratio = (percentage - 80) / 20;
            const r = 255;
            const g = Math.round(155 - ratio * 155);
            const b = 0;
            return `rgb(${r}, ${g}, ${b})`;
        }
    }
    
    drawBackground() {
        // Clear canvas with background color
        this.ctx.fillStyle = this.backgroundColor;
        this.ctx.fillRect(0, 0, this.size, this.size);
        
        // Draw outer ring with gradient
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, this.radius - 20,
            this.centerX, this.centerY, this.radius + 20
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
        
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius + 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Draw inner background
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius - 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();
    }
    
    drawAngularGauge() {
        const startAngle = Math.PI * 0.75; // Start at 135 degrees
        const endAngle = Math.PI * 2.25;   // End at 405 degrees (270 degree arc)
        const totalAngle = endAngle - startAngle;
        
        // Draw colored segments
        const segments = 100;
        for (let i = 0; i < segments; i++) {
            const segmentAngle = totalAngle / segments;
            const currentAngle = startAngle + (segmentAngle * i);
            const percentage = (i / segments) * 100;
            
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius, currentAngle, currentAngle + segmentAngle);
            this.ctx.lineWidth = 20;
            this.ctx.strokeStyle = this.getHeatColor(percentage);
            this.ctx.stroke();
        }
        
        this.drawTickMarks(startAngle, endAngle);
        this.drawNeedle(startAngle, endAngle);
    }
    
    drawSemicircleGauge() {
        const startAngle = Math.PI; // Start at 180 degrees
        const endAngle = 2 * Math.PI; // End at 360 degrees (180 degree arc)
        const totalAngle = endAngle - startAngle;
        
        // Draw colored segments
        const segments = 100;
        for (let i = 0; i < segments; i++) {
            const segmentAngle = totalAngle / segments;
            const currentAngle = startAngle + (segmentAngle * i);
            const percentage = (i / segments) * 100;
            
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius, currentAngle, currentAngle + segmentAngle);
            this.ctx.lineWidth = 25;
            this.ctx.strokeStyle = this.getHeatColor(percentage);
            this.ctx.stroke();
        }
        
        this.drawTickMarks(startAngle, endAngle);
        this.drawNeedle(startAngle, endAngle);
    }
    
    drawQuarterGauge() {
        const startAngle = Math.PI; // Start at 180 degrees
        const endAngle = Math.PI * 1.5; // End at 270 degrees (90 degree arc)
        const totalAngle = endAngle - startAngle;
        
        // Draw colored segments
        const segments = 50;
        for (let i = 0; i < segments; i++) {
            const segmentAngle = totalAngle / segments;
            const currentAngle = startAngle + (segmentAngle * i);
            const percentage = (i / segments) * 100;
            
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius, currentAngle, currentAngle + segmentAngle);
            this.ctx.lineWidth = 30;
            this.ctx.strokeStyle = this.getHeatColor(percentage);
            this.ctx.stroke();
        }
        
        this.drawTickMarks(startAngle, endAngle);
        this.drawNeedle(startAngle, endAngle);
    }
    
    drawLinearGauge() {
        const gaugeWidth = this.radius * 1.5;
        const gaugeHeight = 40;
        const startX = this.centerX - gaugeWidth / 2;
        const startY = this.centerY - gaugeHeight / 2;
        
        // Draw background
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(startX - 5, startY - 5, gaugeWidth + 10, gaugeHeight + 10);
        
        // Draw colored segments
        const segments = 100;
        for (let i = 0; i < segments; i++) {
            const segmentWidth = gaugeWidth / segments;
            const x = startX + (segmentWidth * i);
            const percentage = (i / segments) * 100;
            
            this.ctx.fillStyle = this.getHeatColor(percentage);
            this.ctx.fillRect(x, startY, segmentWidth, gaugeHeight);
        }
        
        // Draw value indicator
        const valuePercentage = (this.animatedValue - this.minValue) / (this.maxValue - this.minValue);
        const indicatorX = startX + (gaugeWidth * valuePercentage);
        
        this.ctx.beginPath();
        this.ctx.moveTo(indicatorX, startY - 10);
        this.ctx.lineTo(indicatorX - 10, startY - 25);
        this.ctx.lineTo(indicatorX + 10, startY - 25);
        this.ctx.closePath();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Draw tick marks
        for (let i = 0; i <= 10; i++) {
            const tickX = startX + (gaugeWidth * i / 10);
            const tickValue = this.minValue + ((this.maxValue - this.minValue) * i / 10);
            
            this.ctx.beginPath();
            this.ctx.moveTo(tickX, startY + gaugeHeight);
            this.ctx.lineTo(tickX, startY + gaugeHeight + 15);
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw tick labels
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(Math.round(tickValue), tickX, startY + gaugeHeight + 30);
        }
    }
    
    drawSpeedometer() {
        const startAngle = Math.PI * 0.6; // Start at 108 degrees
        const endAngle = Math.PI * 2.4;   // End at 432 degrees (324 degree arc)
        const totalAngle = endAngle - startAngle;
        
        // Draw outer ring
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius + 15, 0, 2 * Math.PI);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.fill();
        
        // Draw colored segments with speedometer style
        const segments = 120;
        for (let i = 0; i < segments; i++) {
            const segmentAngle = totalAngle / segments;
            const currentAngle = startAngle + (segmentAngle * i);
            const percentage = (i / segments) * 100;
            
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, this.radius, currentAngle, currentAngle + segmentAngle);
            this.ctx.lineWidth = 18;
            this.ctx.strokeStyle = this.getHeatColor(percentage);
            this.ctx.stroke();
        }
        
        // Draw speedometer-style tick marks
        for (let i = 0; i <= 12; i++) {
            const angle = startAngle + (totalAngle * i / 12);
            const value = this.minValue + ((this.maxValue - this.minValue) * i / 12);
            
            // Major tick marks
            const innerRadius = this.radius + 25;
            const outerRadius = this.radius + 45;
            
            const x1 = this.centerX + Math.cos(angle) * innerRadius;
            const y1 = this.centerY + Math.sin(angle) * innerRadius;
            const x2 = this.centerX + Math.cos(angle) * outerRadius;
            const y2 = this.centerY + Math.sin(angle) * outerRadius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineWidth = 4;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.stroke();
            
            // Draw tick labels
            const labelRadius = this.radius + 60;
            const labelX = this.centerX + Math.cos(angle) * labelRadius;
            const labelY = this.centerY + Math.sin(angle) * labelRadius;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(Math.round(value), labelX, labelY);
        }
        
        this.drawNeedle(startAngle, endAngle);
    }
    
    drawTickMarks(startAngle, endAngle) {
        const totalAngle = endAngle - startAngle;
        
        // Major tick marks
        const majorTicks = 11;
        for (let i = 0; i < majorTicks; i++) {
            const angle = startAngle + (totalAngle * i / (majorTicks - 1));
            const value = this.minValue + ((this.maxValue - this.minValue) * i / (majorTicks - 1));
            
            const innerRadius = this.radius + 25;
            const outerRadius = this.radius + 40;
            
            const x1 = this.centerX + Math.cos(angle) * innerRadius;
            const y1 = this.centerY + Math.sin(angle) * innerRadius;
            const x2 = this.centerX + Math.cos(angle) * outerRadius;
            const y2 = this.centerY + Math.sin(angle) * outerRadius;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.lineWidth = 3;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.stroke();
            
            // Draw tick labels
            const labelRadius = this.radius + 55;
            const labelX = this.centerX + Math.cos(angle) * labelRadius;
            const labelY = this.centerY + Math.sin(angle) * labelRadius;
            
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(Math.round(value), labelX, labelY);
        }
    }
    
    drawNeedle(startAngle, endAngle) {
        if (this.gaugeType === 'linear') return; // Linear gauge doesn't use needle
        
        const totalAngle = endAngle - startAngle;
        const percentage = (this.animatedValue - this.minValue) / (this.maxValue - this.minValue);
        const needleAngle = startAngle + (totalAngle * percentage);
        
        // Draw needle shadow
        this.ctx.save();
        this.ctx.translate(this.centerX + 2, this.centerY + 2);
        this.ctx.rotate(needleAngle);
        
        this.ctx.beginPath();
        this.ctx.moveTo(-15, 0);
        this.ctx.lineTo(this.radius - 30, -4);
        this.ctx.lineTo(this.radius - 30, 4);
        this.ctx.closePath();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fill();
        this.ctx.restore();
        
        // Draw needle
        this.ctx.save();
        this.ctx.translate(this.centerX, this.centerY);
        this.ctx.rotate(needleAngle);
        
        // Needle body
        this.ctx.beginPath();
        this.ctx.moveTo(-20, 0);
        this.ctx.lineTo(this.radius - 30, -5);
        this.ctx.lineTo(this.radius - 30, 5);
        this.ctx.closePath();
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Draw center hub
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 18, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Draw center dot
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 6, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#333333';
        this.ctx.fill();
    }
    
    drawLabels() {
        // Draw gauge name
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 24px Cairo, Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(this.gaugeName, this.centerX, this.centerY - 60);
        
        // Draw current value
        this.ctx.font = 'bold 36px Roboto, Arial';
        const displayValue = Math.round(this.animatedValue) + ' ' + this.units;
        this.ctx.fillText(displayValue, this.centerX, this.centerY + 40);
        
        // Draw min/max labels for non-linear gauges
        if (this.gaugeType !== 'linear') {
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.textAlign = 'left';
            this.ctx.fillText('MIN: ' + this.minValue, this.centerX - this.radius + 20, this.centerY + 80);
            this.ctx.textAlign = 'right';
            this.ctx.fillText('MAX: ' + this.maxValue, this.centerX + this.radius - 20, this.centerY + 80);
        }
    }
    
    animate() {
        // Smooth animation towards target value
        const diff = this.targetValue - this.animatedValue;
        if (Math.abs(diff) > 0.1) {
            this.animatedValue += diff * this.animationSpeed;
        } else {
            this.animatedValue = this.targetValue;
        }
        
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw gauge based on type
        switch (this.gaugeType) {
            case 'angular':
                this.drawAngularGauge();
                break;
            case 'semicircle':
                this.drawSemicircleGauge();
                break;
            case 'quarter':
                this.drawQuarterGauge();
                break;
            case 'linear':
                this.drawLinearGauge();
                break;
            case 'speedometer':
                this.drawSpeedometer();
                break;
            default:
                this.drawAngularGauge();
        }
        
        // Draw labels
        this.drawLabels();
    }
    
    // Setter methods
    setValue(value) {
        this.value = Math.max(this.minValue, Math.min(this.maxValue, value));
        this.targetValue = this.value;
    }
    
    setRange(min, max) {
        this.minValue = min;
        this.maxValue = max;
        this.setValue(this.value);
    }
    
    setGaugeName(name) {
        this.gaugeName = name;
    }
    
    setUnits(units) {
        this.units = units;
    }
    
    setBackgroundColor(color) {
        this.backgroundColor = color;
    }
    
    setGaugeType(type) {
        this.gaugeType = type;
    }
    
    setSize(size) {
        this.size = size;
        this.setupCanvas();
    }
}

// Global variables
let gauge;
let fullscreenGauge;
let isFullscreenMode = false;
let isResizing = false;

// Query string parser
function parseQueryString() {
    const params = new URLSearchParams(window.location.search);
    const config = {};
    
    // Parse all possible parameters
    if (params.has('value')) config.value = parseFloat(params.get('value'));
    if (params.has('min')) config.min = parseFloat(params.get('min'));
    if (params.has('max')) config.max = parseFloat(params.get('max'));
    if (params.has('name')) config.name = decodeURIComponent(params.get('name'));
    if (params.has('units')) config.units = decodeURIComponent(params.get('units'));
    if (params.has('type')) config.type = params.get('type');
    if (params.has('bg')) config.bg = params.get('bg');
    if (params.has('size')) config.size = parseInt(params.get('size'));
    if (params.has('fullscreen')) config.fullscreen = params.get('fullscreen') === 'true';
    
    return config;
}

// Apply configuration from query string
function applyQueryConfig(config) {
    if (config.value !== undefined) {
        document.getElementById('gaugeValue').value = config.value;
        document.getElementById('gaugeSlider').value = config.value;
    }
    if (config.min !== undefined) {
        document.getElementById('minValue').value = config.min;
    }
    if (config.max !== undefined) {
        document.getElementById('maxValue').value = config.max;
    }
    if (config.name !== undefined) {
        document.getElementById('gaugeName').value = config.name;
    }
    if (config.units !== undefined) {
        document.getElementById('units').value = config.units;
    }
    if (config.type !== undefined) {
        document.getElementById('gaugeType').value = config.type;
    }
    if (config.bg !== undefined) {
        document.getElementById('backgroundColor').value = config.bg;
        document.getElementById('backgroundColorText').value = config.bg;
    }
    if (config.size !== undefined) {
        document.getElementById('gaugeSize').value = config.size;
        document.getElementById('gaugeSizeDisplay').textContent = config.size + 'px';
    }
    if (config.fullscreen) {
        setTimeout(() => toggleFullscreen(), 500);
    }
}

// Quick preset configurations
const presets = {
    temperature: {
        name: 'درجة الحرارة',
        units: '°C',
        min: 0,
        max: 100,
        value: 25,
        type: 'angular'
    },
    speed: {
        name: 'السرعة',
        units: 'km/h',
        min: 0,
        max: 200,
        value: 60,
        type: 'speedometer'
    },
    pressure: {
        name: 'الضغط',
        units: 'PSI',
        min: 0,
        max: 50,
        value: 15,
        type: 'semicircle'
    },
    battery: {
        name: 'البطارية',
        units: '%',
        min: 0,
        max: 100,
        value: 75,
        type: 'linear'
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Parse query string first
    const queryConfig = parseQueryString();
    
    // Initialize gauges
    gauge = new Habdometer('gaugeCanvas');
    fullscreenGauge = new Habdometer('fullscreenCanvas', true);
    
    // Apply query configuration
    applyQueryConfig(queryConfig);
    
    // Set up event listeners
    setupEventListeners();
    
    // Initial update
    updateRangeAndGauge();
    updateGauge();
});

function setupEventListeners() {
    // Gauge type selector
    document.getElementById('gaugeType').addEventListener('change', updateGauge);
    
    // Value controls
    const gaugeValue = document.getElementById('gaugeValue');
    const gaugeSlider = document.getElementById('gaugeSlider');
    const gaugeName = document.getElementById('gaugeName');
    const minValue = document.getElementById('minValue');
    const maxValue = document.getElementById('maxValue');
    const units = document.getElementById('units');
    const gaugeSize = document.getElementById('gaugeSize');
    const backgroundColor = document.getElementById('backgroundColor');
    const backgroundColorText = document.getElementById('backgroundColorText');
    const fullscreenBtn = document.getElementById('fullscreenBtn');
    const exitFullscreenBtn = document.getElementById('exitFullscreenBtn');
    
    // Sync number input and slider
    gaugeValue.addEventListener('input', function() {
        gaugeSlider.value = this.value;
        updateGauge();
    });
    
    gaugeSlider.addEventListener('input', function() {
        gaugeValue.value = this.value;
        updateGauge();
    });
    
    // Other controls
    gaugeName.addEventListener('input', updateGauge);
    minValue.addEventListener('input', updateRangeAndGauge);
    maxValue.addEventListener('input', updateRangeAndGauge);
    units.addEventListener('input', updateGauge);
    
    // Gauge size control
    gaugeSize.addEventListener('input', function() {
        document.getElementById('gaugeSizeDisplay').textContent = this.value + 'px';
        updateGauge();
    });
    
    // Background color controls
    backgroundColor.addEventListener('input', function() {
        backgroundColorText.value = this.value;
        updateGauge();
    });
    
    backgroundColorText.addEventListener('input', function() {
        if (this.value.match(/^#[0-9A-F]{6}$/i)) {
            backgroundColor.value = this.value;
            updateGauge();
        }
    });
    
    // Preset color buttons
    document.querySelectorAll('.preset-color').forEach(button => {
        button.addEventListener('click', function() {
            const color = this.dataset.color;
            backgroundColor.value = color;
            backgroundColorText.value = color;
            updateGauge();
            
            // Update active state
            document.querySelectorAll('.preset-color').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Quick preset buttons
    document.querySelectorAll('.quick-btn').forEach(button => {
        button.addEventListener('click', function() {
            const presetName = this.dataset.preset;
            const preset = presets[presetName];
            
            if (preset) {
                document.getElementById('gaugeName').value = preset.name;
                document.getElementById('units').value = preset.units;
                document.getElementById('minValue').value = preset.min;
                document.getElementById('maxValue').value = preset.max;
                document.getElementById('gaugeValue').value = preset.value;
                document.getElementById('gaugeSlider').value = preset.value;
                document.getElementById('gaugeType').value = preset.type;
                
                updateRangeAndGauge();
                updateGauge();
                
                // Update active state
                document.querySelectorAll('.quick-btn').forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });
    
    // Fullscreen controls
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    exitFullscreenBtn.addEventListener('click', toggleFullscreen);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F11') {
            e.preventDefault();
            toggleFullscreen();
        }
        if (e.key === 'Escape' && isFullscreenMode) {
            toggleFullscreen();
        }
    });
    
    // Window resize
    window.addEventListener('resize', function() {
        setTimeout(() => {
            gauge.setupCanvas();
            if (fullscreenGauge) {
                fullscreenGauge.setupCanvas();
            }
        }, 100);
    });
    
    // Resize functionality
    setupResizeHandlers();
}

function setupResizeHandlers() {
    const resizeHandles = document.querySelectorAll('.resize-handle');
    
    resizeHandles.forEach(handle => {
        handle.addEventListener('mousedown', startResize);
    });
    
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', stopResize);
}

function startResize(e) {
    isResizing = true;
    const rect = gauge.canvas.getBoundingClientRect();
    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartSize = gauge.size;
    
    e.preventDefault();
}

function handleResize(e) {
    if (!isResizing) return;
    
    const deltaX = e.clientX - resizeStartX;
    const deltaY = e.clientY - resizeStartY;
    const delta = Math.max(deltaX, deltaY);
    
    const newSize = Math.max(200, Math.min(600, resizeStartSize + delta));
    
    document.getElementById('gaugeSize').value = newSize;
    document.getElementById('gaugeSizeDisplay').textContent = newSize + 'px';
    
    gauge.setSize(newSize);
}

function stopResize() {
    isResizing = false;
}

function updateRangeAndGauge() {
    const min = parseFloat(document.getElementById('minValue').value) || 0;
    const max = parseFloat(document.getElementById('maxValue').value) || 100;
    
    if (max > min) {
        const gaugeSlider = document.getElementById('gaugeSlider');
        const gaugeValue = document.getElementById('gaugeValue');
        
        gaugeSlider.min = min;
        gaugeSlider.max = max;
        gaugeValue.min = min;
        gaugeValue.max = max;
        
        const currentValue = parseFloat(gaugeValue.value);
        if (currentValue < min) {
            gaugeValue.value = min;
            gaugeSlider.value = min;
        } else if (currentValue > max) {
            gaugeValue.value = max;
            gaugeSlider.value = max;
        }
        
        updateGauge();
    }
}

function updateGauge() {
    if (!gauge) return;
    
    const value = parseFloat(document.getElementById('gaugeValue').value) || 0;
    const name = document.getElementById('gaugeName').value || 'هبدوميتر';
    const min = parseFloat(document.getElementById('minValue').value) || 0;
    const max = parseFloat(document.getElementById('maxValue').value) || 100;
    const unitsValue = document.getElementById('units').value || '';
    const bgColor = document.getElementById('backgroundColor').value || '#1a1a1a';
    const gaugeType = document.getElementById('gaugeType').value || 'angular';
    const size = parseInt(document.getElementById('gaugeSize').value) || 400;
    
    // Update main gauge
    gauge.setValue(value);
    gauge.setRange(min, max);
    gauge.setGaugeName(name);
    gauge.setUnits(unitsValue);
    gauge.setBackgroundColor(bgColor);
    gauge.setGaugeType(gaugeType);
    gauge.setSize(size);
    
    // Update fullscreen gauge
    if (fullscreenGauge) {
        fullscreenGauge.setValue(value);
        fullscreenGauge.setRange(min, max);
        fullscreenGauge.setGaugeName(name);
        fullscreenGauge.setUnits(unitsValue);
        fullscreenGauge.setBackgroundColor(bgColor);
        fullscreenGauge.setGaugeType(gaugeType);
    }
    
    // Update display values
    document.getElementById('currentValueDisplay').textContent = Math.round(value);
    document.getElementById('gaugeTitleDisplay').textContent = name;
    document.getElementById('fullscreenValueDisplay').textContent = Math.round(value);
    document.getElementById('fullscreenTitleDisplay').textContent = name;
    
    // Update body background
    updateBodyBackground(bgColor);
}

function updateBodyBackground(bgColor) {
    const brightness = getBrightness(bgColor);
    if (brightness > 128) {
        document.body.style.background = `linear-gradient(135deg, ${bgColor} 0%, ${darkenColor(bgColor, 20)} 100%)`;
    } else {
        document.body.style.background = `linear-gradient(135deg, ${lightenColor(bgColor, 20)} 0%, ${bgColor} 100%)`;
    }
}

function toggleFullscreen() {
    const overlay = document.getElementById('fullscreenOverlay');
    const container = document.getElementById('mainContainer');
    
    if (!isFullscreenMode) {
        // Enter fullscreen mode
        overlay.classList.add('active');
        container.classList.add('fullscreen-mode');
        isFullscreenMode = true;
        
        // Update fullscreen gauge size
        setTimeout(() => {
            const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.7);
            fullscreenGauge.setSize(maxSize);
        }, 100);
        
    } else {
        // Exit fullscreen mode
        overlay.classList.remove('active');
        container.classList.remove('fullscreen-mode');
        isFullscreenMode = false;
    }
}

// Utility functions for color manipulation
function getBrightness(hex) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    return (r * 299 + g * 587 + b * 114) / 1000;
}

function lightenColor(hex, percent) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    const newR = Math.min(255, Math.round(r + (255 - r) * percent / 100));
    const newG = Math.min(255, Math.round(g + (255 - g) * percent / 100));
    const newB = Math.min(255, Math.round(b + (255 - b) * percent / 100));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

function darkenColor(hex, percent) {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    
    const newR = Math.max(0, Math.round(r * (100 - percent) / 100));
    const newG = Math.max(0, Math.round(g * (100 - percent) / 100));
    const newB = Math.max(0, Math.round(b * (100 - percent) / 100));
    
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}

