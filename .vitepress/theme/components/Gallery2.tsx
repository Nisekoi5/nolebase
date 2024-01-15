import { defineComponent, SlotsType } from 'vue'

export default defineComponent({
    props: {
        image: String,
        href: String,
        creator: String,
        title: String,
        describe: String,
        linkText: String,
    },
    slots: Object as SlotsType<{
        describe: () => any
    }>,
    setup(props, { slots }) {
        return () => <div bg="zinc-100 dark:zinc-800" flex="~ <sm:wrap" w-full rounded-xl p-4 mt-5 >
            {slots.describe()}
        </div >
    },

})