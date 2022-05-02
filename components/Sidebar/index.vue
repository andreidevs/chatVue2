<template>
    <div class="chat_aside">
        <div class="hfl aside_wrapper">
            <Header />
            <div v-show="!searchStart" class="chat_aside__body">
                <a-tabs v-model="activeTab">
                    <a-tab-pane :key="1">
                        <span slot="tab">
                            <a-icon type="message" />
                            {{ $t('chat.chats') }}
                        </span>
                        <ChatList />
                    </a-tab-pane>
                    <a-tab-pane :key="2">
                        <span slot="tab">
                            <a-icon type="contacts" />
                            {{ $t('chat.contacts') }}
                        </span>
                        <ContactList />
                    </a-tab-pane>
                </a-tabs>
            </div>
            <div v-if="searchStart">
                <div
                    v-for="(item, index) in listSearch"
                    :key="`chat_${index}`"
                    class="sidebar_item"
                    @click="clearSearch(item)">
                    <ChatContact v-if="item.type === 'chat.ChatModel'" :chat="item" />
                    <UserCard
                        v-else
                        :select="true"
                        :userItem="item"/>
                </div>
                <a-empty description="Ничего не найдено" class="mt-4" v-show="listSearch.length === 0 && !searchLoading" />
                <a-spin  v-show="searchLoading"  style="margin-top: 15px; margin-left: 46%" />
            <!-- <infinite-loading
                @infinite="getListSearch"
                v-bind:distance="20">
                <div slot="spinner">
                   
                </div>
                <div slot="no-more"></div>
                <div slot="no-results"></div>
            </infinite-loading> -->

            </div>
          
        </div>
    </div>
</template>

<script>
import ContactList from './ContactList'
import ChatList from './ChatList'
import Header from './Header'
import ChatContact from '../ChatContact.vue'
import UserCard from '../UserCard.vue'
import { mapState, mapMutations } from 'vuex'
import randomColor from 'randomcolor'
export default {
    name: "ChatSidebar",
    components: {
        ContactList,
        ChatList,
        Header,
        ChatContact,
        UserCard
    
    },
    computed: {
        ...mapState({
            listSearch: state=> state.chat.searchResult,
            searchStart: state=> state.chat.searchStart,
            chatList: state => state.chat.chatList,
           
        }),
        searchLoading:{
            get(){
                return this.$store.state.chat.searchLoading
            },

            set(value){
                this.$store.commit('chat/setValueState', {name: 'searchLoading', value})
            }
        },
        activeTab:{
            get(){
                return this.$store.state.chat.sidebarActiveTab
            },

            set(val){
                this.$store.commit('chat/setSidebarActiveTab', val)
            }
        },
      
       
    },
    methods: {
        ...mapMutations({
            createVirtualChat: 'chat/CREATE_VIRTUAL_CHAT',
            SET_ACTIVE_CHAT: 'chat/SET_ACTIVE_CHAT',
        
        }),
        createChat(item){
            const find = this.chatList.find(el=> el.recipient?.id === item.id)
            if(!find){ 
                item['chat_author'] = this.$store.state.user.user
                item['color'] = randomColor()
                this.createVirtualChat(item)
            } else {
                this.$store.commit('chat/SET_ACTIVE_CHAT', find)
                this.$store.commit('chat/setSidebarActiveTab', 1)
            }
        },
        clearSearch(item){
            if(item.type === "users.ProfileModel"){
                this.createChat(item)
            } 
            this.$store.commit('chat/CLEAR_SEARCH_RESULT')
            this.$store.commit('chat/setValueState', {name: 'searchText', value: ""})
            this.$store.commit('chat/setValueState', {name: 'searchStart', value: false})
            this.searchLoading = false
        }
    }
 
}
</script>