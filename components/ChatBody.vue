<template>
    <div class="chat_body">
        <template v-if="activeChat">
            <div class="hfl chat_body__wrapper">
                <ChatBodyHeader :replySearch="replySearch" />
                <div
                    ref="chatBodyArea"
                    @scroll="scrollAction" 
                    :class="currentPin && currentPin.results.length && 'open_pin'"
                    class="chat_body__messages py-2 px-2 lg:px-3">
                    
                    <template v-if="activeChat.is_active">
                        <infinite-loading
                        
                            v-bind:distance="5"
                            :identifier="`${ activeChat.chat_uid }_top`"
                            direction="top"
                            @infinite="upScrollHandler">
                            <div slot="spinner">
                                <a-spin  v-show="loading" />
                            </div>
                            <div slot="no-more"></div>
                            <div slot="no-results"></div>
                        </infinite-loading>

                        <div
                            v-if="messages"
                            class="chat__log"
                            ref="chatLog">
                            <template v-for="(item, index) in messages.value">
                                <ChatMessage
                                    :key="`${ item.id }_${ index }`"
                                    :replySearch="replySearch"
                                    :user="user"
                                    :messageItem="item" />
                            </template>
                        </div>

                        <infinite-loading
                            v-if="messages && messages.prev && messages.prev.length"
                            v-bind:distance="10"
                            :identifier="`${ activeChat.chat_uid }_${ messages.prev }`"
                            @infinite="downScrollHandler">
                            <div slot="spinner">
                                <a-spin />
                            </div>
                            <div slot="no-more"></div>
                            <div slot="no-results"></div>
                        </infinite-loading>

                        <transition name="slide">
                            <div
                                v-if="replyMessage"
                                class="reply_dummy"></div>
                        </transition>
                    </template>
                </div>
                <a-badge
                    class="scrol_down_btn"
                    v-show="showDownBtn" 
                    :count="missedCount"
                    :number-style="{ backgroundColor: '#1d65c0' }" >
                    <a-button @click="downAction"  :loading="loadingDown"
                              type="primary"  shape="circle" icon="down" size="large"  />
                </a-badge>
                <ChatFooter
                    v-if="activeChat.is_active"
                    ref="ChatFooter" />
                <div class="chat_drawer"></div>
            </div>
        </template>

        <div v-if="!activeChat" class="dialog_close h-full flex flex-col items-center justify-center">
            <a-spin :spinning="dialogLoading">
                <div class="empty_chat">
                    <a-icon type="message"  two-tone-color="#1d65c0" class="mb-4" theme="twoTone" />
                    <div>
                        <span v-html="$t('chat.select_chat')"></span>
                        <span class="cursor-pointer create" @click="$store.commit('chat/TOGGLE_CREATE_CHAT', true)">{{$t('chat.create_new_chat')}}</span>
                    </div>
                </div>
            </a-spin>
        </div>
    </div>
</template>

