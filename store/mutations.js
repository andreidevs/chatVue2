import Vue from 'vue'
import { findKey, orderBy } from 'lodash'
import ChatEventBus from '../utils/ChatEventBus'
export default {

    CREATE_VIRTUAL_CHAT(state, value) {
        let chat = {
            recipient: value,
            chat_author: value.chat_author,
            chat_uid: value.id,
            is_active: true,
            is_moderator: false,
            is_open: true,
            is_public: false,
            member_count: 2,
            no_create: true,
            color: value.color,
            name: value.full_name
        }

        state.activeChat = chat
        Vue.set(state.message, value.id, {
            text: ''
        })

        Vue.set(state.messageModal, value.id, {
            text: ''
        })
    },

    SET_NEW_CREATED_CHAT(state, { value, user }) {
        if (value.chat_author.id === user.id)
            state.activeChat = value
        let id = value.chat_uid



        if (value.recipient) {
            Vue.set(state.message, id, {
                text: state.message[value.recipient.id]?.text ?
                    state.message[value.recipient.id]?.text : ''
            })

            Vue.set(state.messageModal, id, {
                text: state.messageModal[value.recipient.id]?.text ?
                    state.messageModal[value.recipient.id]?.text : ''
            })


            let files = state.fileList[value.recipient.id]?.length ? state.fileList[value.recipient.id] : []

            Vue.set(state.fileList, id, files)
        }



        if (state.chatList && state.chatList.length > 0) {
            state.chatList = orderBy(state.chatList.concat(value), ['last_sent'], ['desc'])
        }
        else {
            state.chatList.push(value)
            state.chatList = orderBy(state.chatList, ['last_sent'], ['desc'])
        }


    },
    incrimentMessageCount(state, chat_uid) {
        const findIndex = state.chatList.findIndex(el => el.chat_uid === chat_uid)
        if (findIndex !== -1) {

            state.chatList[findIndex].new_message_count++
        }
    },
    clearMessageCount(state, chat_uid) {
        const findIndex = state.chatList.findIndex(el => el.chat_uid === chat_uid)
        if (findIndex !== -1) {
            this.dispatch('chat/getMessageCount')
            state.chatList[findIndex].new_message_count = 0
            if (state.chatMessage[chat_uid]) {
                let last = state.chatMessage[chat_uid].value[state.chatMessage[chat_uid].value.length - 1]

                // console.log("LAST", last)
                let data = { chat: state.activeChat.chat_uid, created: last.created }

                ChatEventBus.$emit('chat_member_update_last_message', data)
            }

        }
    },

    ADD_MESSAGE(state, value) {
        // console.log("calue", value)
        const id = value.chat_uid
        if (state.chatMessage[id]) {
            if (!state.chatMessage[id].prev)
                state.chatMessage[id].value.push(value)
        } else {
            // console.log("VALUE NEXTXTTXTXT", value)
            const message = {
                value: [value],
                status: false,
                bottomStatus: false,
                page: 1
            }

            Vue.set(state.chatMessage, id, message)

        }


        ChatEventBus.$emit('arreaScroll')
    },
    addLastMessage(state, message) {
        const findIndex = state.chatList.findIndex(el => el.chat_uid === message.chat_uid)
        if (findIndex !== -1) {

            state.chatList[findIndex].last_message = message
        }


        const chatIndex = state.chatList.findIndex(el => el.chat_uid === message.chat_uid)
        if (chatIndex !== -1) {
            state.chatList[chatIndex]['last_sent'] = new Date()
            state.chatList = orderBy(state.chatList, ['last_sent'], ['desc'])
        }

    },
    setScrollToped(state, value) {
        if (state.activeChat) {
            state.activeChat.scrolled = value
        }
    },
    ADD_MESSAGE_BY_ID(state, { chat_uid, value }) {
        if (state.chatMessage[chat_uid]) {
            state.chatMessage[chat_uid].value.push(value)
        }
    },
    CLEAR_INPUT(state, id) {
        Vue.set(state.message, id, {
            text: ''
        })

        Vue.set(state.messageModal, id, {
            text: ''
        })

    },
    SET_SEARCH_CHAT_MESSAGE(state, payload) {
        state.activeChat.downKey = Math.random() * Math.random()

        let next = '',
            prev = ''

        if (payload.next && payload.next.length) {
            let nextArray = payload.next.split('?')[1].split('&'),
                nextArrayGenerate = []

            nextArray.forEach(item => {
                if (!item.includes("message"))
                    nextArrayGenerate.push(item)
            })
            next = nextArrayGenerate.join('&')
        }
        if (payload.previous && payload.previous.length) {
            let prevArray = payload.previous.split('?')[1].split('&'),
                prevArrayGenerate = []

            prevArray.forEach(item => {
                if (!item.includes("message"))
                    prevArrayGenerate.push(item)
            })
            prev = prevArrayGenerate.join('&')
            state.messageListPrev = true
        } else state.messageListPrev = false

        const chatMessage = {
            value: payload.results,
            status: true,
            next,
            prev,
            bottomStatus: true,
            page: 1
        }
        // console.log('MESSAGE PREV', state.messageListPrev)
        Vue.set(state.chatMessage, state.activeChat.chat_uid, chatMessage)

    },
    CHANGE_MEMBER_MODERATE(state, value) {
        const id = state.activeChat.chat_uid

        const index = state.chatMembers[id].results.findIndex(item => item.user.id === value.id)
        if (index !== -1) {
            state.chatMembers[id].results[index].is_moderator = value.is_moderator
        }
    },
    RENAME_CHAT(state, { chat_name }) {
        state.activeChat.name = chat_name
        const findIndex = state.chatList.findIndex(el => el.chat_uid === state.activeChat.chat_uid)
        if (findIndex !== -1) {
            state.chatList[findIndex].name = chat_name
        }
    },

    PIN_MESSAGE(state, message) {
        // console.log("message pin  ", message)
        if (state.pinMessage[message.chat_uid]) {
            state.pinMessage[message.chat_uid].results.unshift(message)
            state.pinMessage[message.chat_uid].count = state.pinMessage[message.chat_uid].count + 1
        } else {
            const pin = {
                results: [message],
                next: null,
                count: 1
            }
            Vue.set(state.pinMessage, [message.chat_uid], pin)
        }

        const index = state.chatMessage[message.chat_uid].value.findIndex(item => item.id === message.id)
        if (index !== -1)
            state.chatMessage[message.chat_uid].value[index].is_pinned = true
    },
    UNPIN_MESSAGE(state, message) {
        // console.log("message unpin", message)

        if (state.pinMessage[message.chat_uid]) {
            const index = state.pinMessage[message.chat_uid].results.findIndex(pin => pin.id === message.id)
            if (index !== -1)
                Vue.delete(state.pinMessage[message.chat_uid].results, index)

            const pinIndex = state.chatMessage[message.chat_uid].value.findIndex(item => item.id === message.id)
            if (pinIndex !== -1)
                state.chatMessage[message.chat_uid].value[pinIndex].is_pinned = false

            state.pinMessage[message.chat_uid].count = state.pinMessage[message.chat_uid].count - 1
        }
    },

    PIN_GENERATE(state, data) {
        Vue.set(state.pinMessage, state.activeChat.chat_uid, data)
    },
    PIN_PUSH(state, data) {
        state.pinMessage[state.activeChat.chat_uid].results = state.pinMessage[state.activeChat.chat_uid].results.concat(data.results)
        state.pinMessage[state.activeChat.chat_uid].next = data.next
    },
    UNPIN_ALL(state, id) {
        if (state.pinMessage[id]) {
            state.pinMessage[id].results.forEach(pin => {
                const index = state.chatMessage[id].value.findIndex(item => item.id === pin.id)
                if (index !== -1)
                    state.chatMessage[id].value[index].is_pinned = false
            })
        }
        Vue.delete(state.pinMessage, id)
    },

    setSidebarActiveTab(state, value) {
        state.sidebarActiveTab = value
    },

    CONCAT_SPLICE_MEMBERS(state, value) {
        const index = state.addMembersList.findIndex(item => item.id === value.user.id)
        if (index !== -1)
            state.addMembersList.splice(index, 1)
    },
    CONCAT_ADD_MEMBERS_CLEAR(state) {
        state.addMembersList = []
    },
    CONCAT_ADD_MEMBERS(state, value) {
        state.addMembersList = state.addMembersList.concat(value)
    },
    SET_ADD_MEMBER_POPUP(state, value) {
        state.addMemberPopup = value
    },
    SET_SEARCH_TEXT(state, value) {
        state.searchText = value
    },
    CLEAR_SEARCH_RESULT(state) {
        state.searchResult = []
    },
    CONCAT_SEARCH_RESULT(state, value) {
        state.searchResult = state.searchResult.concat(value)
    },

    SET_SELECT_IMG(state, value) {
        state.selectImage = value
        state.imagePopup = true
    },
    SET_IMAGE_POPUP(state, value) {
        state.imagePopup = value
    },

    TOGGLE_INFO_SIDEBAR(state, value) {
        state.sidebarInfo = value
    },
    TOGGLE_CREATE_CHAT(state, value) {
        state.createChat = value
    },
    CONCAT_CONTACTS(state, value) {
        state.contactList = state.contactList.concat(value)
    },
    CONTACT_GROUP_CONTACTS(state, value) {
        state.contactsGroup = state.contactsGroup.concat(value)
    },
    SET_SELECTED_CONTACTS(state, value) {
        state.selectedContacts = value
    },
    SET_MODERATE(state, value) {
        state.moderate = value
    },
    CONCAT_CHAT(state, value) {
        let data = value.map(el => {
            return {
                ...el,
                last_sent: new Date(el.last_sent)
            }
        })

        state.chatList = orderBy(state.chatList.concat(data), ['last_sent'], ['desc'])
    },
    SET_ACTIVE_CHAT(state, value) {
        if (value) {
            state.activeChat = value
            const findIndex = state.chatList.findIndex(el => el.chat_uid === value.chat_uid)
            if (findIndex !== -1) {

                state.chatList[findIndex].new_message_count = 0
            }
        }
    },
    SET_ACTIVE_CHAT_FROM_UID(state, uid) {
        const findIndex = state.chatList.findIndex(el => el.chat_uid === uid)
        if (findIndex !== -1) {
            state.activeChat = state.chatList[findIndex]
            state.chatList[findIndex].new_message_count = 0
        }
    },
    SET_CHAT_MESSAGE_MODAL(state, id) {
        if (!state.messageModal?.[id]) {
            Vue.set(state.messageModal, id, {
                text: ''
            })
        }
    },
    CHANGE_CHAT_MESSAGE_MODAL(state, { id, message }) {
        Vue.set(state.messageModal[id], 'text', message)
    },
    SET_CHAT_MESSAGE(state, id) {
        if (!state.message?.[id]) {
            Vue.set(state.message, id, {
                text: ''
            })
        }
    },
    CHANGE_CHAT_MESSAGE(state, { id, message }) {
        Vue.set(state.message[id], 'text', message)
    },
    SET_MESSAGE_NEXT(state, payload) {
        state.chatMessage[state.activeChat.chat_uid].next = payload.next ? payload.next.split('?')[1] : ''
    },
    CONCAT_CHAT_MESSAGE(state, payload) {
        state.chatMessage[state.activeChat.chat_uid].value.unshift(...payload.results)
    },
    OPEN_CHAT_MESSAGE(state, payload) {
        const chatMessage = {
            value: payload.results,
            status: payload.next ? true : false,
            next: payload.next ? payload.next.split('?')[1] : '',
            prev: payload.previous ? payload.previous.split('?')[1] : '',
            bottomStatus: false,
            page: 1
        }
        state.messageListPrev = payload.previous ? true : false
        Vue.set(state.chatMessage, state.activeChat.chat_uid, chatMessage)
    },
    SET_MESSAGE_PREV(state, payload) {
        state.chatMessage[state.activeChat.chat_uid].prev = payload.previous ? payload.previous.split('?')[1] : ''
    },
    PUSH_CHAT_MESSAGE(state, payload) {
        state.chatMessage[state.activeChat.chat_uid].value.push(...payload.results)
    },
    SET_CHAT_LIST_NEXT(state, value) {
        if (!value)
            state.chatListNext = false
    },
    SET_CONTACT_LIST_NEXT(state, value) {
        if (!value)
            state.contactListNext = false
    },
    SET_CONTACT_GROUP_NEXT(state, value) {
        if (!value)
            state.contactGroupNext = false
    },
    SET_CHAT_LIST_PAGE(state, value) {
        state.chatListPage = value
    },
    SET_CONTACT_LIST_PAGE(state, value) {
        state.contactListPage = value
    },
    SET_CONTACT_GROUP_PAGE(state, value) {
        state.contactGroupPage = value
    },
    SET_CHAT_MEMBERS(state, { data, chat }) {
        Vue.set(state.chatMembers, chat, {
            ...data,
            page: 2
        })
    },
    setValueState(state, { name, value }) {
        state[name] = value
    },
    CONCAT_CHAT_MEMBERS(state, { data, chat }) {
        state.chatMembers[chat].results = state.chatMembers[chat].results.concat(data.results)
        state.chatMembers[chat].next = data.next
        state.chatMembers[chat].page = state.chatMembers[chat].page + 1
    },
    setReplyMessage(state, { id, mesage }) {
        Vue.set(state.replyMessage, id, mesage)
    },
    setReplyMessageModal(state, { id, mesage }) {
        Vue.set(state.replyMessageModal, id, mesage)
    },
    DELETE_REPLY_MESSAGE(state, id) {
        Vue.delete(state.replyMessage, id)
    },
    DELETE_REPLY_MESSAGE_MODAL(state, id) {
        Vue.delete(state.replyMessageModal, id)
    },
    PUSH_FILE_LIST(state, { id, file }) {
        if (state.fileList?.[id]?.length) {
            state.fileList[id].push(file)
        } else {
            Vue.set(state.fileList, id, [file])
        }

    },
    FILE_CHANGE_FIELD(state, { id, field, fileId, value }) {
        if (state.fileList?.[id]?.length) {
            const index = state.fileList[id].findIndex(elem => elem.iid === fileId)
            if (index !== -1) {
                Vue.set(state.fileList[id][index], field, value)
            }
        }
    },
    FILE_DELETE(state, id) {
        if (state.fileList?.[id]?.length) {
            Vue.delete(state.fileList, id)
        }
    },
    FILE_DELETE_BY_KEY(state, { id, fileId }) {
        if (state.fileList?.[id]?.length) {
            const index = state.fileList[id].findIndex(elem => elem.iid === fileId)
            if (index !== -1) {
                Vue.delete(state.fileList[id], index)
            }
        }
    },
    SET_FILE_MODAL(state, { id, value }) {
        Vue.set(state.fileModal, id, value)
    },
    clearContactsGroup(state) {
        state.contactsGroup = []
        state.contactGroupNext = true
        state.contactGroupPage = 0
    },
    DELETE_MEMBER(state, { chat, user }) {
        if (state.chatMembers[chat]) {
            state.activeChat.member_count -= 1
            state.chatMembers[chat].count -= 1
            state.contactGroupPage = 0
            state.chatMembers[chat].results = state.chatMembers[chat].results.filter(el => el.user.id !== user)
        }
    },
    ADD_MEMBER(state, data) {
        // state.activeChat.member_count += data?.members.length
        // state.chatMembers[id].results
    },
    INIT_MEMBERS_LIST(state, data) {
        const chat = data.chat_uid
        // Vue.delete(state.chatMembers, chat)
        state.chatMembers[chat].results = []
        state.chatMembers[chat].next = true
        state.chatMembers[chat].page = 0
        state.contactGroupPage = 0
    },
    LEAVE_CHAT(state, { chat }) {
        state.chatList = state.chatList.filter(el => el.chat_uid !== chat)
        state.activeChat = state.chatList[0]
    },
    addUserCount(state) {
        state.activeChat.member_count += state.selectedContacts.length
        state.selectedContacts.forEach(el => {
            state.contactsGroup = state.contactsGroup.filter(item => item.id !== el)

        })
    },
    clearMessage(state) {
        Vue.delete(state.chatMessage, state.activeChat.chat_uid)
    },

    clearMemberSideBar(state) {
        state.moderate = []
        state.selectedContacts = []
    },

    SET_LOADING_INFOCHAT(state, value) {
        state.loadingInfoChat = value
    },
    DELETE_CHAT(state, chat) {
        state.chatList = state.chatList.filter(el => el.chat_uid !== chat)
        state.activeChat = state.chatList[0]
    },
    removeMessage(state, { chat_uid, message_uid }) {
        state.chatMessage[chat_uid].value = state.chatMessage[chat_uid].value.filter(el => el.message_uid !== message_uid)
    },

    setStatusUser(state, data) {
        state.statusUsers = []
        if (data.public) {
            data.members.forEach(el => {
                state.statusUsers.push({ user_uid: el.user, online: el.status.online })
            })
        } else {
            state.statusUsers.push({ ...data.members })
        }

    },

    setOfflineUser(state, { user, last_activity }) {
        if (state.statusUsers[user]) {
            state.statusUsers[user].online = false
            state.statusUsers[user].last_activity = last_activity
        } else {
            Vue.set(state.statusUsers, user, { online: false })
        }
    },

    setOnlineUser(state, { user }) {
        // console.log("USER", state.statusUsers[user])
        if (state.statusUsers[user])
            state.statusUsers[user].online = true
        else
            Vue.set(state.statusUsers, user, { online: true })

    },
    addChatList(state, chat) {
        // console.log("stateChatList", state.chatList,)
        // console.log("chatttt", chat,)
        state.chatList.push(chat)
        state.chatList = orderBy(state.chatList, ['last_sent'], ['desc'])

    }





}