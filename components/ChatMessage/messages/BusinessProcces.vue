<template>
    <div
        class="cursor-pointer reply_message truncate w-full mt-2 mb-2 pt-1 lg:pt-3 pb-1 lg:pb-3 pr-2"
        @click="openTask()">
        <div class="text-sm">
            <div class="label font-semibold mb-2">
                {{c.itinerary.name}} 
            </div>
            <div class="truncate mb-1 flex items-center">
                <div class="truncate">Название: {{messageItem.share.name}}</div>
                
                <a-tag class="ml-1" v-if="messageItem.share.attachments && messageItem.share.attachments.length">
                    <a-icon type="paper-clip" />
                    {{messageItem.share.attachments.length}}
                </a-tag>
            </div>
            <div class="mb-2 mt-1">Сумма: {{c.amount_of_money}} тнг</div>
            <div class="flex items-center mb-2">
                <span class="mr-1">{{$t('chat.owner')}}:</span>
                <Profiler
                    :avatarSize="22"
                    nameClass="text-sm"
                    :showChatButton="false"
                    :user="messageItem.share.owner" />
            </div>
            <div class="mb-2">
                Статус:  <Status class="ml-1" :record="c" />
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
            <a-button class="mt-2" type="primary" size="small">Открыть заявку</a-button>
        </div>
    </div>
</template>

<script>
import Status from '@apps/BusinessProcesses/components/Table/Status'
export default {
    components: {Status},
    props: {
        messageItem: {
            type: Object,
            required: true
        }
    },
    computed:{
        c(){
            return this.messageItem.share
        }
    },
    methods: {
        openTask() {
            let query = Object.assign({}, this.$route.query)
            if(query.task && Number(query.task) !== this.messageItem.share.id || !query.task) {
                query.task = this.messageItem.share.id
                this.$router.push({query})
            }
        }
    }
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