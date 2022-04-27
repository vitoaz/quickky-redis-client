const state = {
  value: {}
}

const mutations = {
  TEST: (state, value) => {
    state.value = value
  }
}

const actions = {
  async test({commit, dispatch}, value) {
    commit('TEST', value)
    return value
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
