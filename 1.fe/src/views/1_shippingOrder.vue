<template>
  <div
    style="
      background-color: #eeeeee;
      height: 100vh;
      background-attachment: scroll;
      font-size: 2vh;
    "
  >
    <div
      style="
        background-color: #067dd7;
        color: azure;
        height: 6vh;
        font-weight: 800;
        font-size: 3vh;
        padding: 1vh;
      "
    >
      1. SHIPPING ORDER
      <font-awesome-icon
        icon="fa-solid fa-rotate"
        class="float-end"
        style="height: 4vh"
        @click="refresh"
      />
    </div>
    <div class="container">
      <div class="input-group mt-2" @change="setDate">
        <span class="input-group-text col-3" style="font-size: 2vh">Date</span>
        <input
          type="date"
          v-model="dateValue"
          style="font-size: 2vh"
          class="form-control"
        />
      </div>
      <div class="input-group mt-2">
        <span class="input-group-text col-3 text-center" style="font-size: 2vh"
          >Customer</span
        >
        <div class="form-control">
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              id="inlineRadio1"
              value="S1300"
              v-model="customer"
            />
            <label
              class="form-check-label"
              style="font-size: 2vh"
              for="inlineRadio1"
              >MAL</label
            >
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              id="inlineRadio2"
              value="S1301"
              v-model="customer"
            />
            <label
              class="form-check-label"
              for="inlineRadio2"
              style="font-size: 2vh"
              >MGA</label
            >
          </div>
          <div class="form-check form-check-inline">
            <input
              class="form-check-input"
              type="radio"
              name="inlineRadioOptions"
              v-model="customer"
              id="inlineRadio3"
              value="S0800"
            />
            <label
              class="form-check-label"
              for="inlineRadio3"
              style="font-size: 2vh"
              >HMMA</label
            >
          </div>
        </div>
      </div>
      <div class="music-player">
        <audio ref="erroraudio">
          <source src="../assets/sounds/error.mp3" type="audio/mpeg" />
        </audio>
        <div
          @click="errorSound"
          ref="errorbutton"
          class="toggle-sound paused"
        ></div>
      </div>
      <div class="input-group mt-2">
        <button
          class="btn btn-primary col-3"
          style="font-size: 2vh"
          @click="getData"
        >
          Search
        </button>
      </div>
      <div
        class="mt-2"
        v-if="data.length > 0"
        style="height: 50vh; overflow: auto"
      >
        <table class="table table-hover">
          <thead class="table-primary">
            <tr style="position: sticky; top: 0">
              <th>Date</th>
              <th>Customer</th>
              <th>Trailer No.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in data" :key="a" @click="goToScan(a.TRAILER_NO)">
              <td>{{ a.SAL_YMD }}</td>
              <td>
                {{
                  a.CUST_CD === 'S1300'
                    ? 'MAL'
                    : a.CUST_CD === 'S1301'
                    ? 'MGA'
                    : 'HMMA'
                }}
              </td>
              <td>{{ a.TRAILER_NO }}</td>
              <td>{{ a.NOW_ST }}</td>
              <!-- <td >
                <span v-if="a.NOW_ST === '0'" class="badge bg-light text-dark"
                  >Waiting</span
                >
                <span
                  v-else-if="a.NOW_ST === '2'"
                  class="badge bg-warning text-dark"
                  >Scanning</span
                >
                <span v-else class="badge bg-success">Processing</span>
              </td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  components: {},
  data() {
    return {
      dateValue: new Date().toISOString().slice(0, 10),
      shipDate: '',
      customer: 'S1300',
      data: [],
      playing: false
    }
  },
  setup() {},
  created() {},
  mounted() {
    if (localStorage.getItem('reloaded')) {
      // The page was just reloaded. Clear the value from local storage
      // so that it will reload the next time this page is visited.
      localStorage.removeItem('reloaded')
    } else {
      // Set a flag so that we know not to reload the page twice.
      localStorage.setItem('reloaded', '1')
      location.reload()
    }
    this.setDate()
  },
  unmounted() {},
  methods: {
    errorSound() {
      const audio = this.$refs.erroraudio
      this.playing = !this.playing
      if (this.playing) {
        audio.play()
        this.playing = !this.playing
      } else {
        audio.pause()
      }
    },
    setDate() {
      let a = ''
      a = this.dateValue.split('-')
      a = a.join('')
      this.shipDate = a
    },
    async getData() {
      if (this.shipDate === '' || this.customer === '') {
        this.$refs.errorbutton.click()
        alert('Please select Date')
      } else {
        const r = await this.$post('/api/shippingorder/getorder', {
          params: [this.shipDate, this.customer]
        })
        console.log(r)
        if (r === undefined) {
          alert('Error at getData')
          return
        }
        this.data = r.data.recordset
      }
    },
    refresh() {
      location.reload()
    },
    goToScan(a) {
      this.$router.push({
        path: '/palletscan',
        query: { trail: a, date: this.shipDate, cust: this.customer }
      })
    }
  }
}
</script>
