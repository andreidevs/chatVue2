<template>
    <transition name="slide">
        <div
            v-if="replyMessage"
            class="reply_modal flex items-center justify-between reply_nav absolute px-4 py-1 w-full">
            <div class="replay_nav_body w-full pr-2">
                <div class="text-xs font-semibold">
                    {{replyMessage.message_author.full_name}}
                </div>
                <div
                    v-if="replyMessage.text.length"
                    class="replay_nav_text text-sm">
                    <div
                        class="truncate"
                        v-html="replyMessage.text"></div>
                </div>
                <template v-else>
                    <template v-if="replyMessage.share">
                        <div class="text-sm">
                            {{$t(replyMessage.share.model)}}
                        </div>
                    </template>
                    <div v-else class="text-sm">
                        {{$t('chat.file_and_image')}}
                    </div>
                </template>
            </div>
            <a-button
                @click="replyRemove"
                type="link"
                class="text-current"
                size="large"
                icon="close-circle" />
        </div>
    </transition>
</template>

<script>
import { mapState, mapGetters, mapMutations } from 'vuex'
export default {
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat
        }),
        ...mapGetters({
            getReplyMessage: 'chat/replyMessageModal'
        }),
        replyMessage() {
            return this.getReplyMessage(this.activeChat.chat_uid)
        }
    },
    methods: {
        ...mapMutations({
            DELETE_REPLY_MESSAGE: 'chat/DELETE_REPLY_MESSAGE_MODAL'
        }),
        replyRemove() {
            this.DELETE_REPLY_MESSAGE(this.activeChat.chat_uid)
        }
    }
}
</script>

<style lang="scss">
.ant-modal-footer{
    .reply_nav{
        &.reply_modal{
            position: relative;
            bottom: initial;
            left: initial;
            margin-bottom: 5px;
            padding-left: 0px;
            padding-right: 0px;
            backdrop-filter: initial;
            .replay_nav_body{
                text-align: left;
            }
        }
    }
}
</style>