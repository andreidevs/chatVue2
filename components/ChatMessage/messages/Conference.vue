<template>
    <div class="w-full py-1 pr-2 my-2 text-sm truncate reply_message lg:pt-2 lg:pb-2">
        <div class="truncate cursor-pointer" @click="open()" >
            <div class="mb-1 font-semibold">
                {{ c.name }}
            </div>
            <div class="mb-1 ">
                {{ $t("chat.conference") }}
            </div>
            <div class="mb-2 text-xs"></div>
            <div class="flex items-center mb-2 truncate">
                <span class="mr-2">{{ $t("chat.author") }}:</span>
                <Profiler name-class="" :user="c.author" :avatar-size="18" />
            </div>
            <div 
                
                class="cursor-pointer">
                <div class="pb-2">
                    Дата начала: {{$moment(c.date_begin).format('DD.MM.YYYY в HH:mm')}}
                </div>
                <div class="pb-2">
                    Длительность: {{ c.duration }} минут
                </div>
                <div>
                    Участников: {{ memberCount }}
                </div>
            </div>
         
        </div>
        <a 
            v-if="c || c.status !== 'ended'"
            :href="c.target" 
            class="ant-btn  ant-btn-background-ghost mt-2"
            target="_blank">
            <a-icon type="select" />
            <span>Соединиться</span>
        </a>
    </div>
</template>

<script>
import {
    declOfNum,
    formatIntervalShort,
} from '@/utils/utils'


export default {
    components: {  },
    props: {
        messageItem: {
            type: Object,
            required: true
        }
    },
    created: function() {

    },
    computed: {
        c() { return   this.messageItem.share},
               
        memberCount() {
            return this.c.members_count + ' ' + declOfNum(this.c.members_count,
                ['человек', 'человека', 'человек'])
        },
    },
    methods: {
       
        open() {
            let query = Object.assign({}, this.$route.query)
            if(!query?.meeting) {
                query.meeting = this.c.id
                this.$router.push({query})
            }
        },
    },
}
</script>
