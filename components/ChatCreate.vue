<template>
    <a-drawer
        :title="$t('chat.create_group_chat')"
        placement="right"
        :closable="false"
        class="group_chat_drawer"
        :width="windowWidth > 960 ? 400 : 330"
        :zIndex="1200"
        :visible="visible"
        @close="visible = false">
        <div class="drawer_footer relative">
            <a-input
                :disabled="disabledInput"
                class="w-full input_name"
                v-model="chatName"
                size="large"
                :placeholder="$t('chat.chat_name')" />
            <a-button
                :loading="createLoader"
                @click="createChat()"
                class="absolute"
                :disabled="disabledBtn"
                type="primary"
                shape="circle"
                icon="plus" />
        </div>
        <div class="drawer_scroll">
            <a-alert class="mt-2"
                     v-if="selectedContacts.length < 2"
                     message="Для создания группового чата нужно выбрать минимум 2-х участников"
                     banner
                     type="info" />
       
            <div class="cursor-pointer" v-for="(item, index) in contacts" :key="index">
                <UserCard checkBoxMode  :userItem="item"  />
            </div>
   
        
            <infinite-loading @infinite="getContactsList" v-bind:distance="10" :identifier="visible">
                <div slot="spinner"> <a-spin
                    size="small"
                    style="margin-top: 10px;" /></div>
                <div slot="no-more"></div>
                <div slot="no-results"></div>
            </infinite-loading>
        </div>
    </a-drawer>
</template>

<script>
import { mapState} from 'vuex'
import randomColor from 'randomcolor'
import UserCard from './UserCard'
import InfiniteLoading from 'vue-infinite-loading'
import eventBus from '@/utils/eventBus'
export default {
    name: "ChatCreate",
    components: {
        UserCard,
        InfiniteLoading
    },
    computed: {
        visible: {
            get() {
                return this.$store.state.chat.createChat
            },
            set(val) {
                this.$store.commit('chat/TOGGLE_CREATE_CHAT', val)
            }
        },
        ...mapState({
            activeChat: state => state.chat.activeChat,
            contacts: state => state.chat.contactList,
            allContactStatus: state => state.chat.allContactStatus,
            selectedContacts: state => state.chat.selectedContacts,
            moderate: state => state.chat.moderate,
            windowWidth: state => state.windowWidth
        }),
        disabledBtn() {
            if(this.selectedContacts.length > 1 && this.chatName.length)
                return false
            else
                return true
        },
        disabledInput() {
            if(this.selectedContacts.length > 1)
                return false
            else
                return true
        },
    },
    data() {
        return {
            loading: false,
            createLoader: false,
            page: 0,
            chatName: ''
        }
    },
    methods: {
        
        async createChat() {
            if(this.chatName.length >= 3) {
                let chat = {
                    members: [],
                    name: '',
                    color: randomColor(),
                    is_public: false
                }
                this.selectedContacts.forEach(item => {
                    let member = {user: item}
                    if(this.selectedContacts.length > 1) {
                        if(this.moderate.length) {
                            const find = this.moderate.find(elem => elem === item)
                            if(find)
                                member.is_moderator = true
                            else
                                member.is_moderator = false
                        } else {
                            member.is_moderator = false
                        }
                    }
                    chat.members.push(member)
                })
                if(this.selectedContacts.length > 1) {
                    chat.is_public = true
                    chat.name = this.chatName
                } else
                    chat.name = chat.members[0].user
                try {
                    this.createLoader = true
                    // console.log("send data", chat)
                    await  this.createNewChat(chat)
                    setTimeout(() => {
                        this.$store.commit('chat/setSidebarActiveTab', 1)
                        if(this.activeChat) 
                            this.setQueryId(this.activeChat)  
                        this.clearPopup()
                        this.visible = false
                    }, 300);
                   
                } catch(e) {
                } finally {
                    this.createLoader = false
                }
            } else {
                /*this.$vs.notify({
                    text: this.$t('chat_name_min'),
                    color: 'warning'
                })*/
            }
        },
        createNewChat(chat) {
            this.$socket.client.emit("create", chat)
            eventBus.$emit('update_list_share_drawer')
        },

      
        setQueryId(data) {
            let query = Object.assign({}, this.$route.query)
            if (query?.chat_id !== data.chat_uid) {
                query.chat_id = data.chat_uid
                this.$router.push({ query })
            }
        },
        clearPopup() {
            this.chatName = ''
            this.$store.commit('chat/SET_SELECTED_CONTACTS', [])
            this.$store.commit('chat/SET_MODERATE', [])
            this.popupActive = false
        },
        async getContactsList($state = null) {
            if(!this.loading &&  this.visible) {
                try {
                    this.loading = true
                  
                    this.page = this.page+1
                    const res = await this.$store.dispatch('chat/getSidebarContact', {all: true})
                    if(!res.next) {
                        if($state)
                            $state.complete()
                        // this.$store.commit('chat/SET_ALL_CONTACT_STATUS', false)
                    } else {
                        if($state)
                            $state.loaded()
                    }
                } catch(e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            } else {
                if($state)
                    $state.complete()
            }
        }
    }
}
</script>