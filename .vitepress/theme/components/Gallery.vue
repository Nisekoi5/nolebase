<script lang="ts" setup>
const props = defineProps<{
    posterSrc?: string
    href?: string
    creator: string
    title?: string
    describe: string
}>()

</script>

<template>
    <div bg="zinc-100 dark:zinc-800 " flex="~ <sm:wrap" w-full rounded-xl p-4 mt-5>
        <!-- <div flex justify-center flex-shrink-0 h-60 w-40 > -->
        <div flex="~ shrink-0 <sm:grow-1 justify-center" w="40 <sm:100%" h="55 <sm:45" rounded overflow-hidden>
            <slot name="image">
                <img :src="props.posterSrc" />
            </slot>
        </div>
        <div flex="~ col" p="4 <sm:2">
            <div flex="~ col 1">
                <div pb-2 flex="~ items-baseline">
                    <div text="2xl <sm:lg" font-semibold>
                        <slot name="name">
                            {{ props.title }}
                        </slot>
                    </div>
                    <div pl-1>
                        <slot name="creator">
                            {{ props.creator }}
                        </slot>
                    </div>
                </div>
                <div text-sm line-clamp-5>
                    <slot name="describe">
                        {{ props.describe }}
                    </slot>
                </div>
            </div>
            <a :href="props.href" class="hover:no-underline! "
                bg="zinc-50 dark:zinc-700 hover:white  dark:hover:zinc-600 active:zinc-50 dark:active:zinc-700"
                transition="all 200 ease" mt-2 block w-fit flex items-center rounded-lg p-2 text-xs shadow-sm
                target="_blank">
                <span class="i-ic:outline-arrow-outward" /> View
            </a>
        </div>
    </div>
</template>
<style scoped>
img {
    width: 100%;
}
</style>