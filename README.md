# هبدوميتر - Habdometer

A professional, multilingual gauge visualization tool with Arabic branding and advanced features. Built with vanilla HTML, CSS, and JavaScript for maximum compatibility and performance.

## 🎯 Features

### Multiple Gauge Types
- **Angular Gauge**: Classic 270-degree arc gauge
- **Semi-Circle Gauge**: 180-degree half-circle display
- **Quarter Circle Gauge**: 90-degree compact gauge
- **Linear Gauge**: Horizontal bar-style gauge
- **Speedometer**: Automotive-style gauge with extended arc

### 🌐 Bilingual Interface
- **Arabic Primary**: هبدوميتر branding with RTL support
- **English Secondary**: Full bilingual labels and interface
- **Unicode Support**: Proper Arabic text rendering and fonts

### 🔗 Query String Support
Automatically configure the gauge via URL parameters:
```
?value=75&name=Temperature&units=°C&type=semicircle&min=0&max=100&bg=%23ffffff&fullscreen=true
```

**Supported Parameters:**
- `value`: Gauge value (0-100)
- `name`: Gauge name (URL encoded)
- `units`: Units of measurement
- `type`: Gauge type (angular, semicircle, quarter, linear, speedometer)
- `min`: Minimum value
- `max`: Maximum value
- `bg`: Background color (hex format with %23 for #)
- `size`: Gauge size in pixels
- `fullscreen`: Auto-enter fullscreen mode (true/false)

### 🖥️ Fullscreen Mode
- **Clean Display**: Hides all controls, shows only the gauge
- **Responsive Sizing**: Automatically scales to screen size
- **Exit Options**: Click exit button or press Escape key
- **Auto-Entry**: Can be triggered via query string parameter

### 🎨 Customization Options
- **Heat Level Colors**: Automatic gradient from green to red
- **Resizable Gauges**: Drag resize handles to adjust size
- **Background Themes**: 6 preset colors plus custom color picker
- **Quick Presets**: Temperature, Speed, Pressure, Battery configurations

### 📱 Responsive Design
- **Mobile Optimized**: Touch-friendly controls and responsive layout
- **Desktop Enhanced**: Full feature set with hover effects
- **Cross-Browser**: Compatible with all modern browsers

## 🚀 Quick Start

### 1. Upload Files
Upload all 4 files to your web server or Git repository:
- `index.html`
- `styles.css`
- `script.js`
- `README.md`

### 2. Basic Usage
```html
<!-- Simple gauge display -->
http://yoursite.com/

<!-- Pre-configured temperature gauge -->
http://yoursite.com/?value=25&name=Temperature&units=°C&type=angular
```

### 3. Fullscreen Dashboard
```html
<!-- Auto-fullscreen speedometer -->
http://yoursite.com/?value=120&name=Speed&units=km/h&type=speedometer&fullscreen=true

<!-- Battery indicator -->
http://yoursite.com/?value=85&name=Battery&units=%&type=linear&bg=%23000000&fullscreen=true
```

## 📋 Coolify Deployment

### Method 1: Git Repository (Recommended)
1. **Create Git Repository**: Upload all 4 files to GitHub/GitLab
2. **Coolify Setup**:
   - New Resource → Application
   - Source: Git Repository
   - Build Pack: **Static**
   - Publish Directory: `/`
   - Leave build commands empty
3. **Deploy**: Click Deploy and wait for completion

### Method 2: Direct Upload
1. **Coolify Dashboard**: Create New Application
2. **Type**: Static Site
3. **Upload**: All 4 files directly
4. **Deploy**: Automatic deployment

### Configuration Checklist
- ✅ Build Pack: Static
- ✅ Publish Directory: /
- ✅ Build Command: (empty)
- ✅ Install Command: (empty)

## 🎮 Usage Examples

### Temperature Monitor
```
?value=25&name=درجة الحرارة&units=°C&type=angular&bg=%23ffffff
```

### Speed Dashboard
```
?value=120&name=السرعة&units=km/h&type=speedometer&fullscreen=true
```

### Battery Level
```
?value=75&name=البطارية&units=%&type=linear&bg=%23000000
```

### Pressure Gauge
```
?value=35&name=الضغط&units=PSI&type=semicircle&min=0&max=50
```

## 🔧 Advanced Features

### Resizable Gauges
- Hover over gauge to see resize handles
- Drag corners to resize
- Size slider for precise control
- Range: 200px - 600px

### Heat Level Colors
Automatic color mapping based on percentage:
- **0-20%**: Deep green to green
- **20-40%**: Green to yellow-green
- **40-60%**: Yellow-green to yellow
- **60-80%**: Yellow to orange
- **80-100%**: Orange to bright red

### Quick Presets
- **Temperature**: Arabic name, °C units, Angular gauge
- **Speed**: Arabic name, km/h units, Speedometer
- **Pressure**: Arabic name, PSI units, Semi-circle
- **Battery**: Arabic name, % units, Linear gauge

## 🌐 Internationalization

### Arabic Support
- Primary language: Arabic (RTL)
- Font: Cairo for Arabic text
- Default gauge name: هبدوميتر
- Bilingual labels throughout interface

### English Support
- Secondary language: English (LTR)
- Font: Roboto for English text
- Full translation of all controls
- Professional typography

## 📱 Responsive Breakpoints

### Desktop (1024px+)
- Side-by-side layout
- Full feature set
- Hover effects
- Resize handles

### Tablet (768px - 1024px)
- Stacked layout
- Touch-optimized controls
- Simplified interface

### Mobile (< 768px)
- Single column
- Large touch targets
- Optimized gauge sizes
- Simplified color picker

## 🔍 Browser Support

### Fully Supported
- Chrome/Chromium 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Mobile Browsers
- iOS Safari 12+
- Chrome Mobile 60+
- Samsung Internet 8+
- Firefox Mobile 55+

## ⚡ Performance

### Optimizations
- Canvas-based rendering (60fps)
- Hardware acceleration
- Efficient animation loops
- Memory leak prevention
- HiDPI display support

### Loading Speed
- Zero external dependencies
- Optimized CSS/JS
- Compressed assets
- Fast initial render

## 🛠️ Customization

### Adding New Gauge Types
Extend the `Habdometer` class:

```javascript
drawCustomGauge() {
    // Your custom gauge implementation
    // Use this.centerX, this.centerY, this.radius
    // Call this.getHeatColor(percentage) for colors
}
```

### Custom Color Schemes
Modify the `getHeatColor()` function:

```javascript
getHeatColor(percentage) {
    // Your custom color mapping
    // Return RGB string: 'rgb(r, g, b)'
}
```

### New Quick Presets
Add to the `presets` object:

```javascript
const presets = {
    custom: {
        name: 'Custom Name',
        units: 'unit',
        min: 0,
        max: 100,
        value: 50,
        type: 'angular'
    }
};
```

## 📊 API Reference

### URL Parameters
| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `value` | Number | Current gauge value | `75` |
| `name` | String | Gauge display name | `Temperature` |
| `units` | String | Units of measurement | `°C` |
| `type` | String | Gauge type | `semicircle` |
| `min` | Number | Minimum value | `0` |
| `max` | Number | Maximum value | `100` |
| `bg` | String | Background color (hex) | `%23ffffff` |
| `size` | Number | Gauge size in pixels | `400` |
| `fullscreen` | Boolean | Auto-fullscreen mode | `true` |

### Gauge Types
- `angular` - 270° arc gauge (default)
- `semicircle` - 180° half-circle gauge
- `quarter` - 90° quarter-circle gauge
- `linear` - Horizontal bar gauge
- `speedometer` - Extended arc automotive gauge

### JavaScript API
```javascript
// Create new gauge
const gauge = new Habdometer('canvasId');

// Update values
gauge.setValue(75);
gauge.setRange(0, 100);
gauge.setGaugeName('Temperature');
gauge.setUnits('°C');
gauge.setGaugeType('angular');
gauge.setBackgroundColor('#ffffff');
gauge.setSize(400);
```

## 🐛 Troubleshooting

### Common Issues

**Gauge not displaying:**
- Check canvas element exists
- Verify JavaScript loaded
- Check browser console for errors

**Query string not working:**
- Ensure proper URL encoding
- Check parameter spelling
- Verify values are within valid ranges

**Fullscreen not working:**
- Check browser permissions
- Try F11 key or button click
- Verify no JavaScript errors

**Colors not updating:**
- Check hex color format (#rrggbb)
- Verify color picker support
- Try preset colors first

### Performance Issues

**Slow animation:**
- Reduce gauge size
- Check for other heavy scripts
- Verify hardware acceleration

**Memory leaks:**
- Refresh page periodically
- Check for multiple gauge instances
- Monitor browser memory usage

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

For issues, feature requests, or contributions:
1. Check this documentation first
2. Verify browser compatibility
3. Test with minimal configuration
4. Report with specific error messages

---

**هبدوميتر** - Professional gauge visualization for the modern web.

Made with ❤️ for the Arabic-speaking community and beyond.

