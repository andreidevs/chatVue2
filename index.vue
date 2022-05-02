<template>
    <div class="chat_wrapper hfl flx">
        <Sidebar />
        <ChatBody />
        <ImagePopup />
    </div>
</template>

<script>
import Sidebar from './components/Sidebar'
import ChatBody from './components/ChatBody'
import ImagePopup from './components/ImagePopup'
import { mapMutations, mapActions, mapState } from 'vuex'
import 'lazysizes'
import randomColor from 'randomcolor'
export default {
    name: "ChatIndex",
    props: {
        task: {
            type: Boolean,
            default: false
        },
        meetings: {
            type: Boolean,
            default: false
        }
    },
    components: {
        Sidebar,
        ChatBody,
        ImagePopup,
    },
    created() {
        this.getOpenChat()
    },
    computed: {
        ...mapState({
            activeChat: state=> state.chat.activeChat,
            chatList: state => state.chat.chatList
        })
    },
    methods: {
        ...mapActions({
            getCurrentChat: 'chat/getCurrentChat',
            getPrivateChat: 'chat/getPrivateChat',
        }),
        ...mapMutations({
            SET_ACTIVE_CHAT: 'chat/SET_ACTIVE_CHAT',
            SET_ACTIVE_CHAT_FROM_UID: 'chat/SET_ACTIVE_CHAT_FROM_UID',
            createVirtualChat: 'chat/CREATE_VIRTUAL_CHAT',
            setValueState: 'chat/setValueState'
        }),
        async getOpenChat() {
            const query = this.$route.query
         
            if(query && query.chat_id) {
                try {
                    await this.getCurrentChat(query.chat_id)
                    await  this.getPinMessages()
                    if (!this.activeChat.is_public)
                        this.$socket.client.emit('chat_status_user', { chat_uid: this.activeChat.chat_uid, user_uid: this.activeChat.recipient.id })
                } catch(e) {
                    this.$router.push({name: 'chat'})
                    this.$message.error('Чат не существует!')
                }
            } else if(query && query.user) {
                this.setValueState({name: 'dialogLoading', value: true})
                let res = await this.getPrivateChat( query.user)
                setTimeout(() => {
                    
             
                    let find = this.chatList.findIndex(el => el.chat_uid === res.chat_uid)
                    if(find !== -1){
                        this.SET_ACTIVE_CHAT_FROM_UID(res.chat_uid)
                        this.$router.replace({query: {chat_id: res.chat_uid}})
                    } else {
                        res['chat_author'] = this.$store.state.user.user
                        res['color'] = randomColor()
                        this.createVirtualChat(res)
                    }
                    this.setValueState({name: 'dialogLoading', value: false})
                }, 1000);
              
            }

        },
        async getPinMessages() {
            try {
                await this.$store.dispatch('chat/getPinMessage', {
                    page_size: 10
                })
            } catch(e) {

            }
        },
    },
    beforeDestroy() {
        this.SET_ACTIVE_CHAT(null)
    }
}
</script>

