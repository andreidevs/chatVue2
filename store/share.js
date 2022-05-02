const state = () => ({
    visible: false,
    shareModel: null,
    shareId: null,
    shareObject: null,
    bodySelector: 'body',
    shareUrl: null,
    shareTitle: null
})

const mutations = {
    SET_VISIBLE(state, value) {
        state.visible = value
    },
    SET_SHARE_PARAMS(state, { model, shareId, object, bodySelector, shareUrl, shareTitle }) {
        state.visible = true
        state.shareModel = model
        state.shareId = shareId
        state.shareObject = object
        state.shareUrl = shareUrl
        state.shareTitle = shareTitle

        if(bodySelector)
            state.bodySelector = bodySelector
    },
    CLEAR_PARAMS(state) {
        state.shareModel = null
        state.shareId = null
        state.shareObject = null
        state.shareUrl = null
        state.shareTitle = null
    }
}

const actions = {

}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}