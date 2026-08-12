/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import { useRef, useState, useEffect, useMemo, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  useGLTF,
  useScroll,
  Image,
  Scroll,
  Preload,
  ScrollControls,
  MeshTransmissionMaterial,
  Text
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({
  mode = 'lens',
  lensProps = {},
  barProps = {},
  cubeProps = {},
  captureTargetRef,
  trackingTargetRef,
  activeTargetRef,
  activeSelector,
  captureKey,
  enabled = true,
  onCaptureReady,
  onResolvedScreenSize
}) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;
  const [contentCanvas, setContentCanvas] = useState(null);
  const captureCacheRef = useRef(new Map());

  const {
    navItems = [
      { label: 'Home', link: '' },
      { label: 'About', link: '' },
      { label: 'Contact', link: '' }
    ],
    ...modeProps
  } = rawOverrides;

  useEffect(() => {
    const target = captureTargetRef?.current;
    if (!target) return undefined;

    let cancelled = false;
    let frame = 0;
    let captureTimer = 0;
    let lastStaleCheck = 0;
    let drawnRects = new Map();
    const trackedImages = [];
    let resizeObserver;

    const getCaptureSignature = () => `${String(captureKey ?? 'default')}:${target.offsetWidth}x${target.offsetHeight}`;

    const getCaptureImages = () => [...target.querySelectorAll('.project-masonry__media img')]
      .filter(image => !image.closest('[aria-hidden="true"]'));

    const isDrawable = image => image.complete && image.naturalWidth > 0;

    const setCaptured = (media, captured) => {
      const value = captured ? 'true' : 'false';
      if (media.dataset.glassCaptured !== value) media.dataset.glassCaptured = value;
    };

    const getRectSignature = (image, targetRect) => {
      const rect = image.getBoundingClientRect();
      return [
        Math.round(rect.left - targetRect.left),
        Math.round(rect.top - targetRect.top),
        Math.round(rect.width),
        Math.round(rect.height)
      ].join(',');
    };

    const getOpaqueColor = value => {
      if (!value) return null;
      const alpha = value.startsWith('rgba') ? Number.parseFloat(value.split(',')[3]) : 1;
      return Number.isFinite(alpha) && alpha === 0 ? null : value;
    };

    const parseObjectPosition = value => {
      const tokens = value.trim().split(/\s+/);
      const resolve = (token, axis) => {
        if (token === 'left' || token === 'top') return 0;
        if (token === 'right' || token === 'bottom') return 1;
        if (token === 'center') return 0.5;
        if (token?.endsWith('%')) return Math.min(1, Math.max(0, parseFloat(token) / 100));
        return axis === 'x' ? 0.5 : 0.5;
      };
      return {
        x: resolve(tokens[0] || 'center', 'x'),
        y: resolve(tokens[1] || tokens[0] || 'center', 'y')
      };
    };

    const clipToMedia = (context, media, x, y, width, height) => {
      const radius = Number.parseFloat(getComputedStyle(media).borderRadius) || 0;
      context.beginPath();
      if (radius > 0 && typeof context.roundRect === 'function') {
        context.roundRect(x, y, width, height, radius);
      } else {
        context.rect(x, y, width, height);
      }
      context.clip();
    };

    const drawImageContent = (context, image, x, y, width, height) => {
      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;
      if (!sourceWidth || !sourceHeight || width <= 0 || height <= 0) return;

      const style = getComputedStyle(image);
      const position = parseObjectPosition(style.objectPosition || '50% 50%');

      // `contain` letterboxes the artwork instead of cropping it. Drawing it as
      // `cover` would make the lens magnify a frame the page never shows.
      if (style.objectFit === 'contain') {
        const fit = Math.min(width / sourceWidth, height / sourceHeight);
        const drawWidth = sourceWidth * fit;
        const drawHeight = sourceHeight * fit;
        context.drawImage(
          image,
          x + (width - drawWidth) * position.x,
          y + (height - drawHeight) * position.y,
          drawWidth,
          drawHeight
        );
        return;
      }

      const sourceRatio = sourceWidth / sourceHeight;
      const destinationRatio = width / height;
      let cropWidth = sourceWidth;
      let cropHeight = sourceHeight;
      if (sourceRatio > destinationRatio) cropWidth = sourceHeight * destinationRatio;
      else cropHeight = sourceWidth / destinationRatio;

      const sourceX = (sourceWidth - cropWidth) * position.x;
      const sourceY = (sourceHeight - cropHeight) * position.y;
      context.drawImage(
        image,
        sourceX,
        sourceY,
        cropWidth,
        cropHeight,
        x,
        y,
        width,
        height
      );
    };

    const renderCapture = () => {
      frame = 0;
      if (cancelled || !target.isConnected || !target.offsetWidth || !target.offsetHeight) return;

      const scale = 0.75;
      const snapshot = document.createElement('canvas');
      snapshot.width = Math.max(1, Math.round(target.offsetWidth * scale));
      snapshot.height = Math.max(1, Math.round(target.offsetHeight * scale));
      const context = snapshot.getContext('2d', { alpha: false });
      const targetRect = target.getBoundingClientRect();
      context.scale(scale, scale);
      context.fillStyle = getOpaqueColor(getComputedStyle(target).backgroundColor) || '#0d0d0d';
      context.fillRect(0, 0, target.offsetWidth, target.offsetHeight);

      const rects = new Map();
      let everyImageDrawn = true;

      // Tiles in the hidden tab are not part of this snapshot.
      target.querySelectorAll('.project-masonry__media').forEach(media => setCaptured(media, false));

      getCaptureImages().forEach(image => {
        const media = image.closest('.project-masonry__media');
        const rect = image.getBoundingClientRect();
        const x = rect.left - targetRect.left;
        const y = rect.top - targetRect.top;
        const drawable = isDrawable(image);

        context.save();
        if (media) clipToMedia(context, media, x, y, rect.width, rect.height);
        const mediaBackground = media && getOpaqueColor(getComputedStyle(media).backgroundColor);
        if (mediaBackground) {
          context.fillStyle = mediaBackground;
          context.fillRect(x, y, rect.width, rect.height);
        }
        if (drawable) drawImageContent(context, image, x, y, rect.width, rect.height);
        context.restore();

        // A lens over a tile that is missing from the snapshot magnifies an
        // empty rectangle, which reads as a black hole. Flag readiness per tile
        // so the lens only activates over artwork that was actually captured.
        if (media) setCaptured(media, drawable);
        if (!drawable) everyImageDrawn = false;
        rects.set(image, getRectSignature(image, targetRect));
      });

      drawnRects = rects;
      const signature = getCaptureSignature();
      // Only a complete snapshot is worth replaying for this tab, otherwise a
      // half-loaded capture would be restored forever.
      if (everyImageDrawn) captureCacheRef.current.set(signature, { canvas: snapshot, rects });
      else captureCacheRef.current.delete(signature);

      setContentCanvas(snapshot);
      onCaptureReady?.(true);
    };

    const scheduleCapture = (delay = 0) => {
      window.clearTimeout(captureTimer);
      captureTimer = window.setTimeout(() => {
        if (cancelled) return;
        window.cancelAnimationFrame(frame);
        frame = window.requestAnimationFrame(renderCapture);
      }, delay);
    };

    // Lazy-loaded tiles decode long after the first capture, and the reveal
    // tween shifts every tile while it runs, so the snapshot has to be able to
    // notice it no longer matches the page.
    const isCaptureStale = () => {
      if (!target.isConnected) return false;
      const images = getCaptureImages();
      if (images.length !== drawnRects.size) return true;
      const targetRect = target.getBoundingClientRect();
      return images.some(image => {
        if (isDrawable(image) && image.closest('.project-masonry__media')?.dataset.glassCaptured !== 'true') {
          return true;
        }
        return drawnRects.get(image) !== getRectSignature(image, targetRect);
      });
    };

    const checkCaptureStale = () => {
      const now = performance.now();
      if (now - lastStaleCheck < 250) return;
      lastStaleCheck = now;
      trackImages();
      if (isCaptureStale()) scheduleCapture(80);
    };

    // Tiles rarely finish decoding alone, so coalesce a burst of loads into a
    // single redraw of the snapshot.
    const handleImageSettled = () => scheduleCapture(150);

    function trackImages() {
      getCaptureImages().forEach(image => {
        if (trackedImages.includes(image)) return;
        trackedImages.push(image);
        image.addEventListener('load', handleImageSettled);
        image.addEventListener('error', handleImageSettled);
      });
    }

    let observedWidth = target.offsetWidth;
    let observedHeight = target.offsetHeight;
    resizeObserver = new ResizeObserver(() => {
      const nextWidth = target.offsetWidth;
      const nextHeight = target.offsetHeight;
      if (nextWidth === observedWidth && nextHeight === observedHeight) return;
      observedWidth = nextWidth;
      observedHeight = nextHeight;
      captureCacheRef.current.clear();
      scheduleCapture(0);
    });
    resizeObserver.observe(target);

    const cachedCapture = captureCacheRef.current.get(getCaptureSignature());
    if (cachedCapture) {
      drawnRects = cachedCapture.rects;
      setContentCanvas(cachedCapture.canvas);
      onCaptureReady?.(true);
    } else {
      setContentCanvas(null);
      onCaptureReady?.(false);
    }

    trackImages();
    scheduleCapture(cachedCapture ? 250 : 0);

    window.addEventListener('pointermove', checkCaptureStale, { passive: true });
    window.addEventListener('scroll', checkCaptureStale, { passive: true });
    window.addEventListener('pageshow', checkCaptureStale);
    window.addEventListener('focus', checkCaptureStale);

    return () => {
      cancelled = true;
      window.clearTimeout(captureTimer);
      window.cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      trackedImages.forEach(image => {
        image.removeEventListener('load', handleImageSettled);
        image.removeEventListener('error', handleImageSettled);
      });
      window.removeEventListener('pointermove', checkCaptureStale);
      window.removeEventListener('scroll', checkCaptureStale);
      window.removeEventListener('pageshow', checkCaptureStale);
      window.removeEventListener('focus', checkCaptureStale);
    };
  }, [captureTargetRef, captureKey, onCaptureReady]);

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems} />}
        <Wrapper
          modeProps={modeProps}
          trackingTargetRef={trackingTargetRef}
          activeTargetRef={activeTargetRef}
          activeSelector={activeSelector}
          pointerRefreshKey={captureKey}
          enabled={enabled && Boolean(contentCanvas)}
          onResolvedScreenSize={onResolvedScreenSize}
        >
          {contentCanvas && <DomSnapshot canvas={contentCanvas} />}
          <Preload />
        </Wrapper>
      </ScrollControls>
    </Canvas>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  glb,
  geometryKey,
  lockToBottom = false,
  followPointer = true,
  modeProps = {},
  trackingTargetRef,
  activeTargetRef,
  activeSelector,
  pointerRefreshKey,
  enabled = true,
  onResolvedScreenSize,
  ...props
}) {
  const ref = useRef();
  const { nodes } = useGLTF(glb);
  const buffer = useFBO();
  const [scene] = useState(() => new THREE.Scene());
  const geoWidthRef = useRef(1);
  const externalPointerRef = useRef({ x: 0, y: 0, active: !activeTargetRef });
  const wasActiveRef = useRef(!activeTargetRef);
  const lastClientPointerRef = useRef(null);
  const lastReportedScreenSizeRef = useRef(0);

  useEffect(() => {
    if (!trackingTargetRef?.current) return undefined;

    let refreshFrame = 0;
    let resizeObserver;

    const deactivatePointer = () => {
      externalPointerRef.current.active = false;
    };

    const updatePointerFromClient = (clientX, clientY) => {
      const target = trackingTargetRef.current;
      if (!target?.isConnected || document.visibilityState === 'hidden') {
        deactivatePointer();
        return;
      }
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) {
        deactivatePointer();
        return;
      }

      const activeTarget = activeTargetRef?.current;
      const activeRect = activeTarget?.getBoundingClientRect();
      const pointerElement = activeSelector ? document.elementFromPoint(clientX, clientY) : null;
      const selectorMatch = !activeSelector || Boolean(pointerElement?.closest(activeSelector));

      externalPointerRef.current.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      externalPointerRef.current.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
      externalPointerRef.current.active = selectorMatch && (!activeRect || (
        clientX >= activeRect.left &&
        clientX <= activeRect.right &&
        clientY >= activeRect.top &&
        clientY <= activeRect.bottom
      ));
    };

    const updatePointer = event => {
      const coalescedEvents = event.getCoalescedEvents?.();
      const latestEvent = coalescedEvents?.length
        ? coalescedEvents[coalescedEvents.length - 1]
        : event;
      lastClientPointerRef.current = { x: latestEvent.clientX, y: latestEvent.clientY };
      updatePointerFromClient(latestEvent.clientX, latestEvent.clientY);
    };

    const refreshPointer = () => {
      refreshFrame = 0;
      const lastPointer = lastClientPointerRef.current;
      if (lastPointer) {
        updatePointerFromClient(lastPointer.x, lastPointer.y);
      } else {
        deactivatePointer();
      }
    };

    const schedulePointerRefresh = () => {
      if (!refreshFrame) refreshFrame = window.requestAnimationFrame(refreshPointer);
    };

    const handlePointerOut = event => {
      if (!event.relatedTarget) deactivatePointer();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') deactivatePointer();
      else schedulePointerRefresh();
    };

    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('pointercancel', deactivatePointer, { passive: true });
    window.addEventListener('pointerout', handlePointerOut);
    window.addEventListener('scroll', schedulePointerRefresh, { passive: true });
    window.addEventListener('resize', schedulePointerRefresh, { passive: true });
    window.addEventListener('blur', deactivatePointer);
    window.addEventListener('focus', schedulePointerRefresh);
    window.addEventListener('pageshow', schedulePointerRefresh);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    resizeObserver = new ResizeObserver(schedulePointerRefresh);
    resizeObserver.observe(trackingTargetRef.current);
    schedulePointerRefresh();

    return () => {
      window.cancelAnimationFrame(refreshFrame);
      resizeObserver?.disconnect();
      deactivatePointer();
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('pointercancel', deactivatePointer);
      window.removeEventListener('pointerout', handlePointerOut);
      window.removeEventListener('scroll', schedulePointerRefresh);
      window.removeEventListener('resize', schedulePointerRefresh);
      window.removeEventListener('blur', deactivatePointer);
      window.removeEventListener('focus', schedulePointerRefresh);
      window.removeEventListener('pageshow', schedulePointerRefresh);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [trackingTargetRef, activeTargetRef, activeSelector, pointerRefreshKey]);

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
  }, [nodes, geometryKey]);

  const {
    scale,
    screenSize,
    ior,
    thickness,
    anisotropy,
    chromaticAberration,
    ...extraMat
  } = modeProps;

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera, size } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const activePointer = trackingTargetRef?.current ? externalPointerRef.current : pointer;
    const destX = followPointer ? (activePointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (activePointer.y * v.height) / 2 : 0;
    let resolvedScale = scale;
    if (screenSize != null && size.height > 0) {
      // A raw Three.js scale changes its apparent size whenever the canvas
      // height changes. Convert the requested CSS-pixel diameter to world
      // units so short and tall project panels render the same lens size.
      const worldDiameter = (screenSize / size.height) * v.height;
      resolvedScale = worldDiameter / geoWidthRef.current;
    } else if (resolvedScale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      resolvedScale = Math.min(0.15, desired);
    }

    if (onResolvedScreenSize && screenSize == null && resolvedScale != null && v.height > 0) {
      const resolvedScreenSize = (geoWidthRef.current * resolvedScale / v.height) * size.height;
      if (Math.abs(resolvedScreenSize - lastReportedScreenSizeRef.current) > 0.5) {
        lastReportedScreenSizeRef.current = resolvedScreenSize;
        onResolvedScreenSize(resolvedScreenSize);
      }
    }

    const isActive = enabled && (!activeTargetRef?.current || externalPointerRef.current.active);
    const justActivated = isActive && !wasActiveRef.current;

    // The lens must begin exactly where the normal cursor currently sits.
    // Snapping only the invisible mesh position before its scale animation
    // prevents it from visibly travelling in from the canvas origin.
    if (justActivated) {
      ref.current.position.set(destX, destY, 15);
      const seedScale = resolvedScale * 0.3;
      ref.current.scale.set(seedScale, seedScale, seedScale);
    } else {
      easing.damp3(ref.current.position, [destX, destY, 15], 0.06, delta);
    }

    const targetScale = isActive ? resolvedScale : 0;
    easing.damp3(ref.current.scale, [targetScale, targetScale, targetScale], 0.12, delta);
    wasActiveRef.current = isActive;

    gl.setClearColor(0x000000, 0);
    gl.setRenderTarget(buffer);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.setClearColor(0x000000, 0);
  });

  return (
    <>
      {createPortal(children, scene)}
      <mesh
        ref={ref}
        scale={activeTargetRef ? 0 : scale ?? 0.15}
        rotation-x={Math.PI / 2}
        geometry={nodes[geometryKey]?.geometry}
        {...props}
      >
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.15}
          thickness={thickness ?? 5}
          anisotropy={anisotropy ?? 0.01}
          chromaticAberration={chromaticAberration ?? 0.1}
          {...extraMat}
        />
      </mesh>
    </>
  );
});

