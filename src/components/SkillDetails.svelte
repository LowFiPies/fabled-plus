<script lang='ts'>
    import { saveDataInternal, updateSidebar } from '../data/store';
    import ProInput                            from './input/ProInput.svelte';
    import type ProSkill                       from '$api/proskill';
    import SearchableSelect                    from './input/SearchableSelect.svelte';
    import Toggle                              from './input/Toggle.svelte';
    import AttributeInput                      from './input/AttributeInput.svelte';
    import IconInput                           from './input/IconInput.svelte';
    import { skills }                          from '../data/skill-store';
    import DynamicAttributeInput               from '$input/DynamicAttributeInput.svelte';

    export let data: ProSkill;

    $: {
        if (data?.name) updateSidebar();
        saveDataInternal();
    }
</script>

{#if data}
    <ProInput label='Name'
              tooltip='The name of the skill. This should not contain color codes'
              bind:value={data.name} />
    <ProInput label='Cooldown'
              tooltip='The time in seconds before the skill can be cast again (only works with the Cast trigger)'>
        <AttributeInput bind:value={data.cooldown} />
    </ProInput>
    <ProInput label='Cooldown Message'
              tooltip='Whether to send a message when attempting to run the skill while in cooldown'>
        <Toggle bind:data={data.cooldownMessage} />
    </ProInput>
    <ProInput label='Cast Message'
              tooltip='The message to display to players around the caster when the skill is cast. The radius of the area is in the config.yml options'
              bind:value={data.castMessage} />
    <ProInput label='Combo'
              tooltip='The click combo to assign the skill (if enabled). Use L, R, S, LS, RS, P, Q and F for the types of clicks separated by spaces. For example, "L L R R" would work for 4 click combos.'
              bind:value={data.combo} />

{/if}

<style>
    .header {
        grid-column: 1 / -1;
        font-size: 1.2em;
        font-weight: bold;
        text-align: center;
        padding-bottom: 1rem;
    }

    .header::before {
        content: ' ';
        display: block;
        width: 40%;
        height: 1px;
        background: white;
        margin: 1rem auto;
    }
</style>
