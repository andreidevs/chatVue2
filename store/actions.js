import axios from '@/config/axios'
export default {
    getMessageCount({ commit, state }) {
        return new Promise((resolve, reject) => {
            axios.get('chat/message/count/')
                .then(({ data }) => {
                    commit("navigation/SET_MENU_COUNTER", { value: data.count, name: "chat" }, { root: true })
                    resolve(data)
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    },
    getChatMembers({ commit, state }, { chat }) {
        return new Promise((resolve, reject) => {
            axios.get('/chat/member/list/', {
                params: {
                    page: state.chatMembers?.[chat]?.page ? state.chatMembers[chat].page : 1,
                    page_size: 18,
                    chat
                }
            })
                .then(({ data }) => {
                    if (state.chatMembers?.[chat]?.results?.length) {
                        commit('CONCAT_CHAT_MEMBERS', { data, chat })
                    } else {
                        commit('SET_CHAT_MEMBERS', { data, chat })
                    }
                    resolve(data)
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    },
    getSidebarChat({ commit, state }) {
        return new Promise((resolve, reject) => {
            commit('SET_CHAT_LIST_PAGE', state.chatListPage + 1)

            axios.get('/chat/list/', {
                params: {
                    page: state.chatListPage,
                    page_size: 15
                }
            })
                .then(({ data }) => {
                    commit('CONCAT_CHAT', data.results)
                    commit('SET_CHAT_LIST_NEXT', data.next)
                    resolve(data)
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    },
    getSidebarContact({ commit, state }, { all }) {
        return new Promise((resolve, reject) => {
            commit('SET_CONTACT_LIST_PAGE', state.contactListPage + 1)

            axios.get('/chat/users/', {
                params: {
                    page: state.contactListPage,
                    page_size: 15,
                    all
                }
            })
                .then(({ data }) => {
                    commit('CONCAT_CONTACTS', data.results)
                    commit('SET_CONTACT_LIST_NEXT', data.next)
                    resolve(data)
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    },
    getGroupContact({ commit, state }, { chat }) {
        return new Promise((resolve, reject) => {
            commit('SET_CONTACT_GROUP_PAGE', state.contactGroupPage + 1)

            axios.get('/chat/users/', {
                params: {
                    page: state.contactGroupPage,
                    page_size: 15,
                    chat
                }
            })
                .then(({ data }) => {
                    commit('CONTACT_GROUP_CONTACTS', data.results)
                    commit('SET_CONTACT_GROUP_NEXT', data.next)
                    resolve(data)
                })
                .catch(e => {
                    console.log(e)
                    reject(e)
                })
        })
    },
    getMessage({ commit, state }, refresh = false) {
        return new Promise((resolve, reject) => {
            if (state.chatMessage[state.activeChat.chat_uid] && !refresh)
                resolve(state.chatMessage[state.activeChat.chat_uid])
            else {
                axios.get('/chat/message/list/', {
                    params: {
                        page_size: 15,
                        chat: state.activeChat.chat_uid,

                    }
                })
                    .then(({ data }) => {
                        if (data.results.length) {
                            if (data.results[0].chat === state.activeChat.chat_uid)
                                commit('OPEN_CHAT_MESSAGE', data)
                        }
                        resolve(data)
                    })
                    .catch((error) => { reject(error) })
            }
        })
    },
    getMessageScroll({ commit, state }) {
        return new Promise((resolve, reject) => {
            axios.get(`/chat/message/list/?${state.chatMessage[state.activeChat.chat_uid].next}`)
                .then(({ data }) => {
                    if (data.results.length) {
                        commit('SET_MESSAGE_NEXT', data)
                        commit('CONCAT_CHAT_MESSAGE', data)
                    }
                    resolve(data)
                })
                .catch((error) => { reject(error) })
        })
    },
    getCurrentChat({ commit }, id) {
        return new Promise((resolve, reject) => {
            axios.get(`/chat/${id}/detail/`)
                .then(({ data }) => {
                    if (data) {
                        commit('SET_ACTIVE_CHAT', data)
                        commit('SET_CHAT_MESSAGE', data.chat_uid)
                        commit('SET_CHAT_MESSAGE_MODAL', data.chat_uid)
                    }
                    resolve(data)
                })
                .catch((error) => { reject(error) })
        })
    },
    getPrivateChat({ commit }, id) {
        return new Promise((resolve, reject) => {
            axios.get(`/chat/private/?user=${id}`)
                .then(({ data }) => {
                    if (data) {
                        // commit('SET_ACTIVE_CHAT', data)
                        // commit('SET_CHAT_MESSAGE', data.chat_uid)
                        // commit('SET_CHAT_MESSAGE_MODAL', data.chat_uid)
                    }
                    resolve(data)
                })
                .catch((error) => { reject(error) })
        })
    },
    getMessageDownScroll({ commit, state }) {
        return new Promise((resolve, reject) => {
            axios.get(`/chat/message/list/?${state.chatMessage[state.activeChat.chat_uid].prev}`)
                .then(({ data }) => {
                    if (data.results.length) {
                        commit('SET_MESSAGE_PREV', data)
                        commit('PUSH_CHAT_MESSAGE', data)
                    }
                    resolve(data)
                })
                .catch((error) => { reject(error) })

        })
    },
    searchMessages({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            axios.get(`/chat/message/list/`, {
                params: {
                    message: payload.message_uid,
                    page_size: 15,
                    chat: state.activeChat.chat_uid
                }
            })
                .then(({ data }) => {
                    if (data.results.length)
                        commit('SET_SEARCH_CHAT_MESSAGE', data)

                    resolve(data)
                })
                .catch((error) => { reject(error) })
        })
    },
    getPinMessage({ commit, state }, { page_size = 15, page = 1 }) {
        if (state.pinMessage[state.activeChat.chat_uid] && state.pinMessage[state.activeChat.chat_uid].length)
            resolve(state.pinMessage[state.activeChat.chat_uid])
        else {
            return new Promise((resolve, reject) => {
                axios.get('/chat/pinned_message/list/', {
                    params: {
                        page_size,
                        page,
                        chat: state.activeChat.chat_uid
                    }
                })
                    .then(({ data }) => {
                        if (data.results) {
                            commit('PIN_GENERATE', data)
                        }
                        resolve(data)
                    })
                    .catch((error) => { reject(error) })
            })
        }
    },
    getPinMessageScroll({ commit, state }) {
        return new Promise((resolve, reject) => {
            const next = state.pinMessage[state.activeChat.chat_uid].next.split('?')[1]
            axios.get(`/chat/pinned_message/list/?${next}`)
                .then(({ data }) => {
                    commit('PIN_PUSH', data)
                    resolve(data)
                })
                .catch((error) => { reject(error) })
        })
    },
    search({ commit }, payload) {
        return new Promise((resolve, reject) => {
            axios.get(`/chat/search/?text=${payload.val}`, {
                params: {
                    page: payload.page,
                    page_size: 99
                }
            })
                .then(({ data }) => {
                    if (data.results.length)
                        commit('CONCAT_SEARCH_RESULT', data.results)

                    resolve(data)
                })
                .catch((error) => { reject(error) })
        })
    },
    memberSearch({ commit, state }, payload) {
        return new Promise((resolve, reject) => {
            axios.get(`/chat/search/?text=${payload.value}`, {
                params: {
                    page: payload.page,
                    users_only: true,
                    chat: state.openDialog.id
                }
            })
                .then(({ data }) => {
                    if (data.results.length) {
                        let users = []
                        data.results.forEach(item => {
                            users.push(item.obj)
                        })
                        commit('CONCAT_ADD_MEMBERS', users)
                        resolve(data)
                    } else
                        resolve(false)
                })
                .catch((error) => { reject(error) })
        })
    },

}