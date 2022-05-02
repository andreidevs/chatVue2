<template>
    <a-drawer
        :title="$t('chat.group_chat_add')"
        placement="right"
        :closable="false"
        class="group_chat_drawer"
        :width="windowWidth > 960 ? 380 : 300"
        :visible="popupActive"
        @close="popupActive = false">
        
        <div class="drawer_footer relative">
            <a-input
                v-model="search"
                @input="memberSearch"
                :placeholder="$t('chat.press_user_name')"
                class="input_search"
                size="large">
                <a-icon slot="prefix" type="search" />
            </a-input>
            <a-button
                :loading="loading"
                @click="addUser()"
                class="absolute"
                type="primary"
                shape="circle"
                icon="plus" />
            <a-spin
                :spinning="loading"
                class="absolute member_spin" />
        </div>
        <div class="drawer_scroll">
            <ul class="chat__active-chats bordered-items">
                <li class="cursor-pointer" v-for="(contact, index) in addMembersList" :key="index">
                    <UserCard :clickSelect="true" :userItem="contact" :checkBoxMode="true" :selectModerLength="0"  />
                </li>
            </ul>
          
            <infinite-loading @infinite="getContactsList" v-bind:distance="10" :identifier="popupActive">
                <div slot="spinner"><a-spin v-if="page !== 1" /></div>
                <div slot="no-more"></div>
                <div slot="no-results"></div>
            </infinite-loading>
        </div>
    </a-drawer>
</template>

<script>
import UserCard from '../UserCard.vue'
import InfiniteLoading from 'vue-infinite-loading'
import {mapMutations, mapState} from 'vuex'
let searchId
export default {
    name: "ChatAddMemberSidebar",
    data() {
        return {
            loading: false,
            page: 0,
            status: true,
            start: true,
            emptyMessage: false,
            search: '',
            searchStatus: false
        }
    },
    computed: {
        ...mapState({
            addMembersList: state => state.chat.contactsGroup,
            activeChat: state => state.chat.activeChat,
            moderate: state => state.chat.moderate,
            windowWidth: state => state.windowWidth,
            contactGroupNext: state=> state.chat.contactGroupNext,
            selectedContacts: state => state.chat.selectedContacts,
            moderate: state => state.chat.moderate,
        }),
        popupActive: {
            get() {
                return this.$store.state.chat.addMemberPopup
            },
            set(val) {
                this.$store.commit('chat/SET_ADD_MEMBER_POPUP', val)
            }
        }
    },
    watch: {
        popupActive(val) {
            if(val) {
                this.status = true
                this.page = 0
                this.start = true
                this.loading = false
                this.emptyMessage = false
                this.search = ''
                this.searchStatus = false
                this.$store.commit('chat/CONCAT_ADD_MEMBERS_CLEAR')
            }
        }
    },
    created(){
        this.getContactsList()
    },
    methods: {
        ...mapMutations({
            clearUsers: "chat/clearContactsGroup",
            clearMemberSideBar: "chat/clearMemberSideBar",
            addUserCount: 'chat/addUserCount'
        
        }),
        memberSearch(e) {
            clearTimeout(searchId)
            if(e.length > 2) {
                searchId = setTimeout(async() => {
                    try {
                        this.status = false
                        this.searchStatus = true
                        this.$store.commit('chat/CONCAT_ADD_MEMBERS_CLEAR')
                        this.loading = true
                        this.page = 1
                        const res = await this.$store.dispatch('chat/memberSearch', {value: e, page: this.page})
                        if(res && res.next) {
                            this.status = true
                            this.searchStatus = false
                        } else
                            this.emptyMessage = true
                    } catch(e) {
                    } finally {
                        this.loading = false
                    }
                }, 800)
            }
            if(!e.length) {
                searchId = setTimeout(() => {
                    this.page = 0
                    this.loading = false
                    this.status = true
                    this.searchStatus = false
                    this.emptyMessage = false
                    this.$store.commit('chat/CONCAT_ADD_MEMBERS_CLEAR')
                    this.getContactsList()
                }, 800)
            }
        },
        async getContactsList($state = null) {
           
            if(!this.loading && this.contactGroupNext) {
                try {
                    this.loading = true
                    if(this.start){
                        this.clearUsers()
                    }
                    this.start = false
                    let res = null
                    if(this.search.length)
                        res = await this.$store.dispatch('chat/memberSearch', {value: this.search, page: this.page})
                    else
                        res = await this.$store.dispatch('chat/getGroupContact', { chat: this.activeChat.chat_uid})
                    if(!res.next) {
                        if($state)
                            $state.complete()
                        this.status = false
                    } else {
                        if($state)
                            $state.loaded()
                    }
                } catch(e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            }
           
        },
        async  addUser(){
            if(this.selectedContacts.length > 0){ 
                let chat = {
                    members: [],
                    chat_uid: this.activeChat.chat_uid
                }
                this.selectedContacts.forEach(item => {
                    let member = {user: item}
              
                    if(this.moderate.length) {
                        const find = this.moderate.find(elem => elem === item)
                        if(find)
                            member.is_moderator = true
                        else
                            member.is_moderator = false
                    } else {
                        member.is_moderator = false
                    }
                
                    chat.members.push(member)
                })
                if(this.selectedContacts.length > 1) {
                    chat.is_public = true
                    chat.name = this.chatName
                } else
                    chat.name = chat.members[0].user
                try {
                    this.loading = true
                    
                    this.addUserCount()
                    this.$socket.client.emit('chat_add_user', chat)
                    this.clearMemberSideBar()
                   
                    this.$emit('add')
           
                    this.popupActive = false
                
                  
                } catch(e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            }
            
        }
    },
    components: {
        UserCard,
        InfiniteLoading
    }
}
</script>