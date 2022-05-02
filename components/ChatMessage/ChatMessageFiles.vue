<template>
    <div class="message_files mt-2">
        <div 
            class="file_list_item" 
            v-for="(item, index) in message.attachments" 
            :key="index">
            <div 
                class="res_img_wrapper cursor-pointer" 
                v-if="item.is_image">
                <a 
                    :href="item.path" 
                    class="ch_lght">
                    <img 
                        class="img_resp lazyload" 
                        :data-src="item.path" 
                        :alt="item.name" />
                </a>
            </div>
            <div class="file_wrapper" v-else>
                <a 
                    class="doc_file_message text-white" 
                    target="_blank" 
                    download 
                    :href="item.path">
                    <a-icon type="file" class="mr-2" />
                    {{item.name ? item.name : $t('file')}}
                </a>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        message: Object
    }
}
</script>

<style lang="scss">
.ch_lght{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
}
</style>