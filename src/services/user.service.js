import { storageService } from './async-storage.service'
import { httpService } from './http.service'
import { store } from '../store/store'
// import { socketService, SOCKET_EVENT_USER_UPDATED, SOCKET_EMIT_USER_WATCH } from './socket.service'
import { showSuccessMsg } from '../services/event-bus.service'

const STORAGE_KEY_LOGGEDIN_USER = 'loggedinUser'

export const userService = {
    login,
    logout,
    signup,
    getLoggedinUser,
    saveLocalUser,
    getUsers,
    getById,
    remove,
    update,
    followStation,
    saveSong
}

window.userService = userService


function getUsers() {
    // return storageService.query('user')
    return httpService.get(`user`)
}

function onUserUpdate(user) {
    // showSuccessMsg(`This user ${user.fullname} just got updated from socket, new score: ${user.score}`)
    store.commit({ type: 'setWatchedUser', user })
}

async function getById(userId) {
    // const user = await storageService.get('user', userId)
    const user = await httpService.get(`user/${userId}`)

    // socketService.emit(SOCKET_EMIT_USER_WATCH, userId)
    // socketService.off(SOCKET_EVENT_USER_UPDATED, onUserUpdate)
    // socketService.on(SOCKET_EVENT_USER_UPDATED, onUserUpdate)

    return user
}
function remove(userId) {
    // return storageService.remove('user', userId)
    return httpService.delete(`user/${userId}`)
}

async function update(user) {
    // await storageService.put('user', user)
    user = await httpService.put(`user/${user._id}`, user)
    // Handle case in which admin updates other user's details
    if (getLoggedinUser()?._id === user._id) saveLocalUser(user)
    return user
}

async function login(userCred) {
    // const users = await storageService.query('user')
    // const user = users.find(user => user.username === userCred.username)
    try {
        const user = await httpService.post('auth/login', userCred)

        if (user) {
            // socketService.login(user._id)
            const savedUser = saveLocalUser(user)

            return savedUser
        }
    } catch (err) {
        console.error(err)
        throw err
    }
}
async function signup(userCred) {
    // userCred.score = 10000
    userCred.stations = []
    userCred.likedSongs = []
    // const user = await storageService.post('user', userCred)
    const user = await httpService.post('auth/signup', userCred)

    // socketService.login(user._id)
    return saveLocalUser(user)
}
async function logout() {
    sessionStorage.removeItem(STORAGE_KEY_LOGGEDIN_USER)
    // socketService.logout()
    return await httpService.post('auth/logout')
}

async function followStation(miniStation, isToFollow, user) {
    isToFollow ? user.stations.unshift(miniStation)
        : user.stations = user.stations.filter(station => station._id !== miniStation._id)
    return update(user)
}

async function saveSong(song, user) {
    const idx = user.likedSongs.findIndex(s => s.id === song.id)
    idx === -1 ? user.likedSongs.unshift({ ...song }) : user.likedSongs.splice(idx, 1)
    return update(user)
}



function saveLocalUser(user) {
    sessionStorage.setItem(STORAGE_KEY_LOGGEDIN_USER, JSON.stringify(user))
    return user
}

function getLoggedinUser() {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY_LOGGEDIN_USER))
}


// ; (async () => {
//     await userService.signup({ fullname: 'Puki Norma', username: 'user1', password: '123', likedSongs: [], stations: [], isAdmin: false })
//     await userService.signup({ fullname: 'Master Adminov', username: 'admin', password: '123', likedSongs: [], stations: [], isAdmin: true })
//     await userService.signup({ fullname: 'Muki G', username: 'muki', password: '123', likedSongs: [], stations: [] })
// })()



