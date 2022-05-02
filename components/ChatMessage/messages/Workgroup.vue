<template>
    <div class="w-full py-1 pr-2 my-2 text-sm  reply_message lg:pt-2 lg:pb-2">
        <div class=" cursor-pointer" @click="open()" >
            <div class="mb-1 truncate font-semibold">
                {{ c.name }}
            </div>
            <div class="mb-1 ">
                {{ c.is_project ?  $t("chat.project") : $t('chat.workgroup') }}
                     
                <a-tag
                    v-if="c.public_or_private"
                    class="mr-0 ml-2"
                    color="#f50">
                    {{ $t('wgr.closed') }}
                </a-tag>
            </div>

            <div v-if="desc" class="flex justify-between mb-1 text-gray card_desc">
                <span 
                    class="text-sm" 
                    style="word-wrap: break-word; overflow-x: hidden;">
                    Описание: 
                    {{desc}}
                </span>
            </div>

         
            <small class="text-sm">
                {{ participantsText  }}
            </small>

            <div v-if="director" class="mt-1">
                {{ $t("wgr.director") }}: {{ director.last_name }}
                {{ director.first_name }} {{ director.middle_name }}
            </div>
    
            <a 
                class="ant-btn  ant-btn-background-ghost mt-2">
                <a-icon type="select" />
                <span>Открыть</span>
            </a>
       
        </div>
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
               
        desc() {
            if(this.c.description) {
                if(this.c.description && this.c.description.length > 110)
                    return this.c.description.substr(0, 110)
                else
                    return this.c.description
            } else
                return null
        },
        director(){
            return this.c.founder.member
        },
       
        participantsText() {
            return this.c.members_count + ' ' +
             declOfNum(this.c.workgroup_members.length, [this.$t('wgr.participant'), this.$t('wgr.participant2'), this.$t('wgr.participant3')])
        }
    },
    methods: {
       
        open() {
            let query = Object.assign({}, this.$route.query)

            if(this.c.is_project){
                if(!query.viewProject){ 
                    query['viewProject'] = this.c.id
                    console.log("QUERY", query)
                    this.$router.replace({query: query})
                }
             
            } else {
                if(!query.viewGroup){ 
                    query['viewGroup'] = this.c.id
                    console.log("QUERY", query)
                    this.$router.replace({query: query})
                }
            }
         
        },
    },
}
</script>
