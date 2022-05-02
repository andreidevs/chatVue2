<template>
    <div
        class="user_item flx wfl justify-between"
        :class="select && 'select_contact'">
        <div class="user_info flx items-center">
            <div class="awatar_wrapper">
                <a-badge :color="online ? 'green' : 'red'"   >
                    <a-avatar
                        v-if="userItem.avatar"
                        :size="33"
                        :src="userItem.avatar" />
                    <a-avatar
                        v-else
                        :size="33"
                        icon="user" />
                </a-badge>
            </div>
            <div class="user_item__body pl-2">
                <div class="name font-medium truncate">
                    {{ userItem.full_name }}
                </div>
                <div v-if="info && userType" style="margin-top: -3px">
                    <a-tag  :color="userTypeTag">
                        {{ userType }}
                    </a-tag>
                </div>
            </div>
        </div>  
        <a-dropdown
            v-if="actionCheck"
            :trigger="['click']">
            <a-button
                type="link"
                class="text-current">
                <a-icon type="more" />
            </a-button>
            <a-menu slot="overlay">
                <template v-if="isAuthor">
                    <a-menu-item
                        v-if="info.is_moderator"
                        key="0"
                        @click="moderatorDismiss()">
                        {{$t('chat.pick_up_a_moderator')}}
                    </a-menu-item>
                    <a-menu-item
                        v-else
                        key="1"
                        @click="moderatorAssign()">
                        {{$t('chat.submit_a_moderator')}}
                    </a-menu-item>
                </template>
                <a-menu-item
                    class="text-red-500"
                    key="2"
                    @click="memberDelete()">
                    {{$t('chat.exclude')}}
                </a-menu-item>
            </a-menu>
        </a-dropdown>
        <a-badge
            class="mt-1"
            v-if="dialog && !checkBoxMode && dialog.new_message_count > 0"
            :count="dialog.new_message_count"
            :number-style="{ backgroundColor: 'rgb(62, 130, 247)' }" />
                
        <div v-if="checkBoxMode" class="flex items-center">
            <template v-if="thisSelected && selected.length > selectModerLength">
                <div class="mr-2 cursor-pointer moderate_select">
                    <input type="checkbox" :id="`mod_${userItem.id}`" :value="userItem.id" v-model="moderate">
                    <label :for="`mod_${userItem.id}`">{{$t('chat.moderator')}}</label>
                </div>
            </template>
            <div class="check_theme">
                <input type="checkbox" :id="userItem.id" :value="userItem.id" v-model="selected">
                <label :for="userItem.id"></label>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations, mapState } from 'vuex'
export default {
    name: "ChatUserCard",
    props: {
        userItem: {
            type: Object,
            required: true
        },
        select: {
            type: Boolean,
            default: false
        },
        info: {
            type: Object,
            default: () => null
        },
        dialog: {
            type: Object,
            default: () => null
        },
        checkBoxMode: {
            type: Boolean,
            default: false
        },
        group: {
            type: Boolean,
            default: false
        },
        chatMember: {
            type: Object,
            default: () => null
        },
        clickSelect: {
            type: Boolean,
            default: false
        },
        isSearch: {
            type: Boolean,
            default: false
        },
        selectModerLength: {
            type: Number,
            default: 1
        }
    },
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat,
            user: state => state.user.user
        }),
        ...mapGetters({
            getStatusUser: 'chat/getStatusUser'
        }),
    
        userType() {
            if(this.info.is_author)
                return this.$t('chat.admin')
            else if(this.info.is_moderator)
                return this.$t('chat.moderate')
            else
                return false
        },
        userTypeTag() {
            if(this.info.is_author)
                return 'blue'
            else if(this.info.is_moderator)
                return 'green'

            return 'default'
        },
        author() {
            return this.activeChat.chat_author
        },
        isAuthor() {
            if(this.author.id === this.user.id && this.user.id !== this.userItem.id)
                return true
            else
                return false
        },
        actionCheck() {
            if(this.info) {
                if(this.isAuthor && !this.info.is_author || this.activeChat.is_moderator && !this.info.is_moderator && this.user.profile !== this.userItem.id && !this.info.is_author)
                    return true
                else
                    return false
            } else
                return false
        },
        moderate: {
            get() { 
                return this.$store.state.chat.moderate
            },
            set(val) {
                this.$store.commit('chat/SET_MODERATE', val)
            }
        },
        selected: {
            get() {
                return this.$store.state.chat.selectedContacts
            },
            set(val) {
                this.$store.commit('chat/SET_SELECTED_CONTACTS', val)
            }
        },
        thisSelected() {
            if(this.selected) {
                const find = this.selected.find(item => item === this.userItem.id)
                return find
            } else
                return null
        },
        online(){
           
            return this.getStatusUser(this.userItem.id).online
        }
    },
    methods: {
        ...mapMutations({
            setModerator: "chat/CHANGE_MEMBER_MODERATE",
            deleteMember: "chat/DELETE_MEMBER"
        }),
      
        async moderatorDismiss() {
            try {
                this.$socket.client.emit("chat_change_rights",
                    {chat_uid: this.activeChat.chat_uid,
                        members: [
                            {user: this.userItem.id, is_moderator: false}
                        ]})
                this.setModerator({id: this.userItem.id, is_moderator: false})
                this.$message.success(`${this.userItem.full_name} больше не является модератором`)

            } catch(e) {
                this.$message.error(this.$t('error') + e)
            } finally {
               
            }
        },
        async moderatorAssign() {
            try {
                this.$socket.client.emit("chat_change_rights",
                    {chat_uid: this.activeChat.chat_uid,
                        members: [
                            {user: this.userItem.id, is_moderator: true}
                        ]})
                this.setModerator({id: this.userItem.id, is_moderator: true})
                this.$message.success(`${this.userItem.full_name} теперь модератор`)
            } catch(e) {
                this.$message.error(this.$t('error') + e )
            } finally {
               
            }
        },
        async memberDelete() {
            try {
               
                this.$socket.client.emit('chat_delete_user',
                    {chat_uid: this.activeChat.chat_uid,
                        members: [
                            {user: this.userItem.id}
                        ]})
                this.deleteMember({chat: this.activeChat.chat_uid, user: this.userItem.id})
                this.$message.success(`${this.userItem.full_name} исключен из чата`)
            } catch(e) {
                this.$message.error(this.$t('error'))
            } finally {
               
            }
        },
       
    }
}
</script>

<style lang="scss">
.ant-badge-dot{
    top: 5px;
    right: 3px;
    // border: 1px solid #ffffff;
    width: 8px !important;
    height: 8px !important;
}
.user_item{
    padding: 10px;
    align-items: center;
    &.select_contact{
        cursor: pointer;
    }
    .user_item__body{
        .name{
            font-size: 15px;
            max-width: 210px;
        }
        .ant-tag{
            font-size: 12px;
            padding: 0 4px;
            line-height: 15px;
        }
    }
}
</style>