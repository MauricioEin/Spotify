<template>
    <section class="media-player" :class="setFull" ref="player">
        <div class="playing-from" v-if="isFullscreen">
            <p class="debug">Debug: <button @click="this.YTstates=''">clear</button>
{{ YTstates }}
            </p>
            <span>Playing From</span>
            <span class="playlist-name">{{ playingStation.name }}</span>
        </div>
        <img class="fit-img album" :class="setFull" :src="currSongPlaying.imgUrl.medium || currSongPlaying.imgUrl"
            alt="">
        <button v-if="isFullscreen" class="close-full-mobile" @click="(isFullscreen = false)">
            <btn-down-svg />
        </button>

        <div class="player-section">

            <YouTube :src="`https://www.youtube.com/watch?v=${currSongPlaying.youtubeId}`" @ready="getDuration"
                @state-change="onStateChange" ref="youtube" />

            <div class="controls" :class="setFull" @click="setFullInMobile">
                <div class="left-controls" :class="setFull">
                    <img class="media-img fit-img" :class="setFull"
                        :src="currSongPlaying.imgUrl.medium || currSongPlaying.imgUrl" :alt="currSongPlaying.title">
                    <div :class="setFull" class="artist-details">
                        <span class="player-song-name">{{ currSongPlaying.title.slice(0, 25) }}...</span>
                        <!-- <a href="" class="player-artist-name">Coldplay, BTS</a> -->
                    </div>
                    <button class="flex justify-center align-center" @click.stop="saveSong" :class="{ liked: isLiked }">
                        <heart-btn-svg v-if="isLiked" class="liked" />
                        <heart-empty-svg v-else />
                    </button>
                    <!-- <button v-if="songLyrics" class="flex justify-center align-center lyrics-btn"> -->
                    <button class="flex justify-center align-center lyrics-btn" :class="{ active: songLyrics }">
                        <lyrics-btn-svg @click="isLyrics = !isLyrics" :class="{ liked: isLyrics }" />
                    </button>
                </div>

                <div class="center-controls" :class="setFull">
                    <div class="top-center-controls" :class="setFull">
                        <button @click="isShuffled = !isShuffled">
                            <random-svg class="random-btn" :style="shuffleStyle" />
                        </button>
                        <button @click="changeSong(-1)">
                            <prev-svg />
                        </button>
                        <button @click.stop="togglePlay" class="play-btn">
                            <play-svg class="play-svg" v-if="!isPlaying" />
                            <stop-svg class="stop-svg" v-else />
                        </button>
                        <button @click="changeSong(1)">
                            <next-svg />
                        </button>
                        <button @click="changeLoopType">
                            <loop-song-svg class="loop-song" v-if="(loopType === 2)" />
                            <loop-svg class="loop-song" v-else :style="loopStyle" />
                        </button>
                    </div>
                    <div class="bottom-center-controls" :class="setFull">
                        <span class="time-progress-1">{{ formattedTime(currTime) }}</span>
                        <div class="progress-container">
                            <progress class="prog progress-bar" type="progress" :value="currTime" min="0"
                                :max="duration"></progress>
                            <input class="prog input-bar timestamp" id="fontController" type="range"
                                @input="setTimestamp" :value="currTime" min="0" :max="duration" />
                        </div>

                        <span class="time-progress-2">{{ formattedTime(duration) }}</span>
                    </div>
                </div>

                <div class="right-controls" :class="setFull">

                    <button class="sound-btn" @click="toggleMute">
                        <sound-svg v-if="!isMute" />
                        <muted-svg v-else />
                    </button>
                    <div class="progress-container">
                        <progress class="prog progress-bar" :value="volume" max="100"></progress>
                        <input class="prog input-bar sound" type="range" @input="setVolume" max="100" />
                    </div>
                    <button @click="(isFullscreen = !isFullscreen)">
                        <full-svg v-if="!isFullscreen" />
                        <minimize-svg v-else />
                    </button>
                </div>
                <div class="mobile-lyrics-container" v-if="songLyrics && mobileFullScreen">
                    <song-lyrics class="mobile-lyrics" :lyrics="songLyrics" />
                </div>
            </div>

        </div>
        <song-lyrics v-if="songLyrics && isLyrics" :lyrics="songLyrics" />
    </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'
