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
  captureSettleDelay = 0,
  enabled = true,
  onCaptureReady
}) {
  const Wrapper = mode === 'bar' ? Bar : mode === 'cube' ? Cube : Lens;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;
  const [contentCanvas, setContentCanvas] = useState(null);

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

    setContentCanvas(null);
    onCaptureReady?.(false);
    let cancelled = false;
    let timer = 0;
    let idleCallback = 0;
    let resizeObserver;
    let intersectionObserver;
    const captureNotBefore = performance.now() + captureSettleDelay;

    const waitForImages = () => Promise.all(
      [...target.querySelectorAll('img')]
        .filter(image => !image.closest('[aria-hidden="true"]'))
        .map(image => {
          if (image.complete) {
            return typeof image.decode === 'function'
              ? image.decode().catch(() => undefined)
              : undefined;
          }

          return new Promise(resolve => {
            const timeout = window.setTimeout(resolve, 1800);
            const finish = () => {
              window.clearTimeout(timeout);
              resolve();
            };
            image.addEventListener('load', finish, { once: true });
            image.addEventListener('error', finish, { once: true });
          });
        })
    );

    const capture = async () => {
      if (cancelled || !target.isConnected || target.offsetWidth === 0 || target.offsetHeight === 0) return;

      await document.fonts?.ready;
      await waitForImages();
      const { default: html2canvas } = await import('html2canvas-pro');
      if (cancelled) return;

      const snapshot = await html2canvas(target, {
        backgroundColor: null,
        logging: false,
        useCORS: true,
        imageTimeout: 0,
        ignoreElements: element => element.classList?.contains('projects-glass-overlay'),
        scale: Math.min(window.devicePixelRatio || 1, 1.5),
        width: target.offsetWidth,
        height: target.offsetHeight
      });

      if (!cancelled) {
        setContentCanvas(snapshot);
        onCaptureReady?.(true);
      }
    };

    const scheduleCapture = (delay = 140) => {
      window.clearTimeout(timer);
      if (idleCallback && "cancelIdleCallback" in window) window.cancelIdleCallback(idleCallback);
      const settleRemaining = Math.max(0, captureNotBefore - performance.now());
      const resolvedDelay = Math.max(delay, settleRemaining);
      timer = window.setTimeout(() => {
        const runCapture = () => {
          idleCallback = 0;
          capture().catch(error => {
            console.warn('Unable to refresh the FluidGlass project texture.', error);
          });
        };
        if ("requestIdleCallback" in window) {
          idleCallback = window.requestIdleCallback(runCapture, { timeout: 450 });
        } else {
          runCapture();
        }
      }, resolvedDelay);
    };

    intersectionObserver = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) scheduleCapture(80);
    }, { rootMargin: '240px 0px' });
    intersectionObserver.observe(target);

    resizeObserver = new ResizeObserver(() => scheduleCapture(220));
    resizeObserver.observe(target);

    const handleResize = () => scheduleCapture(220);
    window.addEventListener('resize', handleResize, { passive: true });
    scheduleCapture(0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      if (idleCallback && "cancelIdleCallback" in window) window.cancelIdleCallback(idleCallback);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [captureTargetRef, captureKey, captureSettleDelay, onCaptureReady]);

  return (
    <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
      <ScrollControls damping={0.2} pages={3} distance={0.4}>
        {mode === 'bar' && <NavItems items={navItems} />}
        <Wrapper
          modeProps={modeProps}
          trackingTargetRef={trackingTargetRef}
          activeTargetRef={activeTargetRef}
          activeSelector={activeSelector}
          enabled={enabled && Boolean(contentCanvas)}
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
  enabled = true,
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

  useEffect(() => {
    if (!trackingTargetRef?.current) return undefined;

    const updatePointerFromClient = (clientX, clientY) => {
      const target = trackingTargetRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

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
      lastClientPointerRef.current = { x: event.clientX, y: event.clientY };
      updatePointerFromClient(event.clientX, event.clientY);
    };

    const updateAfterLayoutChange = () => {
      const lastPointer = lastClientPointerRef.current;
      if (lastPointer) updatePointerFromClient(lastPointer.x, lastPointer.y);
    };

    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('scroll', updateAfterLayoutChange, { passive: true });
    window.addEventListener('resize', updateAfterLayoutChange, { passive: true });
    return () => {
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('scroll', updateAfterLayoutChange);
      window.removeEventListener('resize', updateAfterLayoutChange);
    };
  }, [trackingTargetRef, activeTargetRef, activeSelector]);

  useEffect(() => {
    const geo = nodes[geometryKey]?.geometry;
    geo.computeBoundingBox();
    geoWidthRef.current = geo.boundingBox.max.x - geo.boundingBox.min.x || 1;
  }, [nodes, geometryKey]);

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const activePointer = trackingTargetRef?.current ? externalPointerRef.current : pointer;
    const destX = followPointer ? (activePointer.x * v.width) / 2 : 0;
    const destY = lockToBottom ? -v.height / 2 + 0.2 : followPointer ? (activePointer.y * v.height) / 2 : 0;
    let resolvedScale = scale;
    if (resolvedScale == null) {
      const maxWorld = v.width * 0.9;
      const desired = maxWorld / geoWidthRef.current;
      resolvedScale = Math.min(0.15, desired);
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
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
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
