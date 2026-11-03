<script setup lang="ts">
// The site mark, drawn large: a Neon purple diamond, a cyan inner diamond, and a coral core,
// set on construction lines. One build in the middle, every environment at the vertices.
const vertices = [
    [160, 24],
    [296, 160],
    [160, 296],
    [24, 160],
] as const
</script>

<template>
    <svg class="sc-hero-mark" viewBox="0 0 320 320" role="img" aria-label="next-dynenv">
        <g class="construction">
            <circle cx="160" cy="160" r="136" />
            <line x1="160" y1="0" x2="160" y2="320" />
            <line x1="0" y1="160" x2="320" y2="160" />
            <path d="M92 92 228 92 228 228 92 228Z" />
        </g>
        <path class="outer" d="M160 24 296 160 160 296 24 160Z" />
        <path class="inner" d="M160 84 236 160 160 236 84 160Z" />
        <path class="core" d="M160 132 188 160 160 188 132 160Z" />
        <rect
            v-for="([x, y], i) in vertices"
            :key="i"
            class="node"
            :x="x - 6"
            :y="y - 6"
            width="12"
            height="12"
        />
    </svg>
</template>

<style scoped>
.sc-hero-mark {
    position: relative;
    width: 100%;
    max-width: 320px;
    height: auto;
}

/* Below the two-column hero, VitePress pulls the title up under the image; keep the mark clear of it */
@media (max-width: 959px) {
    .sc-hero-mark {
        display: block;
        max-width: 220px;
        margin: 36px auto 0;
    }
}

.construction {
    fill: none;
    stroke: var(--sc-divider);
    stroke-width: 1;
}

.construction circle {
    stroke-dasharray: 4 6;
}

.outer {
    fill: none;
    stroke: var(--sc-accent);
    stroke-width: 3;
}

.inner {
    fill: none;
    stroke: var(--sc-interact);
    stroke-width: 2;
}

.core {
    fill: var(--sc-code);
}

.node {
    fill: var(--sc-bg);
    stroke: var(--sc-interact);
    stroke-width: 2;
}
</style>
