<template>
    <div>

        <div class="chat_header flx justify-between items-center">
            <div class="chat_header_left truncate w-full">
                <div
                    class="chat_info flx items-center cursor-pointer truncate w-full"
                    @click="openChatInfo()">
                    <div class="awatar_wrapper pr-2">
                        <a-avatar
                            v-if="activeChat.is_public"
                            :src="activeChat.avatar"
                            :style="`backgroundColor: ${activeChat.color}`"
                            :size="38"
                            icon="team" />
                        <a-avatar
                            v-else
                            :size="38"
                            :style="`backgroundColor: ${activeChat.color}`"
                            :src="activeChat.avatar"
                            icon="user" />
                    </div>
                    <div class="chat_name truncate flex items-center">
                        <div class="truncate">
                            <div class="name  font-bold  truncate">
                                {{ name }}
                            </div>

                            <div
                                v-if="activeChat.is_public && !activeTyping"
                                class="user_count font-light truncate">
                                {{ chatMember }}
                            </div>

                            <div v-if="!activeTyping">

                                <div v-if="!activeChat.is_public && statusUser.online">
                                    <span>В сети</span>
                                </div>
                                <div v-else-if="!activeChat.is_public && statusUser.last_activity">
                                    <span v-if="fromNowDate">Был в сети {{ $moment(statusUser.last_activity).format("Do MMMM HH:mm") }}</span>
                                    <span v-else>Был в сети {{ $moment(statusUser.last_activity).fromNow() }}</span>
                                </div>
                              

                            </div>
                            <div v-if="activeTyping" class="-mt-1">
                                <span class="print font-light" v-if="!activeChat.is_public"> 
                                    печатает
                                    <span class="print-dot font-light">  ....</span>
                                </span>

                                <span v-else>
                                    <span>{{ typingPublicText }}</span>
                                    <span class="print-dot">  ....</span>
                                </span>
                            </div>
                        </div>

                    </div>
                    <!-- <a-tag
                        v-if="activeChat.is_public && isAdmin"
                        color="blue" class="ml-4">
                        {{ $t('chat.admin') }}
                    </a-tag> -->
                </div>
            </div>
            <div class="chat_header_right flx">
                <a-button
                    v-if="activeChat.workgroup"
                    @click="openWorkgroup()"
                    v-tippy="{ inertia : true, duration : '[600,300]'}"
                    :loading="loadingBtnOpenGroup"
                    content="Открыть рабочую группу">
                    {{ activeChat.workgroup.is_project ? $t("chat.project") :  $t("chat.workgroup")}}
                </a-button>

                <!-- <a-button
                    v-tippy="{ inertia : true, duration : '[600,300]'}"
                    :content="$t('chat.create_meeting')"
                    type="link"
                    icon="video-camera" /> -->
                <a-dropdown v-if="(activeChat.is_public && !isAdmin) || (!activeChat.is_public && isAdmin)">
                    <a-button
                        class="ml-1"
                        type="link"
                        icon="more" />

                    <a-menu slot="overlay"  >
                        <a-menu-item v-if="activeChat.is_public" @click="openChatInfo()">
                            <a-icon type="schedule" />
                            {{ $t('chat.chat_information') }}
                        </a-menu-item>
                        <a-menu-divider v-if="isAdmin && activeChat.is_public" />
                        <a-menu-item
                            v-if="isAdmin"
                            class="text_red"
                            @click="showDeleteModal()">
                            <a-icon type="delete" />
                            {{ $t('chat.remove') }}
                        </a-menu-item>
                    </a-menu>
                </a-dropdown>
            </div>
       
            <ChatInfoDrawer />
        </div>
        <PinMessages
            v-if="activeChat && activeChat.is_active && currentPin && currentPin.results.length"
            :messageSearch="replySearch"
            :currentPin="currentPin"
            :chatData="activeChat" />
    </div>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex'
