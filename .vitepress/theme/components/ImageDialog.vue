<script setup lang="ts">
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inBrowser } from 'vitepress'
interface Props {
  modelValue?: boolean
  src?: string
  alt?: string
}

type ActivatorProps = {
  onClick: () => void
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const instance = getCurrentInstance()
const isControlled = computed(() =>
  Object.prototype.hasOwnProperty.call(instance?.vnode.props ?? {}, 'modelValue'),
)

const innerValue = ref(false)
const visible = computed(() =>
  isControlled.value ? Boolean(props.modelValue) : innerValue.value,
)

function setVisible(value: boolean) {
  if (isControlled.value) {
    emit('update:modelValue', value)
  }
  else {
    innerValue.value = value
  }
}

const dialogRef = ref<HTMLDivElement | null>(null)
const canRenderImage = computed(() => Boolean(props.src))

const scrollState = {
  x: 0,
  y: 0,
  bodyOverflow: '',
  bodyPaddingRight: '',
  bodyPosition: '',
  bodyTop: '',
  bodyLeft: '',
  bodyRight: '',
  bodyWidth: '',
  htmlOverflow: '',
  htmlOverscrollBehavior: '',
}

let hasDialogRouteEntry = false

function lockScroll() {
  if (!inBrowser) return

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth

  scrollState.x = window.scrollX
  scrollState.y = window.scrollY
  scrollState.bodyOverflow = document.body.style.overflow
  scrollState.bodyPaddingRight = document.body.style.paddingRight
  scrollState.bodyPosition = document.body.style.position
  scrollState.bodyTop = document.body.style.top
  scrollState.bodyLeft = document.body.style.left
  scrollState.bodyRight = document.body.style.right
  scrollState.bodyWidth = document.body.style.width
  scrollState.htmlOverflow = document.documentElement.style.overflow
  scrollState.htmlOverscrollBehavior = document.documentElement.style.overscrollBehavior

  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${scrollState.y}px`
  document.body.style.left = `-${scrollState.x}px`
  document.body.style.right = '0'
  document.body.style.width = '100%'
  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'contain'

  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`
  }
}

function unlockScroll() {
  if (!inBrowser) return

  document.body.style.overflow = scrollState.bodyOverflow
  document.body.style.paddingRight = scrollState.bodyPaddingRight
  document.body.style.position = scrollState.bodyPosition
  document.body.style.top = scrollState.bodyTop
  document.body.style.left = scrollState.bodyLeft
  document.body.style.right = scrollState.bodyRight
  document.body.style.width = scrollState.bodyWidth
  document.documentElement.style.overflow = scrollState.htmlOverflow
  document.documentElement.style.overscrollBehavior = scrollState.htmlOverscrollBehavior

  window.scrollTo(scrollState.x, scrollState.y)
}

async function pushDialogRoute() {
  // 如果已经打开了当前Dialog了
  if (hasDialogRouteEntry) return

  hasDialogRouteEntry = true

  history.replaceState({ scrollPosition: window.scrollY }, '')
  const state = { id: 'stopBack' }
  history.pushState(state, '', window.location.href)
  setVisible(true)
}

function open() {
  if (!props.src) return
  // 如果已激活了就返回避免重复弹出添加多个记录
  if (visible.value) return
  void pushDialogRoute()
}

function close() {
  setVisible(false)

  if (hasDialogRouteEntry) {
    hasDialogRouteEntry = false
    window.history.back()
  }
}

// 点击视口外关闭
function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    close()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

const activatorProps = computed<ActivatorProps>(() => ({
  onClick: open
}))

watch(
  visible,
  (newValue) => {
    if (newValue) {
      lockScroll()
    } else {
      unlockScroll()
    }
  },
  { immediate: true },
)

onMounted(() => {
  if (inBrowser) {
    window.addEventListener('keydown', handleKeydown)
  }

})
onBeforeUnmount(() => {
  if (inBrowser) {
    window.removeEventListener('keydown', handleKeydown)
  }
  if (visible.value) unlockScroll()
})

</script>

<template>
  <slot name="activator" :props="activatorProps" />

  <Teleport to="body">
    <div v-show="visible" ref="dialogRef" class="product-image-dialog" role="dialog" aria-modal="true"
      :aria-label="alt || '商品图片预览'" @click="handleBackdropClick">
      <button class="product-image-dialog-close" type="button" aria-label="关闭图片预览" @click="close">
      <span>
        ×
      </span>
      </button>

      <img v-if="canRenderImage" class="product-image-dialog-img" :src="src" :alt="alt || '商品图片'" />
    </div>
  </Teleport>
</template>

<style scoped>
.product-image-dialog {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4vh 4vw;
  background: rgba(10, 10, 12, 0.72);
  backdrop-filter: blur(6px);
}

.product-image-dialog-close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 999px;
  background: rgba(20, 20, 22, 0.72);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.product-image-dialog-img {
  display: block;
  width: auto;
  max-width: 100%;
  max-height: 92vh;
  margin: 0 auto;
  border-radius: 16px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
}
</style>