import { defineComponent } from 'vue'
import YouTube from 'vue3-youtube'
import { utilService } from '../services/util.service'
import { getLyrics } from '../services/lyrics.service'

import playSvg from '../assets/svgs/media-player-play.vue'
import stopSvg from '../assets/svgs/media-player-stop.vue'
import nextSvg from '../assets/svgs/media-player-next.vue'
import prevSvg from '../assets/svgs/media-player-prev.vue'
import randomSvg from '../assets/svgs/media-player-random.vue'
import soundSvg from '../assets/svgs/media-player-sound.vue'
import mutedSvg from '../assets/svgs/media-player-muted.vue'
import heartEmptySvg from '../assets/svgs/heart-empty-svg.vue'
import heartBtnSvg from '../assets/svgs/heart-btn-svg.vue'
import loopSvg from '../assets/svgs/media-player-loop.vue'
import fullSvg from '../assets/svgs/media-player-full.vue'
import minimizeSvg from '../assets/svgs/media-player-minimize.vue'
import loopSongSvg from '../assets/svgs/media-player-loop-song.vue'
import btnDownSvg from '../assets/svgs/btn-down-svg.vue'
import lyricsBtnSvg from '../assets/svgs/lyrics-btn-svg.vue'
import songLyrics from './song-lyrics.vue'

