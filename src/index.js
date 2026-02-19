// ../index.js
import * as THREE from 'three'
import Stats from 'three/addons/libs/stats.module.js'

// 封装初始化函数，接收容器元素作为参数
export function initThree(container) {
  let renderer = null
  let scene = null
  let camera = null
  let cube = null
  let animateId = null
  let stats = null

  if (!container) {
    console.error('three.js 容器元素不存在')
    return null
  }

  // 创建渲染器
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  container.appendChild(renderer.domElement)

  // 初始化 Stats
  stats = new Stats()
  document.body.appendChild(stats.domElement)

  // 创建场景
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0xf0f0f0)

  // 创建相机
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000,
  )
  camera.position.z = 5

  // 创建立方体
  const geometry = new THREE.BoxGeometry(2, 2, 2)
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
    wireframe: true,
  })
  cube = new THREE.Mesh(geometry, material)
  scene.add(cube)

  // 渲染循环
  const animate = () => {
    animateId = requestAnimationFrame(animate)
    stats.update()
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
    renderer.render(scene, camera)
  }
  animate()

  // 窗口 resize 监听
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  }
  window.addEventListener('resize', handleResize)

  // 返回清理函数，供组件卸载时调用
  return {
    destroy() {
      // 清理动画循环
      if (animateId) cancelAnimationFrame(animateId)
      // 销毁渲染器
      if (renderer) {
        renderer.dispose()
        container.removeChild(renderer.domElement)
      }
      // 清理几何体/材质
      if (cube) {
        cube.geometry.dispose()
        cube.material.dispose()
      }
      // 移除 Stats
      if (stats) document.body.removeChild(stats.domElement)
      // 移除 resize 监听
      window.removeEventListener('resize', handleResize)
    },
  }
}
