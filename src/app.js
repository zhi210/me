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
    window.scrollTo(0, 0)  // 切页后回到顶部，模拟跳新页面的行为
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

  function handleNavClick(item) {
    closeMenu()
    if (item.external) return

    // 属于 CV 页的锚点
    const cvSections = ['cv', 'practice', 'skills', 'books']
    if (cvSections.includes(item.id)) {
      navigateTo('cv')
      // 等 DOM 渲染后再滚动到锚点
      nextTick(() => {
        const el = document.getElementById(item.id)
        if (el) el.scrollIntoView({ behavior: 'smooth' })
      })
    } else {
      navigateTo('about')
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
