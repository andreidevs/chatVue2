import { mapState } from 'vuex'

export default {
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat,
            windowWidth: state => state.windowWidth,
            // user: state => state.user.user
        }),
        isViewContext() {
            if (!this.messageItem.is_system || (this.messageItem.is_system && this.messageItem.share)) return false

            return true
        },
        bubbleBackground() {
            if (this.myMessage) {
                return 'bg_primary'
            } else if (this.messageItem.is_system) {
                return 'bg_system'
            }


            return 'bg_gray'
        },
        deleteBtnShow() {

            // !this.messageItem.is_system &&
            //     !this.messageItem.is_deleted &&
            //     this.activeChat.chat_author &&
            //     this.user.id === this.messageItem.message_author?.id
            if (

                !this.messageItem.is_system &&
                this.user.id === this.messageItem.message_author?.id) {

                const messDate = this.$moment().add(1, 'm').format()

                if (this.$moment(messDate).diff(this.messageItem.created, 'minute') <= 1)
                    return true
                else
                    return false
            } else
                return false
        },
        textLength() {
            if (this.messageItem.text.length > 300)
                return true
            else
                return false
        },
        textReplace() {
            const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
            return this.messageItem.text.replace(urlRegex, (url) => {
                return '<a target="_blank" href="' + url + '">' + url + '</a>';
            })
        },
        messageDate() {
            const yesterday = this.$moment(this.messageItem.created).add(14, 'hour').unix(),
                current = this.$moment().unix();

            if (yesterday > current)
                return this.$moment(this.messageItem.created).format('HH:mm')
            else
                return this.$moment(this.messageItem.created).format('DD.MM.YYYY HH:mm')
        },
        isDelete() {
            if (this.messageItem.is_deleted)
                return 'delete_message'
            else
                return ''
        },
        messageBg() {
            if (this.activeChat.chat_author) {
                if (this.user.id === this.activeChat.chat_author.id)
                    return 'bg_primary text-white'
                else
                    return 'border border-solid border-transparent bg_white'
            } else
                return 'delete_message'
        },
        myMessage() {

            if (this.messageItem.message_author)

                if (this.user.id === this.messageItem.message_author.id)
                    return true
                else
                    return false
            else
                return false
        },
        pinMessageShow() {
            if (this.activeChat.is_public) {
                if (this.activeChat.chat_author && this.user.id === this.activeChat.chat_author.id || this.activeChat.is_moderator) {
                    return true
                }
                else
                    return false
            } else
                return true
        }
    }
}