# /diseno - CSS & Visual Design Specialist

## Description
Handles all CSS and visual design improvements, especially the 3D board.

## Instructions
When invoked:

1. Read ALL CSS in `index.html` (lines 10-131)
2. Analyze the 3D board CSS specifically:
   - `.board-3d-outer` - container with perspective
   - `.b3wrap` - grid with 3D transform
   - `.sq3` - individual squares
   - `::after` / `::before` - board edges and shadow
3. Check media queries for responsive 3D rules
4. Design CSS fixes for mobile that:
   - Reduce `rotateX` angle on small screens (less tilt = more visible)
   - Increase `perspective` distance (less distortion)
   - Remove `scale()` reduction on mobile (use full width)
   - Adjust pseudo-element sizes for small screens
   - Ensure minimum touch target size (44px+)
5. Test mentally at these breakpoints:
   - 375px (iPhone SE)
   - 390px (iPhone 14)
   - 414px (iPhone Plus)
   - 768px (iPad)
   - 1200px (Desktop)
6. Output exact CSS rules to add/modify