<script>
import ChatBodyHeader from './ChatBodyHeader'
import InfiniteLoading from 'vue-infinite-loading'
import ChatMessage from './ChatMessage/index.vue'
import ChatFooter from './ChatFooter'
import ChatEventBus from '../utils/ChatEventBus'
import { mapState, mapGetters, mapActions, mapMutations } from 'vuex'
export default {
    name: "ChatBody",
    components: {
        ChatBodyHeader,
        InfiniteLoading,
        ChatMessage,
        ChatFooter
    },
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat,
            user: state => state.user.user,
            pinMessage: state => state.chat.pinMessage,
            dialogLoading: state => state.chat.dialogLoading,
            messageListPrev: state => state.chat.messageListPrev
        }),
        ...mapGetters({
            chatMessages: 'chat/chatMessages',
            getReplyMessage: 'chat/replyMessage',
            getCountMessages: 'chat/getCountMessages',
           
        }),
        messages() {
            return this.chatMessages(this.activeChat.chat_uid)
        },
        replyMessage() {
            return this.getReplyMessage(this.activeChat.chat_uid)
        },
        currentMessage() {
            if(this.activeChat && this.messages){
                return this.messages
            }
            else
                return false
        },
        currentPin() {
            if(this.activeChat && this.pinMessage[this.activeChat.chat_uid])
                return this.pinMessage[this.activeChat.chat_uid]
            else
                return false
        },
        missedCount(){
            return this.getCountMessages(this.activeChat.chat_uid)
        }
    },
    data() {
        return {
            loading: false,
            emptyMessage: false,
            showDownBtn: false,
            loadingDown: false,
        }
    },
    watch: {
        activeChat(val) {
            if(val) {
                // if(!this.showDownBtn)
                
                this.scrollDown()
               
                this.scrollAction()

                setTimeout(() => {
                    this.clearMessageCount(this.activeChat.chat_uid)
                }, 1000);
               
            }
        }
    },
    methods: {
        ...mapActions({
            getMessageScroll: 'chat/getMessageScroll',
            getMessage: 'chat/getMessage',
            getMessageDownScroll: 'chat/getMessageDownScroll',
            getPinMessage: 'chat/getPinMessage'
        }),
        ...mapMutations({
            clearMessage: "chat/clearMessage",
            setScrollToped: "chat/setScrollToped",
            clearMessageCount: "chat/clearMessageCount",
        }),
        async downAction(){
            this.loadingDown = true
            await this.scrollTestPrev()
            this.scrollDown()
            this.clearCount(this.activeChat.chat_uid)
            this.loadingDown = false
        },
        async clearCount(){
            if(this.missedCount > 0){ 
                this.clearMessageCount(this.activeChat.chat_uid)
            }
        },
        scrollAction(){
            this.$nextTick(() => {
                let container = this.$refs['chatBodyArea']
                if(container !== undefined){ 
                    const currScroll = container.scrollHeight - container.scrollTop,
                        checkScroll = container.clientHeight + 100

                    if(currScroll >= checkScroll) {
                        this.showDownBtn = true
                        this.setScrollToped(true)
                    } else {
                        this.showDownBtn = false
                        this.setScrollToped(false)
                        this.clearCount()
                    }
                }
            })
        },
        async replySearch(message) {
            const messageScroll = (elem) => {
                let top = elem.offsetTop - 65

                if(this.currentPin && this.currentPin.results.length)
                    top = top - 43

                //document.querySelector('.chat-content-scroll-area').scrollTo({top, behavior: 'smooth'})
                elem.scrollIntoView({block: "center", behavior: "smooth"})

                if (!elem.classList.contains('flashing')) {
                    let observer = new IntersectionObserver(() => {
                        observer.unobserve(elem)
                        elem.classList.add('flashing')
                        setTimeout(() => {
                            elem.classList.remove('flashing')
                        }, 1200)
                    }, this.observerOptions)
                    observer.observe(elem)
                }
            }
            // try {

            const searchMessage = this.currentMessage.value.find(item =>{ 
                // console.log("item", item)
                // console.log("message", message)
                return  item.message_uid === message.message_uid
            }
            )

            if(searchMessage) {
                const elem = document.getElementById(`message_${ searchMessage.message_uid }`)
                messageScroll(elem)
            } else {
                await this.$store.dispatch('chat/searchMessages', message)
                const elem = document.getElementById(`message_${ message.message_uid }`)
                messageScroll(elem)
            }
            // } catch(e) {
            //     console.log(e)
            // } finally {
            ChatEventBus.$emit('CLOSE_PIN_DRAWER')
            // }
        },
        scrollDown(){
            this.$nextTick(() => {
                this.$refs['chatBodyArea'].scrollTop = this.$refs['chatBodyArea'].scrollHeight          
            })
        },
        async  scrollTestPrev(){
            if(this.messageListPrev){
                await  this.getMessage({refresh: true})
            }
        },
        async downScrollHandler() {
            if(this.messages && !this.loading) {
                if(this.messages.prev && this.messages.prev.length) {
                    try {
                        this.loading = true
                        await this.getMessageDownScroll()
                        if(this.messages.bottomStatus)
                            $state.loaded()
                        else
                            $state.complete()
                    } catch(e) {
                    } finally {
                        this.loading = false
                    }
                } else {
                    $state.complete()
                }
            }
        },
        async upScrollHandler($state) {

            if(this.messages && !this.loading) {
                // Запрашиваем сообщение при скролле
            
                if(this.messages.next && this.messages.next.length) {
                    try {
                        this.loading = true
                        await this.getMessageScroll()
                        if(this.messages.status)
                            $state.loaded()
                        else
                            $state.complete()
                    } catch(e) {
                    } finally {
                        this.loading = false
                    }
                } else if(this.messages.next === undefined){
                    await this.clearMessage()
                    await this.getMessage()
                    await this.getPinMessage({ page_size: 10, page: 1 })
                   
                   
                    if(this.messages && this.messages.status)
                        $state.loaded()
                    else
                        $state.complete()
                }
                   
            } else {
                // Запрашиваем сообщения изначально
                try {
                    this.loading = true
                 
                    await this.getMessage()
                    this.scrollDown()
                    await this.getPinMessage({ page_size: 10, page: 1 })
                   
                    this.scrollDown()
                    if(this.messages && this.messages.status)
                        $state.loaded()
                    else
                        $state.complete()
                } catch(e) {
                    console.log(e)
                } finally {
                    this.scrollDown()

                    if(!this.messages)
                        this.emptyMessage = true
                        
                    this.loading = false
                }
            }
        },

    },
    mounted() {
        ChatEventBus.$on('arreaScroll', () => {
            this.$nextTick(() => {
                let container = this.$refs['chatBodyArea']
                if(container){ 
                    const currScroll = container.scrollHeight - container.scrollTop,
                        checkScroll = container.clientHeight + 100
                    if(currScroll <= checkScroll) {
                        if(container !== undefined)
                            container.scrollTop = container.scrollHeight
                    }
             
                }
            })
        })
        ChatEventBus.$on('arreaScrollDown', () => {
            this.scrollDown()
            this.clearCount()
        })
    }
}
</script>

<style lang="scss">
    .scrol_down_btn{
        position: absolute;
        bottom: 20%;
        right: 4%;
    }
</style>