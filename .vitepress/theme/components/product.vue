<script setup lang="ts">
import { computed, ref } from 'vue'
import ProductImageDialog from './ImageDialog.vue'

type ProductStatus = 'pending' | 'bought' | 'skip'

interface ProductImage {
    src: string
    alt?: string
}

interface ProductTag {
    label: string
    cls: string
}

interface ProductStatusMeta {
    label: string
    cls: string
}

interface ProductDetailRow {
    key: string
    label: string
    value: string
    isLink?: boolean
}

interface Props {
    // 商品名称（必填）
    name: string
    /** 品牌或店铺名 */
    brand?: string
    /** 价格数值 */
    price?: number | string | null
    /** 货币符号，默认 ¥ */
    currency?: string
    /** 购买状态 */
    status?: ProductStatus
    /** 购买平台 */
    store?: string
    /** 尺码，如 M / 42 */
    size?: string
    /** 颜色 */
    color?: string
    /** 季节，如 夏季 / 全年 */
    season?: string
    /** 材质，如 100% 棉 */
    material?: string
    /** 购买链接 URL */
    link?: string
    /** 图片列表，多图时显示缩略图 */
    images?: ProductImage[]
    /** 备注说明 */
    notes?: string
}

const props = withDefaults(defineProps<Props>(), {
    brand: '',
    price: null,
    currency: '¥',
    status: 'pending',
    size: '',
    color: '',
    season: '',
    material: '',
    link: '',
    images: () => [],
    notes: ''
})

const expanded = ref(false)
const activeIndex = ref(0)

const statusMap: Record<ProductStatus, ProductStatusMeta> = {
    pending: { label: '待购买', cls: 'status-pending' },
    bought: { label: '已购买', cls: 'status-bought' },
    skip: { label: '暂跳过', cls: 'status-skip' }
}

const currentStatus = computed<ProductStatusMeta>(() => statusMap[props.status])

const tags = computed<ProductTag[]>(() =>
    [
        props.size && { label: props.size, cls: 'tag-size' },
        props.color && { label: props.color, cls: 'tag-color' },
        props.season && { label: props.season, cls: 'tag-season' },
        props.material && { label: props.material, cls: 'tag-material' },
        props.store && { label: props.store, cls: 'tag-store' }
    ].filter((tag): tag is ProductTag => Boolean(tag))
)

const detailRows = computed<ProductDetailRow[]>(() =>
    [
        props.size && { key: 'size', label: '尺码', value: props.size },
        props.color && { key: 'color', label: '颜色', value: props.color },
        props.season && { key: 'season', label: '季节', value: props.season },
        props.material && { key: 'material', label: '材质', value: props.material },
        props.store && { key: 'store', label: '平台', value: props.store },
        props.link && { key: 'link', label: '链接', value: props.link, isLink: true }
    ].filter((row): row is ProductDetailRow => Boolean(row))
)

const hasImages = computed(() => props.images.length > 0)
const hasMoreImages = computed(() => props.images.length > 1)
const currentImage = computed<ProductImage | null>(() => props.images[activeIndex.value] ?? null)

function selectImage(index: number) {
    activeIndex.value = index
}

</script>

