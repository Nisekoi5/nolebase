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
        disableNewline: {
            default: true, type: Boolean
        }
    },
    slots: Object as SlotsType<{
        default?: () => any,
        title?: () => any
        creator?: () => any
        image?: () => any
        describe?: () => any
    }>,
    setup(props, { slots }) {
        const regxSpace = /(?!^ ) /mg
        const renderSlot = (vnodes: VNode[]) => {
            // 如果spacePreLine为真则将空格替换为换行符
            // 这个函数将插槽传递过来的被SFC编译掉的文本进行处理后返回
            // 因为SFC编译后文本中的空格个换行符会被压缩成一个,修改compilerOptions会导致激活不匹配，也只能这样了
            // 否则需要在使用该组件的时候每行后面增加一个<br>标签

            if (props.disableNewline) return vnodes
            vnodes.forEach((vnode) => {
                // console.log(vnode)
                if (vnode.type === Text) {
                    // console.log(vnode.children)
                    // 除首个空格以外的空格替换为换行符
                    vnode.children = (vnode.children as string).replace(regxSpace, '\n')
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
                <a href={props.href} class="hover:no-underline!"
                    bg="zinc-50 dark:zinc-700 hover:white  dark:hover:zinc-600 active:zinc-50 dark:active:zinc-700"
                    transition="all 200 ease"
                    mt-2 block w-fit flex items-center rounded-lg p-2 text-xs shadow-sm
                    target="_blank">
                    <span class="i-ic:outline-arrow-outward"></span>{props.linkText}
                </a>
            </div>
        </div>
    },

})