<template>
    <transition name="slide">
        <div
            v-if="replyMessage"
            class="flex items-center justify-between reply_nav absolute px-4 py-1 w-full">
            <div class="replay_nav_body w-full pr-2">
                <div class="text-xs font-semibold">
                    {{replyMessage.message_author.full_name}}
                </div>
                <div
                    v-if="replyMessage.text.length"
                    class="replay_nav_text text-sm ">
                    <span
                        class="truncate"
                        v-html="replyMessage.text"></span>
                </div>
                <!-- <template v-else>
                    <template v-if="replyMessage.share">
                        <div class="text-sm">
                            {{$t(replyMessage.share.model)}}
                        </div>
                    </template>
                    <div v-else class="text-sm">
                        {{$t('chat.file_and_image')}}
                    </div>
                </template> -->
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
    name: "ChatReplyMessage",
    computed: {
        ...mapState({
            activeChat: state => state.chat.activeChat
        }),
        ...mapGetters({
            getReplyMessage: 'chat/replyMessage'
        }),
        replyMessage() {
            return this.getReplyMessage(this.activeChat.chat_uid)
        }
    },
    methods: {
        ...mapMutations({
            DELETE_REPLY_MESSAGE: 'chat/DELETE_REPLY_MESSAGE'
        }),
        replyRemove() {
            this.DELETE_REPLY_MESSAGE(this.activeChat.chat_uid)
        }
    }
}
</script>