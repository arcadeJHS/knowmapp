<script lang="ts">
    import { onMount } from 'svelte';
    import ResourceAdder from "$lib/ResourceAdder.svelte";
    import { getHtmlContent } from '../utils/getHtmlContent.ts';

    let doc: string | undefined = '';
    let summaries: string[] = [];
    let summary: string | undefined = '';
    let capabilities: AISummarizerCapabilities | undefined;
    let summarizerSession: AISummarizerSession | undefined;

    async function summarizeText(text: string): Promise<string> {
        // The context window is currently limited to 1024 tokens.
        // You can estimate the number of tokens in English content by assuming that 1 token is roughly equal to 4 characters.
        // https://docs.google.com/document/d/1Bvd6cU9VIEb7kHTAOCtmmHNAYlIZdeNmV7Oy-2CtimA/edit?pli=1#heading=h.wotps13gj8r
        const maxChars = 1000;

        // Split the text into slices of max 1000 characters
        for (let i = 0; i < text.length; i += maxChars) {
            const slice = text.slice(i, i + maxChars);
            const sliceSummary = await summarizerSession?.summarize(slice);
            if (sliceSummary) {
                summaries = [...summaries, sliceSummary];
            }
        }

        let combinedSummary = summaries.join(' ');

        // If the combined summary is greater than 1000 characters, summarize it again
        if (combinedSummary.length > maxChars) {
            combinedSummary = await summarizeText(combinedSummary);
        }

        return combinedSummary;
    }

    const summarize = async (event: CustomEvent) => {
        const url: string = event.detail.url;

        if (!url) { return; }

        doc = await getHtmlContent(url);

        if (!doc) { return; }

        summary = await summarizeText(doc);
    };

    onMount(async () => {
        await (window as Window).ai?.summarizer?.create();
        capabilities = await (window as Window).ai?.summarizer?.capabilities();

        if (capabilities && capabilities.available !== 'no') {
            if (capabilities.available === 'readily') {
                summarizerSession = await (window as Window).ai.summarizer?.create();
            }
        }
    });
</script>

{#if !summarizerSession}
    <p>Loading resources...</p>
{:else}
    <ResourceAdder on:resource={summarize} />

    <!-- {#if doc}
        <code>{doc}</code>
    {/if} -->


    {#if summaries.length > 0}
        <h2>SUMMARIES</h2>
        {#each summaries as s}
            <p>{s}</p>
        {/each}
    {/if}

    {#if summary}
        <h2>FINAL SUMMARY</h2>
        <p>{summary}</p>
    {/if}
{/if}