<template>
    <div class="product-card my-4">
        <!-- 预览图片 -->
        <div class="product-img-wrap">
            <ProductImageDialog
                v-if="hasImages"
                v-model:index="activeIndex"
                :images="images"
                :alt="currentImage?.alt || name"
            >
                <template #activator="{ props: activatorProps }">
                    <img :src="currentImage?.src" :alt="currentImage?.alt || name" class="product-main-img"
                        v-bind="activatorProps" />
                </template>
            </ProductImageDialog>
            <div v-else class="product-img-placeholder">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                    <path
                        d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10a2 2 0 002 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
                </svg>
            </div>

            <!-- 购买状态 -->
            <span class="product-badge" :class="currentStatus.cls">{{ currentStatus.label }}</span>
        </div>

        <!-- Thumbnail strip (visible when expanded or >1 image) -->
        <div v-if="hasMoreImages && expanded" class="product-thumbs">
            <button v-for="(img, i) in images" :key="i" class="product-thumb" :class="{ active: activeIndex === i }"
                :aria-label="`查看第 ${i + 1} 张图片`" @click="selectImage(i)">
                <img :src="img.src" :alt="img.alt || `图片 ${i + 1}`" />
            </button>
        </div>

        <!-- Info body -->
        <div class="product-body">
            <div class="product-header">
                <div>
                    <h3 class="product-name">{{ name }}</h3>
                    <p v-if="brand" class="product-brand">{{ brand }}</p>
                </div>
                <span v-if="price !== null" class="product-price">{{ currency }} {{ price }}</span>
            </div>

            <!-- Tags -->
            <div v-if="tags.length" class="product-tags">
                <span v-for="tag in tags" :key="tag.label" class="product-tag" :class="tag.cls">{{ tag.label }}</span>
            </div>

            <!-- Expandable detail -->
            <div v-if="expanded" class="product-detail">
                <table v-if="detailRows.length" class="product-table">
                    <tbody>
                        <tr v-for="row in detailRows" :key="row.key">
                            <td class="product-td-key">{{ row.label }}</td>
                            <td>
                                <a v-if="row.isLink" :href="row.value" target="_blank" referrerpolicy="no-referrer">
                                    查看商品 &rarr;
                                </a>
                                <template v-else>{{ row.value }}</template>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <p v-if="notes" class="product-notes">{{ notes }}</p>
            </div>

            <!-- Expand toggle -->
            <button v-if="hasMoreImages || notes || link || material || store" class="product-toggle"
                :aria-expanded="expanded" @click="expanded = !expanded">
                {{ expanded ? '收起' : '查看更多' }}
                <svg class="product-chevron" :class="{ flipped: expanded }" width="12" height="12" viewBox="0 0 12 12"
                    fill="none">
                    <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                        stroke-linejoin="round" />
                </svg>
            </button>
        </div>
    </div>
</template>

<style scoped>
.product-card {
    --product-radius: 14px;
    --product-border: 1px solid #e8e8e8;
    --product-bg: #ffffff;
    --product-bg-img: #f5f5f3;
    --product-text: #1a1a1a;
    --product-muted: #888;
    --product-accent: #1a1a1a;

    background: var(--product-bg);
    border: var(--product-border);
    border-radius: var(--product-radius);
    overflow: hidden;
    width: 100%;
    max-width: 380px;
    font-family: -apple-system, 'PingFang SC', 'Hiragino Sans GB', sans-serif;
    transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.product-card:hover {
    box-shadow: 0 6px 24px rgba(0, 0, 0, 0.09);
    transform: translateY(-1px);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
    .product-card {
        --product-border: 1px solid #2e2e2e;
        --product-bg: #1c1c1e;
        --product-bg-img: #252527;
        --product-text: #f0f0f0;
        --product-muted: #888;
    }
}

/* VitePress dark class override */
.dark .product-card {
    --product-border: 1px solid #2e2e2e;
    --product-bg: #1c1c1e;
    --product-bg-img: #252527;
    --product-text: #f0f0f0;
    --product-muted: #888;
}

/* Image area */
.product-img-wrap {
    background: var(--product-bg-img);
    width: 100%;
    aspect-ratio: 4/3;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.product-main-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    cursor: zoom-in;
    transition: transform 0.3s ease;
}

.product-card:hover .product-main-img {
    transform: scale(1.02);
}

.product-img-placeholder {
    color: #bbb;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}

/* Badge */
.product-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    font-size: 11px;
    padding: 3px 9px;
    border-radius: 999px;
    font-weight: 500;
    letter-spacing: 0.02em;
    line-height: 1.2rem
}

.status-pending {
    background: #fff8e6;
    color: #b07800;
    border: 1px solid #ffe499;
}

.status-bought {
    background: #e8f7ef;
    color: #1a7a45;
    border: 1px solid #9adcb9;
}

.status-skip {
    background: #f0f0f0;
    color: #888;
    border: 1px solid #ddd;
}

@media (prefers-color-scheme: dark) {
    .status-pending {
        background: #332800;
        color: #f5c842;
        border-color: #664e00;
    }

    .status-bought {
        background: #0d2e1c;
        color: #4ade80;
        border-color: #1a5c33;
    }

    .status-skip {
        background: #2a2a2a;
        color: #888;
        border-color: #3a3a3a;
    }
}

.dark .status-pending {
    background: #332800;
    color: #f5c842;
    border-color: #664e00;
}

.dark .status-bought {
    background: #0d2e1c;
    color: #4ade80;
    border-color: #1a5c33;
}

.dark .status-skip {
    background: #2a2a2a;
    color: #888;
    border-color: #3a3a3a;
}

/* Thumbnails */
.product-thumbs {
    display: flex;
    gap: 6px;
    padding: 8px 12px;
    background: var(--product-bg-img);
    border-bottom: var(--product-border);
    overflow-x: auto;
    scrollbar-width: none;
}

.product-thumbs::-webkit-scrollbar {
    display: none;
}

.product-thumb {
    width: 48px;
    height: 48px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
    border: 2px solid transparent;
    padding: 0;
    background: none;
    cursor: pointer;
    transition: border-color 0.15s;
}

.product-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.product-thumb.active {
    border-color: var(--product-accent);
}

/* Body */
.product-body {
    padding: 14px 16px 12px;
}

.product-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
}

