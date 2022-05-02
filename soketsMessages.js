
import { mapMutations, mapState, mapActions } from 'vuex';
import ChatEventBus from './utils/ChatEventBus';
// const sound = require('@/assets/audio/notify.mp3')
export default {
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat,
            user: state => state.user.user,
            chatList: state => state.chat.chatList,
            chatMessage: state => state.chat.chatMessage,
        }),
    },
    methods: {
        ...mapActions({
            getChatMembers: 'chat/getChatMembers',
        }),
        ...mapMutations({
            setNewCreatedChat: "chat/SET_NEW_CREATED_CHAT",
            addMessage: "chat/ADD_MESSAGE",
            getMessages: "chat/getMessage",
            setPin: 'chat/PIN_MESSAGE',
            setUnpin: 'chat/UNPIN_MESSAGE',
            unpinAll: 'chat/UNPIN_ALL',
            renameChat: 'chat/RENAME_CHAT',
            deleteMember: 'chat/DELETE_MEMBER',
            initMembersList: 'chat/INIT_MEMBERS_LIST',
            leaveChat: 'chat/LEAVE_CHAT',
            addLastMessage: 'chat/addLastMessage',
            removeMessage: 'chat/removeMessage',
            setStatusUser: 'chat/setStatusUser',
            setOnline: 'chat/setOnlineUser',
            setOffline: 'chat/setOfflineUser',
            incrimentMessageCount: "chat/incrimentMessageCount",
            clearMessageCount: "chat/clearMessageCount",
            incrementMenuCounter: "navigation/INCREMENT_MENU_COUNTER",
        }),

        setDataFromChat(data) {
            const myAuthor = this.user.id
            let name =
                myAuthor !== data.chat_author.id
                    ? data.chat_author.full_name :
                    data.recipient !== undefined ?
                        data.recipient?.full_name : data.name
            let value = {
                ...data,
                name: data.name ? data.name : name,
                last_sent: new Date(data.last_sent),
                no_create: false,

            }

            this.setNewCreatedChat({ value, user: this.user })

            if (this.user.id !== data.chat_author.id) {
                this.playAudio()
            }

        },
        playAudio() {
            // const audio = new Audio(sound)
            // audio.oncanplaythrough = () => {
            //     audio.play()

            // }
        },



    },
    sockets: {
        join_chat({ data }) {
            if (this.$route.name !== 'chat' && this.chatList.length === 0) {

            } else this.setDataFromChat(data)

        },

        message({ data }) {
            try {
                this.addMessage(data)
                this.addLastMessage(data)

                if ((!this.activeChat && (this.user.id !== data.message_author.id)) ||

                    ((this.activeChat.chat_uid === data.chat_uid)
                        && (this.user.id !== data.message_author.id)
                        && this.activeChat.scrolled
                    ) ||

                    ((this.activeChat.chat_uid !== data.chat_uid) && (this.user.id !== data.message_author.id))) {

                    ChatEventBus.$emit('CHAT_SHOW_NEW_MESSAGE', data)
                    this.incrimentMessageCount(data.chat_uid)
                    this.incrementMenuCounter('chat')
                    this.playAudio()
                } else if ((this.activeChat.chat_uid === data.chat_uid) && (this.user.id !== data.message_author.id)) {
                    this.playAudio()
                    if (!this.activeChat.scrolled) {
                        this.clearMessageCount(this.activeChat.chat_uid)
                    }
                }
            } catch (e) { }
        },

        chat_pin_message({ data }) {
            this.setPin(data)
            ChatEventBus.$emit('PINNED_MESSAGE', data)
        },

        chat_unpin_message({ data }) {
            this.setUnpin(data)
        },

        chat_unpin_all_message({ data }) {
            this.unpinAll(data)
        },

        chat_rename({ data }) {
            this.renameChat(data)
        },

        chat_add_user({ data }) {
            this.$store.commit('chat/SET_LOADING_INFOCHAT', true)
            this.initMembersList(data)
            this.getChatMembers({ chat: data.chat_uid })
            this.$store.commit('chat/SET_LOADING_INFOCHAT', false)

        },

        chat_delete_user({ data }) {
            this.deleteMember({ chat: data.chat_uid, user: data.members[0].user })

        },


        leave_room({ data }) {
            this.leaveChat({ chat: data.chat_uid })
        },

        chat_delete_message({ data }) {
            this.removeMessage(data)
        },

        chat_status_user(data) {
            this.setStatusUser(data)
        },

        chat_online_user(data) {
            this.setOnline({ user: data.user })
        },

        chat_offline_user(data) {
            this.setOffline({ user: data.user, last_activity: data.last_activity })
        },



    },
    mounted() {
        ChatEventBus.$on('chat_member_update_last_message', (data) => {
            this.$socket.client.emit('chat_member_update_last_message', data)
        })
    },

}