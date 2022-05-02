<template>
    <div>
        <ShareDrawer />
        <ChatCreate />
    </div>
</template>

<script>
import chat from "./store/index"
import share from './store/share'
import ShareDrawer from './components/ShareDrawer'
import ChatCreate from './components/ChatCreate'
import eventBus from './utils/ChatEventBus'
import soketsMessages from './soketsMessages'
export default {
    name: "ChatInit",
    mixins: [soketsMessages],
    created() {
        if(!this.$store.hasModule('chat'))
            this.$store.registerModule("chat", chat)

        if(!this.$store.hasModule('share'))
            this.$store.registerModule("share", share)

       
    },
    mounted(){
        this.$store.dispatch('chat/getMessageCount')    
         
        eventBus.$on('CHAT_SHOW_NEW_MESSAGE', (data)=>{
            // console.log("SHOW MESSGAE", data)
            const key = data.message_uid
            let title = data.is_public ? data.chat_name : data.message_author.full_name
            this.$notification.open({
                message: title,
                description: data.text,
                duration: 7,
                key,
                class: 'cursor-pointer',
                icon: <a-icon type="message" style="color: #108ee9" />,
                onClick: ()=> this.openNoty(data, key),
                onClose: this.$notification.close(key),

            });

        })
        
    },
    methods: {
       
        openNoty(data, key){
            if(this.$route.name !=='chat') { 
                this.$router.push({name: 'chat', query: {chat_id: data.chat_uid}})
            }else {
                this.$store.commit('chat/SET_ACTIVE_CHAT_FROM_UID', data.chat_uid)  
                this.$router.replace({name: 'chat', query: {}})
                this.$router.push({name: 'chat', query: {chat_id: data.chat_uid}})
                
              
            }
            eventBus.$emit('arreaScrollDown')
            this.$notification.close(key)
        }
    },
    components: {
        ShareDrawer,
        ChatCreate,
    }
}
</script>
<style scoped>
.noty_message{
    width: 300px;
}
</style>

<style lang="scss">
@import "./assets/css/style.scss";
</style>