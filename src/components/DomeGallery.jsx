import { useEffect, useMemo, useRef, useCallback } from 'react';
import { useGesture } from '@use-gesture/react';
import './DomeGallery.css';

const DEFAULT_IMAGES = [
  {
    src: '/assets/world-san-francisco-1.jpg',
    alt: 'Watching the sunset above the clouds in San Francisco',
    caption: 'San Francisco, CA'
  },
  {
    src: '/assets/world-chicago-1.jpg?v=2',
    alt: 'Standing above the Chicago River at night',
    caption: 'Chicago, IL'
  },
  {
    src: '/assets/world-san-francisco-2.jpg?v=3',
    alt: 'Walking along the waterfront by the Golden Gate Bridge',
    caption: 'San Francisco, CA'
  },
  {
    src: '/assets/world-chicago-2.jpg?v=2',
    alt: 'Visiting Cloud Gate in Millennium Park',
    caption: 'Chicago, IL'
  },
  {
    src: '/assets/world-san-francisco-3.jpg?v=3',
    alt: 'Visiting Y Combinator in San Francisco',
    caption: 'San Francisco, CA'
  },
  {
    src: '/assets/world-denver-1.jpg?v=2',
    alt: 'Walking through a Colorado mountain town near Denver',
    caption: 'Denver, CO'
  },
  {
    src: '/assets/world-denver-2.jpg?v=2',
    alt: 'Snow-capped Rocky Mountains near Denver',
    caption: 'Denver, CO'
  },
  {
    src: '/assets/world-bethlehem-1.jpg?v=1',
    alt: 'Enjoying a snowy night in Bethlehem',
    caption: 'Bethlehem, PA'
  },
  {
    src: '/assets/world-bethlehem-2.jpg?v=1',
    alt: 'Celebrating with a friend in Bethlehem',
    caption: 'Bethlehem, PA'
  },
  {
    src: '/assets/world-bethlehem-3.jpg?v=1',
    alt: 'Celebrating outside a historic stone building in Bethlehem',
    caption: 'Bethlehem, PA'
  },
  {
    src: '/assets/world-new-york-2.jpg?v=2',
    alt: 'Exploring Times Square in New York City',
    caption: 'New York, NY'
  },
  {
    src: '/assets/world-new-york-un.jpg?v=1',
    alt: 'Attending an event at the United Nations Headquarters',
    caption: 'New York, NY'
  },
  {
    src: '/assets/world-toronto-1.jpg?v=1',
    alt: 'Toronto skyline and the CN Tower',
    caption: 'Toronto, Canada'
  },
  {
    src: '/assets/world-boston-1.jpg?v=1',
    alt: 'Visiting the waterfront in Boston',
    caption: 'Boston, MA'
  },
  {
    src: '/assets/world-shawnee-mountain.jpg?v=1',
    alt: 'Snowboarding at sunset at Shawnee Mountain',
    caption: 'East Stroudsburg, PA'
  },
  {
    src: '/assets/world-mumbai-1.jpg?v=1',
    alt: 'Viewing historic architecture in Mumbai',
    caption: 'Mumbai, India'
  },
  {
    src: '/assets/world-andaman-nicobar-1.jpg?v=1',
    alt: 'Scuba diving beside a coral reef in the Andaman and Nicobar Islands',
    caption: 'Andaman and Nicobar Islands, India'
  },
  {
    src: '/assets/world-bangalore-1.jpg?v=1',
    alt: 'Relaxing with friends while camping in Bangalore',
    caption: 'Bangalore, India'
  },
  {
    src: '/assets/world-kerala-1.jpg?v=2',
    alt: 'Spending time with children at a community event in Kochi, Kerala',
    caption: 'Kochi, Kerala'
  },
  {
    src: '/assets/world-uttarakhand-1.jpg?v=1',
    alt: 'Taking in a waterfall surrounded by greenery in Uttarakhand',
    caption: 'Uttarakhand, India'
  },
  {
    src: '/assets/world-dubai-1.jpg?v=1',
    alt: 'Riding an electric scooter through Dubai',
    caption: 'Dubai, UAE'
  },
  {
    src: '/assets/world-raleigh-1.jpg?v=1',
    alt: 'Attending a leadership conference with fellow students in Raleigh',
    caption: 'Raleigh, NC'
  },
  {
    src: '/assets/world-singapore-1.jpg?v=1',
    alt: 'Visiting the Merlion and Marina Bay in Singapore',
    caption: 'Singapore, Singapore'
  },
  {
    src: '/assets/world-thrissur-1.jpg?v=1',
    alt: 'Spending time with children at a community event in Thrissur',
    caption: 'Thrissur, India'
  },
  {
    src: '/assets/world-nanyuki-1.jpg?v=1',
    alt: 'Standing at the equator marker in Nanyuki',
    caption: 'Nanyuki, Kenya'
  },
  {
    src: '/assets/world-nairobi-1.jpg?v=1',
    alt: 'Overlooking the green highlands near Nairobi',
    caption: 'Nairobi, Kenya'
  },
  {
    src: '/assets/world-bali-1.jpg?v=1',
    alt: 'Preparing for an outdoor adventure surrounded by tropical greenery in Bali',
    caption: 'Bali, Indonesia'
  },
  {
    src: '/assets/world-bali-2.jpg?v=1',
    alt: 'Watching the sunrise over the mountains in Bali',
    caption: 'Bali, Indonesia'
  },
  {
    src: '/assets/world-diani-1.jpg?v=1',
    alt: 'Running along the beach in Diani',
    caption: 'Diani, Kenya'
  },
  {
    src: '/assets/world-kuala-lumpur-1.jpg?v=1',
    alt: 'Standing in front of the illuminated Petronas Towers at night',
    caption: 'Kuala Lumpur, Malaysia'
  },
  {
    src: '/assets/world-kuala-lumpur-2.jpg?v=1',
    alt: 'Looking toward a hillside pagoda in Kuala Lumpur',
    caption: 'Kuala Lumpur, Malaysia'
  },
  {
    src: '/assets/world-montreal-1.jpg?v=1',
    alt: 'Inside the richly decorated Notre-Dame Basilica of Montréal',
    caption: 'Montréal, Canada'
  }
];

