<template>
  <section ref="lyrics" class="song-lyrics" @click.stop="expandLyrics">
    <div class="lyrics-container">
      <pre>{{ lyrics?.substring(0, lyrics?.length - 70) }}


        
**** Beta-version partial lyrics ****             
Lyrics provided by Musixmatch</pre>
    </div>
  </section>
</template>

<script>
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service'

import searchIcon from '../assets/svgs/search-icon.vue'
import leftArrowSvg from '../assets/svgs/left-arrow-svg.vue'


export default {
  name: 'song-lyrics',
  props: ['lyrics'],
  components: { searchIcon, leftArrowSvg },
  data() {
    return {
      searchStr: '',
    }
  },
  methods: {
    expandLyrics() {
      this.$refs.lyrics.classList.toggle('expanded')
    }
  }
}

</script>