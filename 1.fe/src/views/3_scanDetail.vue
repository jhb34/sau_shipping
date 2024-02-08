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
        font-size: 3vh;
        font-weight: 800;
        padding: 1vh;
      "
    >
      Shipping Scan
      <font-awesome-icon
        icon="fa-solid fa-rotate"
        class="float-end"
        style="height: 4vh"
        @click="refresh"
      />
      <font-awesome-icon
        icon="fa-solid fa-left-long"
        class="float-start"
        @click="goToHome"
        style="height: 4vh"
      />
    </div>
    <div class="container">
      <i class="bi-alarm" style="font-size: 2rem; color: cornflowerblue"></i>
      <div class="input-group mt-2" @change="setDate">
        <span class="input-group-text col-3" style="font-size: 2vh">Date</span>
        <div class="form-control">
          <span style="font-size: 2vh"
            >{{ input.date.substring(0, 4) }} /
            {{ input.date.substring(4, 6) }} /
            {{ input.date.substring(6, 9) }}</span
          >
        </div>
      </div>
      <div class="input-group mt-1">
        <span class="input-group-text col-3 text-center" style="font-size: 2vh"
          >Trailer No.</span
        >
        <div class="form-control">
          <span style="font-size: 2vh">{{ input.trail }}</span>
        </div>
      </div>
      <!-- <p>scan: {{ scanValue }} <button @click="barcodeChk">a</button></p>
      <div class="input-group mt-2">
        <input
          type="text"
          placeholder="Barcode Ready"
          v-model="scanValue"
          class="form-control"
        />
      </div> -->
      <div class="mt-2" style="height: 50vh; overflow: auto">
        <table class="table table-hover">
          <thead class="table-primary">
            <tr style="position: sticky; top: 0">
              <th>Item Number</th>
              <th>Pallet Number</th>
              <th>flag</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in data" :key="a">
              <td>{{ a.ITMNO }}</td>
              <td>
                {{ a.STAG_NO }}
              </td>
              <td>{{ a.OUT_FLAG }}</td>
              <td>{{ a.NOW_ST }}</td>
              <!-- <td>
                <span v-if="a.NOW_ST === '0'" class="badge bg-warning text-dark"
                  >Ready</span
                >
                <span
                  v-else-if="a.NOW_ST === a.ORD_BOX"
                  class="badge text-bg-danger"
                  >Scanning</span
                >
                <span v-else class="badge text-bg-secondary">Complete</span>
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
      scanValue: '',
      input: {},
      data: []
    }
  },
  setup() {},
  created() {
    this.input = this.$route.query
  },
  mounted() {
    this.getData()
  },
  unmounted() {},
  methods: {
    async getData() {
      const r = await this.$post('/getscandetail', {
        params: [this.input.date, this.input.trail, this.input.itm]
      })
      console.log(r)
      this.data = r.data.recordset
    },
    async chkDup(a) {
      const r = await this.$post('/chkdup', { params: a })
      console.log(r.data.recordset)
      if (r.data.recordset.length === 0) {
        console.log('fun', false)
        return false
      } else {
        console.log('fun', true)
        return true
      }
    },
    goToScan(a) {
      this.$router.push({ path: '/scanning', query: { id: a } })
    },
    goToHome() {
      this.$router.push({
        path: '/scanning'
      })
    },
    refresh() {
      location.reload()
    },
    async barcodeChk() {
      let TMP_DATE = ''
      let TMP_ITMNO = ''
      let TMP_QTY = ''
      let TMP_SERNO = ''
      let datas = []
      if (this.scanValue.slice(0, 3) === '[)>') {
        datas = this.scanValue.split(':')
        for (const a of datas) {
          if (a.slice(0, 1) === 'P') {
            TMP_ITMNO = a.slice(1)
          } else if (a.slice(0, 2) === '7Q') {
            TMP_QTY = a.slice(2)
          } else if (a.slice(0, 1) === 'D') {
            TMP_DATE = a.slice(1)
            if (TMP_DATE.length === 6) {
              if (TMP_DATE.slice(0, 2) > 12) {
                TMP_DATE = '20' + TMP_DATE
              } else {
                TMP_DATE = '20' + TMP_DATE.slice(-2) + TMP_DATE.slice(0, 4)
              }
            }
          } else if (a.slice(0, 2) === '3S') {
            TMP_SERNO = a.slice(2)
          }
        }
        console.log('data', datas)
        console.log('date', TMP_DATE)
        console.log('itmno', TMP_ITMNO)
        console.log('qty', TMP_QTY)
        console.log('serno', TMP_SERNO) // this.chkDup(TMP_SERNO)
        //   .then((a) => {
        //     if (a) {
        //       console.log('참참', a)
        //     } else {
        //       console.log('거짓거짓', a)
        //     }
        //   })
        //   .then((a) => {
        //     if (a) {
        //       console.log('참참2', a)
        //     } else {
        //       console.log('거짓거짓2', a)
        //     }
        //   })
        if (await this.chkDup(TMP_SERNO)) {
          alert('duplicate')
          return
        }

        console.log('hello')
        this.scanValue = ''
      } else {
        console.log('nothing')
      }
    }
  }
}
</script>