const getThumbnailSrc = src => src.replace('/assets/world-', '/assets/world-thumbs/world-');

const DEFAULT_LOCATIONS = [
  'Bethlehem, PA',
  'New York, NY',
  'Chicago, IL',
  'San Francisco, CA',
  'Denver, CO',
  'Boston, MA',
  'Raleigh, NC',
  'East Stroudsburg, PA',
  'Montreal, Canada',
  'Toronto, Canada',
  'Dubai, UAE',
  'Kenya, Africa',
  'Tanzania, Africa',
  'Thailand, Asia',
  'Indonesia, Asia',
  'Singapore, Asia',
  'Malaysia, Asia',
  'Kerala, India',
  'Maharashtra, India',
  'Bangalore, India (Karnataka)',
  'New Delhi, India',
  'Jaipur, India',
  'Maldives',
  'Andaman and Nicobar Islands'
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35
};

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const normalizeAngle = d => ((d % 360) + 360) % 360;
const wrapAngleSigned = deg => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el, name, fallback) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};

const splitLocationCaption = caption => {
  const value = String(caption || '').trim();
  const separatorIndex = value.lastIndexOf(',');

  if (separatorIndex < 0) {
    return { place: value, country: '', length: value.length };
  }

  const place = value.slice(0, separatorIndex).trim();
  const country = value.slice(separatorIndex + 1).trim();
  return { place, country, length: value.length };
};

const US_STATE_CODES = new Set([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]);

const isUSLocation = location => US_STATE_CODES.has(location.country);

const getCaptionSizeClass = length => {
  if (length >= 25) return 'item__caption--compact';
  if (length >= 18) return 'item__caption--small';
  return '';
};

