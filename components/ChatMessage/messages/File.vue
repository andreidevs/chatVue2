<template>
    <div class="message_files reply_message lg:pt-3 pb-1 lg:pb-3 pr-2 mb-2 mt-2">
        <div class="text-xs mb-1"><a-icon type="paper-clip" /> {{$t('chat.attached_file')}}</div>
        <div class="file_list_item">
            <div class="res_img_wrapper cursor-pointer" @click="$store.commit('chat/SET_SELECT_IMG', message.share)" v-if="message.share.is_image">
                <img class="img_resp lazyload" :data-src="message.share.path" :alt="message.share.name" />
            </div>
            <div class="file_wrapper" v-else>
                <a class="doc_file_message" download :href="message.share.path">
                    <a-icon type="file" class="mr-2" />
                    {{message.share.name ? message.share.name : $t('file')}}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        message: {
            type: Object,
            required: true
        }
    }
}
</script>

<style lang="scss" scoped>
.res_img_wrapper{
    background: transparent!important;
}
</style>