// === TYPING EFFECT ===

// array of phrases to cycle through
const phrases = [
  "BS CS, Minor Applied Math",
  "Software Security Specialist",
  "Full-stack Developer"
];

// boolean indicating dark/light theme, and the starting stroke colors for the canvas
let isDarkMode = true;
let canvasStrokeColor = 'rgba(100, 255, 218, 0.35)'; 
let canvasCenterColor = 'rgba(100, 255, 218, 0.15)';

// state tracking for our type write effect
let currentPhrase = 0, currentChar = 0;
let isDeleting = false;

// the element the effect adjusts
const typedText = document.getElementById('typewriter');

/**
 * Function to create a typerwriter effect.
 * It cycles through the phrases array, typing each phrase character by character,
 * and deleting it character by character using a setTimeout recursion loop.
 */
const typeEffect = () => {
  const phrase = phrases[currentPhrase];

  // add or remove characters based on the isDeleting state
  if (isDeleting) {
    currentChar--;
    typedText.textContent = phrase.substring(0, currentChar);
  } else {
    currentChar++;
    typedText.textContent = phrase.substring(0, currentChar);
  }

  // wait before deleting full phrase
  if (!isDeleting && currentChar === phrase.length) {
    isDeleting = true;
    setTimeout(typeEffect, 1500);
  } 
  // move to next phrase
  else if (isDeleting && currentChar === 0) {
    isDeleting = false;
    currentPhrase = (currentPhrase + 1) % phrases.length;
    setTimeout(typeEffect, 100);
  } 
  // Continue either type or deleting. deleting is slightly faster than typing, by 25ms.
  else {
    setTimeout(typeEffect, isDeleting ? 75 : 100);
  }
}
typeEffect();

// === THEME TOGGLE ===

// button in our dropdown that toggles the theme
const toggleBtn = document.getElementById('toggleThemeBtn');

let animationRunning = true; // legacy variable to control animation state, keeping here as I may use it later to allow toggling of particle effects

// Toggle theme state and switch stroke colors for the canvas based on the current them state
toggleBtn.addEventListener('click', () => {
  isDarkMode = !isDarkMode;
  canvasStrokeColor = isDarkMode 
    ? 'rgba(100, 255, 218, 0.35)'
    : 'rgba(17, 80, 25, 0.35)';
  canvasCenterColor = isDarkMode 
    ? 'rgba(100, 255, 218, 0.15)'
    : 'rgba(42, 99, 65, 0.15)';
});

// === CUSTOM CURSOR ===

// our element that will create the custom cursor
const customCursor = document.getElementById('custom-cursor');

// state objects for the cursor's trail
const trail = [];
const trailLength = 20;


// mouse position, and a variable that tracks the last time the mouse was moved
let lastMouseMoveTime = 0;
let mouse = { x: null, y: null };

// update the mouse position and the custom cursor's position on mouse move
window.addEventListener('mousemove', (e) => {
  // update the custom cursor's position
  customCursor.style.left = `${e.clientX}px`;
  customCursor.style.top = `${e.clientY}px`;

  // update our mouse state value and the last mouse move time
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  lastMouseMoveTime = Date.now();
});

// Show or hide custom cursor over specific elements. Default cursor will display over whitelisted elements.
document.addEventListener("mouseover", (e) => {
  const tag = e.target.tagName.toLowerCase(); // convert to lowercase for consistency
  const isInteractiveTag = ["a", "button"].includes(tag); // interactive tags that should show the default cursor
  const isDropdownMenu = e.target.classList.contains("dropdown-menu"); // dropdown menu class that should show the default cursor
  customCursor.style.opacity = (isInteractiveTag || isDropdownMenu) ? "0" : "1"; // hide the custom cursor depending if either of the state conditions are met
});

/**
 * Draws the cursor trail on the canvas, using opacity values to create a fade effect.
 * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
 * @returns {void}
 */