function DomSnapshot({ canvas }) {
  const { viewport } = useThree();
  const texture = useMemo(() => {
    const nextTexture = new THREE.CanvasTexture(canvas);
    nextTexture.colorSpace = THREE.SRGBColorSpace;
    nextTexture.minFilter = THREE.LinearFilter;
    nextTexture.magFilter = THREE.LinearFilter;
    nextTexture.generateMipmaps = false;
    nextTexture.needsUpdate = true;
    return nextTexture;
  }, [canvas]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

function Lens({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/lens.glb" geometryKey="Cylinder" followPointer modeProps={modeProps} {...p} />;
}

function Cube({ modeProps, ...p }) {
  return <ModeWrapper glb="/assets/3d/cube.glb" geometryKey="Cube" followPointer modeProps={modeProps} {...p} />;
}

function Bar({ modeProps = {}, ...p }) {
  const defaultMat = {
    transmission: 1,
    roughness: 0,
    thickness: 10,
    ior: 1.15,
    color: '#ffffff',
    attenuationColor: '#ffffff',
    attenuationDistance: 0.25
  };

  return (
    <ModeWrapper
      glb="/assets/3d/bar.glb"
      geometryKey="Cube"
      lockToBottom
      followPointer={false}
      modeProps={{ ...defaultMat, ...modeProps }}
      {...p}
    />
  );
}

function NavItems({ items }) {
  const group = useRef();
  const { viewport, camera } = useThree();

  const DEVICE = {
    mobile: { max: 639, spacing: 0.2, fontSize: 0.035 },
    tablet: { max: 1023, spacing: 0.24, fontSize: 0.035 },
    desktop: { max: Infinity, spacing: 0.3, fontSize: 0.035 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= DEVICE.mobile.max ? 'mobile' : w <= DEVICE.tablet.max ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { spacing, fontSize } = DEVICE[device];

  useFrame(() => {
    if (!group.current) return;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);
    group.current.position.set(0, -v.height / 2 + 0.2, 15.1);

    group.current.children.forEach((child, i) => {
      child.position.x = (i - (items.length - 1) / 2) * spacing;
    });
  });

  const handleNavigate = link => {
    if (!link) return;
    link.startsWith('#') ? (window.location.hash = link) : (window.location.href = link);
  };

  return (
    <group ref={group} renderOrder={10}>
      {items.map(({ label, link }) => (
        <Text
          key={label}
          fontSize={fontSize}
          color="white"
          anchorX="center"
          anchorY="middle"
          depthWrite={false}
          outlineWidth={0}
          outlineBlur="20%"
          outlineColor="#000"
          outlineOpacity={0.5}
          depthTest={false}
          renderOrder={10}
          onClick={e => {
            e.stopPropagation();
            handleNavigate(link);
          }}
          onPointerOver={() => (document.body.style.cursor = 'pointer')}
          onPointerOut={() => (document.body.style.cursor = 'auto')}
        >
          {label}
        </Text>
      ))}
    </group>
  );
}

function Images() {
  const group = useRef();
  const data = useScroll();
  const { height } = useThree(s => s.viewport);

  useFrame(() => {
    group.current.children[0].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    group.current.children[1].material.zoom = 1 + data.range(0, 1 / 3) / 3;
    group.current.children[2].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    group.current.children[3].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
    group.current.children[4].material.zoom = 1 + data.range(1.15 / 3, 1 / 3) / 2;
  });

  return (
    <group ref={group}>
      <Image position={[-2, 0, 0]} scale={[3, height / 1.1, 1]} url="/assets/demo/cs1.webp" />
      <Image position={[2, 0, 3]} scale={3} url="/assets/demo/cs2.webp" />
      <Image position={[-2.05, -height, 6]} scale={[1, 3, 1]} url="/assets/demo/cs3.webp" />
      <Image position={[-0.6, -height, 9]} scale={[1, 2, 1]} url="/assets/demo/cs1.webp" />
      <Image position={[0.75, -height, 10.5]} scale={1.5} url="/assets/demo/cs2.webp" />
    </group>
  );
}

function Typography() {
  const DEVICE = {
    mobile: { fontSize: 0.2 },
    tablet: { fontSize: 0.4 },
    desktop: { fontSize: 0.6 }
  };
  const getDevice = () => {
    const w = window.innerWidth;
    return w <= 639 ? 'mobile' : w <= 1023 ? 'tablet' : 'desktop';
  };

  const [device, setDevice] = useState(getDevice());

  useEffect(() => {
    const onResize = () => setDevice(getDevice());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const { fontSize } = DEVICE[device];

  return (
    <Text
      position={[0, 0, 12]}
      fontSize={fontSize}
      letterSpacing={-0.05}
      outlineWidth={0}
      outlineBlur="20%"
      outlineColor="#000"
      outlineOpacity={0.5}
      color="white"
      anchorX="center"
      anchorY="middle"
    >
      React Bits
    </Text>
  );
}
