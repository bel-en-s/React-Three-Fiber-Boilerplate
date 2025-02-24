import { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stats, OrbitControls } from '@react-three/drei'
import { BackSide, VideoTexture, ClampToEdgeWrapping, LinearFilter } from 'three'
import { create } from 'zustand'
import JEASINGS from 'jeasings'
import gsap from 'gsap'

const useStore = create((set) => ({
  position: [70, 100, 70],
  fov: 110,
  progress: 0,
  setParameters: (position, fov, progress) => set({ position, fov, progress }),
  resetView: () => set({ position: [70, 100, 70], fov: 110, progress: 0 }),
}))

function Sphere() {
  const videoRef = useRef(document.createElement('video'))

  useEffect(() => {
    const video = videoRef.current
    video.src = '/img/1.mp4'
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
    <mesh scale={[1, 1, 1]}>
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
  const { camera } = useThree()
  const { position, fov } = useStore()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (event) => {
      const { innerWidth, innerHeight } = window
      const x = (event.clientX / innerWidth - 0.5) * 2 // Normalize to [-1, 1]
      const y = -(event.clientY / innerHeight - 0.5) * 2 // Normalize to [-1, 1] (inverted for natural movement)
      mouse.current = { x, y }

      gsap.to(camera.position, {
        x: position[0] - x * 5, // Adjust intensity
        y: position[1] + y * 5, // Adjust intensity
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [position, fov])

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
          setParameters(newPosition, newFov, progressRef.current)
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
        <OrbitControls enablePan={false} enableZoom={false} />
        <JEasings />
        <Stats />
      </Canvas>
      <ScrollHandler />
      <ResetButton />
    </>
  )
}
