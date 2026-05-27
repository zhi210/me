<template>
  <div v-if="info">

    <!-- ===== 顶部导航栏 ===== -->
    <div id="header" class="header-bar">
      <div class="header-inner">
        <div class="header-wordmark">
          <a href="#about" class="wordmark-link" @click="closeMenu">{{ info.wordmark }}</a>
        </div>
        <div class="header-links">
          <div class="hamb" @click="toggleMenu">
            <span class="hamb-line"></span>
          </div>
          <div class="nav-wrapper" :class="{ 'nav-open': menuOpen }">
            <div class="nav-menu">
              <a
                v-for="item in navItems"
                :key="item.id"
                :href="item.href"
                :class="navItemClass(item)"
                :target="item.external ? '_blank' : undefined"
                :rel="item.external ? 'noopener noreferrer' : undefined"
                @click="handleNavClick(item)"
              >{{ item.label }}</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== About 区域 ===== -->
    <div v-if="currentPage === 'about'">
      <div class="page-content" id="about">
        <div class="about-section">

          <!-- 左：头像 + 姓名 + 图标 -->
          <div class="about-avatar">
            <div class="avatar-img-wrap">
              <img class="avatar-img" :src="info.avatar" :alt="info.name + '生活照'">
            </div>
            <div class="avatar-text">
              <span class="avatar-name">
                <span class="highlight">{{ info.greeting }}</span>！<span class="line-break"></span>
                我是<span class="highlight">{{ info.name }}</span><span class="line-break"></span>
                ({{ info.nameEn }})
              </span>
              <div class="avatar-contacts">
                <span class="contact-tooltip" data-tip="邮箱">
                  <a :href="'mailto:' + info.email" class="contact-link">
                    <span class="contact-icon">✉</span>
                  </a>
                </span>
                <span class="contact-tooltip" data-tip="电话">
                  <a :href="'tel:' + info.phone" class="contact-link">
                    <span class="contact-icon">☎</span>
                  </a>
                </span>
              </div>
            </div>
          </div>

          <!-- 右：院系信息 -->
          <div class="about-info">
            <p class="about-info-row">{{ info.degree }}</p>
            <p class="about-info-row">
              <a :href="info.university.url" class="about-link" target="_blank" rel="noopener noreferrer">{{ info.university.name }}</a>
              {{ info.school.fullName }}（<a :href="info.school.url" class="about-link" target="_blank" rel="noopener noreferrer">{{ info.school.name }}</a>）
            </p>
            <p class="about-info-row">{{ info.goal }}</p>
            <p class="about-info-row">邮箱：{{ info.email }}</p>
          </div>

        </div>
      </div>

      <!-- ===== 白色区域：简介 + 格言 + 三方框 + 项目经历 ===== -->
      <div class="white-band">

        <!-- 简介 + 格言 -->
        <div class="summary-section">
          <div class="summary-text" v-html="info.summary"></div>
          <div class="summary-quote-wrap">
            <div class="summary-blockquote">
              <p class="blockquote-text">{{ info.quote }}</p>
            </div>
          </div>
          <div class="summary-cta">点击下方三个方框，跳转至对应项目经历详情：</div>
        </div>

        <!-- 三个项目方框 -->
        <div class="themes-section">
          <div class="themes-grid">
            <div
              v-for="proj in projects.slice(0, 3)"
              :key="proj.id"
              class="theme-card"
            >
              <div class="theme-inner">
                <a 
                    href="javascript:;" 
                    class="theme-link" 
                    @click="scrollToProject(proj.id)"
                  >
                  <img class="theme-img" :src="proj.cardImg" :alt="proj.cardImgAlt">
                  <div class="theme-text">
                    <div class="theme-name">{{ proj.title }}</div>
                    <div class="theme-desc">
                      <span class="theme-label">技术栈</span>{{ proj.cardTech }}
                    </div>
                    <div class="theme-desc">
                      <span class="theme-label">内容</span>{{ proj.cardDesc }}
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== 项目经历 ===== -->
        <div class="publications-full-bg">
          <div class="publications-section">
            <h2 class="pub-section-title">项目经历</h2>

            <div
              v-for="cat in projectCategories"
              :key="cat"
              class="topic-group"
            >
              <div class="topic-header">{{ cat }}</div>

              <div
                v-for="proj in projectsByCategory(cat)"
                :key="proj.id"
                class="publication-row"
                :id="proj.id"
              >
                <div class="pub-thumbnail">
                  <img class="pub-thumb-img" :src="proj.thumbImg" :alt="proj.thumbImgAlt">
                </div>
                <div class="pub-information">
                  <div class="pub-title">{{ proj.fullTitle }}</div>
                  <div class="pub-authors">
                    <span
                      v-for="(author, idx) in proj.authors"
                      :key="idx"
                      class="pub-author"
                      :class="{ 'pub-author-primary': author.primary }"
                    >{{ author.name }}</span>
                  </div>
                  <div class="pub-venue">
                    <span class="pub-venue-name">{{ proj.venue }}</span>，{{ proj.venueDate }}
                  </div>
                  <div class="pub-desc">{{ proj.description }}</div>
                  <div class="pub-resources">
                    <span v-for="tag in proj.tags" :key="tag" class="pub-tag">{{ tag }}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- ===== 俄罗斯方块小游戏 ===== -->
        <div class="game-band">
          <div class="game-section">
            <h2 class="game-title">🎮 俄罗斯方块</h2>

            <div class="game-layout">
              <!-- 左面板：储存 + 分数 + 最高分 + 等级 + 行数 -->
              <div class="game-panel game-panel-left">
                <div class="game-panel-box game-preview-box">
                  <div class="game-panel-label">储存 (C)</div>
                  <canvas id="holdCanvas" class="game-hold-canvas"></canvas>
                </div>
                <div class="game-panel-box">
                  <div class="game-panel-label">分数</div>
                  <div class="game-panel-value" id="scoreDisplay">0</div>
                </div>
                <div class="game-panel-box">
                  <div class="game-panel-label">最高分</div>
                  <div class="game-panel-value" id="highScoreDisplay">0</div>
                </div>
                <div class="game-stats-grid">
                  <div class="game-panel-box">
                    <div class="game-panel-label">等级</div>
                    <div class="game-panel-value" id="levelDisplay">1</div>
                  </div>
                  <div class="game-panel-box">
                    <div class="game-panel-label">行数</div>
                    <div class="game-panel-value" id="linesDisplay">0</div>
                  </div>
                </div>
              </div>

              <!-- 中间：画布 -->
              <div class="game-canvas-wrap">
                <div id="touchOverlay" class="game-touch-overlay">
                  <canvas id="gameCanvas" class="game-canvas"></canvas>
                </div>
              </div>

              <!-- 右面板：下一个 + 按钮 + 操作说明 -->
              <div class="game-panel game-panel-right">
                <div class="game-panel-box game-preview-box">
                  <div class="game-panel-label">下一个</div>
                  <canvas id="nextCanvas" class="game-next-canvas"></canvas>
                </div>
                <div class="game-btn-group">
                  <a href="javascript:;" id="btnStart" class="game-btn game-btn-start">开始游戏</a>
                  <a href="javascript:;" id="btnPause" class="game-btn game-btn-pause">暂停</a>
                  <a href="javascript:;" id="btnRestart" class="game-btn game-btn-restart">重新开始</a>
                </div>
                <div class="game-help">
                  <div class="game-help-title">操作说明</div>
                  <div class="game-help-row"><span class="game-key">←</span><span class="game-key">→</span> 移动</div>
                  <div class="game-help-row"><span class="game-key">↑</span> 旋转</div>
                  <div class="game-help-row"><span class="game-key">↓</span> 加速下落</div>
                  <div class="game-help-row"><span class="game-key">Space</span> 硬降</div>
                  <div class="game-help-row"><span class="game-key">C</span> 储存</div>
                  <div class="game-help-row"><span class="game-key">P</span> 暂停</div>
                </div>
              </div>
            </div>


            <p class="game-subtitle">
              键盘方向键操作 · 按任意方向键开始
            </p>
          </div>
        </div>

      </div>
    </div>

    <!-- ===== CV ===== -->

    <div v-if="currentPage === 'cv'">
      <div class="page-content cv-content" v-if="cvData">

        <!-- CV 标题行 + 下载按钮 -->
        <div class="cv-header-row" id="cv">
          <h1 class="cv-title">{{ info.name }} — 个人简历</h1>
          <a :href="info.resumePdf" class="cv-download-btn" :download="info.resumeDownloadName">
            <span class="dl-icon">↓</span> Download PDF
          </a>
        </div>

        <!-- 教育背景 + 联系方式 -->
        <div class="cv-top-grid">
          <div class="cv-edu">
            <h2 class="cv-section-title">教育背景</h2>
            <p class="cv-edu-period">
              <span class="highlight">{{ cvData.education.period }}</span>
              &nbsp;&nbsp;{{ cvData.education.school }}，{{ cvData.education.degree }}
            </p>
            <p class="cv-body-text">主修课程：{{ cvData.education.courses }}</p>
            <p class="cv-body-text">绩点：<span class="highlight">{{ cvData.education.gpa }}</span></p>
            <p class="cv-body-text">累计排名：<span class="highlight">{{ cvData.education.rank }}</span></p>
            <p class="cv-body-text">奖学金：{{ cvData.education.scholarship }}</p>
          </div>
          <div class="cv-contact">
            <h2 class="cv-section-title">联系方式</h2>
            <p class="cv-body-text">
              <span class="cv-label">邮箱：</span>
              <a :href="'mailto:' + cvData.contact.email" class="about-link">{{ cvData.contact.email }}</a>
            </p>
            <p class="cv-body-text"><span class="cv-label">电话：</span>{{ cvData.contact.phone }}</p>
            <p class="cv-body-text">
              <span class="cv-label">院系：</span>
              <a :href="cvData.contact.schoolUrl" class="about-link" target="_blank" rel="noopener noreferrer">{{ cvData.contact.schoolName }}</a>
            </p>
            <p class="cv-body-text"><span class="cv-label">专业：</span>{{ cvData.contact.major }}</p>
          </div>
        </div>

        <!-- 自我评价 -->
        <div class="cv-section">
          <h2 class="cv-section-title">自我评价</h2>
          <p class="cv-body-text">{{ cvData.selfEval }}</p>
        </div>

        <!-- 项目经历（CV版） -->
        <div class="cv-section">
          <h2 class="cv-section-title">项目经历</h2>
          <div
            v-for="proj in projects"
            :key="'cv-' + proj.id"
            class="cv-project"
          >
            <p class="cv-project-title"><span class="highlight">{{ proj.title }}</span></p>
            <p class="cv-body-text">{{ proj.cvDescription }}</p>
          </div>
        </div>

        <!-- 实践活动（时间轴） -->
        <div class="cv-section" id="practice">
          <h2 class="cv-section-title">实践活动</h2>
          <div class="timeline">
            <div
              v-for="(item, idx) in cvData.practice"
              :key="idx"
              class="timeline-item"
            >
              <div class="timeline-marker"></div>
              <div class="timeline-period">{{ item.period }}</div>
              <div class="timeline-content">{{ item.content }}</div>
            </div>
          </div>
        </div>


        <!-- 技能掌握 -->
        <div class="cv-section" id="skills">
          <h2 class="cv-section-title">技能掌握</h2>
          <ul class="cv-list">
            <li
              v-for="skill in cvData.skills"
              :key="skill.label"
              class="cv-list-item"
            ><span class="cv-label">{{ skill.label }}：</span>{{ skill.value }}</li>
          </ul>
        </div>

        <!-- 阅读书目 -->
        <div class="cv-section books-section" id="books">
          <h2 class="cv-section-title">阅读书目</h2>
          <ol class="book-list">
            <li
              v-for="book in books"
              :key="book.title"
              class="book-item"
            >
              <img class="book-cover" :src="book.cover" :alt="book.coverAlt">
              <div class="book-details">
                <p class="book-title"><span class="highlight">{{ book.title }}</span></p>
                <p class="book-author">作者：{{ book.author }}</p>
                <p class="book-date">读书时间：{{ book.date }}</p>
                <a class="book-link" :href="book.link" target="_blank" rel="noopener noreferrer">京东购买链接</a>
              </div>
            </li>
          </ol>
          <div class="back-books-btn">
            <a href="#books" class="back-books-link">返回<span class="line-break"></span>顶部</a>
          </div>
        </div>

      </div>
    </div>

    <!-- ===== 页脚 ===== -->
    <div class="footer-bar">
      <div class="footer-inner">
        <span class="footer-text">{{ info.footerText }}</span>
      </div>
    </div>

  </div>
