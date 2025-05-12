<!-- src/features/events/components/EventAbout.svelte -->
<script lang="ts">    
    import type { Event } from '../types';
    import { onMount } from 'svelte';
    
    export let event: Event;
    
    let showTikTokEmbed = false;
    
    // Helper function to extract TikTok video ID from various URL formats
    const getTikTokVideoId = (url: string): string | null => {
        // Handle vt.tiktok.com short links
        if (url.includes('vt.tiktok.com')) {
            // We'll need to follow the redirect to get the actual video ID
            return 'needs-redirect';
        }
        
        // Handle standard TikTok URLs
        const regExp = /https?:\/\/(?:www\.)?tiktok\.com\/@.+\/video\/(\d+)/;
        const match = url.match(regExp);
        return match?.[1] || null;
    };
    
    // Function to load TikTok embed script
    const loadTikTokScript = () => {
        if (!document.querySelector('script[src="https://www.tiktok.com/embed.js"]')) {
            const script = document.createElement('script');
            script.src = 'https://www.tiktok.com/embed.js';
            script.async = true;
            document.body.appendChild(script);
        }
    };
    
    onMount(() => {
        if (event.videoUrl?.includes('tiktok.com')) {
            loadTikTokScript();
            showTikTokEmbed = true;
        }
    });
</script>

<!-- Event Dates -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-xl text-sky-900 mb-4">Event Dates</h2>
    <p class="text-lg font-semibold my-2">
        {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
    </p>
    {#if event.start_time && event.end_time}
    <p class="text-sm text-slate-500">
        {event.start_time} - {event.end_time}
    </p>
    {/if}
</div>

<!-- Event Description -->
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-xl text-sky-900 mb-4">About This Event</h2>
    <p class="text-[15px] leading-snug">
        {event.description || 'No description provided.'}
    </p>
</div>

<!-- Event Brief PDF -->
{#if event.eventBriefUrl}
<div class="bg-white rounded-2xl p-5 mb-4 shadow-md">
    <h2 class="text-xl text-sky-900 mb-4">Event Brief</h2>
    <iframe 
        src={event.eventBriefUrl} 
        class="w-full h-[500px] border rounded-lg"
        title="Event Brief PDF"
    ></iframe>
</div>
{/if}

<!-- Video Preview -->
{#if event.videoUrl}
<div class="mt-6">
    <h2 class="text-xl text-sky-900">Event Highlights</h2>
    <div class="relative rounded-xl overflow-hidden mt-3 aspect-video">
        {#if event.videoUrl.includes('youtube.com') || event.videoUrl.includes('youtu.be')}
            <!-- YouTube Embed -->
            <iframe 
                src={`https://www.youtube.com/embed/${event.videoUrl.split('v=')[1]?.split('&')[0] || event.videoUrl.split('youtu.be/')[1]}`}
                class="w-full h-full"
                frameborder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                title="YouTube Event Video"
            ></iframe>
        
        {:else if event.videoUrl.includes('tiktok.com') && showTikTokEmbed}
            <!-- TikTok Embed - Works with both vt.tiktok.com and regular links -->
            <blockquote 
                class="tiktok-embed" 
                cite={event.videoUrl.includes('vt.tiktok.com') ? '' : event.videoUrl}
                data-video-id={getTikTokVideoId(event.videoUrl)}
                style="max-width: 100%; min-width: 100%; width: 100%; height: 100%;"
            >
                <section>
                    <a target="_blank" title="TikTok Video" href={event.videoUrl}>View on TikTok</a>
                </section>
            </blockquote>
        
        {:else if event.videoUrl.includes('vimeo.com')}
            <!-- Vimeo Embed -->
            <iframe
                src={`https://player.vimeo.com/video/${event.videoUrl.split('vimeo.com/')[1]?.split('?')[0]}`}
                class="w-full h-full"
                frameborder="0"
                allow="autoplay; fullscreen"
                allowfullscreen
                title="Vimeo Event Video"
            ></iframe>
        
        {:else}
            <!-- Regular video file -->
            <video controls class="w-full h-full">
                <source src={event.videoUrl} type="video/mp4">
                <track kind="captions" src="path/to/captions.vtt" srclang="en" label="English">
                Your browser does not support the video tag.
            </video>
        {/if}
    </div>
</div>
{/if}