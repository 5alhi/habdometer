// Missing helper functions for speedometer

function drawChromeRing(ctx, centerX, centerY, innerRadius, outerRadius) {
    // Create chrome ring gradient
    const chromeGradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    chromeGradient.addColorStop(0, '#f0f0f0');
    chromeGradient.addColorStop(0.3, '#e0e0e0');
    chromeGradient.addColorStop(0.6, '#c0c0c0');
    chromeGradient.addColorStop(0.8, '#a0a0a0');
    chromeGradient.addColorStop(1, '#808080');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
    ctx.fillStyle = chromeGradient;
    ctx.fill();
    
    // Add highlight
    const highlightGradient = ctx.createLinearGradient(centerX - outerRadius, centerY - outerRadius, centerX + outerRadius, centerY + outerRadius);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, 2 * Math.PI);
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI, true);
    ctx.fillStyle = highlightGradient;
    ctx.fill();
}

function drawCarGaugeFace(ctx, centerX, centerY, radius) {
    // Carbon fiber texture background
    const faceGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    faceGradient.addColorStop(0, '#2a2a2a');
    faceGradient.addColorStop(0.7, '#1a1a1a');
    faceGradient.addColorStop(1, '#0a0a0a');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = faceGradient;
    ctx.fill();
    
    // Add texture pattern
    ctx.save();
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * (radius * 0.3);
        const y1 = centerY + Math.sin(angle) * (radius * 0.3);
        const x2 = centerX + Math.cos(angle) * (radius * 0.9);
        const y2 = centerY + Math.sin(angle) * (radius * 0.9);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    ctx.restore();
}

function drawSpeedometerTickMarks(ctx, centerX, centerY, radius, startAngle, endAngle, min, max) {
    const totalAngle = endAngle - startAngle;
    const range = max - min;
    const majorTicks = 10;
    
    // Major ticks with numbers
    for (let i = 0; i <= majorTicks; i++) {
        const angle = startAngle + (totalAngle * i / majorTicks);
        const value = min + (range * i / majorTicks);
        
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(angle);
        
        // Major tick mark
        ctx.beginPath();
        ctx.moveTo(radius - 30, 0);
        ctx.lineTo(radius - 10, 0);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        
        // Tick glow
        ctx.beginPath();
        ctx.moveTo(radius - 30, 0);
        ctx.lineTo(radius - 10, 0);
        ctx.lineWidth = 5;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.stroke();
        
        ctx.restore();
        
        // Numbers
        const textX = centerX + Math.cos(angle) * (radius - 45);
        const textY = centerY + Math.sin(angle) * (radius - 45);
        
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold ${Math.max(10, radius * 0.08)}px Inter`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fillText(Math.round(value), textX, textY);
        ctx.restore();
    }
    
    // Minor ticks
    const minorTicks = majorTicks * 5;
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
            ctx.strokeStyle = '#cccccc';
            ctx.stroke();
            
            ctx.restore();
        }
    }
}

function drawSpeedometerNeedle(ctx, centerX, centerY, length, angle) {
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);
    
    // Needle shadow
    ctx.save();
    ctx.translate(3, 3);
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(length, -2);
    ctx.lineTo(length + 5, 0);
    ctx.lineTo(length, 2);
    ctx.lineTo(-20, 4);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.restore();
    
    // Main needle with enhanced gradient
    const needleGradient = ctx.createLinearGradient(0, -4, 0, 4);
    needleGradient.addColorStop(0, '#ff6666');
    needleGradient.addColorStop(0.2, '#ff3333');
    needleGradient.addColorStop(0.5, '#cc0000');
    needleGradient.addColorStop(0.8, '#990000');
    needleGradient.addColorStop(1, '#660000');
    
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(length, -2);
    ctx.lineTo(length + 5, 0);
    ctx.lineTo(length, 2);
    ctx.lineTo(-20, 4);
    ctx.closePath();
    ctx.fillStyle = needleGradient;
    ctx.fill();
    
    // Needle highlight
    const highlightGradient = ctx.createLinearGradient(0, -4, 0, 0);
    highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
    
    ctx.beginPath();
    ctx.moveTo(-20, -4);
    ctx.lineTo(length, -2);
    ctx.lineTo(length + 5, 0);
    ctx.lineTo(length, 0);
    ctx.lineTo(-20, 0);
    ctx.closePath();
    ctx.fillStyle = highlightGradient;
    ctx.fill();
    
    // White tip with glow
    ctx.beginPath();
    ctx.arc(length, 0, 3, 0, 2 * Math.PI);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // Tip glow
    ctx.beginPath();
    ctx.arc(length, 0, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.fill();
    
    ctx.restore();
}

function drawEnhancedCenterHub(ctx, centerX, centerY, radius) {
    // Multi-layered center hub
    const hubGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    hubGradient.addColorStop(0, '#f0f0f0');
    hubGradient.addColorStop(0.3, '#e0e0e0');
    hubGradient.addColorStop(0.6, '#d0d0d0');
    hubGradient.addColorStop(0.8, '#c0c0c0');
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
    const innerRadius = radius * 0.7;
    const innerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, innerRadius);
    innerGradient.addColorStop(0, '#333333');
    innerGradient.addColorStop(0.5, '#222222');
    innerGradient.addColorStop(1, '#111111');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerRadius, 0, 2 * Math.PI);
    ctx.fillStyle = innerGradient;
    ctx.fill();
    
    // Center logo
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(8, radius * 0.5)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 2;
    ctx.fillText('H', centerX, centerY);
}

function drawDigitalDisplay(ctx, centerX, centerY, value, units) {
    const displayWidth = 80;
    const displayHeight = 25;
    const x = centerX - displayWidth / 2;
    const y = centerY - displayHeight / 2;
    
    // Display background
    const bgGradient = ctx.createLinearGradient(x, y, x, y + displayHeight);
    bgGradient.addColorStop(0, '#001100');
    bgGradient.addColorStop(1, '#003300');
    
    ctx.fillStyle = bgGradient;
    ctx.fillRect(x, y, displayWidth, displayHeight);
    
    // Display border
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, displayWidth, displayHeight);
    
    // Digital text with glow
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = 5;
    ctx.fillText(`${Math.round(value)}${units}`, centerX, centerY);
}

function drawCarStyleText(ctx, centerX, centerY, value, units, name) {
    // Gauge name with chrome effect
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${Math.max(14, centerY * 0.05)}px Inter`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 3;
    ctx.fillText(name.toUpperCase(), centerX, centerY);
    ctx.restore();
}

