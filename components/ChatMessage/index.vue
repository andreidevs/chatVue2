<template>
    <div
        class="flex items-start mt-3"
        :ref="`message_${messageItem.message_uid}`"
        :id="`message_${ messageItem.message_uid }`">
        <div
            class="flex justify-between w-full"
            :class="myMessage && 'flex-row-reverse'">
            <a-dropdown
                :trigger="['contextmenu']"
                :disabled="isViewContext">
                <div
                    class="flex"
                    :class="myMessage && 'flex-row-reverse'">
                    <div
                        v-if="messageItem.message_author"
                        :class="myMessage ? 'ml-1 lg:ml-3' : 'mr-1 lg:mr-3'">
                        <a-avatar
                            v-if="messageItem.message_author.avatar"
                            :size="windowWidth > 864 ? 44 : 28"
                            :src="messageItem.message_author.avatar" />
                        <a-avatar
                            v-else
                            :size="windowWidth > 864 ? 44 : 28"
                            icon="user" />
                    </div>
                    <div
                        class="bubble"
                        :class="[bubbleBackground, isDelete, textLength && 'large_message', expand && 'show']">
                        <div
                            class="mb-1 user_name text-xs flex item-center font-semibold">
                            <template v-if="messageItem.message_author">
                                {{messageItem.message_author.full_name}}
                            </template>
                            <template v-if="messageItem.is_system">
                                {{$t('chat.systemic')}}
                            </template>
                            <!-- <template v-if="!messageItem.is_system && messageItem.message_author">
                                {{messageItem.message_author.id === activeChat.chat_author.id ? ` - ${$t('chat.owner')}` : ''}}
                            </template> -->
                        </div>

                        <template v-if="!messageItem.is_deleted && messageItem.share">
                            <Conference
                                v-if="messageItem.share.type === 'meetings.PlannedMeetingModel'"
                                :messageItem="messageItem" />
                            <Workgroup
                                v-if="
                                    messageItem.share.type === 'workgroups.WorkGroupModel' ||
                                        messageItem.share.type === 'workgroups.WorkgroupModel' "
                                :messageItem="messageItem" />
                            <Task
                                v-if="messageItem.share.type === 'tasks.TaskModel'"
                                :messageItem="messageItem" />
                            <BusinessProcces
                                v-if="messageItem.share.type === 'processes.FinancialApplicationModel'"
                                :messageItem="messageItem" />
                            <File
                                v-if="messageItem.share.type === 'files' ||messageItem.share.type ===  'common.File'"
                                :message="messageItem" />
                            <Comments
                                v-if="messageItem.share.type === 'comments.CommentModel' || messageItem.share.type === 'comments'"
                                :messageItem="messageItem" />
                        </template>
                       
                        <div
                            class="cursor-pointer reply_message truncate w-full mt-2 mb-2 pt-1 pb-1 pr-2"
                            v-if=" messageItem.message_reply && !messageItem.is_deleted"
                            @click="messSearch(messageItem.message_reply)">
                            <div v-if="messageItem.message_reply.message_author" class="reply_chat_author truncate">
                                {{messageItem.message_reply.message_author.full_name}}
                                {{messageItem.message_reply.message_author.id === activeChat.chat_author.id ? ` - ${$t('chat.owner')}` : ''}}
                            </div>
                            <div
                                v-if="messageItem.message_reply.text.length"
                                class="reply_text text-sm"
                                v-html="messageItem.message_reply.text"></div>
                            <template v-else>
                                <template v-if="messageItem.message_reply.share">
                                    <div class="reply_text text-sm">
                                        {{$t(messageItem.message_reply.share.model)}}
                                    </div>
                                </template>
                                <div
                                    v-else
                                    class="reply_text text-sm">
                                    {{$t('chat.file_and_image')}}
                                </div>
                            </template>
                        </div>
                        <div
                            class="message"
                            v-html="textReplace">
                        </div>
                        <div
                            v-if="textLength"
                            class="text_expand">
                            <div
                                class="btn"
                                @click="toggleShow()">
                                {{ expandText }}
                            </div>
                        </div>

                        <ChatMessageFiles
                            v-if="messageItem.attachments.length && !messageItem.is_deleted"
                            :message="messageItem" />

                        <div class="flex items-center justify-end  text-xs ">
                            <a-spin
                                v-if="!messageItem.is_deleted && !messageItem.is_system"
                                size="small"
                                :spinning="menuLoading"
                                class="mr-3 lg:hidden">
                                <a-dropdown
                                    :trigger="['click']"
                                    class="select-none">
                                    <div class="cursor-pointer">
                                        {{$t('chat.actions')}}
                                    </div>
                                    <a-menu slot="overlay">
                                        <template v-if="!pinMessageOn">
                                            <a-menu-item
                                                key="1"
                                                @click="replyMethod()">
                                                {{$t('chat.to_answer')}}
                                            </a-menu-item>
                                            <a-menu-item
                                                key="2"
                                                class="text-red-500"
                                                v-if="deleteBtnShow"
                                                @click="deleteMessage()">
                                                {{$t('chat.remove')}}
                                            </a-menu-item>
                                            <a-menu-item
                                                key="3"
                                                @click="createTask()">
                                                {{$t('chat.set_task')}}
                                            </a-menu-item>
                                            <!-- <a-menu-item
                                                v-if="!myMessage && activeChat.is_public"
                                                key="4"
                                                @click="sendMessage()">
                                                {{$t('chat.personal_chat')}}
                                            </a-menu-item> -->
                                            <a-menu-item
                                                v-if="pinMessageShow && !messageItem.is_pinned"
                                                key="5"
                                                @click="pinMessage()">
                                                {{$t('chat.anchor')}}
                                            </a-menu-item>
                                        </template>
                                        <template v-if="messageItem.is_pinned">
                                            <a-menu-item
                                                v-if="pinMessageShow"
                                                key="6"
                                                @click="unpinMessage()">
                                                {{$t('chat.unpin')}}
                                            </a-menu-item>
                                            <a-menu-item
                                                v-if="pinMessageOn"
                                                key="7"
                                                @click="messSearch(messageItem)">
                                                {{$t('chat.show_in_chat')}}
                                            </a-menu-item>
                                        </template>
                                    </a-menu>
                                </a-dropdown>
                            </a-spin>
                            <span class="flex items-center">
                                {{messageDate}}
                            </span>
                            <div
                                v-if="windowWidth > 864 && menuLoading"
                                class="ml-3">
                                <a-spin size="small" />
                            </div>
                        </div>
                    </div>
                </div>
                <a-menu slot="overlay">
                    <template v-if="!pinMessageOn">
                        <a-menu-item
                            key="1"
                            @click="replyMethod()">
                            {{$t('chat.to_answer')}}
                        </a-menu-item>
                        <a-menu-item
                            key="2"
                            class="text-red-500"
                            v-if="deleteBtnShow"
                            @click="deleteMessage()">
                            {{$t('chat.remove')}}
                        </a-menu-item>
                        <a-menu-item
                            key="3"
                            @click="createTask()">
                            {{$t('chat.set_task')}}
                        </a-menu-item>
                        <!-- <a-menu-item
                            v-if="!myMessage && activeChat.is_public"
                            key="4"
                            @click="sendMessage()">
                            {{$t('chat.personal_chat')}}
                        </a-menu-item> -->
                        <a-menu-item
                            v-if="pinMessageShow && !messageItem.is_pinned"
                            key="5"
                            @click="pinMessage()">
                            {{$t('chat.anchor')}}
                        </a-menu-item>
                    </template>
                    <template v-if="messageItem.is_pinned">
                        <a-menu-item
                            v-if="pinMessageShow"
                            key="6"
                            @click="unpinMessage()">
                            {{$t('chat.unpin')}}
                        </a-menu-item>
                        <a-menu-item
                            v-if="pinMessageOn"
                            key="7"
                            @click="messSearch(messageItem)">
                            {{$t('chat.show_in_chat')}}
                        </a-menu-item>
                    </template>
                </a-menu>
            </a-dropdown>
        </div>
    </div>
