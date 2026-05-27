import { ref, onMounted, computed, nextTick } from 'vue'
export function usePortfolio() {
  // ── reactive state ──────────────────────────────────────────────
  const info      = ref(null)
  const navItems  = ref([])
  const projects  = ref([])
  const cvData    = ref(null)
  const books     = ref([])
  const currentPage = ref('about') 
  const menuOpen      = ref(false)
  const activeSection = ref('about')

  // ── data loading ────────────────────────────────────────────────
  async function loadData() {
    const [infoRes, navRes, projRes, cvRes, bookRes] = await Promise.all([
      fetch('/data/info.json'),
      fetch('/data/nav.json'),
      fetch('/data/projects.json'),
      fetch('/data/cv.json'),
      fetch('/data/books.json'),
    ])
    info     .value = await infoRes .json()
    navItems .value = await navRes  .json()
    projects .value = await projRes .json()
    cvData   .value = await cvRes   .json()
    books    .value = await bookRes .json()
  }

  // ── computed ────────────────────────────────────────────────────
  // Project categories derived from projects list (preserve order)
  const projectCategories = computed(() => {
    const seen = []
    for (const p of projects.value) {
      if (!seen.includes(p.category)) seen.push(p.category)
    }
    return seen
  })

  function projectsByCategory(cat) {
    return projects.value.filter(p => p.category === cat)
  }

  // ── nav helpers ─────────────────────────────────────────────────
  function toggleMenu() {
    menuOpen.value = !menuOpen.value
  }
  function navigateTo(page) {
    currentPage.value = page
  }

  function closeMenu() {
    menuOpen.value = false
  }

  function navItemClass(item) {
    const classes = ['nav-item']
    if (item.className) classes.push(item.className)
    if (item.id === activeSection.value) classes.push('nav-selected')
    return classes.join(' ')
  }

  // 滚动到指定元素，考虑 sticky 导航栏高度
  function scrollToElement(el, block = 'start') {
    if (!el) return
    const headerHeight = 60 // sticky 导航栏估算高度
    if (block === 'start') {
      // 滚动到顶部，减去导航栏高度
      const top = el.getBoundingClientRect().top + window.scrollY - headerHeight
      window.scrollTo({ top, behavior: 'smooth' })
    } else {
      // 滚动到中间
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  // 高亮闪烁两次
  function flashHighlight(el) {
    if (!el) return
    el.style.transition = 'background-color 0.4s ease'
    const flash = () => {
      el.style.backgroundColor = '#fffbeb'
      setTimeout(() => {
        el.style.backgroundColor = ''
      }, 400)
    }
    flash()
    setTimeout(flash, 850)
  }

  function handleNavClick(item) {
    closeMenu()
    if (item.external) return

    // 属于 CV 页的锚点
    const cvSections = ['cv', 'practice', 'skills', 'books']
    if (cvSections.includes(item.id)) {
      navigateTo('cv')
      // 等 DOM 渲染后再滚动到锚点（需要额外延迟确保布局稳定）
      nextTick(() => {
        setTimeout(() => {
          const el = document.getElementById(item.id)
          if (!el) return

          if (item.id === 'practice' || item.id === 'skills') {
            // 滚动到中间并高亮闪烁
            scrollToElement(el, 'center')
            flashHighlight(el)
          } else {
            // 滚动到顶部（减去导航栏高度）
            scrollToElement(el, 'start')
          }
        }, 100)
      })
    } else {
      // About 页面：滚动到顶部（减去导航栏高度）
      navigateTo('about')
      nextTick(() => {
        setTimeout(() => {
          const el = document.getElementById('about')
          if (el) scrollToElement(el, 'start')
        }, 0)
      })
    }
  }



  // ── scroll spy ──────────────────────────────────────────────────
  function setupScrollSpy() {
    const sectionIds = ['about', 'cv', 'practice', 'skills', 'books']
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            activeSection.value = entry.target.id
          }
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    )
    for (const id of sectionIds) {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    }
  }

  // ── lifecycle ───────────────────────────────────────────────────
  onMounted(async () => {
    await loadData()
    setupScrollSpy()
  })

  return {
    info,
    navItems,
    projects,
    cvData,
    books,
    menuOpen,
    activeSection,
    projectCategories,
    projectsByCategory,
    toggleMenu,
    closeMenu,
    navItemClass,
    handleNavClick,
    currentPage,
    navigateTo,
  }
}
