<script lang="ts">
    import { createEventDispatcher, onMount, tick } from 'svelte';
    import { isValidUrl } from '../utils/isValidUrl.ts';
	import { error } from '@sveltejs/kit';

    export let disableInput: boolean = false;
    let inputEl: HTMLInputElement;
    let userInput: string | undefined;
    let urlIsValid: boolean = true;

    const dispatch = createEventDispatcher();

    const dispatchResource = (content: string | undefined) => {
        urlIsValid = true;
        
        if (!content) { return; }

        if (!isValidUrl(content)) {
            urlIsValid = false;
            return;
        }
        
        userInput = undefined;
        inputEl.blur();
        dispatch('resource', { url: content });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            dispatchResource(userInput);
        }
    };

    const focusInput = async () => {
        await tick();
        inputEl?.focus();
    };

    onMount(() => {
        focusInput();
    });
</script>

<form 
    on:submit|preventDefault={() => { dispatchResource(userInput); }}>

    <div>
        <input
            type="text"
            name="resource"
            class:error={!urlIsValid}
            on:keydown={handleKeyDown}
            bind:value={userInput}
            bind:this={inputEl}
            placeholder="Enter URL"
            disabled={disableInput} 
        />

        <button type="submit" disabled={!userInput || disableInput}>Add</button>
    </div>

    {#if !urlIsValid}
        <p class="error-message">Invalid URL</p>
    {/if}
</form>

<style>
    form {
        display: flex;
        flex-direction: column;
    }

    form > div {
        display: flex;
        gap: 0.5rem;
        
    }

    input {
        flex-grow: 1;
    }

    input.error {
        border-color: red;
    }

    p.error-message {
        margin: 0;
        color: red;
        font-size: 0.8em;
    }

    button {
        padding: 0.5rem 1rem;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 0.25rem;
        cursor: pointer;
        height: min-content;
        flex-shrink: 0;
    }

    button:disabled {
        background-color: #6c757d;
        cursor: not-allowed;
    }
</style>