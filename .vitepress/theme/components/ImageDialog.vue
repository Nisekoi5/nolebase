<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { inBrowser, useRouter } from 'vitepress'

interface ImageItem {
  src: string
  alt?: string
}

interface Props {
  src?: string
  alt?: string
  images?: Array<string | ImageItem>
}

type ActivatorProps = {
  onClick: () => void
}

const props = defineProps<Props>()
const router = useRouter()
const visible = defineModel<boolean>({ default: false })
const indexModel = defineModel<number>('index', { default: 0 })

const normalizedImages = computed<ImageItem[]>(() => {
  if (props.images?.length) {
    return props.images.map(image =>
      typeof image === 'string' ? { src: image } : image,
    )
  }

  return props.src ? [{ src: props.src, alt: props.alt }] : []
})

function clampIndex(value: number) {
  // 如果index小于0或者大于数组长度。则跳到开头或者结尾
  if (value < 0) {
    return normalizedImages.value.length - 1
  } else if (value >= normalizedImages.value.length) {
    return 0
  }
  return value
}

function setCurrentIndex(value: number) {
  indexModel.value = clampIndex(value)
}

const currentImage = computed<ImageItem>(() =>
  normalizedImages.value[indexModel.value]!
)

const canRenderImage = computed(() => Boolean(currentImage.value?.src))
const hasMultipleImages = computed(() => normalizedImages.value.length > 1)

function setVisible(value: boolean) {
  visible.value = value
}



const dialogRef = ref<HTMLDivElement | null>(null)

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

let isDialogActive = false
router.onBeforePageLoad = () => {
  if (isDialogActive) {
    isDialogActive = false
    close()
    return false
  }
  return true
}

function open() {
  if (!canRenderImage.value || visible.value) return

  // 插入一个hash路由用于模拟拦截后退操作
  history.replaceState({ scrollPosition: window.scrollY }, '')
  const url = new URL(location.href)
  url.hash = '#dialog'
  history.pushState({}, '', url.href)
  isDialogActive = true
  setVisible(true)
}

function close() {
  setVisible(false)
}

function prevImage() {
  if (!hasMultipleImages.value) return
  setCurrentIndex(indexModel.value - 1)
}

function nextImage() {
  if (!hasMultipleImages.value) return
  setCurrentIndex(indexModel.value + 1)
}

function handleBackdropClick(event: MouseEvent) {
  if (event.target === dialogRef.value) {
    history.back()
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (!visible.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    history.back()
    return
  }

  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    prevImage()
    return
  }

  if (event.key === 'ArrowRight') {
    event.preventDefault()
    nextImage()
  }
}

const activatorProps = computed<ActivatorProps>(() => ({
  onClick: open,
}))


watch(
  visible,
  (newValue) => {
    if (newValue) {
      lockScroll()
    }
    else {
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
      :aria-label="currentImage?.alt || alt || 'Image preview'" @click="handleBackdropClick">
      <button v-if="hasMultipleImages" class="product-image-dialog-nav product-image-dialog-nav-prev" type="button"
        aria-label="Previous image" @click.stop="prevImage">
        <span>&lsaquo;</span>
      </button>

      <button v-if="hasMultipleImages" class="product-image-dialog-nav product-image-dialog-nav-next" type="button"
        aria-label="Next image" @click.stop="nextImage">
        <span>&rsaquo;</span>
      </button>

      <button class="product-image-dialog-close" type="button" aria-label="Close image preview" @click="close">
        <span>&times;</span>
      </button>

      <div v-if="hasMultipleImages" class="product-image-dialog-count">
        {{ indexModel + 1 }} / {{ normalizedImages.length }}
      </div>

      <img v-if="canRenderImage" class="product-image-dialog-img" :src="currentImage?.src"
        :alt="currentImage?.alt || alt || 'Image'">
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

.product-image-dialog-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 999px;
  background: rgba(20, 20, 22, 0.72);
  color: #fff;
  font-size: 30px;
  line-height: 1;
  cursor: pointer;

}

.product-image-dialog-nav span,
.product-image-dialog-close span {
  vertical-align: text-top;
}

.product-image-dialog-nav-prev {
  left: 16px;
}

.product-image-dialog-nav-next {
  right: 16px;
}

.product-image-dialog-count {
  position: absolute;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(20, 20, 22, 0.72);
  color: #fff;
  font-size: 12px;
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
