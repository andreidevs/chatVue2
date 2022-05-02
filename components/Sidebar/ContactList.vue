<template>
    <div class="sidebar_list">
        <div
            v-for="(item, index) in contactList"
            :key="`contact_${index}`"
            class="sidebar_item"
            @click="createChat(item)">
            <UserCard
                :select="true"
                :userItem="item"/>
        </div>
        <infinite-loading
            @infinite="getContactsList"
            v-bind:distance="20">
            <div slot="spinner">
                <a-spin
                    size="small"
                    style="margin-top: 10px;" />
            </div>
            <div slot="no-more"></div>
            <div slot="no-results"></div>
        </infinite-loading>
    </div>
</template>

<script>
import { mapState, mapActions, mapMutations } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'
import UserCard from '../UserCard.vue'
import randomColor from 'randomcolor'
export default {
    name: "ChatContactList",
    components: {
        UserCard,
        InfiniteLoading
    },
    computed: {
        ...mapState({
            contactList: state => state.chat.contactList,
            chatList: state => state.chat.chatList,
            contactListNext: state => state.chat.contactListNext,
            contactListPage: state => state.chat.contactListPage
        })
    },
    data() {
        return {
            loading: false,
            page: 1
        }
    },
    methods: {
        ...mapActions({
            getSidebarContact: 'chat/getSidebarContact'
        }),
        ...mapMutations({
            createVirtualChat: 'chat/CREATE_VIRTUAL_CHAT',
            SET_ACTIVE_CHAT: 'chat/SET_ACTIVE_CHAT',
            SET_CHAT_MESSAGE: 'chat/SET_CHAT_MESSAGE',
            SET_CHAT_MESSAGE_MODAL: 'chat/SET_CHAT_MESSAGE_MODAL',
        
        }),
        async getContactsList($state) {
            if(this.contactListNext) {
                try {
                    this.loading = true
                   
                    const res = await this.getSidebarContact({all: false})
                    if(res.next) {
                        $state.loaded()
                    } else {
                        $state.complete()
                    }
                } catch(e) {
                    console.log(e)
                } finally {
                    this.loading = false
                }
            } else
                $state.complete()
        },

        async   createChat(item){
          
            const find = this.chatList.find(el=> el.recipient?.id === item.id)
            if(!find){ 
                item['chat_author'] = this.$store.state.user.user
                item['color'] = randomColor()
                this.createVirtualChat(item)
            } else {
                this.$store.commit('chat/SET_ACTIVE_CHAT', find)
                this.$store.commit('chat/setSidebarActiveTab', 1)
            }
        }
    },
   
}
</script>