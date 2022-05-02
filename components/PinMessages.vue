<template>
    <div class="pin_messages px-2 lg:px-3 flex items-center justify-between">
        <div class="spin_slide" v-if="loading">
            <a-spin size="small" />
        </div>
        <div class="w-full flex items-center">
            <swiper
                class="swiper swiper_thumbs"
                style="width: 10px;"
                :options="swiperOptionThumbs"
                :ref="`pin_thumb_${chatData.chat_uid}`">
                <swiper-slide
                    v-for="(mess, index) in currentPin.results"
                    class="thumb"
                    :key="`${mess.message_uid}_`+index">
                </swiper-slide>
            </swiper>
            <div class="w-full truncate">
                <swiper
                    class="swiper"
                    :options="swiperOption"
                    :ref="`pin_slide_${chatData.chat_uid}`"
                    @slideChange="onSlideChange">
                    <swiper-slide
                        v-for="(mess, index) in currentPin.results"
                        :key="mess.id">
                        <div class="cursor-pointer truncate select-none" @click="itemHandler(mess, index)">
                            <label class="text-xs font-semibold block cursor-pointer">
                                {{ $t('chat.pinned_message', {index: index+1}) }}
                            </label>
                            <div class="truncate text-xs size-text" v-if="mess.text.length">
                                {{mess.text}}
                            </div>
                            <template v-else>
                                <template v-if="mess.share">
                                    <div class="reply_text text-sm">{{$t(mess.share.model)}}</div>
                                </template>
                                <div v-else class="reply_text text-sm">{{$t('chat.file_and_image')}}</div>
                            </template>
                        </div>
                    </swiper-slide>
                </swiper>
            </div>
        </div>
        <div>
            <a-badge
                :count="currentPin.count"
                class="pin_count cursor-pointer"
                @click="openPinDrawer()">
                <a-button
                    :loading="pinLoader"
                    type="link"
                    size="large"
                    class="text-current"
                    icon="pushpin" />
            </a-badge>
        </div>
        <PinDrawer
            :currentPin="currentPin"
            :messageSearch="messageSearch"
            :chatData="chatData" />
    </div>
</template>

<script>
import { Swiper, SwiperSlide } from 'vue-awesome-swiper'
import 'swiper/css/swiper.css'
import ChatEventBus from '../utils/ChatEventBus'
import PinDrawer from './PinDrawer'
export default {
    name: "ChatPinMessage",
    props: {
        chatData: {
            type: Object,
            required: true
        },
        currentPin: {
            type: Object,
            required: true
        },
        messageSearch: {
            type: Function,
            default: () => {}
        }
    },
    data() {
        return {
            swiperOption: {
                autoHeight: true,
                direction: 'vertical',
                slidesPerView: 1,
                mousewheel: true,
                touchRatio: 0,
                draggable: false
            },
            swiperOptionThumbs: {
                autoHeight: true,
                direction: 'vertical',
                spaceBetween: 2,
                slidesPerView: 'auto',
                centeredSlides: true,
                touchRatio: 0,
                slideToClickedSlide: true,
                draggable: false
            },
            pinLoader: false,
            loading: false
        }
    },
    computed: {
        swiper() {
            return this.$refs[`pin_slide_${this.chatData.chat_uid}`].$swiper
        },
        swiperThumb() {
            return this.$refs[`pin_thumb_${this.chatData.chat_uid}`].$swiper
        }
    },
    mounted() {
        this.$nextTick(() => {
            this.swiper.controller.control = this.swiperThumb
            this.swiperThumb.controller.control = this.swiper
        })
        ChatEventBus.$on('PINNED_MESSAGE', () => {
            try {
                if(this.$refs[`pin_slide_${this.chatData.chat_uid}`] && this.$refs[`pin_slide_${this.chatData.chat_uid}`].$swiper && this.currentPin.results.length > 1)
                    this.$refs[`pin_slide_${this.chatData.chat_uid}`].$swiper.slideTo(0, 300)
            } catch(e) {
                console.log(e)
            }
        })
        ChatEventBus.$on('SLIDE_TO_PIN', (mess) => {
            const index = this.currentPin.results.findIndex(pin => pin.id === mess.id)
            if(index !== -1)
                this.swiper.slideTo(index, 300)
        })
    },
    methods: {
        async onSlideChange() {
            const length = this.currentPin.results.length-1
            if(length >= 9 && this.currentPin.next && !this.loading) {
                if(this.swiper.activeIndex === length) {
                    try {
                        this.loading = true
                        await this.$store.dispatch('chat/getPinMessageScroll')
                    } catch(e) {

                    } finally {
                        this.swiper.slideTo(this.swiper.activeIndex+1, 0)
                        this.loading = false
                    }
                }
            }
        },
        openPinDrawer() {
            ChatEventBus.$emit('OPEN_PIN_DRAWER')
        },
        itemHandler(mess, index) {
            this.pinLoader = true
            this.messageSearch(mess)
                .then(() => {
                    this.pinLoader = false
                    if(this.currentPin.results.length === index+1)
                        this.swiper.slideTo(0, 300)
                    else
                        this.swiper.slideTo(index+1, 300)
                })
                .catch(()=>{
                    this.pinLoader = false
                })
        }
    },
    components: {
        Swiper,
        SwiperSlide,
        PinDrawer
    }
}
</script>

<style lang="scss">
    .pin_messages{
        height: 42px;
        border-bottom: 1px solid var(--borderColor);
        overflow: hidden;
        position: relative;
        background-color: var(--bgColor5);
        .pin_count{
            .ant-badge-count{
                font-size: 8px;
                padding: 0 1px;
                top: 10px;
                right: 10px;
                min-width: 16px;
                height: 16px;
                line-height: 16px;
            }
        }
        .size-text{
                
             @media(min-width: 1900px){
                max-width: 70vw;
            }
            @media(min-width: 1700px){
                max-width: 67vw;
            }
            @media(min-width: 1500px){
                max-width: 63vw;
            }
            @media(min-width: 1300px){
                max-width: 58vw;
            }
            @media(min-width: 1200px){
                max-width: 53vw;
            }
        
        }
        .spin_slide{
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 10;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(255, 255, 255, 0.5);
        }
        .swiper_thumbs{
            padding-top: 2px;
            margin-top: -10px;
            .thumb{
                width: 2px;
                height: 15px;
                background: var(--primaryColor);
                border-radius: 1px;
                &:not(.swiper-slide-active){
                    opacity: 0.3;
                }
            }
        }
        .swiper{
            height: 42px;
            .swiper-slide{
                display: flex;
                align-items: center;
            }
        }
    }
</style>