export default defineComponent({
    //[{title:'Coldplay - Universe', imgUrl:'https://upload.wikimedia.org/wikipedia/en/a/a2/Coldplay_-_My_Universe.png', youtubueId: 'nukZQTFsA10'}
    data() {
        return {
            isPlaying: false,
            isMute: false,
            isShuffled: false,
            isFullscreen: false,
            volume: 50,
            currSongIdx: this.playingSongIdx,
            songList: [],
            currTime: 0,
            duration: null,
            timeInterval: '',
            loopType: 0,
            currSongPlaying: {},
            songLyrics: '',
            isLyrics: false,
            station: "",
            YTstates:''
        }
    },

    created() {
        this.songList = [...this.playingStation.songs]
        this.currSongIdx = this.playingSongIdx
        this.currSongPlaying = this.songList[this.currSongIdx]
    },

    methods: {
        async onStateChange(ev) {
            console.log('YT state change!', ev.data)
            this.YTstates+=ev.data+', '
            if (ev.data === 1) {
                this.getDuration() 
                this.songLyrics = await getLyrics(this.currSongPlaying.title) || ''
                this.YTstates+='L, '

            }
            if (ev.data === 0 &&
                this.currSongIdx !== this.songList.length - 1 &&
                this.loopType !== 2) {
                this.changeSong(1)
            }
            else if (ev.data === 0 &&
                this.currSongIdx === this.songList.length - 1 &&
                this.loopType === 0) {
                this.togglePlay()
            }
            else if (ev.data === 0 &&
                this.currSongIdx === this.songList.length - 1 &&
                this.loopType === 1) {
                this.changeSong(1)
            }
            else if (ev.data === 0 &&
                this.loopType === 2) {
                this.$refs.youtube.loadVideoById(this.songList[this.currSongIdx].youtubeId)
            }

        },

        togglePlay() {
            this.$store.commit({ type: 'toggleIsPlaying' })
        },

        toggleMute() {
            if (this.isMute) {
                this.$refs.youtube.unMute()
                this.isMute = false
            } else {
                this.$refs.youtube.mute()
                this.isMute = true
            }
        },

        setVolume(ev) {
            const volume = ev.target.value
            this.volume = volume
            this.$refs.youtube.setVolume(volume)
        },

        changeSong(dir) {
            var newIdx = this.currSongIdx
            if (this.isShuffled) {
                while (newIdx === this.currSongIdx) {
                    newIdx = utilService.getRandomIntInclusive(0, this.songList.length - 1)
                }
            } else newIdx = (this.currSongIdx + dir + this.songList.length) % this.songList.length

            // this gives us the calc for looping around the playlist
            this.$store.commit({ type: 'playStation', station: this.playingStation, idx: newIdx })
        },

        setTimestamp(ev) {
            const timeStamp = ev.target.value
            this.currTime = timeStamp
            this.$refs.youtube.seekTo(timeStamp)
        },

        updateCurrTime() {
            this.timeInterval = setInterval(() => {
                const currTime = this.$refs?.youtube?.getCurrentTime()
                // console.log(currTime)
                if (currTime) {
                    this.currTime = Math.floor(currTime)
                }
            }, 1000)
        },

        getDuration() {
            this.duration = Math.floor(this.$refs.youtube.getDuration())
        },

        formattedTime(time) {
            const duration = time
            const minutes = ('minutes:,', Math.floor(duration / 60))
            var seconds = ('seconds:,', Math.floor(((duration / 60) % 1) * 60).toString())
            if (seconds.length < 2) {
                seconds = '0' + seconds
            }
            return minutes.toString() + ':' + seconds
        },

        updateCurrStation() {
            this.originalList = this.songList = this.playingStation.songs
            this.currSongIdx = this.playingSongIdx
            this.currSongPlaying = this.songList[this.currSongIdx]
            if (!this.isPlayingInStore) {
                this.togglePlay()
            }
        },

        changeLoopType() {
            this.loopType++
            if (this.loopType === 3) this.loopType = 0
        },

        setFullInMobile() {
            if (window.innerWidth < 750) {
                this.isFullscreen = true
            }
        },
        saveSong() {
            this.$store.dispatch({ type: 'saveSong', song: this.currSongPlaying })

        },


    },

    computed: {
        shuffleStyle() {
            return (this.isShuffled) ? { fill: '#1ED760' } : {}
        },

        loopStyle() {
            return (!this.loopType) ? { fill: '#b3b3b3' } : {}
        },

        setFull() {
            return (this.isFullscreen) ? 'full' : ''
        },
        playingStation() {
            return this.$store.getters.getPlayingStation
        },

        playingSongIdx() {
            return this.$store.getters.getPlayingSongIdx
        },

        isPlayingInStore() {
            return this.$store.getters.isPlaying
        },
        loggedInUser() {
            return this.$store.getters.loggedinUser
        },
        isLiked() {
            return this.loggedInUser.likedSongs.some(song => song.youtubeId === this.currSongPlaying.youtubeId)
        },
        mobileFullScreen() {
            return this.isFullscreen && window.innerWidth < 860
        },


    },

    watch: {
        playingStation() {
            this.updateCurrStation()
        },
        playingSongIdx() {
            this.updateCurrStation()

        },
        isPlayingInStore() {
            this.isPlaying = this.isPlayingInStore            
        },
        
        isPlaying() {
            if (this.isPlaying) {
                this.$refs.youtube.playVideo()
                // this.isPlaying = true
                this.updateCurrTime()
                this.$refs.youtube.playVideo()
            } else {
                this.$refs.youtube.pauseVideo()
                // this.isPlaying = false
                clearInterval(this.timeInterval)
            }
        },
        songLyrics() {
            if (!this.songLyrics) this.isLyrics = false
        },
        isFullscreen() {
            // if(this.isFullscreen)
            this.$refs.player.style.backgroundColor = this.isFullscreen ?
                this.playingStation.clr : ''
        }
    },

    components: {
        YouTube,
        playSvg,
        stopSvg,
        nextSvg,
        prevSvg,
        randomSvg,
        soundSvg,
        mutedSvg,
        heartEmptySvg,
        heartBtnSvg,
        loopSvg,
        fullSvg,
        minimizeSvg,
        loopSongSvg,
        btnDownSvg,
        lyricsBtnSvg,
        songLyrics
    },
})
</script>

