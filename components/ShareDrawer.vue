<template>
    <a-drawer
        class="share_select_driwer"
        :class="shareUrl && 'show_link'"
        :width="windowWidth > 380 ? 380 : windowWidth"
        :destroyOnClose="true"
        :zIndex="1100"
        :title="$t('chat.share')"
        @close="close()"
        :visible="visible"
        :afterVisibleChange="afterVisibleChange">
        <div 
            v-if="shareUrl" 
            class="drawer_share_link">
            <a-tooltip 
                :title="$t('chat.copy_link')"
                :getPopupContainer="getPopupContainer"
                @click="copyLink()">
                <div class="share_btn">
                    <a-icon type="link" />
                </div>
            </a-tooltip>
            <a-tooltip 
                :title="$t('chat.share_email')"
                :getPopupContainer="getPopupContainer"
                @click="emailShare()">
                <div class="share_btn">
                    <a-icon type="mail" />
                </div>
            </a-tooltip>
            <!--<a-popover :getPopupContainer="getPopupContainer">
                <template slot="content">
                    <qr-code :text="shareUrl" />
                </template>
                <div class="share_btn">
                    <a-icon type="qrcode" />
                </div>
            </a-popover>-->
            <a-tooltip 
                :title="$t('chat.share_telegram')"
                :getPopupContainer="getPopupContainer"
                @click="tgShare()">
                <div class="share_btn">
                    <img src="@/assets/images/telegram.svg" />
                </div>
            </a-tooltip>
            <a-tooltip 
                :title="$t('chat.share_whatsapp')"
                :getPopupContainer="getPopupContainer"
                @click="wpShare()">
                <div class="share_btn">
                    <img src="@/assets/images/WhatsApp.svg" />
                </div>
            </a-tooltip>
        </div>
        <div class="drawer_body">
            <div class="drawer_scroll infinite-wrapper ">
                <ul class="bordered-items">
                    <li class="flex items-center justify-between px-3 py-2 cursor-pointer item" 
            
                        v-for="(dialog, index) in dialogList" :key="index">
                        <div class="flex items-center justify-between w-full">
                            <div
                                @click="changeSelectValue(dialog)" 
                                class="flex items-center w-full truncate">
                                <div class="mr-2">
                                    <a-avatar
                                        v-if="dialog.recipient && dialog.recipient.avatar"
                                        :src="dialog.recipient.avatar" />
                                    <a-avatar icon="user" v-else />
                                </div>
                                <div class="truncate">
                                    <div class="text-sm font-semibold truncate">
                                        {{dialog.name}}
                                        <template v-if="dialog.is_public">
                                            <a-icon class="ml-1" style="font-size: 11px;" type="team" />
                                        </template>
                                    </div>
                                </div>
                            </div> 
                   
                            <div class="flex items-center">
                                <a-checkbox 
                                    :ref="'checkbox_'+dialog.chat_uid" 
                                    :id="dialog.chat_uid"  
                                    @change="changeSelect"/>
                            </div>
                        </div>
                    </li>
                </ul>
           
                <infinite-loading @infinite="getDialogkList" :distance="10">
                    <div slot="spinner">
                        <a-spin
                            size="small"
                            style="margin-top: 10px;" />
                    </div>
                    <div slot="no-more"></div> 
                    <div slot="no-results"></div>
                </infinite-loading>
            </div>
        </div>
        <div class="drawer_footer share_footer">
            <a-button
                :loading="loading"
                @click="modalVisible = true"
                class="px-6"
                type="primary"
                :disabled="selectList.length === 0">
                {{ $t('chat.send') }}
            </a-button>
            <a-button
                @click="createChat"
                class="ml-2"
                type="link">
                Создать чат
            </a-button>
        </div>
        <a-modal
            class="share_modal"
            :visible="modalVisible"
            :zIndex="1200"
            @cancel="modalVisible = false">
            <template slot="title">
                <div v-if="selectedChat" class="flex items-center">
                    <div class="flex items-center truncate">
                        <div class="mr-2">
                            <a-avatar
                                v-if="selectedChat.recipient && selectedChat.recipient.avatar"
                                :src="selectedChat.recipient.avatar" />
                            <a-avatar icon="user" v-else />
                        </div>
                        <div class="truncate">
                            <div class="text-sm font-semibold truncate">
                                {{selectedChat.name}}
                                <template v-if="selectedChat.is_public">
                                    <a-icon class="ml-1" style="font-size: 11px;" type="team" />
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <div v-if="shareObject">
                <div class="mb-2 font-semibold">{{$t('chat.attach')}}
                    <span class="lowercase" v-if="shareModel !== 'workgroups.WorkGroupModel'">
                        {{$t(shareModel)}}:  {{shareObject.name}}</span>

                    <span class="lowercase" v-else>
                        {{shareObject.is_project ? 'Проект' : "Рабочую группу"}}:  {{shareObject.name}}</span></div>

                <div v-if="shareModel === 'tasks.TaskModel'" class="flex items-center">
                   
                    <a-tag class="ml-1" v-if="shareObject.attachments && shareObject.attachments.length">
                        <a-icon type="paper-clip" />
                        {{shareObject.attachments.length}}
                    </a-tag>
                    
                    <template v-else>
                        <a-tag class="m-0">{{$t('chat.no_time_limit')}}</a-tag>
                    </template>
                    <a-tag class="ml-2 mr-0" :color="statusType">
                        {{$t(shareObject.status)}}
                    </a-tag>
                </div>
                <template v-if="shareModel === 'files'">
                    <div class="flex items-center truncate">
                        <a-icon
                            :type="checkFileType"
                            class="mr-2" />
                        <div class="truncate">
                            {{shareObject.name ? shareObject.name : shareObject.path}}
                        </div>
                    </div>
                </template>
                <template v-if="shareModel === 'comments'">
                    <div class="flex items-center mb-2 truncate">
                        <div class="mr-2">
                            <a-avatar
                                v-if="shareObject.author.avatar"
                                :src="shareObject.author.avatar" />
                            <a-avatar icon="user" v-else />
                        </div>
                        <div class="truncate">
                            <div class="text-sm font-semibold truncate">
                                {{shareObject.author.full_name}}
                            </div>
                        </div>
                    </div>
                    <div>
                        {{shareObject.text}}
                    </div>
                </template>
                <div v-if="shareModel === 'meetings.PlannedMeetingModel'">
                    <h3 class="text-base">{{shareObject.name}}</h3>

                   
                    <a-tag class="my-1 mr-1">
                        Длительность {{ shareObject.duration}} мин
                    </a-tag>
                    <div 
                        v-if="shareObject.status === 'online'" 
                        class="online flex items-center">
                        <div class="blob mr-2"></div>
                        Онлайн
                    </div>
                    <a-tag 
                        v-if="shareObject.status === 'new'"
                        class="ml-1"
                        color="green">
                        Новая
                    </a-tag>
                    <a-tag 
                        v-if="shareObject.status === 'ended'"
                        class="ml-1"
                        color="purple">
                        Завершена
                    </a-tag>
                    <a-tag class="my-1 mr-1">
                        Количество участников - {{ shareObject.members_count }}
                    </a-tag>
                </div>
            </div>
            <div slot="footer">
                <div class="relative w-full footer_share">
                    <a-textarea
                        class="w-full modal_text"
                        name="modalText"
                        ref="shareText"
                        v-model="text"
                        @keydown="inputHandler"
                        :placeholder="$t('chat.enter_your_message')"
                        :auto-size="false" />
                    <div class="absolute flex items-center footer_action">
                        <a-dropdown>
                            <a-menu slot="overlay" >
                                <a-menu-item key="1"    @click="createMessage(false)"> <a-icon type="profile" />Поделиться и остаться </a-menu-item>
                                <a-menu-item key="2"    @click="createMessage(true)"> <a-icon type="message" />Поделиться и перейти в чат </a-menu-item>
                            
                            </a-menu>
                            <a-button
                                class="flex items-center justify-center lg:ml-2 send_button"
                                type="primary"
                                :loading="createLoader"
                                @click="createMessage(false)"
                                shape="circle">
                                <send-icon
                                    size="1.2x" />
                            </a-button>
                        </a-dropdown>
                        
                    </div>
                </div>
            </div>
        </a-modal>
    </a-drawer>