import ChatInfoDrawer from './ChatInfoDrawer'
import PinMessages from '../PinMessages.vue'
import { declOfNum } from '../../utils'
export default {
    name: "ChatBodyHeader",
    components: {
        ChatInfoDrawer,
        PinMessages
    },
    props: {
        replySearch: {
            type: Function,
            default: () => {}
        }
    },
    data(){
        return {
            typing: [],
            activeTyping: false,
            timeout: null,
            loadingBtnOpenGroup: false
        }
    },
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat,
            user: state => state.user.user,
            pinMessage: state => state.chat.pinMessage,
            
        }),
        ...mapGetters({
            chatMessages: 'chat/chatMessages',
            getReplyMessage: 'chat/replyMessage',
            getOnlineMember: 'chat/getStatusUser',
            getTyping: 'chat/getTyping'
        }),
        chatMember() {
            return this.activeChat.member_count + ' '
             + declOfNum(this.activeChat.member_count,
                 [this.$t('chat.participant'), this.$t('chat.participant2'), this.$t('chat.participant3')])
        },
        name() {
            return this.activeChat.name
        },
        author() {
            return this.activeChat.chat_author
        },
        statusUser(){
            if(this.activeChat && this.activeChat.recipient){ 
                return this.getOnlineMember(this.activeChat.recipient.id)
            }
            return false
        },
        isAdmin() {
            if(this.author.id === this.user.id)
                return true
            else
                return false
        },
        
        fromNowDate(){
           
            let now = this.$moment(new Date()); //todays date
            let end = this.$moment(this.statusUser.last_activity); // another date
            let duration = this.$moment.duration(now.diff(end));
            let hours = duration.asHours();

            return hours > 23 ? true : false
        },
      
        
        currentPin() {
            if(this.activeChat && this.pinMessage[this.activeChat.chat_uid])
                return this.pinMessage[this.activeChat.chat_uid]
            else
                return false
        },

        typingPublicText(){
            let text;
            if(this.typing.length === 1){
                text = `${this.typing[0]} печатает`
            } else if(this.typing.length === 2){
                text = `${this.typing[0]}, ${this.typing[1]} печатают`
            } else {
                text = `${this.typing[0]}, ${this.typing[1]} и еще ${this.typing.length - 2} печатают`
            }

            return text
        }
    },
    watch: {
        typing(){
            if(this.typing.length === 0){
                this.activeTyping = false
            }
        }
    },
    sockets: {
        chat_typing({ data }) {
            if(data.chat_uid === this.activeChat.chat_uid){ 
                const find = this.typing.find(el=> el === data.user)
         
                if(find === undefined){ 
                    this.typing.push(data.user)
                    this.timeout = setTimeout(() => {
                        this.typing = this.typing.filter(el => el !== data.user)
               
                    }, 1500);
                } else {
                    clearTimeout(this.timeout)
                    this.timeout = setTimeout(() => {
                        this.typing = this.typing.filter(el => el !== data.user)
               
                    }, 1500);
                }

                this.activeTyping = true
            }
       
        }
    },
    methods: {
        ...mapMutations({
            TOGGLE_INFO_SIDEBAR: 'chat/TOGGLE_INFO_SIDEBAR',
            SET_CHAT_MEMBERS: 'chat/SET_CHAT_MEMBERS'
        }),
        openWorkgroup(){
            this.loadingBtnOpenGroup = true
            let query = this.$route.query
           
            if(this.activeChat.workgroup.is_project){
                query['viewProject'] = this.activeChat.workgroup.uid
            } else {
                query['viewGroup'] = this.activeChat.workgroup.uid
            }
            this.$router.replace({query: {}});
            this.$router.replace({query});
            setTimeout(() => {
                this.loadingBtnOpenGroup = false
            }, 4000);
        },
        showDeleteModal() {
            this.$confirm({
                title: this.$t('chat.chat_delete'),
                content: this.$t('chat.chat_delete_text'),
                okText: this.$t('chat.yes'),
                okType: 'danger',
                cancelText: this.$t('chat.no'),
                onOk() {
                    // console.log('OK');
                },
                onCancel() {
                    // console.log('Cancel');
                },
            });
        },
        openChatInfo() {
            if(this.activeChat.is_public)
                this.TOGGLE_INFO_SIDEBAR(true)
        },

      
    }
}
</script>
<style scoped>
.print-dot {

  display:inline-block;
font-size: 1rem;
  clip-path: inset(0 2ch 0 0);
  animation: l 2s steps(4) infinite;
}

@keyframes l {
  to {
    clip-path: inset(0 -1ch 0 0)
  }
}

</style>