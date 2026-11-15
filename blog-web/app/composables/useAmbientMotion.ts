export function useAmbientMotion() {
  const app = useNuxtApp()
  let observer: IntersectionObserver | undefined
  let frame = 0
  let latest: PointerEvent | undefined
  let activeCard: HTMLElement | null = null
  let removePageHook: (() => void) | undefined
  let motion: MediaQueryList | undefined
  let pointer: MediaQueryList | undefined
  let scene: HTMLElement | null = null

  function reveal() {
    observer?.disconnect()
    if (motion?.matches || !('IntersectionObserver' in window)) return
    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('is-revealed')
        observer?.unobserve(entry.target)
      }
    }, { threshold: .08, rootMargin: '0px 0px -24px 0px' })
    document.querySelectorAll('.reveal:not(.is-revealed), .article-card:not(.is-revealed), .resource-card:not(.is-revealed)').forEach(element => observer?.observe(element))
    scene = document.querySelector<HTMLElement>('.aurora-scene')
  }
  function paint() {
    frame = 0
    if (!latest) return
    const target = latest.target instanceof Element ? latest.target.closest<HTMLElement>('.spotlight') : null
    if (activeCard && activeCard !== target) {
      activeCard.style.removeProperty('--pointer-x')
      activeCard.style.removeProperty('--pointer-y')
    }
    activeCard = target
    if (target) {
      const rect = target.getBoundingClientRect()
      target.style.setProperty('--pointer-x', `${latest.clientX - rect.left}px`)
      target.style.setProperty('--pointer-y', `${latest.clientY - rect.top}px`)
    }
    if (scene) {
      const rect = scene.getBoundingClientRect()
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        scene.style.setProperty('--scene-x', `${((latest.clientX / window.innerWidth) - .5) * 12}px`)
        scene.style.setProperty('--scene-y', `${((latest.clientY / window.innerHeight) - .5) * 8}px`)
      }
    }
  }
  function move(event: PointerEvent) {
    latest = event
    if (!frame) frame = requestAnimationFrame(paint)
  }
  function configure() {
    window.removeEventListener('pointermove', move)
    cancelAnimationFrame(frame)
    frame = 0
    latest = undefined
    activeCard?.style.removeProperty('--pointer-x')
    activeCard?.style.removeProperty('--pointer-y')
    activeCard = null
    scene?.style.removeProperty('--scene-x')
    scene?.style.removeProperty('--scene-y')
    if (!motion?.matches && pointer?.matches) window.addEventListener('pointermove', move, { passive: true })
    reveal()
  }
  onMounted(() => {
    motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
    motion.addEventListener('change', configure)
    pointer.addEventListener('change', configure)
    configure()
    removePageHook = app.hook('page:finish', () => { void nextTick(reveal) })
  })
  onBeforeUnmount(() => {
    observer?.disconnect()
    cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', move)
    motion?.removeEventListener('change', configure)
    pointer?.removeEventListener('change', configure)
    removePageHook?.()
  })
}