</template>

<script>
import {mapState} from 'vuex'
import { SendIcon } from 'vue-feather-icons'
import {statusList} from '@/utils/localeData'
import InfiniteLoading from 'vue-infinite-loading'
import eventBus from '@/utils/eventBus'
//import VueQRCodeComponent from 'vue-qrcode-component'

export default {
    name: "ChatShareDrawer",
    components: {
      
        SendIcon,
        InfiniteLoading,
        //QrCode: VueQRCodeComponent
    },
    data() {
        return {
            statusList,
            dialogList: [],
            activeDrop: true,
            scrollStatus: true,
            page: 0,
            drawerVisible: false,
            loading: false,
            createLoader: false,
            modalVisible: false,
            selectedChat: null,
            selectList: [],
            text: ''
        }
    },
    computed: {
        ...mapState({
            windowWidth: state => state.windowWidth,
            shareModel: state => state.share.shareModel,
            shareId: state => state.share.shareId,
            shareObject: state => state.share.shareObject,
            chatMessage: state => state.chat.chatMessage,
            bodySelector: state => state.share.bodySelector,
            shareUrl: state => state.share.shareUrl,
            shareTitle: state => state.share.shareTitle
        }),
        statusType() {
            const status = this.statusList.find(elem => elem.name === this.shareObject.status)
            if(status)
                return status.color
            else
                return 'blue'
        },
        visible: {
            get() {
                return this.$store.state.share.visible
            },
            set(val) {
                this.$store.commit('share/SET_VISIBLE', val)
            }
        },
        checkFileType() {
            if(this.shareObject.is_image)
                return 'file-image'
            if(this.shareObject.is_doc)
                return 'file-text'
            if(this.shareObject.is_video)
                return 'video-camera'
            if(this.shareObject.is_audio)
                return 'audio'

            return 'file'
        }
    },
    watch: {
        modalVisible(val) {
            if(!val)
                this.text = ''
            else {
                this.$nextTick(() => {
                    this.$refs.shareText.$el.focus()
                })
            }
        },
        visible(val) {
            if(!val)
                this.clear()
            else
                this.drawerVisible = true
        },
      
    },
    mounted(){
        eventBus.$on("update_list_share_drawer", ()=>{
            if(this.visible){ 
                this.dialogList =[]
                this.page = 0
                this.getDialogkList()
            }
        })
    },
    
    methods: {
        emailShare() {
            window.open(`mailto:?subject=${this.shareTitle}&body=${this.shareTitle} - ${this.shareUrl}`, '_blank').focus()
        },
        wpShare() {
            window.open(`https://wa.me/?text=${this.shareTitle} - ${this.shareUrl}`, '_blank').focus()
        },
        tgShare() {
            window.open(`https://t.me/share/url?url=${this.shareUrl}&text=${this.shareTitle}`, '_blank').focus()
        },
        copyLink() {
            try {
                navigator.clipboard.writeText(this.shareUrl)
            } catch(e) {
                console.log(e)
            }
        },
        getPopupContainer() {
            return document.querySelector('.share_footer')
        },
        afterVisibleChange(val) {
            if(!val) {
                this.drawerVisible = false
            }
        },
        inputHandler(e) {
            if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault()
                this.createMessage()
            }
        },
        changeSelectValue(dialog){
            // this.$nextTick(()=>{
            // let value = this.$refs['checkbox_'+ dialog.chat_uid][0].$el.control.checked
            // if(value){
            this.selectList.push(dialog.chat_uid)
                 
            // } else {
            //     this.selectList = this.selectList.filter(el=> el !== dialog.chat_uid)
            // }
            this.modalVisible = true
            // })
           
        },
        changeSelect(val){
            let value = val.target.checked
            if(value){
                this.selectList.push(val.target.id)
            } else {
                this.selectList = this.selectList.filter(el=> el !== val.target.id)
            }
        },
        createChat(){
            this.$store.commit('chat/TOGGLE_CREATE_CHAT', true)
        },
        async createMessage(value) {
            try {
               
                this.createLoader = true
                this.selectList.forEach(el => {
                    let queryParams = {
                        text: this.text,
                        attachments: [],
                        chat: el,
                        share: { 
                            share_id: this.shareId,
                            ...this.shareObject,
                            type: this.shareModel

                        }
                    
                    }

                    this.$socket.client.emit("message", queryParams)
                    // this.$store.commit('chat/ADD_MESSAGE_BY_ID', {chat_uid: this.selectList[0], value: queryParams})
           
                });
                if(this.shareModel === 'tasks.TaskModel')
                    this.$message.success(this.$t('chat.task_sent'))
                if(this.shareModel === 'files')
                    this.$message.success(this.$t('chat.file_sent'))
                if(this.shareModel === 'comments')
                    this.$message.success(this.$t('chat.comments_sent'))
               

                if(value){ 
                    this.createLoader = true
                    setTimeout(() => {
                        if(this.$route.name !=='chat' && this.$route.query.chat_id !== this.selectList[0])
                            this.$router.push({name: 'chat', query: {chat_id: this.selectList[0]}})  

                        this.close()
                        this.createLoader = false
                    }, 10);
                } else {
                    this.close()
                }
               
                
            } catch(e) {
                console.log(e)
                // this.$message.error(this.$t('error') + e)
            } finally {
                this.createLoader = false
            }
        },
        clear() {
            this.text = ''
            this.selectedChat = null
            this.dialogList = []
            this.scrollStatus = true
            this.page = 0
            this.selectList = []
            this.$store.commit('share/CLEAR_PARAMS')
        },
        selectDialog(dialog) {
            this.selectedChat = dialog
            this.modalVisible = true
        },
        close() {
            this.modalVisible = false
            this.visible = false
            this.selectList = []
        },
        async getDialogkList($state = null) {
            if(!this.loading && this.scrollStatus) {
                try {
                    this.loading = true
                    this.page = this.page+1
                    let params = {
                        page_size: 15,
                        page: this.page
                    }

                    const { data } = await this.$http.get('/chat/list/', { params })
                    if(data && data.results.length)
                        this.dialogList = this.dialogList.concat(data.results)
                   
                    if(!data.next) {
                        if($state)
                            $state.complete()
                        this.scrollStatus = false
                    } else {
                        if($state)
                            $state.loaded()
                    }
                } catch(e) {

                } finally {
                    this.loading = false
                }
            } else {
                if($state)
                    $state.loaded()
            }
        }
    }
}
</script>

