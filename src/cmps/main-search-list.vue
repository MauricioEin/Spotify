<template>
    <section class="main-search-list">
        <main-search-list-header />
        <ul class="clean-list">
            <li v-for="(song, index) in songs" :key="song._id">
                <search-song-preview @songSelected="songSelected" :index="index" :song="song"
                    :playingSongId="playingSongId" :clickedSong="clickedSong" :loggedInUser="loggedInUser"
                    @songClicked="onSongClicked" @addToStation="$emit('addToStation', song)" />
            </li>
        </ul>
    </section>
</template>

<script>
import searchSongPreview from './search-song-preview.vue';
import mainSearchListHeader from './main-search-list-header.vue';
export default {
    props: {
        songs: {
            type: Array,
            required: true
        },
    },
    data() {
        return {
            playingSongId: '',
            clickedSong: '',
        }
    },
    computed: {
        loggedInUser() {
            return this.$store.getters.loggedinUser
        },
    },
    methods: {
        songSelected(songId) {
            this.playingSongId = songId
        },
        onSongClicked(id) {
            this.clickedSong = id
        },
        removeClick(){
            this.clickedSong=''
        }
    },
    mounted() {
        window.addEventListener('click', this.removeClick)
    },
    unmounted() {
        window.removeEventListener('click', this.removeClick)
    },
    components: {
        searchSongPreview,
        mainSearchListHeader
    }
}
</script>

<style lang="scss" scoped>

</style>