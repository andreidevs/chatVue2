<template>
    <div class="reply_message w-full mt-2 mb-2 pt-1 lg:pt-3 pb-1 lg:pb-3 pr-2">
        <Profiler
            class="mb-2 profiler"
            :subtitle="{text: $t('comment2'), class: 'text-sm'}"
            :user="messageItem.share.author" />
        <div>{{messageItem.share.text}}</div>
    </div>
</template>

<script>
export default {
    props: {
        messageItem: {
            type: Object,
            required: true
        }
    }
}
</script>