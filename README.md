# Habdometer - Professional Gauge Visualizer

A beautiful, responsive gauge visualization application with multiple gauge types, 3D Apple-style design, and advanced features.

## Features

### 🎯 Multiple Gauge Types
- **Angular Gauge**: Arc around the bottom (proper speedometer-style arc)
- **Semi-Circle Gauge**: Half-circle display
- **Quarter Circle Gauge**: Quarter arc display
- **Linear Gauge**: Horizontal bar gauge
- **Speedometer**: Professional car odometer with chrome rings and digital display

### 🎨 3D Apple-Style Design
- Glass morphism effects with backdrop blur
- Multi-layered shadows and depth
- Smooth hover animations and transitions
- Premium metallic finishes and gradients
- Interactive 3D transforms

### 🔧 Advanced Features
- **Heat Level Colors**: Smooth green-to-red gradient based on value
- **Query String Support**: Direct URL configuration
- **Fullscreen Mode**: Clean presentation with all controls hidden
- **Resizable Gauges**: Drag handles and size slider (200px - 800px)
- **URL Generation**: Create shareable links with current settings
- **Responsive Design**: Works on desktop, tablet, and mobile

### ⚙️ Configuration Options
- Gauge value with number input and slider
- Custom gauge names (supports any language including Arabic)
- Min/max value ranges
- Units (°C, %, RPM, etc.)
- Background colors with presets
- Quick settings presets (Temperature, Speed, Pressure, Battery)

## Usage

### Basic Usage
1. Open the application in your browser
2. Select gauge type from dropdown
3. Adjust value using input field or slider
4. Customize name, range, and units as needed
5. Use fullscreen mode for presentations

### Query String Parameters
Configure the gauge directly via URL parameters:

```
?value=75&name=Temperature&units=°C&type=semicircle&fullscreen=true
```

**Available Parameters:**
- `value` - Gauge value (number)
- `name` - Gauge name (URL encoded)
- `min` - Minimum value (number)
- `max` - Maximum value (number)
- `units` - Units text (URL encoded)
- `type` - Gauge type (angular, semicircle, quarter, linear, speedometer)
- `bg` - Background color (URL encoded hex)
- `size` - Gauge size in pixels (200-800)
- `fullscreen` - Auto-fullscreen mode (true/false)

### Examples

**Basic Gauge:**
```
https://yoursite.com/
```

**Temperature Monitor:**
```
https://yoursite.com/?value=25&name=Temperature&units=°C&type=semicircle
```

**Speed Dashboard:**
```
https://yoursite.com/?value=120&name=Speed&units=km/h&type=speedometer&fullscreen=true
```

**Battery Indicator:**
```
https://yoursite.com/?value=85&name=Battery&units=%&type=linear&bg=%23000000
```

## Deployment

### Static Site Deployment (Recommended)
This application is a pure HTML/CSS/JavaScript static site with no dependencies.

**Files to deploy:**
- `index.html` - Main application
- `styles.css` - Styling and 3D effects
- `script.js` - Gauge functionality
- `favicon.ico` - Browser icon
- `favicon-16x16.png` - Small PNG icon
- `favicon-32x32.png` - Standard PNG icon
- `apple-touch-icon.png` - iOS/Apple devices icon

### Coolify Deployment
1. Upload all files to your Git repository
2. In Coolify: New Resource → Application → Git Repository
3. Select your repository
4. Set Build Pack to "Static"
5. Set Publish Directory to "/"
6. Deploy

### Other Platforms
- **Netlify**: Drag and drop all files
- **Vercel**: Connect Git repository
- **GitHub Pages**: Upload to repository with Pages enabled
- **Any static hosting**: Upload all files to web root

## Browser Support
- ✅ Chrome/Chromium (all versions)
- ✅ Firefox (all versions)
- ✅ Safari (desktop & mobile)
- ✅ Edge (all versions)
- ✅ Mobile browsers (iOS Safari, Android Chrome)

## Technical Details

### Performance
- Pure vanilla JavaScript (no frameworks)
- Canvas-based rendering for smooth animations
- 60fps animations and transitions
- Optimized for mobile devices

### Responsive Design
- Mobile-first approach
- Touch-friendly controls
- Adaptive layouts for all screen sizes
- Fullscreen mode optimized for presentations

### Accessibility
- Keyboard navigation support
- High contrast color options
- Screen reader friendly
- Touch and mouse interaction support

## Customization

### Adding New Gauge Types
1. Add new option to `gaugeType` select in HTML
2. Create new draw function in `script.js`
3. Add case to `drawGauge()` switch statement

### Modifying Colors
Heat level colors are generated in `getHeatColor()` function:
- Green (0-50%): RGB transition from green to yellow
- Red (50-100%): RGB transition from yellow to red

### Styling Changes
All visual effects are in `styles.css`:
- 3D effects use CSS transforms and shadows
- Glass morphism uses backdrop-filter
- Animations use CSS transitions

## License
This project is open source and available under the MIT License.

## Support
For issues or questions, please check the documentation or create an issue in the repository.

---

**Version**: 2.0.0  
**Last Updated**: 2025  
**Compatibility**: All modern browsers

