<template>
    <div class="chat_aside__header flx">
        <a-input-search
            :placeholder="$t('chat.press_name')"
            v-model="searchText"
            allowClear
            @change="chatSearch"/>
        <a-button
            v-tippy="{ inertia : true, duration : '[600,300]'}"
            :content="$t('chat.new_chat')"
            @click="$store.commit('chat/TOGGLE_CREATE_CHAT', true)"
            class="ml-2 new_chat_button"
            type="link"
            icon="form" />

    </div>
</template>

<script>
import { debounce } from "lodash";
export default {
    name: "ChatHeader",
    computed: {

        searchLoading:{
            get(){
                return this.$store.state.chat.searchLoading
            },

            set(value){
                this.$store.commit('chat/setValueState', {name: 'searchLoading', value})
            }
        },
        searchText:{
            get(){
                return this.$store.state.chat.searchText
            },

            set(value){
                this.$store.commit('chat/setValueState', {name: 'searchText', value})
            }
        },
       
        searchPage:{
            get(){
                return this.$store.state.chat.searchPage
            },

            set(value){
                this.$store.commit('chat/setValueState', {name: 'searchPage', value})
            }
        },
        searchStart:{
            get(){
                return this.$store.state.chat.searchStart
            },

            set(value){
                this.$store.commit('chat/setValueState', {name: 'searchStart', value})
            }
        },
    },
    methods: {
        chatSearch:debounce(async function() {
            if(this.searchText.length > 1) {
                this.searchLoading = true
                this.searchStart = true
                try {
                    this.$store.commit('chat/CLEAR_SEARCH_RESULT')
                   
                    this.$store.dispatch('chat/search', {val: this.searchText, page: this.searchPage})
                } catch(e) {}
                finally{
                    setTimeout(() => {
                        this.searchLoading = false
                    }, 1000);
                }
                
            } else{ 
                this.$store.commit('chat/CLEAR_SEARCH_RESULT')
                this.searchStart = false
            }
        },500
        )},
    
}
</script>

<style lang="">
    
</style>