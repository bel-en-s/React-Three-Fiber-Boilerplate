import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stats, OrbitControls } from '@react-three/drei'
import { BackSide, VideoTexture, ClampToEdgeWrapping, LinearFilter, Raycaster, Vector2 } from 'three'
import { create } from 'zustand'
import JEASINGS from 'jeasings'
import gsap from 'gsap'

const useStore = create((set) => ({
  position: [70, 100, 70],
  fov: 110,
  progress: 0,
  isPanorama: false,
  setParameters: (position, fov, progress, isPanorama) => set({ position, fov, progress, isPanorama }),
  resetView: () => set({ position: [70, 100, 70], fov: 110, progress: 0, isPanorama: false }),
}))

function Sphere() {
  const videoRef = useRef(document.createElement('video'))

  useEffect(() => {
    const video = videoRef.current
    video.src = '/img/2.mp4'
    video.loop = true
    video.muted = true
    video.play()
  }, [])

  const videoTexture = new VideoTexture(videoRef.current)
  videoTexture.wrapS = ClampToEdgeWrapping
  videoTexture.wrapT = ClampToEdgeWrapping
  videoTexture.minFilter = LinearFilter
  videoTexture.magFilter = LinearFilter
  videoTexture.generateMipmaps = false

  return (
    <mesh scale={[1, 1, 1]} name="panorama">
      <sphereGeometry args={[100, 128, 128]} />
      <meshBasicMaterial map={videoTexture} side={BackSide} />
    </mesh>
  )
}

function JEasings() {
  useFrame(() => {
    JEASINGS.update()
  })
}

function Camera() {
  const { camera, scene } = useThree()
  const { position, fov, isPanorama } = useStore()
  const mouse = useRef({ x: 0, y: 0 })
  const raycaster = useRef(new Raycaster())
  const pointer = useRef(new Vector2())

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isPanorama) return // Disable movement in panorama mode

      const { innerWidth, innerHeight } = window
      const x = (event.clientX / innerWidth - 0.5) * 2
      const y = -(event.clientY / innerHeight - 0.5) * 2
      mouse.current = { x, y }

      gsap.to(camera.position, {
        x: position[0] - x * 5,
        y: position[1] + y * 5,
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    const handleClick = (event) => {
      if (isPanorama) return // Already in panorama mode

      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = -(event.clientY / window.innerHeight) * 2 + 1

      raycaster.current.setFromCamera(pointer.current, camera)
      const intersects = raycaster.current.intersectObjects(scene.children)

      if (intersects.length > 0 && intersects[0].object.name === 'panorama') {
        gsap.to(camera.position, {
          x: 0,
          y: 0,
          z: 0.1, // Very close to the sphere
          duration: 1.2,
          ease: 'power2.out',
        })
        gsap.to(camera, {
          fov: 80,
          duration: 1.2,
          ease: 'power2.out',
          onUpdate: () => camera.updateProjectionMatrix(),
        })
        useStore.setState({ isPanorama: true })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
    }
  }, [position, fov, isPanorama])

  useEffect(() => {
    gsap.to(camera.position, {
      x: position[0],
      y: position[1],
      z: position[2],
      duration: 1.2,
      ease: 'power2.out',
    })

    gsap.to(camera, {
      fov,
      duration: 1.2,
      ease: 'power2.out',
      onUpdate: () => camera.updateProjectionMatrix(),
    })
  }, [position, fov])
}

function ScrollHandler() {
  const setParameters = useStore((state) => state.setParameters)
  const progressRef = useRef(useStore.getState().progress)

  useEffect(() => {
    const handleWheel = (event) => {
      event.preventDefault()
      if (useStore.getState().isPanorama) return // Disable scroll in panorama mode

      const delta = event.deltaY * 0.0005
      const newProgress = Math.min(Math.max(progressRef.current + delta, 0), 1)
      progressRef.current = newProgress

      const newPosition = [
        70 * (1 - newProgress) + 0 * newProgress,
        100 * (1 - newProgress) + 0 * newProgress,
        70 * (1 - newProgress) + 10 * newProgress
      ]
      const newFov = 110 * (1 - newProgress) + 70 * newProgress

      gsap.to(progressRef, {
        current: newProgress,
        duration: 1.2,
        ease: 'power2.out',
        onUpdate: () => {
          setParameters(newPosition, newFov, progressRef.current, false)
        }
      })
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [setParameters])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [])

  return null
}

function ResetButton() {
  const resetView = useStore((state) => state.resetView)

  return (
    <button
      onClick={() => {
        gsap.to(useStore.getState(), {
          position: [70, 100, 70],
          fov: 110,
          progress: 0,
          isPanorama: false,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            resetView()
          }
        })
      }}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 15px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: '#fff',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Reset View
    </button>
  )
}

export default function App() {
  return (
    <>
      <Canvas camera={{ position: [70, 100, 70], fov: 110 }}>
        <Sphere />
        <Camera />
        <OrbitControls enablePan={false} enableZoom={true} minDistance={10} maxDistance={150} />
        <JEasings />
        <Stats />
      </Canvas>
      <ScrollHandler />
      <ResetButton />
    </>
  )
}
