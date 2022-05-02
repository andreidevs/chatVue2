<template>
    <div class="chat_body__footer " >
        <ReplyMessage />
        <div class="input_wrapper">
            <a-textarea
                class="message_input"
                :auto-size="{ minRows: 1, maxRows: 2} "
                v-model="message.text"
                ref="message_input"
                @change="setTyping()"
                @keydown.enter.exact.prevent
                @keyup.enter.exact="sendMessage"
                :placeholder="$t('chat.press_message')" />
            <div class="send_actions">
                <Emoji  @click="selectEmoji"/>
                <label
                    class="text-2xl px-2 text-current ant-btn ant-btn-link mr-1"
                    for="file_upload">
                    <a-icon type="paper-clip" />
                </label>
                <a-button
                    @click="sendMessage"
                    class="send_button"
                    type="primary"
                    shape="circle">
                    <send-icon
                        size="1.2x" />
                </a-button>
            </div>
        </div>
        <input
            type="file"
            id="file_upload"
            multiple
            style="display:none;"
            ref="file_upload"
            @change="handleFileUpload"
            accept=".jpg, .jpeg, .png, .gif .doc, .docx, .xlsx, .xls, .pdf, .zip, .rar, .7z, .txt" />
        <a-modal
            @dragover.prevent
            @drop.prevent
            :title="$t('chat.file_modal_title')"
            centered
            :visible="fileModal"
            :getContainer="getContainer"
            class="file_modal"
            @cancel="closeFileModal()">
            <div class="file_modal_body">
                <div v-if="fileList && fileList.length">
                    <div
                        v-for="(file, index) in fileList"
                        :key="index"
                        class="file_item relative">
                        <a-spin v-if="!file.file" />
                        <template v-else>
                            <div
                                v-if="file.image"
                                class="image_file">
                                <a-button
                                    icon="delete"
                                    @click="deleteFile(file)"
                                    class="absolute img_delete" />
                                <img
                                    :src="file.file.path"
                                    :alt="file.iid">
                            </div>
                            <div
                                v-else
                                class="mb-2 doc_item w-full flex items-center justify-between">
                                <div class="flex items-center truncate">
                                    <a-icon
                                        type="file"
                                        class="mr-2" />
                                    <div class="truncate">
                                        {{file.name}}
                                    </div>
                                </div>
                                <a-button
                                    @click="deleteFile(file)"
                                    class="ml-2"
                                    icon="delete"
                                    type="link" />
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div slot="footer">
                <ReplyMessageModal />
                <div class="input_wrapper">
                    <a-input
                        style="height: 45px"
                        v-model="messageModal.text"
                        @keyup.enter="sendMessage"
                        @keyup.esc="closeFileModal"
                        ref="message_input_modal"
                        :placeholder="$t('chat.press_message')" />

                    <div class="send_actions">
                        <label
                            class="text-2xl px-2 text-current ant-btn ant-btn-link mr-1"
                            for="file_upload">
                            <a-icon type="paper-clip" />
                        </label>
                        <a-button
                            class="send_button"
                            type="primary"
                            @click="sendMessage"
                            shape="circle">
                            <send-icon
                                size="1.2x" />
                        </a-button>
                    </div>
                </div>
            </div>
        </a-modal>
        <div v-show="showDragWin" class="drag-win">
            <div class="drag-body">
                
                <a-icon type="file-add"  :style="{ fontSize: '54px', color: '#0e4682'} " />
                <span class="text-xl" :style="`color:#0e4682`">Перетащите сюда файлы</span>
            </div>
        </div>
    </div>
</template>

<script>
import { SendIcon } from 'vue-feather-icons'
import ReplyMessage from './ReplyMessage'
import ReplyMessageModal from './ReplyMessageModal'
import ChatEventBus from '../../utils/ChatEventBus'
import computed from './mixins/computed'
import methods from './mixins/methods'
import utils from './mixins/utils'
import Emoji from '@/components/Emoji'
export default {
    name: "ChatFooter",
    components: {
        SendIcon,
        ReplyMessage,
        ReplyMessageModal,
        Emoji
    },
    mixins: [computed, methods, utils],
    data(){
        return {
            showDragWin: false,
        }
    },
   
    watch: {
        fileModal(val) {
            if(val) {
                this.$nextTick(() => {
                    this.$refs['message_input_modal']?.focus()
                })
            }
        }
    },
   
    mounted() {
        ChatEventBus.$on('inputFocus', () => {
            this.$nextTick(() => {
                this.$refs['message_input']?.focus()
            })
        })

        this.$nextTick(()=>{
            if(this.activeChat){ 
                window.addEventListener('paste', (e)=>this.paste(e))
                window.addEventListener('dragover', (e)=>this.dragOver(e))
                window.addEventListener('drop', (e)=>this.dropComplete(e))
                window.addEventListener('dragleave', (e)=>this.dragLeave(e))
            }
        })  
    }
}
</script>

<style lang="scss">

.file_modal_body{
    overflow-y: auto;
    padding: 10px;
    .img_delete{
        top: 10px;
        right: 10px;
    }
    .file_item{
        &:not(:last-child){
            .image_file{
                margin-bottom: 10px;
            }
        }
        .image_file{
            background: rgba(0, 0, 0, 0.04);
            position: relative;
            min-height: 200px;
            max-height: 200px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            img{
                width: 100%;
                object-fit: cover;
                vertical-align: middle;
                -o-object-fit: cover;
            }
        }
    }
}
.file_modal{
    .ant-modal-header,
    .ant-modal-footer{
        padding: 10px;
    }
    .ant-modal-close-x{
        width: 43px;
        height: 43px;
        line-height: 43px;
    }
    .input_wrapper{
        position: relative;
        .message_input{
            width: 100%;
            height: 100%;
            border-radius: 30px;
            text-align: left;
            border: 1px solid var(--border2);
            height: 45px;
            outline: none;
            padding: 10px 55px 10px 15px;
        }
        .send_actions{
            position: absolute;
            top: 0;
            z-index: 1;
            right: 0;
            height: 45px;
            display: flex;
            align-items: center;
            padding-right: 10px;
            .send_button{
                display: flex;
                align-items: center;
                justify-content: center;
                .feather{
                    margin-top: 2px;
                    margin-right: 2px;
                }
            }
        }
    }
    .ant-modal-body{
        padding: 0px;
        min-height: 400px;
        max-height: 400px;
        overflow-y: auto;
    }
    .ant-modal-wrap,
    .ant-modal-mask{
        position: absolute;
    }
    .ant-modal-mask{
        background-color: rgba(0, 0, 0, 0.3);
    }
}
.drag-win{
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
     display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    
    left: 0;
    bottom: 0;
    // padding: 22px;
    z-index: 99;


    

.drag-body{
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

     background: #fff;
    border: 3px dashed var(--primaryColor);
    border-radius: 20px;
  
  
    width: 96%;
    height: 80%;
    margin-right: 1%;
}


}





</style>