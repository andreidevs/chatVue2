import { isFileImage } from '../../../utils'
import { mapMutations } from 'vuex'
import { debounce } from 'lodash'
import ChatEventBus from '../../../utils/ChatEventBus'
export default {
    methods: {
        ...mapMutations({
            CHANGE_CHAT_MESSAGE: 'chat/CHANGE_CHAT_MESSAGE',
            CHANGE_CHAT_MESSAGE_MODAL: 'chat/CHANGE_CHAT_MESSAGE_MODAL',
            PUSH_FILE_LIST: 'chat/PUSH_FILE_LIST',
            FILE_CHANGE_FIELD: 'chat/FILE_CHANGE_FIELD',
            SET_FILE_MODAL: 'chat/SET_FILE_MODAL',
            FILE_DELETE: 'chat/FILE_DELETE',
            FILE_DELETE_BY_KEY: 'chat/FILE_DELETE_BY_KEY',
            setReplyMessage: 'chat/setReplyMessage',
            setReplyMessageModal: 'chat/setReplyMessageModal',
            DELETE_REPLY_MESSAGE: 'chat/DELETE_REPLY_MESSAGE',
            DELETE_REPLY_MESSAGE_MODAL: 'chat/DELETE_REPLY_MESSAGE_MODAL',
            clearInput: "chat/CLEAR_INPUT",
            addLastMessage: 'chat/addLastMessage'
        }),
        // Emoji
        selectEmoji(emoji) {
            this.message.text = this.message.text + emoji.detail.unicode
            if (this.messageModal?.text) {
                this.messageModal.text = this.messageModal.text + emoji.detail.unicode

            }
        },
        // Delete filin from modal
        deleteFile(file) {
            this.FILE_DELETE_BY_KEY({
                id: this.activeChat.chat_uid,
                fileId: file.iid
            })

            if (!this.fileList?.length) {
                this.closeFileModal()
            }
        },
        // Close from file modal
        closeFileModal() {
            this.SET_FILE_MODAL({
                id: this.activeChat.chat_uid,
                value: false
            })
            this.FILE_DELETE(this.activeChat.chat_uid)
            if (this.messageModal?.text) {
                this.message.text = this.messageModal.text
                this.messageModal.text = ''
            }
            if (this.replyMessageModalData) {
                this.setReplyMessage({
                    id: this.activeChat.chat_uid,
                    mesage: this.replyMessageModalData
                })
                this.DELETE_REPLY_MESSAGE_MODAL(this.activeChat.chat_uid)
            }
            this.$nextTick(() => {
                this.$refs['message_input']?.focus()
            })
        },



        handleFileUpload(event) {

            const files = Object.values(event.target.files)
            if (files.length) {
                if (this.fileList.length >= 10) {
                    this.$message.warning(this.$t('chat.file_max_count', { count: 10 }))
                } else {
                    files.forEach(async (item, i) => {
                        let formData = new FormData()
                        if (10 && ((files[i].size / 1024) / 1024) >= 10) {
                            this.$message.warning(this.$t('chat.file_size_error', { name: files[i].name, filesize: 10 }))
                            return false
                        }

                        const iid = Date.now() + Math.floor(Math.random() * Math.floor(20)) + Math.random()
                        const type = isFileImage(files[i])

                        this.PUSH_FILE_LIST({
                            id: this.activeChat.chat_uid,
                            file: {
                                image: type,
                                name: files[i].name,
                                type: files[i].name.split('.')[1],
                                loading: true,
                                file: null,
                                iid
                            }
                        })


                        if (!this.fileModal) {
                            this.SET_FILE_MODAL({
                                id: this.activeChat.chat_uid,
                                value: true
                            })
                            if (this.message.text) {
                                this.messageModal.text = this.message.text
                                this.message.text = ''
                            }
                            if (this.replyMessageData) {
                                this.setReplyMessageModal({
                                    id: this.activeChat.chat_uid,
                                    mesage: this.replyMessageData
                                })
                                this.DELETE_REPLY_MESSAGE(this.activeChat.chat_uid)
                            }
                        }

                        formData.append('upload', files[i])

                        try {
                            const { data } = await this.$http.post('/common/upload/', formData, {
                                headers: {
                                    'Content-Type': 'multipart/form-data'
                                }
                            })
                            // if(data && data.length) {
                            this.FILE_CHANGE_FIELD({
                                id: this.activeChat.chat_uid,
                                field: 'file',
                                fileId: iid,
                                value: data[0]
                            })
                            this.FILE_CHANGE_FIELD({
                                id: this.activeChat.chat_uid,
                                field: 'loading',
                                fileId: iid,
                                value: false
                            })
                            // }

                        } catch (e) {
                            this.$message.error(this.$t('chat.error'))
                        }
                    })
                }
            }
        },
        async sendMessage() {
            try {
                if (this.checkEmptyMessage) {
                    let timeout = 0
                    if (this.activeChat.no_create) {
                        timeout = 300
                        await this.createNewChat(this.activeChat)
                        setTimeout(() => {
                            this.$store.commit('chat/setSidebarActiveTab', 1)
                            this.setQueryId(this.activeChat)
                        }, timeout);

                    }

                    setTimeout(() => {
                        let data = {}

                        const author = this.$store.state.user.user
                        data['message_author'] = author
                        data['message_author']['full_name'] = author.first_name + ' ' + author.last_name + ' ' + author.middle_name
                        data['text'] = this.getMessageText()
                        data['chat'] = this.activeChat.chat_uid
                        data['is_system'] = false
                        data['is_pinned'] = false
                        data['is_deleted'] = false
                        data['message_reply'] = this.replyMessageData
                        data['attachments'] = this.getFileListSend(this.activeChat.chat_uid)
                        let aChat = this.activeChat
                        aChat['no_create'] = false
                        data = { ...data, ...aChat }


                        this.createMessage(data)
                        this.clearInput(this.activeChat.chat_uid)

                        this.closeFileModal()
                        this.DELETE_REPLY_MESSAGE_MODAL(this.activeChat.chat_uid)
                        this.DELETE_REPLY_MESSAGE(this.activeChat.chat_uid)
                        ChatEventBus.$emit('arreaScrollDown')

                    }, timeout);
                } else {
                    this.message.text = ""
                    this.messageModal.text = ""
                }
            } catch (e) {
                console.error(e)
                this.$message.error("Ошибка перезагрузите страницу!")
            }

        },

        setTyping: debounce(function () {
            this.$socket.client.emit('chat_typing', { chat_uid: this.activeChat.chat_uid })
        }, 200),

        createNewChat(chat) {
            this.$socket.client.emit("create",
                {
                    is_public: chat.is_public,
                    members: [
                        { user: chat.recipient.id }
                    ]
                })
        },

        createMessage(message) {
            this.$socket.client.emit("message", message)
            this.addLastMessage(message)
        },
        setQueryId(data) {
            let query = Object.assign({}, this.$route.query)
            if (query?.chat_id !== data.chat_uid) {
                query.chat_id = data.chat_uid
                this.$router.push({ query })
            }
        },

        paste(e) {
            let items;

            if (e.clipboardData?.items?.length) {
                items = e.clipboardData.items;
                if (items) {

                    let self = this
                    items = Array.prototype.filter.call(items, (element) => {
                        return element.type.indexOf('image') >= 0
                    })

                    Array.prototype.forEach.call(items, (item) => {

                        let blob = item.getAsFile();

                        let dt = new DataTransfer();
                        dt.items.add(new File([blob], blob.name ? blob.name : 'Изображение.jpeg', { type: item.type }));

                        let file_list = { target: { files: dt.files } };
                        self.handleFileUpload(file_list)

                    });
                }
            }
        },
        dragOver(e) {
            e.stopPropagation();
            e.preventDefault();

            e.dataTransfer.dropEffect = 'copy';
            this.showDragWin = true


        },
        dragLeave(event) {
            event.stopPropagation();
            event.preventDefault();
            if (event.clientX === 0 && event.clientY === 0)
                this.showDragWin = false

        },
        dropComplete(e) {

            e.stopPropagation();
            e.preventDefault();
            this.showDragWin = false

            const fileList = { target: { files: e.dataTransfer.files } };

            this.handleFileUpload(fileList)
        },

    },
}