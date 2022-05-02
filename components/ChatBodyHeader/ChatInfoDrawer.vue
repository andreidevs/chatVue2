<template>
    <a-drawer
        placement="right"
        class="chat_info_drawer"
        :width="360"
        :visible="visible"
        :destroyOnClose="true"
        @close="visible = false">
        <div class="drawer_header flex items-center justify-between truncate w-full">
            <div class="flex items-center">
                <div class="awatar_wrapper pr-2">
                    <a-avatar
                        v-if="activeChat.is_public"
                        :size="32"
                        icon="team" />
                    <a-avatar
                        v-else
                        :size="32"
                        icon="user" />
                </div>
                <div class="name truncate w-full">
                    <div class="truncate w-full">{{ activeChat.name }}</div>
                    <div class="member">{{ chatMember }}</div>
                </div>
            </div>
            <div
                v-if="isModerator || isAuthor"
                class="actions">
                <a-button
                    v-tippy="{ inertia : true, duration : '[600,300]'}"
                    :content="$t('chat.edit')"
                    @click="changeChatName()"
                    icon="edit"
                    type="link" />
                <a-button
                    v-tippy="{ inertia : true, duration : '[600,300]'}"
                    :content="$t('chat.add_user')"
                    @click="addUser()"
                    icon="usergroup-add"
                    type="link" />
                <a-button
                    v-if="isAuthor"
                    v-tippy="{ inertia : true, duration : '[600,300]'}"
                    :content="$t('chat.remove')"
                    @click="showDeleteModal()"
                    icon="delete"
                    type="link" />
                <a-button
                    v-tippy="{ inertia : true, duration : '[600,300]'}"
                    :content="$t('chat.close')"
                    @click="visible = false"
                    icon="close"
                    type="link" />
            </div>
           
        </div>
        <div class="flex items-center justify-center">
            <a-spin
                class="mt-1"
                :spinning="loading"/>
        </div>
     
        <div class="drawer_body">
         
            <div
                v-if="members && members.results"
                class="chat_members">
                <div
                    v-for="item in members.results"
                    :key="item.id"
                    class="item">
                    <UserCard
                        :userItem="item.user"
                        :info="item" />
                </div>
            </div>
            <infinite-loading
                @infinite="getMembers"
                :identifier="activeChat.chat_uid"
                v-bind:distance="20">
                <div slot="spinner">
                    <!-- <a-spin
                        size="small"
                        style="margin-top: 10px;" /> -->
                </div>
                <div slot="no-more"></div>
                <div slot="no-results"></div>
            </infinite-loading>
        </div>

        <a-modal
            :title="$t('chat.change_chat_name')"
            @cancel="changeName = false"
            :visible="changeName">
            <a-form-model
                ref="nameForm"
                :model="form"
                :rules="rules">
                <a-form-model-item ref="name" prop="name">
                    <a-input size="large" v-model="form.name" :placeholder="$t('chat.press_chat_name')" />
                </a-form-model-item>
            </a-form-model>
            <template slot="footer">
                <a-button key="back" @click="changeName = false">
                    {{$t('chat.close')}}
                </a-button>
                <a-button :loading="nameLoading" key="submit" type="primary" @click="submitForm()">
                    {{$t('chat.save')}}
                </a-button>
            </template>
        </a-modal>
        <AddMemberSidebar/>
    </a-drawer>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import { declOfNum } from '../../utils'