.product-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--product-text);
    margin: 0 0 2px;
    line-height: 1.3;
    letter-spacing: -0.01em;
}

.product-brand {
    font-size: 0.8rem;
    color: var(--product-muted);
    margin: 0;
}

.product-price {
    font-size: 1rem;
    font-weight: 600;
    color: var(--product-text);
    white-space: nowrap;
    flex-shrink: 0;
}

/* Tags */
.product-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 10px;
}

.product-tag {
    font-size: 11px;
    padding: 1px 10px;
    border-radius: 999px;
    font-weight: 500;
}

.tag-size {
    background: #eef6ff;
    color: #2563b0;
}

.tag-color {
    background: #f0edfe;
    color: #5b21b6;
}

.tag-season {
    background: #fff4e6;
    color: #b45309;
}

.tag-material {
    background: #FFF1E8;
    color: #B4491E;
}

.tag-store {
    background: #EAF4FF;
    color: #225EA8;
}

.dark .tag-size {
    background: #1e2d42;
    color: #93c5fd;
}

.dark .tag-color {
    background: #2a2040;
    color: #c4b5fd;
}

.dark .tag-season {
    background: #2d1e0a;
    color: #fbbf24;
}

.dark .tag-material {
    background: #0c2318;
    color: #6ee7b7;
}

.dark .tag-store {
    background: #16283D;
    color: #8EC5FF;
}

/* Detail table */
.product-detail {
    margin-top: 4px;
    margin-bottom: 8px;
    animation: slideDown 0.2s ease;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-4px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}



.product-td-key {
    color: var(--product-muted);
    width: 64px;
    font-size: 11.5px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
}







.product-notes {
    font-size: 12px;
    color: var(--product-muted);
    margin: 8px 0 0;
    line-height: 1.6;
    padding: 8px 10px;
    background: var(--product-bg-img);
    border-radius: 8px;
}

/* Toggle */
.product-toggle {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--product-muted);
    background: none;
    border: none;
    padding: 0;
    cursor: pointer;
    margin-top: 6px;
    transition: color 0.15s;
}

.product-toggle:hover {
    color: var(--product-text);
}

.product-chevron {
    transition: transform 0.2s ease;
}

.product-chevron.flipped {
    transform: rotate(180deg);
}
</style>