<style lang="scss">
.footer_share{
    textarea{
        resize: none;
    }
    .footer_action{
        right: 15px;
        top: 50%;
        margin-top: -16px;
    }
    .send_chat_btn{
        &.ant-btn-loading{
            img{
                display: none;
            }
        }
    }
    
}
.ant-dropdown{
        z-index: 99999;
}
.send_button{
                display: flex;
                align-items: center;
                justify-content: center;
                .feather{
                    margin-top: 2px;
                    margin-right: 2px;
                }
            }
.share_select_driwer{
    .ant-drawer-content,
    .ant-drawer-wrapper-body{
        overflow: hidden;
    }
    &.show_link{
        .drawer_share_link{
            height: 50px;
            border-bottom: 1px solid var(--border2);
            padding: 5px 15px;
            display: flex;
            align-items: center;
            .share_btn{
                cursor: pointer;
                width: 35px;
                height: 35px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #eff2f5;
                border-radius: 50%;
                img{
                    max-width: 18px;
                    height: auto;
                }
                &:not(:last-child){
                    margin-right: 8px;
                }
            }
        }
        .drawer_body{
            height: calc(100% - 90px);
        }
    }
    &:not(.show_link) {
        .drawer_body{
            height: calc(100% - 40px);
        }
    }
    .ant-drawer-body{
        padding: 0px;
        height: calc(100% - 40px);
        .drawer_footer{
            padding: 0 15px;
            display: flex;
            align-items: center;
            border-top: 1px solid var(--border2);
            height: 40px;
        }
        .drawer_scroll{
            height: 100%;
            overflow-y: auto;
            overflow-x: hidden;
        }
    }
}
</style>