import UserCard from '../UserCard.vue'
import InfiniteLoading from 'vue-infinite-loading'
import AddMemberSidebar from '../Sidebar/AddMemberSidebar.vue'
import { mapActions, mapGetters } from 'vuex'
export default {
    name: "ChatInfoDrawer",
    components: {
        InfiniteLoading,
        UserCard,
        AddMemberSidebar
    },
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat,
            sidebarInfo: state => state.chat.sidebarInfo,
            user: state => state.user.user,
        }),
        ...mapGetters({
            chatMembers: 'chat/chatMembers'
        }),
        visible: {
            get() {
                if(this.sidebarInfo && this.activeChat && this.activeChat.is_public)
                    this.$socket.client.emit('chat_status_user', {chat_uid: this.activeChat.chat_uid})
                return this.sidebarInfo
            },
            set(val) {
                this.$store.commit('chat/TOGGLE_INFO_SIDEBAR', val)
            }
        },
        loading: {
            get(){
                return this.$store.state.chat.loadingInfoChat
            },
            set(val){
                this.$store.commit('chat/SET_LOADING_INFOCHAT', val)
            }
        },
        chatMember() {
            return this.activeChat.member_count + ' ' + declOfNum(this.activeChat.member_count, [this.$t('chat.participant'), this.$t('chat.participant2'), this.$t('chat.participant3')])
        },
        members() {
            return this.chatMembers(this.activeChat.chat_uid)
        },
        author() {
            return this.activeChat.chat_author
        },
        isAuthor() {
            if(this.author.id === this.user.id)
                return true
            else
                return false
        },
        isModerator() {
            return this.activeChat.is_moderator
        }
    },
    data(){
        return{ 
            changeName: false,
            nameLoading: false,
            rules: {
                name: [
                    { required: true, message: this.$t('chat.field_require'), trigger: 'blur' },
                    { min: 3, max: 30, message: this.$t('chat.field_min_require', {min: 3}), trigger: 'blur' },
                ],
            },
            form: {
                name: ''
            }
        }
    },

    methods: {
        ...mapActions({
            getChatMembers: 'chat/getChatMembers',
        }),
        ...mapMutations({
            renameChat: "chat/RENAME_CHAT",
            deleteChatFromStore: 'chat/DELETE_CHAT'
            
        }),
        changeChatName() {
            // if(this.activeChat.chat_author.id === this.user.id) {
            this.form.name = JSON.parse(JSON.stringify(this.activeChat.name))
            this.changeName = true
            // }
        },
        submitForm() {
            this.$refs.nameForm.validate(async valid => {
                if (valid) {
                    try {
                        this.nameLoading = true
                        this.$socket.client.emit('chat_rename', {chat_uid: this.activeChat.chat_uid, chat_name: this.form.name})
                        this.renameChat({chat_uid: this.activeChat.chat_uid, chat_name: this.form.name})
                  
                        this.changeName = false
                        this.$message.success(this.$t('chat.name_changed'))
                    
                    } catch(e) {
                        this.$message.error(this.$t('chat.error') + e )
                    } finally {
                        this.nameLoading = false
                    }
                } else
                    return false
            })
        },
        showDeleteModal() {
            const self = this
            this.$confirm({
                title: this.$t('chat.chat_delete'),
                content: this.$t('chat.chat_delete_text'),
                okText: this.$t('chat.yes'),
                okType: 'danger',
                cancelText: this.$t('chat.no'),
                async onOk() {
                    await   self.deleteChat()
                },
                onCancel() {
                    // console.log('Cancel');
                },
            });
           
        },

        async deleteChat(){
            try{ 
                this.$socket.client.emit('chat_delete', {chat_uid: this.activeChat.chat_uid})
                this.visible = false
                this.deleteChatFromStore(this.activeChat.chat_uid)
                this.$router.replace({query: {}})
                this.$message.success('Чат удален')
            }
            catch(e){
                this.$message.success('Ошибка удаления чата')
            }
            finally{

            }
        },

    
        async getMembers($state) {
            try{
                this.loading = true
                if(!this.members || this.members.results.length !== this.members?.count) {
                    try {
                        const res = await this.getChatMembers({chat: this.activeChat.chat_uid})
                        if(res.next) {
                            $state.loaded()
                        } else {
                            $state.complete()
                        }
                    } catch(e) {
                        console.log(e)
                    }
                } else {
                    $state.complete()
                }
            }
            catch(e){

            }
            finally{
                this.loading = false
            }
        },
        addUser(){
            this.$store.commit('chat/SET_ADD_MEMBER_POPUP', true)
        },
       
    }
}
</script>

<style lang="scss"> 
.chat_info_drawer{
    .chat_members{
        .item{
            &:not(:first-child) {
                border-top: 1px solid var(--border2);
            }
        }
    }
    .ant-drawer-header-no-title{
        display: none;
    }
    .ant-drawer-body{
        padding: 0px;
        overflow: hidden;
        height: 100%;
    }
    .drawer_header{
        border-bottom: 1px solid var(--border2);
        height: 50px;
        padding: 0 10px;
        .name{
            .truncate{
                max-width: 150px;
            }
        }
        .member{
            font-size: 12px;
            line-height: 13px;
            color: var(--gray);
        }
        .actions{
            display: flex;
            align-items: center;
        }
    }
    .drawer_body{
        height: calc(100% - 50px);
        overflow-y: auto;
    }
}
</style>