const drawTrail = (ctx) => {
  if (customCursor.style.opacity === "0") return; // don't draw the trail if the custom cursor is hidden

  for (let i = 0; i < trail.length; i++) {
    const { x, y } = trail[i]; // get the x and y coordinates of the trail point
    const alpha = 1 - i / trailLength; // calculate the alpha value for the fade effect
    const radius = 6 + i * 0.5; // increase the radius for each point in the trail
    // draw with our calculated values
    ctx.beginPath(); 
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(100, 255, 218, ${alpha * 0.15})`;
    ctx.fill();
  }
};

/**
 * Updates the cursor trail based on the current mouse position.
 * @returns {void}
 */
const updateTrail = () => {

  if (mouse.x === null || mouse.y === null) return; // if mouse position is not set, do nothing

  if (trail.length === 0) trail.push({ x: mouse.x, y: mouse.y }); // if the trail is empty, add the current mouse position as the first point

  const leading = trail[0]; // get the leading point of the trail
  const dx = mouse.x - leading.x; // calculate the difference in x position
  const dy = mouse.y - leading.y; // calculate the difference in y position

  // add a new point to the trail, with and offset
  trail.unshift({
    x: leading.x + dx * 0.2,
    y: leading.y + dy * 0.2
  });

  // if the trail exceeds the maximum length, remove the last point
  if (trail.length > trailLength) trail.pop();
};

// === PARTICLE SYSTEM ===

// Get the canvas and context, set up device pixel ratio and cell size
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
const dpr = window.devicePixelRatio || 1;

/**
 * The original collision detection algorithm used a brute force approach, checking every shape against every other shape every single frame.
 * On top of other inefficiencies that I found and fixed, this caused significant performance issues even with small numbers of shapes.
 * The time complexity was n(n - 1) / 2 or O(n^2) which is quadratic in nature, so it scales poorly if I ever want to add even more shapes with smaller sizes.
 * 
 * To improve this, I implemented a Spatial Hash Grid(SHG) to partition the canvas into a grid of 100 pixel cells.
 * Each shape is assigned to a cell in the grid based on position, and only shapes in the same or neighboring cells are checked for collisions.
 * As such, the number of comparisons per frame is reduced signficantly, scaling especially well with larger numbers of shapes.
 * 
 * At the end of the day the worst case is still O(n^2), if every shape is in the same cell, but this is relatively impossible.
 * The average case is O(n + k) where n is the number of shapes and k is the average number of collisions per grid cell.
 * This is a significant improvement over a brute force approach, and alongside other optimizations I made (see below), improved the load times of the front page by well over 50-60%.
 */
const cellSize = 100;

// Set canvas dimensions and scale for high DPI displays
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
ctx.scale(dpr, dpr);

// Handles resizing the canvas and scaling the context to match DPR.
let resizeTimeout;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);
  }, 100);
});

/**
 * Generates a random number of shapes based on the canvas size.
 * Helps with both performance, and aesthetics as the code adapts to the size of the viewport as opposed to a static number of shapes.
 */
const shapeCount = Math.floor(window.innerWidth * window.innerHeight / 30000);
const shapes = [];


/**
 * Creates a shape with random properties.
 * @returns {Object} - An object representing the shape with properties like position, velocity, radius, and points.
 */
const createShape = () => {
  // Randomly select the number of vertices for the shape, between 4 or 5.
  const pointCount = Math.floor(Math.random() * 2) + 4;

  // Bounding size of the shape (diameter of the polygon)
  const boxSize = 80;

  // padding to keep shapes away from the edges of the canvas when they're generated.
  // this is to prevent shapes from both being cut off on first load, but also to prevent them from immediately getting bounced off of the edges.
  const padding = 150;

  // Randomly generate the x and y position of the shape within our bounding box.
  const x = Math.random() * (canvas.width / dpr - 2 * padding) + padding;
  const y = Math.random() * (canvas.height / dpr - 2 * padding) + padding;

  // Distance from the center of the canvas to the shape's position.
  const distFromCenter = Math.hypot(x - canvas.width / (2 * dpr), y - canvas.height / (2 * dpr));

  // Maximum possible distance from the center to any corner.
  const maxDist = Math.hypot(canvas.width / (2 * dpr), canvas.height / (2 * dpr));

  // We normalize the distance to a factor of 0-1, will allow us to create a jitter effect that scales with distance from the center.
  const chaosFactor = distFromCenter / maxDist;

  // Amount of random jitter per control point, scaled by our generated chaos factor.
  const jitterRange = 10 + chaosFactor * 30;

  // array of control points for the polygon.
  const points = [];

  // Generate the control point based on angle and radius values.
  for (let i = 0; i < pointCount; i++) {
    // Calculate the angle around the circle based on the point's index.
    const angle = (i / pointCount) * Math.PI * 2;

    // Fied radius to place points in a polygon shape.
    const radius = boxSize / 2;

    // Define the control point with base circular coordinates, with random offsets calculated based on the jitterRange.
    // Creates our randomized polygon shape
    points.push({
      baseX: Math.cos(angle) * radius, // x-coord
      baseY: Math.sin(angle) * radius, // y-cord
      offsetX: Math.random() * jitterRange - jitterRange / 2, // x-distortion
      offsetY: Math.random() * jitterRange - jitterRange / 2 // y-distortion
    });
  }

  // Assign initial velocity for both vertical(up starting) and horizontal(left) starting.
  const vx = (Math.random() - 0.75) * 0.5;
  const vy = (Math.random() - 0.75) * 0.5;

  // return the complete shape object
  return {
    x, y, vx, vy, // x, y, and vx, vy are the position and velocity of the shape.
    originalVx: vx, // store the original and current velocity to allow for friction effects when a shape's velocity is modified.
    originalVy: vy,
    radius: boxSize / 2, // effective radius used in collision detection
    points, // the shape's polygon vertices, that have been distorted by the jitterRange.
    centerOffset: { // random center for drawing internal lines to the outside vertices
      x: Math.random() * 20 - 10,
      y: Math.random() * 20 - 10,
      driftX: (Math.random() - 0.5) * (0.2 + chaosFactor * 0.5),
      driftY: (Math.random() - 0.5) * (0.2 + chaosFactor * 0.5)
    }
  };
};

/**
 * Function to generate a specified number of shapes and add them to the shapes array.
 * @return {void}
 */
const generateShapes = (shapeCount) => {
  shapes.push(...Array.from({ length: shapeCount }, createShape));
};

// computes a unique string key representing the grid cell for a given position {x, y}.
const getCellKey = (x, y) => {
  // determine the column x coords fall into
  const col = Math.floor(x / cellSize);
  // and y
  const row = Math.floor(y / cellSize);
  return `${col},${row}`; // return the key in a format of col,row
};

/**
 * Function to resolve collisions between shapes using a spatial hash grid.
 * @returns {void}
 */
const resolveCollisions = () => {
  const grid = new Map(); // Initialize spatial hash grid

  // Insert each shape into its corresponding cell
  shapes.forEach(shape => {
    const key = getCellKey(shape.x, shape.y); // Compute grid key for current shape
    if (!grid.has(key)) grid.set(key, []); // Initialize cell if not already present
    grid.get(key).push(shape); // Insert shape into grid cell
  });

  // Iterate over each populated grid cell
  grid.forEach((cellShapes, key) => {
    const [col, row] = key.split(',').map(Number); // Parse column and row from string key

    // Check all 9 surrounding cells (including self)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const neighborKey = `${col + dx},${row + dy}`; // Compute neighbor key
        const neighborShapes = grid.get(neighborKey); // Retrieve shapes in that cell
        if (!neighborShapes) continue; // Skip if no shapes in neighbor cell

        // Compare each shape in the current cell with each in the neighbor cell
        cellShapes.forEach(a => {
          neighborShapes.forEach(b => {
            if (a === b || a._checked === b) return; // Avoid self-checks and duplicate pairs

            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distSq = dx * dx + dy * dy; // Squared distance between shapes
            const minDist = a.radius + b.radius; // Minimum allowed distance before collision

            if (distSq < minDist * minDist) { // Collision detected
              const dist = Math.sqrt(distSq);
              const overlap = (minDist - dist) / 2; // Amount they overlap
              const angle = Math.atan2(dy, dx); // Angle between centers
              const offsetX = Math.cos(angle) * overlap; // X displacement for resolution
              const offsetY = Math.sin(angle) * overlap; // Y displacement for resolution

              // Separate the shapes to resolve the overlap
              a.x -= offsetX;
              a.y -= offsetY;
              b.x += offsetX;
              b.y += offsetY;

              const energyLoss = 0.9; // Factor to simulate imperfect elasticity

              // Use vector projections to compute an elastic collision response

              // Calculate the normal unit vector (the direction from a -> b)
              const nx = dx / dist;  
              const ny = dy / dist;

              // Calculate the tangent unit vector (perpendicular to the normal vector)
              // AKA the direction in which the shapes could slide past each other
              const tx = -ny; // the actual tangent vector (rotated 90 deg)
              const ty = nx;

              /* Project the velocities of both shapes onto the tangent axis
              /* These components don't change during the collision, as they're parallel
              /* and no force acts along the tangent direction in a perfectly central elastic collision.
              */
              const dpTanA = a.vx * tx + a.vy * ty; // Dot product, projecting a's velocity onto the tangent
              const dpTanB = b.vx * tx + b.vy * ty; // Dot product, projecting b's velocity onto the tangent

              // Project the velocities onto the normal axis or line of impact
              // These components do change, so let's swap them to simulate elastic collision.
              const dpNormA = a.vx * nx + a.vy * ny;
              const dpNormB = b.vx * nx + b.vy * ny;

              /**
               * Swap the normal components between the two shapes (equal mass, elastic)
               * The tangent components remain the same, the normal components are swapped
               * This simulates a perfectly elastic collision, where both shapes exchange their NV
               * and bounce off of each other.
               */
              a.vx = tx * dpTanA + nx * dpNormB;
              a.vy = ty * dpTanA + ny * dpNormB;
              b.vx = tx * dpTanB + nx * dpNormA;
              b.vy = ty * dpTanB + ny * dpNormA;

              // Apply energy loss by dampening velocity vectors.
              // This simulates energy loss during the collision. So during the inital collision,
              // the shapes will gain a large value of velocity that dampens over time.
              // A relatively simple way to simulate energy loss.
              a.vx *= energyLoss;
              a.vy *= energyLoss;
              b.vx *= energyLoss;
              b.vy *= energyLoss;
            }

            a._checked = b; // Mark this pair as checked to avoid double-handling
          });
        });
      }
    }
  });

  // Step 3: Clean up `_checked` flags
  shapes.forEach(shape => delete shape._checked);
};

/**
 * Function to resolve the bounds of the shape. It is meant to keep the shapes within the canvas boundaries.
 * If a shape goes out of bounds, it receives a velocity reversal. Velocity is brought back to the original velocity
 * via a friction coefficient, which is multiplied by the original velocity. Eventually after so many frames, the shape returns to the OV.
 * @returns {void}
 */
const resolveShapeBoundaries = () => {
  shapes.forEach(s => {
    if (s.x - s.radius < 0 || s.x + s.radius > canvas.width / dpr) s.vx *= -1;
    if (s.y - s.radius < 0 || s.y + s.radius > canvas.height / dpr) s.vy *= -1;
  });
};

/**
 * Draws a shape onto the canvas based on its internal properties and the current time.
 * @param {Shape} s 
 * @param {Date} time 
 * @returns {void}
 */
const drawShape = (s, time) => {
  ctx.save();
  ctx.translate(s.x, s.y);

  // Calculate dynamic points
  const dynamicPoints = s.points.map((pt, i) => ({
    x: pt.baseX + Math.sin(time + i) * pt.offsetX,
    y: pt.baseY + Math.cos(time + i) * pt.offsetY
  }));

  // Draw outer polygon
  ctx.beginPath();
  dynamicPoints.forEach((pt, i) => {
    i === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
  });
  ctx.closePath();
  ctx.strokeStyle = canvasStrokeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Update and clamp center offset
  s.centerOffset.x = Math.max(-15, Math.min(15, s.centerOffset.x + s.centerOffset.driftX));
  s.centerOffset.y = Math.max(-15, Math.min(15, s.centerOffset.y + s.centerOffset.driftY));

  // Draw lines from center to each vertex
  ctx.beginPath();
  dynamicPoints.forEach(pt => {
    ctx.moveTo(s.centerOffset.x, s.centerOffset.y);
    ctx.lineTo(pt.x, pt.y);
  });
  ctx.strokeStyle = canvasCenterColor;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.restore();
};

let frameCounter = 0;


/**
 * Main animation loop that updates the canvas and shapes.
 * @returns {void}
 */
const animate = () => {
  if (!animationRunning) return; // Stop the animation loop 

  // Clear the canvas for the animation frame
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);

  // Get the current time in seconds
  const time = Date.now() * 0.001;

  // Run collision resolution every 3 frames to save performance
  if (++frameCounter % 3 === 0) resolveCollisions();

  // Prevent shapes from moving out of bounds
  resolveShapeBoundaries();

  // Parameters for mouse interaction force
  const mouseRadius = 100;
  const forceStrength = 0.10;
  const forceMult = 1.5;

  // Update and render each shape
  shapes.forEach(s => {
    // If mouse position is available, apply a repelling force
    if (mouse.x !== null && mouse.y !== null) {
      const dx = s.x - mouse.x; // x distance from shape to mouse
      const dy = s.y - mouse.y; // y distance from shape to mouse
      const distSq = dx * dx + dy * dy; // squared distance for performance

      if (distSq < mouseRadius * mouseRadius) {
        // Shape is within the mouse radius
        const dist = Math.sqrt(distSq); // true distance
        const force = (forceMult - dist / mouseRadius) * forceStrength; // inverse falloff force

        // Apply force directionally away from mouse
        s.vx += (dx / dist) * force;
        s.vy += (dy / dist) * force;
      } else {
        // Slight velocity decay to slowly return to the original velocity point.
        s.vx *= 0.98;
        s.vy *= 0.98;
      }
    }

    // Update shape position by velocity
    s.x += s.vx;
    s.y += s.vy;

    // Draw the updated shape
    drawShape(s, time);
  });

  // Update and render the mouse trail effect
  updateTrail();
  drawTrail(ctx);

  // Continue the animation loop
  requestAnimationFrame(animate);
};

generateShapes(shapeCount);
requestAnimationFrame(animate);
