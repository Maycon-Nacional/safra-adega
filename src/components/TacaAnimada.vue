<template>
  <svg class="taca" viewBox="0 0 200 260" role="img" aria-label="Taça de vinho sendo servida">
    <defs>
      <clipPath id="bojo-taca">
        <path d="M52 22 H148 C148 96 134 130 100 140 C66 130 52 96 52 22 Z" />
      </clipPath>
      <linearGradient id="cor-vinho" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#9B2C47" />
        <stop offset="1" stop-color="#4A1424" />
      </linearGradient>
      <linearGradient id="brilho-vidro" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0.55" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
    </defs>

    <!-- fio de vinho caindo -->
    <rect class="fio" x="98.5" y="0" width="3" height="120" rx="1.5" fill="#7A1F3D" />

    <g clip-path="url(#bojo-taca)">
      <g class="liquido">
        <path
          class="onda"
          d="M-200 80 Q-175 72 -150 80 T-100 80 T-50 80 T0 80 T50 80 T100 80 T150 80 T200 80 T250 80 T300 80 V200 H-200 Z"
          fill="url(#cor-vinho)"
        />
        <path
          class="onda onda-2"
          d="M-200 84 Q-175 90 -150 84 T-100 84 T-50 84 T0 84 T50 84 T100 84 T150 84 T200 84 T250 84 T300 84 V200 H-200 Z"
          fill="#5B1A2E"
          opacity="0.55"
        />
      </g>
    </g>

    <path
      d="M52 22 H148 C148 96 134 130 100 140 C66 130 52 96 52 22 Z"
      fill="none"
      stroke="currentColor"
      stroke-width="2.2"
      stroke-linejoin="round"
    />
    <path d="M62 30 C62 80 70 110 86 126" stroke="url(#brilho-vidro)" stroke-width="5" fill="none" stroke-linecap="round" />
    <path d="M100 140 V226" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" />
    <ellipse cx="100" cy="230" rx="40" ry="7" fill="none" stroke="currentColor" stroke-width="2.2" />
  </svg>
</template>

<style scoped>
.taca {
  width: 100%;
  height: auto;
  color: rgba(var(--v-theme-on-surface), 0.55);
  overflow: visible;
}
.liquido {
  transform: translateY(70px);
  animation: encher 2.6s 0.3s cubic-bezier(0.33, 1, 0.68, 1) forwards;
}
.onda {
  animation: ondular 3.2s linear infinite;
}
.onda-2 {
  animation-duration: 4.6s;
  animation-direction: reverse;
}
.fio {
  transform-origin: top;
  transform: scaleY(0);
  animation: servir 2.9s 0.1s ease-in-out forwards;
}
@keyframes encher {
  to {
    transform: translateY(0);
  }
}
@keyframes ondular {
  to {
    transform: translateX(100px);
  }
}
@keyframes servir {
  0% {
    transform: scaleY(0);
    opacity: 1;
  }
  15% {
    transform: scaleY(1);
  }
  80% {
    transform: scaleY(1);
    opacity: 1;
  }
  100% {
    transform: scaleY(1);
    opacity: 0;
  }
}
</style>
