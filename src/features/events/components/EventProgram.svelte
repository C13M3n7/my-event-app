<script lang="ts">
    import type { FestivalData, FestivalDay } from '../types';

    export let festivalData: FestivalData;
    export let selectedDay: FestivalDay;
</script>

<!-- Program content -->

<!-- Festival Features -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-sky-900 mb-4">Festival Features</h2>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div class="text-center p-3 bg-slate-50 rounded-xl">
            <svg width="32" height="32" fill="none" class="mb-2"><path d="M9 18v-7m3 7v-4m3 4v-2m3 2v-4m3 4v-7M4 6h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="#10B981" stroke-width="2"/></svg>
            <h3 class="my-2 text-[16px] text-sky-900">Music</h3>
            <p class="text-sm text-slate-500">Independent bands, DJs, At Adau single launch</p>
        </div>
        <div class="text-center p-3 bg-slate-50 rounded-xl">
            <svg width="32" height="32" fill="none" class="mb-2"><path d="M12 2v4m0 14v4M5 12H1m22 0h4m-4.64-6.36l-2.83 2.83m-9.9 9.9l-2.83 2.83M18.36 18.36l-2.83-2.83M5.64 5.64l2.83 2.83" stroke="#10B981" stroke-width="2"/></svg>
            <h3 class="my-2 text-[16px] text-sky-900">F&B</h3>
            <p class="text-sm text-slate-500">Bakeh Cookhouse, artisan coffee, fusion cuisine</p>
        </div>
        <div class="text-center p-3 bg-slate-50 rounded-xl">
            <svg width="32" height="32" fill="none" class="mb-2"><path d="M3 10h18M7 15h1m4 0h1m4 0h1M3 19h18a2 2 0 002-2V7a2 2 0 00-2-2H3a2 2 0 00-2 2v10a2 2 0 002 2z" stroke="#10B981" stroke-width="2"/></svg>
            <h3 class="my-2 text-[16px] text-sky-900">Retail</h3>
            <p class="text-sm text-slate-500">Artisan market, tuak market, Gawai cookies</p>
        </div>
        <div class="text-center p-3 bg-slate-50 rounded-xl">
            <svg width="32" height="32" fill="none" class="mb-2"><path d="M16 8v8l4 4m6-12a10 10 0 11-20 0 10 10 0 0120 0z" stroke="#10B981" stroke-width="2"/></svg>
            <h3 class="my-2 text-[16px] text-sky-900">Engagement</h3>
            <p class="text-sm text-slate-500">Workshops, competitions, cultural ceremonies</p>
        </div>
    </div>
</div>

<!-- Daily Schedule -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-[20px] text-sky-900 mb-4">Tentative Program</h2>
    <div>
        <div class="flex gap-2 mb-4 overflow-x-auto pb-2">
            {#each ["Wed 28", "Thu 29", "Fri 30", "Sat 31"] as day}
                <button 
                    class="px-3 py-2 rounded-full text-sm whitespace-nowrap transition-colors"
                    class:bg-sky-900={selectedDay === day}
                    class:text-white={selectedDay === day}
                    class:bg-slate-100={selectedDay !== day}
                >
                    {day}
                </button>
            {/each}
        </div>
        <div class="grid gap-3">
            <div class="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <span class="font-semibold text-sky-900 min-w-[60px]">10:00 AM</span>
                <div>
                    <h4 class="text-[15px] mb-1">Market Opens</h4>
                    <p class="text-sm text-slate-500 m-0">Artisan & food vendors</p>
                </div>
            </div>
            <div class="flex gap-3 p-3 bg-slate-50 rounded-xl">
                <span class="font-semibold text-sky-900 min-w-[60px]">2:00 PM</span>
                <div>
                    <h4 class="text-[15px] mb-1">Fusion Dance Workshop</h4>
                    <p class="text-sm text-slate-500 m-0">Main Stage</p>
                </div>
            </div>
            <!-- More time slots... -->
        </div>
    </div>
</div>