import { defineComponent, SlotsType, Text } from 'vue'

import type { VNode } from 'vue'
export default defineComponent({
    props: {
        image: {
            type: String,
            require: false
        },
        href: {
            type: String,
            require: false
        },
        creator: {
            type: String,
            require: false
        },
        title: {
            type: String,
            require: false
        },
        describe: {
            type: String,
            require: false
        },
        linkText: {
            default: 'View', type: String
        },
    },
    slots: Object as SlotsType<{
        default?: () => any,
        title?: () => any
        creator?: () => any
        image?: () => any
        describe?: () => any
    }>,
    setup(props, { slots }) {
        const reg = /^\s+/
        const renderSlot = (vnodes: VNode[]) => {
            vnodes.forEach((vnode) => {
                // console.log(vnode)
                if (vnode.type === Text) {
                    // 替换掉直接文本节点的首个换行符
                    vnode.children = (vnode.children as string).replace(reg, '')
                } else if (vnode.type == '') {
                    // '做些别的'
                }

            })
            return vnodes
        }
        return () => <div bg="zinc-100 dark:zinc-800 " flex="~ <sm:wrap" w-full rounded-xl p-4 mt-5>
            <div flex="~ shrink-0 <sm:grow-1 justify-center" w="40 <sm:100%" h="55 <sm:45" rounded overflow-hidden>
                {slots.image ? renderSlot(slots.image()) : <img src={props.image} />}
            </div>
            <div flex="~ col" p="4 <sm:2">
                <div flex="~ col 1">
                    <div pb-2 flex="~ items-baseline">
                        <div>
                            <span text="2xl <sm:lg" font-semibold>
                                {slots.title ? renderSlot(slots.title()) : props.title}
                            </span>
                            <span pl-1>
                                {slots.creator ? renderSlot(slots.creator()) : props.creator}
                            </span>
                        </div>

                    </div>
                    <div text-sm line-clamp-5 whitespace-pre-line>
                        {slots.describe ? renderSlot(slots.describe()) : props.describe}
                    </div>
                </div>
                <a href={props.href} class="hover:no-underline! "
                    bg="zinc-50 dark:zinc-700 hover:white  dark:hover:zinc-600 active:zinc-50 dark:active:zinc-700"
                    transition="all 200 ease" mt-2 block w-fit flex items-center rounded-lg p-2 text-xs shadow-sm
                    target="_blank">
                    <span class="i-ic:outline-arrow-outward" /> {props.linkText}
                </a>
            </div>
        </div >
    },

})