</template>

<script>
import Task from './messages/Task'
import ChatMessageFiles from './ChatMessageFiles'
import File from './messages/File'
import Comments from './messages/Comments'
import Conference from './messages/Conference'
import Workgroup from './messages/Workgroup'
import BusinessProcces from './messages/BusinessProcces'
import eventBus from '@/utils/eventBus'
import ChatEventBus from '../../utils/ChatEventBus'
import { mapMutations } from 'vuex'
import computedMixin from './computed'
export default {
    name: "ChatMessage",
    components: {
        ChatMessageFiles,
        Task,
        File,
        Comments,
        Workgroup,
        Conference,
        BusinessProcces
    },
    mixins: [computedMixin],
    props: {
        messageItem: {
            type: Object,
            require: true
        },
        user: {
            type: Object,
            required: false
        },
        replySearch: {
            type: Function,
            default: () => {}
        },
        pinMessageOn: {
            type: Boolean,
            default: false
        }
    },
   
    data() {
        return {
            expand: false,
            menuLoading: false,
            expandText: this.$t('chat.uncover')
        }
    },
    methods: {
        ...mapMutations({
            setReplyMessage: 'chat/setReplyMessage',
            setPin: 'chat/PIN_MESSAGE',
            setUnpin: 'chat/UNPIN_MESSAGE',
            removeMessage: 'chat/removeMessage'
        }),
        replyMethod() {
            this.setReplyMessage({
                id: this.activeChat.chat_uid,
                mesage: this.messageItem
            })
            ChatEventBus.$emit('inputFocus')
            ChatEventBus.$emit('arreaScroll')
        },
        messSearch(mess) {
            this.menuLoading = true
            this.replySearch(mess)
                .then(() => {
                    ChatEventBus.$emit('SLIDE_TO_PIN', mess)
                    this.menuLoading = false
                })
        },
        async pinMessage() {
            try {
                this.menuLoading = true
                let data = this.messageItem

                data.chat_uid = this.messageItem.chat_uid ? this.messageItem.chat_uid : this.messageItem.chat
              
                this.$socket.client.emit("chat_pin_message", data)
                this.setPin(data)
                ChatEventBus.$emit('PINNED_MESSAGE', data)
            } catch(e) {
                console.log(e)
                this.$mess.error(this.$t('error'))
            } finally {
                this.menuLoading = false
            }
        },
        async unpinMessage() {
            try {
                this.menuLoading = true
                let data = this.messageItem
                
                data.chat_uid = this.messageItem.chat_uid ? this.messageItem.chat_uid : this.messageItem.chat

                this.$socket.client.emit("chat_unpin_message", this.messageItem)
                this.setUnpin(data)
            } catch(e) {
                console.log(e)
                this.$message.error(this.$t('error'))
            } finally {
                this.menuLoading = false
            }
        },
        async sendMessage() {
            try{ 
                this.menuLoading = true
                const res = await this.$store.dispatch('chat/getUserChat', this.messageItem.message_author.id)
                if(res) {
                    this.$router.push({name: 'chat', query: {id: res.id}})
                    this.$store.commit('chat/SET_OPEN_DIALOG', res)
                }
            } catch(e) {
                this.$message.error(this.$t('error'))
            } finally {
                this.menuLoading = false
            }
        },
        async createTask() {
            let visors = []
            if(this.activeChat.is_public) {
                try {
                    this.menuLoading = true
                    const {data} = await this.$http.get('/chat/member/list/', {
                        params: {
                            chat: this.activeChat.chat_uid
                        }
                    })
                    if(data && data.results.length) {
                        data.results.forEach(({user}) => {
                            visors.push(user)
                        })
                    }
                } catch(e) {

                } finally {
                    this.menuLoading = false
                }
            }
            let form = {
                name: this.messageItem.text,
                operator: this.messageItem.chat_author,
                attachments: this.messageItem.attachments,
                reason: this.messageItem.message_uid
            }
            if(visors.length)
                form.visors = visors

            if(this.messageItem.text.length > 150) {
                if(this.activeChat.is_public)
                    form.name = this.$t('message_task', {chat: this.activeChat.name, user: this.messageItem.chat_author.full_name})
                else
                    form.name = this.$t('message_task', {chat: this.messageItem.chat, user: this.messageItem.chat_author.full_name})

                form.description = this.messageItem.text
            } else
                form.name = this.messageItem.text

            eventBus.$emit('ADD_WATCH', {type: 'add_task', data: form})
        },
        toggleShow() {
            if(this.expand) {
                this.expand = false
                this.expandText = this.$t('chat.uncover')
            } else {
                this.expand = true
                this.expandText = this.$t('chat.collapse')
            }
        },
        async deleteMessage() {
            try {

                const data = {chat_uid: this.activeChat.chat_uid, message_uid: this.messageItem.message_uid}
                this.$socket.client.emit('chat_delete_message', data)
                this.removeMessage(data)
            } catch(e) {
                this.$message.error(this.$t('error') + e)
            }
        },
        galleryInit() {
            this.$nextTick(() => {
                const lightboxWrap = this.$refs[`message_${this.messageItem.message_uid}`],
                    lightbox = lightboxWrap.querySelectorAll('.ch_lght')

                if(lightbox?.length) {
                    lightGallery(lightboxWrap, {
                        selector: ".ch_lght",
                        thumbnail: true,
                        animateThumb: true,
                        rotateLeft: true,
                        rotateRight: true,
                        flipHorizontal: false,
                        flipVertical: false,
                        fullScreen: true,
                        showThumbByDefault: true,
                        download: true,
                        speed: 300
                    })
                }
            })
        }
    },
    created(){
        if(this.messageItem.attachments?.length)
            this.galleryInit()
        // console.log("MESSAGE", this.messageItem)
        // console.log("ACTIVE CHAT", this.activeChat)
    }
   
}
</script>