</template>

<script setup>
import { onMounted, onUnmounted, nextTick, watch } from 'vue'
import { usePortfolio } from './app.js'
import { initTetris, destroyTetris } from './tetris.js'
import './assets/style.css'

// 跳转到对应项目并高亮闪烁
function scrollToProject(projId) {
  // 1. 找到目标元素
  const targetEl = document.getElementById(projId);
  if (!targetEl) return;

  // 2. 滚动到视图中间
  targetEl.scrollIntoView({
    behavior: 'smooth',
    block: 'center'
  });

  // 3. 高亮闪烁两次
  targetEl.style.transition = 'background-color 0.4s ease';
  const flash = () => {
    targetEl.style.backgroundColor = '#fffbeb'; // 高亮淡黄色
    setTimeout(() => {
      targetEl.style.backgroundColor = ''; // 恢复
    }, 400);
  };
  
  // 闪2次（第一次立即执行，第二次延迟850ms）
  flash();
  setTimeout(flash, 850);
}

const {
  info,
  navItems,
  projects,
  cvData,
  books,
  menuOpen,
  projectCategories,
  projectsByCategory,
  toggleMenu,
  closeMenu,
  navItemClass,
  handleNavClick,
  currentPage,
  navigateTo,
} = usePortfolio()

// 初始化俄罗斯方块游戏
function tryInitTetris() {
  const canvas = document.getElementById('gameCanvas')
  if (canvas) {
    initTetris()
  } else {
    // 如果 DOM 还没渲染好，稍后重试
    setTimeout(tryInitTetris, 100)
  }
}

// 等待 info 加载完成、DOM 渲染后再初始化
watch(info, (val) => {
  if (val) {
    nextTick(() => {
      tryInitTetris()
    })
  }
})

onUnmounted(() => {
  destroyTetris()
})
</script>




<style>
/* 移动端汉堡菜单展开（Vue 用 class 替代 checkbox 方案） */
.nav-open {
  display: block !important;
}
</style>
