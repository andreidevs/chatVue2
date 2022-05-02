<template>
    <div
        class="chat_contact flx wfl"
        :class="active && 'active'"
        @click="selectChat()">
        <div class="awatar_wrapper">
            <a-avatar
                v-if="chat.avatar"
                :size="38"
                :src="chat.avatar" />
            <template v-else>
                <a-avatar
                    v-if="chat.is_public"
                    :style="`backgroundColor: ${avatarBg}`"
                    :size="38"
                    icon="team" />
                <a-avatar
                    v-else
                    :style="`backgroundColor: ${avatarBg}`"
                    :size="38"
                    :src="chat.chat_author.avatar ? chat.chat_author.avatar : ''"
                    icon="user" />
            </template>
        </div>
        <div class="user_item__body pl-2 truncate" style="width: 100%">

            <div class="name font-medium flex justify-between">

                <div class="truncate font-bold flex items-center">
                    
                    <a-icon type="team" class="" v-if="chat.is_public"/>
                    <span class="ml-1 truncate"> {{ chat.name }} </span>
                   
                   
                </div>
                <span class="text-xs">
                    {{ $moment(chat.last_sent).format('HH:mm') }}
                </span>
               
            </div>

            <div class="flex justify-between align-center">
                <div v-if="chat.last_message" class="message_desc truncate">
                    <span v-if="chat.last_message.message_author" >
                        {{ chat.last_message.message_author.full_name }} : {{ lastMessageReplace }}
                    </span>
                    <span v-html="chat.last_message.text" v-else>
                  
                    </span>
               
               
                </div>
                <a-badge
                    :count="chat.new_message_count"
                    :number-style="{ backgroundColor: '#1d65c0' }" />
            </div>
           
            
        </div>
      
    </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import randomColor from 'randomcolor'
export default {
    name: "ChatContact",
    props: {
        chat: {
            type: Object,
            required: true
        }
    },
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat
        }),
        lastMessageReplace(){
            let mess = this.chat.last_message
            let res =  this.chat.last_message.text.toString().replace(/[<]br[^>]*[>]/gi," ")

            // Attachments
            if(res.trim().length === 0 && mess.attachments.length> 0){
                
                if(mess.attachments[0].is_image){
                    if(mess.attachments.length >= 2) res='"Несколько изображений"'
                    else  res = '"Избражение"'
                } else {
                    if(mess.attachments.length >= 2) res='"Несколько файлов"'
                    else  res = `"Файл: ${mess.attachments[0].name}.${mess.attachments[0].extension}"`
                }  
                
            }

            // Share
            if(res.trim().length === 0 && mess.share){
                if(mess.share.type === "tasks.TaskModel") res = `"Задача #${mess.share.counter}"`
                if(mess.share.type === "comments.CommentModel") res = `"Комментарий: ${mess.share.text}"`
            }


            return res
        },
        active() {
            if(this.activeChat?.chat_uid === this.chat.chat_uid)
                return true
            else
                return false
        },
        avatarBg() {
            return this.chat.color ? this.chat.color :  randomColor()
        }
    },
    methods: {
        ...mapMutations({
            SET_ACTIVE_CHAT: 'chat/SET_ACTIVE_CHAT',
            SET_CHAT_MESSAGE: 'chat/SET_CHAT_MESSAGE',
            SET_CHAT_MESSAGE_MODAL: 'chat/SET_CHAT_MESSAGE_MODAL'
        }),
        selectChat() {
            this.SET_ACTIVE_CHAT(this.chat)
            this.SET_CHAT_MESSAGE(this.chat.chat_uid)
            this.SET_CHAT_MESSAGE_MODAL(this.chat.chat_uid)
            if(this.activeChat && !this.activeChat.is_public)
                this.$socket.client.emit('chat_status_user', 
                    {chat_uid: this.activeChat.chat_uid, user_uid: this.activeChat.recipient.id})

            let query = Object.assign({}, this.$route.query)
            
            if(query?.chat_id !== this.chat.chat_uid) {
                query.chat_id = this.chat.chat_uid
                this.$router.push({query})
            }
        }
    }
}
</script>

<style lang="scss">
.chat_contact{
    padding: 10px;
    cursor: pointer;
    align-items: center;
    .message_desc{
        font-size: 13px;
    }
    &.active{
        background: #f5f5f5;
    }
    .user_item__body{
        .name{
            font-size: 15px;
            .team_icon{
                font-size: 12px;
                margin-left: 5px;
            }
        }
    }
}
</style>