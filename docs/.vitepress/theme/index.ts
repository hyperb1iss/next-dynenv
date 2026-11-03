import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'

import HeroMark from './HeroMark.vue'
import './silkcircuit.css'

export default {
    extends: DefaultTheme,
    Layout: () => h(DefaultTheme.Layout, null, { 'home-hero-image': () => h(HeroMark) }),
} satisfies Theme
