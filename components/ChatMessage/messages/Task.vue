<template>
    <div
        class="cursor-pointer reply_message truncate w-full mt-2 mb-2 pt-1 lg:pt-3 pb-1 lg:pb-3 pr-2"
        :style="`border-color: ${priorityColor}`"
        @click="openTask()">
        <div class="text-sm">
            <div class="label font-semibold mb-2">
                {{$t('chat.task2')}} #{{messageItem.share.counter}}
            </div>
            <div class="truncate mb-1 flex items-center">
                <div class="truncate">{{messageItem.share.name}}</div>
                <a-tag class="ml-1" v-if="messageItem.share.attachments && messageItem.share.attachments.length">
                    <a-icon type="paper-clip" />
                    {{messageItem.share.attachments.length}}
                </a-tag>
            </div>
            <div class="flex items-center mb-2">
                <span class="mr-1">{{$t('chat.owner')}}:</span>
                <Profiler
                    :avatarSize="22"
                    nameClass="text-sm"
                    :showChatButton="false"
                    :user="messageItem.share.owner" />
            </div>
            <div class="flex items-center mb-2">
                <span class="mr-1">{{$t('chat.operator')}}:</span>
                <Profiler
                    :avatarSize="22"
                    nameClass="text-sm"
                    :showChatButton="false"
                    :user="messageItem.share.operator" />
            </div>
            <div class="flex items-center mb-2" v-if="messageItem.share.visors.length">
                <span class="mr-1">{{$t('chat.observers')}}:</span>
                <div class="flex items-center">
                    <div v-for="user in messageItem.share.visors" :key="user.id" class="visor_user">
                        <Profiler
                            :avatarSize="22"
                            :showUserName="false"
                            nameClass="text-sm"
                            :showChatButton="false"
                            :user="user" />
                    </div>
                </div>
            </div>
            <div class="flex items-center">
                <span class="mr-1">{{$t('chat.dead_line')}}:</span>
                <template v-if="messageItem.share.dead_line">
                    <div>{{$moment(messageItem.share.dead_line).format('D MMMM, HH:mm')}}</div>
                </template>
                <template v-else>
                    <a-tag class="m-0">{{$t('chat.no_time_limit')}}</a-tag>
                </template>
            </div>
            <a-button class="mt-2" type="primary" size="small">{{$t('chat.open_task')}}</a-button>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        messageItem: {
            type: Object,
            required: true
        }
    },
    data(){
        return {
            priorityList: [
                {
                    name: 'Низкий',
                    value: 1,
                    color: '#52c41a',
                    i18n: 'low'
                },
                {
                    name: 'Средний',
                    value: 2,
                    color: '#faad14',
                    i18n: 'middle'
                },
                {
                    name: 'Высокий',
                    value: 3,
                    color: '#f5222d',
                    i18n: 'tall'
                }
            ]
        }
    },
    computed:{
        priorityColor(){
            let idx = this.messageItem.share.priority - 1
            return this.priorityList[idx].color
        }
    },
    methods: {
        openTask() {
            let query = Object.assign({}, this.$route.query)
            if(query.task && Number(query.task) !== this.messageItem.share.id || !query.task) {
                query.task = this.messageItem.share.id
                this.$router.push({query})
            }
        },
        
    },

}
</script>

<style lang="scss">
.visor_user{
    display: flex;
    align-items: center;
    &:not(:first-child){
        margin-left: -10px;
    }
}
</style>