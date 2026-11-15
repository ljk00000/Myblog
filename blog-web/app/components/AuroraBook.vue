<template>
  <div class="aurora-scene" aria-hidden="true">
    <div class="scene-halo scene-halo-violet" /><div class="scene-halo scene-halo-blue" />
    <svg class="book-universe" viewBox="0 0 560 500" fill="none">
      <defs>
        <linearGradient id="orbit-color" x1="70" y1="120" x2="470" y2="390" gradientUnits="userSpaceOnUse"><stop stop-color="#b19aff" /><stop offset=".48" stop-color="#a2dced" /><stop offset="1" stop-color="#ee9acb" /></linearGradient>
        <linearGradient id="page-left" x1="122" y1="184" x2="280" y2="354" gradientUnits="userSpaceOnUse"><stop stop-color="#7564b4" stop-opacity=".5" /><stop offset="1" stop-color="#17182d" stop-opacity=".95" /></linearGradient>
        <linearGradient id="page-right" x1="285" y1="213" x2="425" y2="320" gradientUnits="userSpaceOnUse"><stop stop-color="#a5a1eb" stop-opacity=".42" /><stop offset="1" stop-color="#29223e" stop-opacity=".75" /></linearGradient>
        <linearGradient id="page-edge" x1="130" y1="170" x2="428" y2="350" gradientUnits="userSpaceOnUse"><stop stop-color="#d7baff" /><stop offset=".48" stop-color="#9b96ff" /><stop offset="1" stop-color="#8ae0ed" /></linearGradient>
        <radialGradient id="book-glow"><stop stop-color="#a090ff" stop-opacity=".28" /><stop offset="1" stop-color="#a090ff" stop-opacity="0" /></radialGradient>
      </defs>
      <circle cx="280" cy="256" r="200" fill="url(#book-glow)" />
      <g class="orbit-lines" stroke="url(#orbit-color)">
        <ellipse cx="280" cy="256" rx="235" ry="104" transform="rotate(-28 280 256)" stroke-opacity=".32" />
        <ellipse cx="280" cy="256" rx="213" ry="172" transform="rotate(32 280 256)" stroke-opacity=".12" />
        <ellipse cx="280" cy="256" rx="252" ry="209" stroke-opacity=".08" stroke-dasharray="2 9" />
        <path d="M55 256h450M280 43v426" stroke-opacity=".07" stroke-dasharray="3 7" />
      </g>
      <g class="orbit-sparks"><circle cx="90" cy="336" r="5" fill="#9ed8ed" /><circle cx="465" cy="177" r="4" fill="#d1b3ff" /><circle cx="363" cy="65" r="2" fill="#d5b7ec" /><circle cx="141" cy="112" r="2.5" fill="#bbb9ff" /><path d="M449 340v14m-7-7h14M117 199v10m-5-5h10" stroke="#d5b3ff" stroke-opacity=".7" /></g>
      <g class="book-float" stroke-linecap="round" stroke-linejoin="round">
        <path d="M125 207 274 257 428 200 421 330 281 390 129 337Z" fill="#0e1022" stroke="url(#page-edge)" stroke-opacity=".3" />
        <path d="m130 324 150 55 143-58M130 315l150 55 144-59M130 306l150 55 145-59" stroke="url(#page-edge)" stroke-opacity=".28" />
        <path d="M125 186c60-11 111 9 155 55v121c-44-36-94-54-155-43Z" fill="url(#page-left)" stroke="url(#page-edge)" stroke-width="1.5" />
        <path d="M280 241c45-47 96-66 151-55v133c-55-11-106 7-151 43Z" fill="url(#page-right)" stroke="url(#page-edge)" stroke-width="1.5" />
        <path d="M280 241c-41-57-80-83-125-81l-11 131c53 0 97 23 136 71" fill="url(#page-left)" stroke="url(#page-edge)" stroke-opacity=".65" />
        <path d="M280 241c30-61 71-94 117-98l16 137c-53 13-98 39-133 82Z" fill="url(#page-right)" stroke="url(#page-edge)" stroke-opacity=".7" />
        <path d="M280 241v121" stroke="#d6caff" stroke-width="2" />
        <g stroke="#c5b4f5" stroke-opacity=".28"><path d="M173 193c30 8 56 24 80 48M170 209c30 8 57 24 82 48M168 226c31 9 58 25 83 48M166 243c27 7 49 20 70 38" /><path d="M306 236c20-27 43-46 70-56M307 255c22-26 46-44 71-54M308 275c22-24 46-41 72-52M309 294c18-18 36-31 56-42" /></g>
        <path class="page-light" d="M280 239c-5-34 7-60 29-87" stroke="url(#page-edge)" stroke-width="1.5" stroke-dasharray="3 7" />
        <path d="m293 134 4 9 10 1-8 6 2 10-8-6-9 5 3-10-7-7 10 1Z" fill="#e8d9ff" />
      </g>
    </svg>
    <span class="scene-caption">BETWEEN WORDS & WORLDS</span>
    <span class="scene-coordinate">READ. EXPLORE. REPEAT.</span>
  </div>
</template>
