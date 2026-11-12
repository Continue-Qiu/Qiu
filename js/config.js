/* ============================================================
 * FORM · 内容配置
 * 改文案、项目、工具、近况，只动这个文件就够了。
 * ============================================================ */
window.FORM = {
  brand: {
    name: "FORM",
    alias: "INDEX"
  },

  /* 首屏下方滚动的关键词 */
  ticker: [
    "LAYOUT",
    "TYPOGRAPHY",
    "MOTION",
    "GRID",
    "COLOR",
    "INTERFACE",
    "HTML",
    "CSS",
    "JAVASCRIPT",
    "NO BUILD",
    "ALWAYS MAKING"
  ],

  /* 02 作品
     variant 决定悬浮预览的配色：v1 / v2 / v3 / v4
     url 留空 = 不生成外链 */
  work: [
    {
      title: "Grid Study",
      desc: "栅格与留白的比例练习，用最少的元素撑起页面骨架。",
      tags: ["Layout", "Grid"],
      year: "2026",
      url: "",
      note: "视觉实验",
      variant: "v1",
      initial: "G"
    },
    {
      title: "Motion Notes",
      desc: "滚动、悬停与缓动的节奏实验，让静态页面有呼吸感。",
      tags: ["CSS", "Motion"],
      year: "2026",
      url: "",
      note: "视觉实验",
      variant: "v2",
      initial: "M"
    },
    {
      title: "Type Shelf",
      desc: "衬线与无衬线的混排实验，标题、注脚与数字对齐。",
      tags: ["Typography", "Editorial"],
      year: "2026",
      url: "",
      note: "视觉实验",
      variant: "v3",
      initial: "T"
    },
    {
      title: "This Index",
      desc: "你正在看的这一页：零依赖、无构建、纯静态。",
      tags: ["HTML", "CSS", "JavaScript"],
      year: "2026",
      url: "",
      note: "视觉实验",
      variant: "v4",
      initial: "I"
    }
  ],

  /* 03 工具 */
  stack: [
    {
      cn: "语言",
      en: "LANGUAGES",
      items: ["HTML", "CSS", "JavaScript", "TypeScript", "Python"]
    },
    {
      cn: "排版",
      en: "TYPESETTING",
      items: ["Instrument Serif", "Geist", "Geist Mono", "网格", "留白"]
    },
    {
      cn: "动效",
      en: "MOTION",
      items: ["CSS Transitions", "Keyframes", "IntersectionObserver", "缓动", "克制"]
    },
    {
      cn: "原则",
      en: "PRINCIPLES",
      items: ["零依赖", "无构建", "响应式", "无障碍", "无追踪"]
    }
  ],

  /* 04 现在 */
  now: [
    {
      k: "MAKING",
      t: "界面与排版实验",
      d: "把同一套结构，换成不同的字体、留白与节奏。"
    },
    {
      k: "EXPLORING",
      t: "动效与微交互",
      d: "滚动、悬停、缓动——让页面看起来是活的。"
    },
    {
      k: "PRINCIPLE",
      t: "零依赖 · 无构建",
      d: "一个 index.html 加一份 CSS，双击就能跑。"
    }
  ]
};