function buildItems(pool, seg, locations) {
  // Preserve the original React Bits dome geometry: a dense, evenly spaced
  // longitude grid with six staggered tiles per column. The visual curvature
  // depends on this fixed relationship between the tile offsets and segments.
  const xCols = Array.from({ length: seg }, (_, index) => -(seg - 1) + index * 2);
  const evenYs = [-5, -3, -1, 1, 3, 5];
  const oddYs = [-4, -2, 0, 2, 4, 6];
  const coords = xCols.flatMap((x, column) => {
    const ys = column % 2 === 0 ? evenYs : oddYs;
    return ys.map(y => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const normalizedImages = pool.map(image => {
    if (typeof image === 'string') {
      return { src: image, alt: '', caption: '' };
    }
    return {
      src: image.src || '',
      alt: image.alt || image.caption || image.place || '',
      caption: image.caption || image.place || image.alt || ''
    };
  }).filter(image => image.src);

  const uniqueImages = [...new Map(normalizedImages.map(image => [image.src, image])).values()];
  if (uniqueImages.length === 0) return { items: [], geometrySegments: seg };

  // A coprime stride spreads photos that were added together across the dome,
  // keeping photos from the same city from clustering in adjacent tiles.
  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  let stride = Math.max(2, Math.ceil(uniqueImages.length / 3));
  while (gcd(stride, uniqueImages.length) !== 1) stride += 1;
  const distributedImages = uniqueImages.map((_, index) => uniqueImages[(index * stride) % uniqueImages.length]);
  const firstOccurrence = new Set();

  return {
    geometrySegments: seg,
    items: coords.map((coord, index) => {
      // Repeat the complete shuffled sequence to fill the visual grid. A full
      // cycle separates identical sources by the entire unique collection,
      // avoiding obvious duplicates in neighbouring rows or columns.
      const image = distributedImages[index % distributedImages.length];
      const keyboardAccessible = !firstOccurrence.has(image.src);
      firstOccurrence.add(image.src);
      return {
        ...coord,
        src: image.src,
        alt: image.alt || locations[index % locations.length] || '',
        caption: image.caption || locations[index % locations.length] || '',
        keyboardAccessible
      };
    })
  };
}

function computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  locations = DEFAULT_LOCATIONS,
  fit = 0.5,
  fitBasis = 'auto',
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = '#120F17',
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  openedImageWidth = '250px',
  openedImageHeight = '350px',
  imageBorderRadius = '30px',
  openedImageBorderRadius = '30px',
  grayscale = true,
  imageFilter = '',
  autoSpin = true,
  autoSpinSpeed = 2.2,
  autoSpinDelay = 900
}) {
  const rootRef = useRef(null);
  const mainRef = useRef(null);
  const sphereRef = useRef(null);
  const frameRef = useRef(null);
  const viewerRef = useRef(null);
  const scrimRef = useRef(null);
  const focusedElRef = useRef(null);
  const originalTilePositionRef = useRef(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef(null);
  const draggingRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef(null);
  const autoSpinRAF = useRef(null);
  const autoSpinActiveRef = useRef(true);
  const lastInteractionAtRef = useRef(0);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const touchAxisRef = useRef(null);

  const scrollLockedRef = useRef(false);
  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add('dg-scroll-lock');
  }, []);
  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute('data-enlarging') === 'true') return;
    scrollLockedRef.current = false;
    document.body.classList.remove('dg-scroll-lock');
  }, []);

  const galleryLayout = useMemo(() => buildItems(images, segments, locations), [images, segments, locations]);
  const items = galleryLayout.items;
  const geometrySegments = galleryLayout.geometrySegments;
  const resolvedImageFilter = imageFilter || (grayscale ? 'grayscale(1)' : 'none');

  const applyTransform = (xDeg, yDeg) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  };

  const lockedRadiusRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver(entries => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width),
        h = Math.max(1, cr.height);
      const minDim = Math.min(w, h),
        maxDim = Math.max(w, h),
        aspect = w / h;
      let basis;
      switch (fitBasis) {
        case 'min':
          basis = minDim;
          break;
        case 'max':
          basis = maxDim;
          break;
        case 'width':
          basis = w;
          break;
        case 'height':
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty('--radius', `${lockedRadiusRef.current}px`);
      root.style.setProperty('--viewer-pad', `${viewerPad}px`);
      root.style.setProperty('--overlay-blur-color', overlayBlurColor);
      root.style.setProperty('--tile-radius', imageBorderRadius);
      root.style.setProperty('--enlarge-radius', openedImageBorderRadius);
      root.style.setProperty('--image-filter', resolvedImageFilter);
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector('.enlarge');
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();

        const hasCustomSize = openedImageWidth && openedImageHeight;
        if (hasCustomSize) {
          const tempDiv = document.createElement('div');
          tempDiv.style.cssText = `position: absolute; width: ${openedImageWidth}; height: ${openedImageHeight}; visibility: hidden;`;
          document.body.appendChild(tempDiv);
          const tempRect = tempDiv.getBoundingClientRect();
          document.body.removeChild(tempDiv);

          const centeredLeft = frameR.left - mainR.left + (frameR.width - tempRect.width) / 2;
          const centeredTop = frameR.top - mainR.top + (frameR.height - tempRect.height) / 2;

          enlargedOverlay.style.left = `${centeredLeft}px`;
          enlargedOverlay.style.top = `${centeredTop}px`;
        } else {
          enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
          enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
          enlargedOverlay.style.width = `${frameR.width}px`;
          enlargedOverlay.style.height = `${frameR.height}px`;
        }
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    resolvedImageFilter,
    imageBorderRadius,
    openedImageBorderRadius,
    openedImageWidth,
    openedImageHeight
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, []);

  useEffect(() => {
    if (!autoSpin || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => { autoSpinActiveRef.current = entry.isIntersecting && !document.hidden; },
      { rootMargin: '200px 0px' }
    );
    const onVisibilityChange = () => {
      const rect = root.getBoundingClientRect();
      autoSpinActiveRef.current = !document.hidden && rect.bottom >= -200 && rect.top <= window.innerHeight + 200;
    };
    observer.observe(root);
    document.addEventListener('visibilitychange', onVisibilityChange);

    let previousTime = performance.now();
    lastInteractionAtRef.current = previousTime;
    const step = now => {
      const deltaSeconds = Math.min((now - previousTime) / 1000, 0.05);
      previousTime = now;
      const isIdle = autoSpinActiveRef.current && now - lastInteractionAtRef.current >= autoSpinDelay;
      const canSpin =
        isIdle &&
        !draggingRef.current &&
        !inertiaRAF.current &&
        !focusedElRef.current &&
        !openingRef.current;

      if (canSpin) {
        const nextY = wrapAngleSigned(rotationRef.current.y + autoSpinSpeed * deltaSeconds);
        rotationRef.current = { ...rotationRef.current, y: nextY };
        applyTransform(rotationRef.current.x, nextY);
      }

      autoSpinRAF.current = requestAnimationFrame(step);
    };

    autoSpinRAF.current = requestAnimationFrame(step);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (autoSpinRAF.current) cancelAnimationFrame(autoSpinRAF.current);
      autoSpinRAF.current = null;
    };
  }, [autoSpin, autoSpinDelay, autoSpinSpeed]);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx, vy) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [dragDampening, maxVerticalRotationDeg, stopInertia]
  );

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        lastInteractionAtRef.current = performance.now();
        stopInertia();
        const evt = event;
        draggingRef.current = true;
        rootRef.current?.setAttribute('data-dragging', 'true');
        movedRef.current = false;
        touchAxisRef.current = null;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
      },
      onDrag: ({ event, last, velocity = [0, 0], direction = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;
        const evt = event;
        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;
        if (evt.pointerType === 'touch' && !touchAxisRef.current && Math.hypot(dxTotal, dyTotal) > 8) {
          touchAxisRef.current = Math.abs(dxTotal) > Math.abs(dyTotal) * 1.2 ? 'horizontal' : 'vertical';
        }
        if (evt.pointerType === 'touch' && touchAxisRef.current === 'vertical') {
          if (last) {
            draggingRef.current = false;
            rootRef.current?.removeAttribute('data-dragging');
            touchAxisRef.current = null;
          }
          return;
        }
        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }
        const nextX = clamp(
          startRotRef.current.x - dyTotal / dragSensitivity,
          -maxVerticalRotationDeg,
          maxVerticalRotationDeg
        );
        const nextY = wrapAngleSigned(startRotRef.current.y + dxTotal / dragSensitivity);
        if (rotationRef.current.x !== nextX || rotationRef.current.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }
        if (last) {
          draggingRef.current = false;
          rootRef.current?.removeAttribute('data-dragging');
          lastInteractionAtRef.current = performance.now();
          let [vMagX, vMagY] = velocity;
          const [dirX, dirY] = direction;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;
          if (Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement;
            vx = clamp((mx / dragSensitivity) * 0.02, -1.2, 1.2);
            vy = clamp((my / dragSensitivity) * 0.02, -1.2, 1.2);
          }
          if (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005) startInertia(vx, vy);
          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
          touchAxisRef.current = null;
        }
      }
    },
    { target: mainRef, eventOptions: { passive: true } }
  );

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;
    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement;
      const overlay = viewerRef.current?.querySelector('.enlarge');
      if (!overlay) return;
      const refDiv = parent.querySelector('.item__image--reference');
      const originalPos = originalTilePositionRef.current;
      if (!originalPos) {
        overlay.remove();
        if (refDiv) refDiv.remove();
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        el.style.visibility = '';
        el.style.zIndex = 0;
        focusedElRef.current = null;
        rootRef.current?.removeAttribute('data-enlarging');
        openingRef.current = false;
        unlockScroll();
        return;
      }
      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current.getBoundingClientRect();
      const originalPosRelativeToRoot = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height
      };
      const overlayRelativeToRoot = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height
      };
      const animatingOverlay = document.createElement('div');
      animatingOverlay.className = 'enlarge-closing';
      animatingOverlay.style.cssText = `position:absolute;left:${overlayRelativeToRoot.left}px;top:${overlayRelativeToRoot.top}px;width:${overlayRelativeToRoot.width}px;height:${overlayRelativeToRoot.height}px;z-index:9999;border-radius:var(--enlarge-radius,32px);overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,.35);transition:transform ${enlargeTransitionMs}ms ease-out,opacity ${enlargeTransitionMs}ms ease-out;pointer-events:none;margin:0;transform-origin:top left;will-change:transform,opacity;`;
      const originalImg = overlay.querySelector('img');
      if (originalImg) {
        const img = originalImg.cloneNode();
        img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
        animatingOverlay.appendChild(img);
      }
      overlay.remove();
      rootRef.current.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();
      requestAnimationFrame(() => {
        const x = originalPosRelativeToRoot.left - overlayRelativeToRoot.left;
        const y = originalPosRelativeToRoot.top - overlayRelativeToRoot.top;
        const scaleX = originalPosRelativeToRoot.width / overlayRelativeToRoot.width;
        const scaleY = originalPosRelativeToRoot.height / overlayRelativeToRoot.height;
        animatingOverlay.style.transform = `translate3d(${x}px,${y}px,0) scale(${scaleX},${scaleY})`;
        animatingOverlay.style.opacity = '0';
      });
      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;
        if (refDiv) refDiv.remove();
        parent.style.transition = 'none';
        el.style.transition = 'none';
        parent.style.setProperty('--rot-y-delta', '0deg');
        parent.style.setProperty('--rot-x-delta', '0deg');
        requestAnimationFrame(() => {
          el.style.visibility = '';
          el.style.opacity = '0';
          el.style.zIndex = 0;
          focusedElRef.current = null;
          rootRef.current?.removeAttribute('data-enlarging');
          requestAnimationFrame(() => {
            parent.style.transition = '';
            el.style.transition = 'opacity 300ms ease-out';
            requestAnimationFrame(() => {
              el.style.opacity = '1';
              setTimeout(() => {
                el.style.transition = '';
                el.style.opacity = '';
                openingRef.current = false;
                if (!draggingRef.current && rootRef.current?.getAttribute('data-enlarging') !== 'true')
                  document.body.classList.remove('dg-scroll-lock');
              }, 300);
            });
          });
        });
      };
      animatingOverlay.addEventListener('transitionend', cleanup, { once: true });
    };
    scrim.addEventListener('click', close);
    const onKey = e => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      scrim.removeEventListener('click', close);
      window.removeEventListener('keydown', onKey);
    };
  }, [enlargeTransitionMs, unlockScroll]);

  const openItemFromElement = useCallback(
    el => {
      if (openingRef.current) return;
      openingRef.current = true;
      lastInteractionAtRef.current = performance.now();
      openStartedAtRef.current = performance.now();
      lockScroll();
      const parent = el.parentElement;
      focusedElRef.current = el;
      el.setAttribute('data-focused', 'true');
      const offsetX = getDataNumber(parent, 'offsetX', 0);
      const offsetY = getDataNumber(parent, 'offsetY', 0);
      const sizeX = getDataNumber(parent, 'sizeX', 2);
      const sizeY = getDataNumber(parent, 'sizeY', 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, geometrySegments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);
      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;
      parent.style.setProperty('--rot-y-delta', `${rotY}deg`);
      parent.style.setProperty('--rot-x-delta', `${rotX}deg`);
      const refDiv = document.createElement('div');
      refDiv.className = 'item__image item__image--reference';
      refDiv.style.opacity = '0';
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);

      void refDiv.offsetHeight;

      const tileR = refDiv.getBoundingClientRect();
      const mainR = mainRef.current?.getBoundingClientRect();
      const frameR = frameRef.current?.getBoundingClientRect();

      if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        parent.removeChild(refDiv);
        unlockScroll();
        return;
      }

      originalTilePositionRef.current = { left: tileR.left, top: tileR.top, width: tileR.width, height: tileR.height };
      el.style.visibility = 'hidden';
      el.style.zIndex = 0;
      const overlay = document.createElement('div');
      overlay.className = 'enlarge';
      const requestedWidth = Number.parseFloat(openedImageWidth);
      const requestedHeight = Number.parseFloat(openedImageHeight);
      const targetWidth = Number.isFinite(requestedWidth) ? Math.min(requestedWidth, frameR.width) : frameR.width;
      const targetHeight = Number.isFinite(requestedHeight) ? Math.min(requestedHeight, frameR.height) : frameR.height;
      const targetLeft = frameR.left - mainR.left + (frameR.width - targetWidth) / 2;
      const targetTop = frameR.top - mainR.top + (frameR.height - targetHeight) / 2;
      overlay.style.position = 'absolute';
      overlay.style.left = targetLeft + 'px';
      overlay.style.top = targetTop + 'px';
      overlay.style.width = targetWidth + 'px';
      overlay.style.height = targetHeight + 'px';
      overlay.style.opacity = '0';
      overlay.style.zIndex = '30';
      overlay.style.willChange = 'transform, opacity';
      overlay.style.transformOrigin = 'top left';
      overlay.style.transition = `transform ${enlargeTransitionMs}ms ease, opacity ${enlargeTransitionMs}ms ease`;
      const rawSrc = parent.dataset.src || el.querySelector('img')?.src || '';
      const caption = parent.dataset.caption || el.querySelector('.item__caption')?.textContent || '';
      const img = document.createElement('img');
      img.src = rawSrc;
      overlay.appendChild(img);
      if (caption) {
        const location = splitLocationCaption(caption);
        const captionElement = document.createElement('div');
        captionElement.className = `enlarge__caption${isUSLocation(location) ? ' enlarge__caption--us' : ''}`;
        const placeElement = document.createElement('span');
        placeElement.className = 'enlarge__caption-place';
        placeElement.textContent = `${location.place}${location.country ? ',' : ''}`;
        captionElement.appendChild(placeElement);
        if (location.country) {
          const countryElement = document.createElement('span');
          countryElement.className = 'enlarge__caption-country';
          countryElement.textContent = location.country;
          captionElement.appendChild(countryElement);
        }
        overlay.appendChild(captionElement);
      }
      viewerRef.current.appendChild(overlay);
      const tx0 = tileR.left - (mainR.left + targetLeft);
      const ty0 = tileR.top - (mainR.top + targetTop);
      const sx0 = tileR.width / targetWidth;
      const sy0 = tileR.height / targetHeight;

      const validSx0 = isFinite(sx0) && sx0 > 0 ? sx0 : 1;
      const validSy0 = isFinite(sy0) && sy0 > 0 ? sy0 : 1;

      overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;

      setTimeout(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = '1';
        overlay.style.transform = 'translate(0px, 0px) scale(1, 1)';
        rootRef.current?.setAttribute('data-enlarging', 'true');
      }, 16);

    },
    [enlargeTransitionMs, geometrySegments, lockScroll, openedImageHeight, openedImageWidth, unlockScroll]
  );

  const onTileClick = useCallback(
    e => {
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget);
    },
    [openItemFromElement]
  );

  const onTilePointerUp = useCallback(
    e => {
      if (e.pointerType !== 'touch') return;
      if (draggingRef.current) return;
      if (movedRef.current) return;
      if (performance.now() - lastDragEndAt.current < 80) return;
      if (openingRef.current) return;
      openItemFromElement(e.currentTarget);
    },
    [openItemFromElement]
  );

  const onTileKeyDown = useCallback(
    e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      openItemFromElement(e.currentTarget);
    },
    [openItemFromElement]
  );

  useEffect(() => {
    return () => {
      document.body.classList.remove('dg-scroll-lock');
      rootRef.current?.removeAttribute('data-dragging');
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className="sphere-root"
      style={{
        ['--segments-x']: geometrySegments,
        ['--segments-y']: geometrySegments,
        ['--overlay-blur-color']: overlayBlurColor,
        ['--tile-radius']: imageBorderRadius,
        ['--enlarge-radius']: openedImageBorderRadius,
        ['--image-filter']: resolvedImageFilter
      }}
    >
      <main ref={mainRef} className="sphere-main">
        <div className="stage">
          <div ref={sphereRef} className="sphere">
            {items.map((it, i) => {
              const location = splitLocationCaption(it.caption);
              const captionSizeClass = getCaptionSizeClass(location.length);
              const usLocationClass = isUSLocation(location) ? ' item__caption--us' : '';

              return (
                <div
                key={`${it.x},${it.y},${i}`}
                className="item"
                data-src={it.src}
                data-caption={it.caption}
                data-offset-x={it.x}
                data-offset-y={it.y}
                data-size-x={it.sizeX}
                data-size-y={it.sizeY}
                style={{
                  ['--offset-x']: it.x,
                  ['--offset-y']: it.y,
                  ['--item-size-x']: it.sizeX,
                  ['--item-size-y']: it.sizeY
                }}
              >
                <div
                  className="item__image"
                  role={it.keyboardAccessible ? 'button' : undefined}
                  tabIndex={it.keyboardAccessible ? 0 : -1}
                  aria-label={it.keyboardAccessible ? (it.alt || 'Open image') : undefined}
                  aria-hidden={it.keyboardAccessible ? undefined : 'true'}
                  onClick={onTileClick}
                  onPointerUp={onTilePointerUp}
                  onKeyDown={onTileKeyDown}
                >
                  <img
                    src={getThumbnailSrc(it.src)}
                    draggable={false}
                    alt={it.alt}
                    loading="lazy"
                    decoding="async"
                  />
                  <span className={`item__caption ${captionSizeClass}${usLocationClass}`}>
                    <span className="item__caption-place">
                      {location.place}{location.country ? ',' : ''}
                    </span>
                    {location.country && <span className="item__caption-country">{location.country}</span>}
                  </span>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        <div className="overlay" />
        <div className="overlay overlay--blur" />
        <div className="edge-fade edge-fade--top" />
        <div className="edge-fade edge-fade--bottom" />

        <div className="viewer" ref={viewerRef}>
          <div ref={scrimRef} className="scrim" />
          <div ref={frameRef} className="frame" />
        </div>
      </main>
    </div>
  );
}
