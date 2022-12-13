import Vuex from 'vuex'

import { userStore } from './user.store.js'
import { stationStore } from './station.store.js'
import { userService } from '../services/user.service.js'
import { stationService } from '../services/station.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export const store = Vuex.createStore({
  strict: true,
  modules: {
    userStore,
    stationStore
  },
  state: {
  },
  mutations: {
  },
  actions: {
    async followStation({ state, commit }, { station, isToFollow }) {
      try {
        const loggedInUser = JSON.parse(JSON.stringify(state.userStore.loggedinUser))
        const miniUser = {
          _id: loggedInUser._id,
          username: loggedInUser.username,
        }
        const miniStation = { _id: station._id, name: station.name }

        const savedStation = await stationService.updateFollowers(station, miniUser, isToFollow)
        const savedUser = await userService.followStation(miniStation, isToFollow, loggedInUser)

        commit({ type: 'updateStation', station: savedStation })
        commit({ type: 'updateUser', user: savedUser })
        commit({ type: 'setLoggedinUser', user: savedUser })
        commit({ type: 'updateUserStations', station, isToFollow})

      } catch (err) {
        console.error('store: Error in following/unfollowing', err)
        showErrorMsg('Log in to like stations')
        throw err
      }
    },

  }
})
