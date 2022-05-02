<template>
    <div class="sidebar_list">
        <div>
            <div
                v-for="(item, index) in chatList"
                :key="`chat_${index}`"
                class="sidebar_item">
                <ChatContact :chat="item" />
            </div>
            <infinite-loading
                @infinite="getChatList"
                v-bind:distance="20">
                <div slot="spinner">
                    <a-spin
                        size="small"
                        style="margin-top: 10px;" />
                </div>
                <div slot="no-more"></div>
                <div slot="no-results"></div>
            </infinite-loading>
            <a-empty v-if="!loading && chatList.length === 0" class="mt-4" description="Список пуст"/>
        </div>
   
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import InfiniteLoading from 'vue-infinite-loading'
import ChatContact from '../ChatContact.vue'
export default {
    name: "ChatList",
    components: {
        ChatContact,
        InfiniteLoading,
   
    },
    computed: {
        ...mapState({
            chatList: state => state.chat.chatList,
            chatListNext: state => state.chat.chatListNext,
            chatListPage: state => state.chat.chatListPage,
        })
    },
    data() {
        return {
            loading: false
        }
    },
    methods: {
        ...mapActions({
            getSidebarChat: 'chat/getSidebarChat'
        }),
        async getChatList($state) {
            if(this.chatListNext) {
                try {
                    this.loading = true
                    const res = await this.getSidebarChat()
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
        
    }
}
</script>